"""
Original Transformer — "Attention Is All You Need" (Vaswani et al., 2017)
https://arxiv.org/abs/1706.03762

Full encoder-decoder architecture in PyTorch.
All hyperparameters are passed via a single TransformerConfig dataclass.

Architecture summary:
  - Sinusoidal Positional Encoding (fixed, not learned)
  - Multi-Head Attention (MHA) with scaled dot-product
  - Post-norm residual connections: LayerNorm(x + sublayer(x))
  - ReLU feed-forward network (2-layer MLP, expand then contract)
  - Projection with log_softmax
"""

from dataclasses import dataclass
import torch
import torch.nn as nn
import math


# ============================================================
# Config — single source of truth for all hyperparameters
# ============================================================
@dataclass
class TransformerConfig:
    dmodel: int = 512            # embedding / model dimension
    vocabsize: int = 37000       # vocabulary size
    B: int = 2                   # batch size (for demo runs)
    max_seq_len: int = 512       # max sequence length (src and tgt)
    dff: int = 2048              # feed-forward inner dimension
    H: int = 8                   # number of attention heads
    N: int = 6                   # number of encoder/decoder blocks
    dropout: float = 0.1         # dropout probability
    norm_eps: float = 1e-6       # epsilon for LayerNorm numerical stability

    @property
    def dk(self):
        # per-head dimension — dmodel must be divisible by H
        return self.dmodel // self.H


config = TransformerConfig()


# ============================================================
# 1. InputEmbedding — token indices → dense vectors, scaled by sqrt(dmodel)
# ============================================================
class InputEmbedding(nn.Module):
    """
    Lookup table: maps token IDs → dmodel-dimensional vectors.

    The paper (Section 3.4) multiplies by sqrt(dmodel) to keep embedding
    magnitudes roughly comparable to the positional encodings added next.
    Without this scaling, the positional signal would dominate.
    """
    def __init__(self, config) -> None:
        super().__init__()
        self.embedding = nn.Embedding(config.vocabsize, config.dmodel)
        # scale factor applied after lookup — Section 3.4
        self.scale = math.sqrt(config.dmodel)

    def forward(self, x):
        # x: (B, S) integer token IDs
        # output: (B, S, dmodel) — scaled embeddings
        return self.embedding(x) * self.scale


# ============================================================
# 2. PositionalEncoding — fixed sinusoidal position signal
#    PE(pos, 2i)   = sin(pos / 10000^(2i/dmodel))
#    PE(pos, 2i+1) = cos(pos / 10000^(2i/dmodel))
# ============================================================
class PositionalEncoding(nn.Module):
    """
    Adds a fixed (non-learned) sinusoidal signal so the model knows token order.

    Why sinusoidal?
      - The model can attend to relative positions since PE(pos+k) is a linear
        function of PE(pos) for any fixed offset k.
      - Works for sequences longer than those seen during training.

    Stored as a buffer — saved with the model but not updated by the optimizer.
    """
    def __init__(self, config) -> None:
        super().__init__()
        pe = torch.zeros(config.max_seq_len, config.dmodel)  # (max_seq_len, dmodel)
        pos = torch.arange(0, config.max_seq_len, dtype=torch.float).unsqueeze(1)  # (max_seq_len, 1)
        # unsqueeze(1): (max_seq_len,) → (max_seq_len, 1) so pos * divTerm → (max_seq_len, dmodel // 2)
        divTerm = 1 / 10000 ** (
            torch.arange(0, config.dmodel, 2, dtype=torch.float) / config.dmodel
        )  # (dmodel // 2,)
        pe[:, 0::2] = torch.sin(pos * divTerm)  # (max_seq_len, dmodel // 2) → even cols of pe
        pe[:, 1::2] = torch.cos(pos * divTerm)  # (max_seq_len, dmodel // 2) → odd cols of pe
        pe.unsqueeze_(0)  # (1, max_seq_len, dmodel)
        # unsqueeze(0): (max_seq_len, dmodel) → (1, max_seq_len, dmodel) — broadcasts to batch in forward
        self.register_buffer("pe", pe)  # (1, max_seq_len, dmodel)

    def forward(self, x):
        # x: (B, S, dmodel)
        return x + self.pe[:, : x.shape[1], :]  # (B, S, dmodel) + (1, S, dmodel) → (B, S, dmodel)


# ============================================================
# 3. LayerNormalization — per-sample, per-position normalization
#    z = alpha * (x - mean) / (std + eps) + bias
# ============================================================
class LayerNormalization(nn.Module):
    """
    Normalizes across the last dimension (dmodel) independently for each
    (batch, position) pair.

    alpha (scale) and bias (shift) are learnable vectors of shape (dmodel,).
    They allow the model to undo the normalization if needed — the network
    learns whether and how much normalization to apply.

    eps prevents division by zero when std ≈ 0.
    """
    def __init__(self, config) -> None:
        super().__init__()
        self.eps = config.norm_eps
        self.alpha = nn.Parameter(torch.ones(config.dmodel))   # (dmodel,) learnable scale
        self.bias = nn.Parameter(torch.zeros(config.dmodel))   # (dmodel,) learnable shift

    def forward(self, x):
        # x: (B, S, dmodel)
        mean = x.mean(dim=-1, keepdim=True)  # (B, S, 1)
        std = x.std(dim=-1, keepdim=True)    # (B, S, 1)
        return self.alpha * (x - mean) / (std + self.eps) + self.bias  # (B, S, dmodel)


# ============================================================
# 4. FeedForward — position-wise 2-layer MLP with ReLU
#    FFN(x) = W2 · dropout(ReLU(W1 · x + b1)) + b2
# ============================================================
class FeedForward(nn.Module):
    """
    Applied independently to each position (hence "position-wise").
    Expands dmodel → dff (typically 4×), applies ReLU + dropout,
    then contracts dff → dmodel.

    This is where the model's "memory" lives — the FFN acts like a key-value
    store that retrieves patterns recognised by the attention heads.
    """
    def __init__(self, config) -> None:
        super().__init__()
        self.layer1 = nn.Linear(config.dmodel, config.dff)    # dmodel → dff per position
        self.layer2 = nn.Linear(config.dff, config.dmodel)    # dff → dmodel per position
        self.dropout = nn.Dropout(config.dropout)

    def forward(self, x):
        # x: (B, S, dmodel) → (B, S, dff) → relu → dropout → (B, S, dmodel)
        return self.layer2(self.dropout(torch.relu(self.layer1(x))))  # (B, S, dmodel)


# ============================================================
# 5. MultiHeadAttention — scaled dot-product attention over H heads
#    Attention(Q,K,V) = softmax(Q·K^T / sqrt(dk)) · V
# ============================================================
class MultiHeadAttention(nn.Module):
    """
    Splits dmodel into H heads of size dk = dmodel / H.
    Each head computes independent attention, outputs are concatenated
    and projected back to dmodel.

    Why multiple heads?
      Different heads can attend to different representation subspaces
      and different positions simultaneously (Section 3.2.2).

    Four projection matrices:
      Wq, Wk, Wv — project input to query/key/value spaces
      Wo          — project concatenated heads back to dmodel
    """
    def __init__(self, config) -> None:
        super().__init__()
        self.dmodel = config.dmodel
        self.h = config.H
        self.dk = config.dk  # dmodel // H

        self.wq = nn.Linear(config.dmodel, config.dmodel)  # dmodel → dmodel
        self.wk = nn.Linear(config.dmodel, config.dmodel)  # dmodel → dmodel
        self.wv = nn.Linear(config.dmodel, config.dmodel)  # dmodel → dmodel
        self.wo = nn.Linear(config.dmodel, config.dmodel)  # dmodel → dmodel
        self.dropout = nn.Dropout(p=config.dropout)

    @staticmethod
    def attention(q, k, v, dropout, mask):
        """
        Scaled dot-product attention (Section 3.2.1).
        q, k: (B, H, S, dk)
        v:    (B, H, S, dk)
        Returns: context (B, H, S, dk)
        """
        # q, k, v: (B, H, S, dk)
        _, _, _, dk = q.shape

        # (B, H, S, dk) @ (B, H, dk, S) → (B, H, S, S)
        # divide by sqrt(dk) to prevent dot products from growing too large
        # in high dimensions (which would push softmax into near-zero gradient regions)
        attention_score = q @ k.transpose(-1, -2) / math.sqrt(dk)

        if mask is not None:
            # mask==0 positions get -inf so softmax assigns them zero weight
            # used for: padding masks (src) and causal masks (tgt)
            attention_score = attention_score.masked_fill(mask == 0, float("-inf"))

        attention_score = attention_score.softmax(dim=-1)  # (B, H, S, S)
        return dropout(attention_score) @ v  # (B, H, S, dk)

    def forward(self, q, k, v, mask):
        B, S, _ = q.shape   # q: (B, S, dmodel)
        _, Sk, _ = k.shape  # k: (B, Sk, dmodel)
        _, Sv, _ = v.shape  # v: (B, Sv, dmodel)

        # project and split into H heads
        query = self.wq(q).view(B, S, self.h, self.dk).transpose(1, 2)   # (B, H, S, dk)
        key   = self.wk(k).view(B, Sk, self.h, self.dk).transpose(1, 2)  # (B, H, Sk, dk)
        value = self.wv(v).view(B, Sv, self.h, self.dk).transpose(1, 2)  # (B, H, Sv, dk)

        x = MultiHeadAttention.attention(
            query, key, value, self.dropout, mask
        )  # (B, H, S, dk)

        # merge heads back: (B, H, S, dk) → (B, S, H, dk) → (B, S, dmodel)
        x = x.transpose(1, 2).contiguous().view(B, S, self.dmodel)  # (B, S, dmodel)
        return self.wo(x)  # (B, S, dmodel)


# ============================================================
# 6. ResidualConnection — POST-norm (as per the original paper)
#    output = LayerNorm(x + sublayer(x))
#
#    Note: most modern implementations (GPT-2, LLaMA) use PRE-norm:
#          output = x + sublayer(LayerNorm(x))
#    The original paper uses post-norm (Section 3.1, Figure 1).
# ============================================================
class ResidualConnection(nn.Module):
    """
    Wraps any sub-layer with a residual (skip) connection and layer norm.
    Post-norm: apply sub-layer first, add residual, THEN normalize.

    The residual connection:
      - Allows gradients to flow directly to earlier layers (prevents vanishing)
      - Lets the network learn residuals (small corrections) rather than
        full transformations — easier to optimize
    """
    def __init__(self, config) -> None:
        super().__init__()
        self.norm = LayerNormalization(config)
        self.dropout = nn.Dropout(p=config.dropout)

    def forward(self, x, sublayer):
        # dropout is applied to the sublayer output before adding the residual
        return self.norm(x + self.dropout(sublayer(x)))


# ============================================================
# 7. EncoderBlock — one layer of the encoder stack
#    self-attention → residual+norm → FFN → residual+norm
# ============================================================
class EncoderBlock(nn.Module):
    """
    Each encoder layer has two sub-layers (Section 3.1):
      1. Multi-head self-attention  (Q = K = V = x)
      2. Position-wise feed-forward network

    Both are wrapped with post-norm residual connections.
    The encoder attends to all positions in the source sequence.
    """
    def __init__(self, config) -> None:
        super().__init__()
        self.MultiHeadAttentionLayer = MultiHeadAttention(config)
        self.FeedForwardLayer = FeedForward(config)
        # two residual connections — one around self-attn, one around FFN
        self.ResidualConnectionLayer = nn.ModuleList(
            [ResidualConnection(config) for _ in range(2)]
        )

    def forward(self, x, mask):
        # self-attention: Q=K=V=x (encoder attends to itself)
        x = self.ResidualConnectionLayer[0](
            x, lambda x: self.MultiHeadAttentionLayer(x, x, x, mask)
        )
        x = self.ResidualConnectionLayer[1](x, self.FeedForwardLayer)
        return x


# ============================================================
# 8. Encoder — N stacked EncoderBlocks + final LayerNorm
# ============================================================
class Encoder(nn.Module):
    """
    Stack of N identical encoder layers, followed by a final LayerNorm.

    The final norm stabilizes the output representation before it is
    passed to the decoder's cross-attention layers.
    """
    def __init__(self, config) -> None:
        super().__init__()
        self.layers = nn.ModuleList([EncoderBlock(config) for _ in range(config.N)])
        self.norm = LayerNormalization(config)

    def forward(self, x, mask):
        for layer in self.layers:
            x = layer(x, mask)
        return self.norm(x)


# ============================================================
# 9. DecoderBlock — one layer of the decoder stack
#    masked self-attention → cross-attention → FFN (3 residual connections)
# ============================================================
class DecoderBlock(nn.Module):
    """
    Each decoder layer has three sub-layers (Section 3.1):
      1. Masked multi-head self-attention
         — causal mask prevents attending to future target tokens
      2. Multi-head cross-attention
         — Q from decoder, K and V from encoder output
         — this is how the decoder "reads" the encoded source
      3. Position-wise feed-forward network

    All three are wrapped with post-norm residual connections.
    """
    def __init__(self, config) -> None:
        super().__init__()
        self.MultiHeadAttentionLayer = MultiHeadAttention(config)       # self-attn
        self.CrossMultiHeadAttentionLayer = MultiHeadAttention(config)  # cross-attn
        self.FeedForwardLayer = FeedForward(config)
        # three residual connections — self-attn, cross-attn, FFN
        self.ResidualConnectionLayer = nn.ModuleList(
            [ResidualConnection(config) for _ in range(3)]
        )

    def forward(self, x, encoder_output, src_mask, tgt_mask):
        # sub-layer 1: masked self-attention (decoder attends to its own previous tokens)
        x = self.ResidualConnectionLayer[0](
            x, lambda x: self.MultiHeadAttentionLayer(x, x, x, tgt_mask)
        )
        # sub-layer 2: cross-attention (Q from decoder, K/V from encoder output)
        x = self.ResidualConnectionLayer[1](
            x,
            lambda x: self.CrossMultiHeadAttentionLayer(
                x, encoder_output, encoder_output, src_mask
            ),
        )
        # sub-layer 3: feed-forward
        x = self.ResidualConnectionLayer[2](x, self.FeedForwardLayer)
        return x


# ============================================================
# 10. Decoder — N stacked DecoderBlocks + final LayerNorm
# ============================================================
class Decoder(nn.Module):
    """
    Stack of N identical decoder layers, followed by a final LayerNorm.
    Each layer refines the target representation using both self-attention
    (within the target) and cross-attention (to the encoded source).
    """
    def __init__(self, config) -> None:
        super().__init__()
        self.layers = nn.ModuleList([DecoderBlock(config) for _ in range(config.N)])
        self.norm = LayerNormalization(config)

    def forward(self, x, encoder_output, src_mask, tgt_mask):
        for layer in self.layers:
            x = layer(x, encoder_output, src_mask, tgt_mask)
        return self.norm(x)


# ============================================================
# 11. ProjectionLayer — maps dmodel → vocabsize with log_softmax
# ============================================================
class ProjectionLayer(nn.Module):
    """
    Final linear layer that maps decoder output to log-probabilities
    over the vocabulary.

    log_softmax is used rather than softmax because:
      - NLLLoss expects log-probabilities
      - log_softmax is numerically more stable than log(softmax(x))
    """
    def __init__(self, config) -> None:
        super().__init__()
        # project dmodel → vocabsize, then log_softmax for log-probabilities
        self.layer1 = nn.Linear(config.dmodel, config.vocabsize)

    def forward(self, x):
        # x: (B, S, dmodel) → (B, S, vocabsize)
        return torch.log_softmax(self.layer1(x), dim=-1)


# ============================================================
# 12. Transformer — the full encoder-decoder model
# ============================================================
class Transformer(nn.Module):
    """
    Assembles the complete Transformer (Figure 1 of the paper).

    Separate embedding and positional encoding layers for src and tgt
    — useful for translation where src/tgt have different vocabularies.

    Three entry points:
      encode  — src tokens → encoder representation
      decode  — tgt tokens + encoder output → decoder output
      project — decoder output → log-probabilities over vocabulary
    """
    def __init__(self, config) -> None:
        super().__init__()
        # src and tgt get separate embeddings + positional encodings
        self.src_embedding     = InputEmbedding(config)
        self.tgt_embedding     = InputEmbedding(config)
        self.src_positionalEnc  = PositionalEncoding(config)
        self.tgt_positionalEnc  = PositionalEncoding(config)
        self.encoder      = Encoder(config)
        self.decoder      = Decoder(config)
        self.projection   = ProjectionLayer(config)
        self.dropout      = nn.Dropout(p=config.dropout)

    def encode(self, x, mask):
        x = self.src_embedding(x)
        x = self.src_positionalEnc(x)
        x = self.dropout(x)
        return self.encoder(x, mask)

    def decode(self, x, encoder_output, src_mask, tgt_mask):
        x = self.tgt_embedding(x)
        x = self.tgt_positionalEnc(x)
        x = self.dropout(x)
        return self.decoder(x, encoder_output, src_mask, tgt_mask)

    def project(self, x):
        return self.projection(x)


if __name__ == "__main__":
    demo_S = config.max_seq_len
    x = torch.randn(config.B, demo_S, config.dmodel)

    embedding = InputEmbedding(config)
    src_ids = torch.randint(0, config.vocabsize, (config.B, demo_S))
    out = embedding(src_ids)
    print("InputEmbedding out:", out.shape)

    pe = PositionalEncoding(config)
    out = pe(x)
    print("PositionalEncoding out:", out.shape)
    print("Shape preserved:", x.shape == out.shape)

    norm = LayerNormalization(config)
    out = norm(x)
    print("LayerNormalization out:", out.shape)
    print("Shape preserved:", x.shape == out.shape)

    ff = FeedForward(config)
    out = ff(x)
    print("FeedForward out:", out.shape)
    print("Shape preserved:", x.shape == out.shape)

    mha = MultiHeadAttention(config)
    out = mha(x, x, x, None)
    print("MultiHeadAttention out:", out.shape)
    print("Shape preserved:", x.shape == out.shape)

    residual = ResidualConnection(config)
    out = residual(x, lambda t: t)
    print("ResidualConnection out:", out.shape)
    print("Shape preserved:", x.shape == out.shape)

    enc_block = EncoderBlock(config)
    out = enc_block(x, None)
    print("EncoderBlock out:", out.shape)
    print("Shape preserved:", x.shape == out.shape)

    encoder = Encoder(config)
    out = encoder(x, None)
    print("Encoder out:", out.shape)
    print("Shape preserved:", x.shape == out.shape)

    dec_block = DecoderBlock(config)
    out = dec_block(x, x, None, None)
    print("DecoderBlock out:", out.shape)
    print("Shape preserved:", x.shape == out.shape)

    decoder = Decoder(config)
    out = decoder(x, x, None, None)
    print("Decoder out:", out.shape)
    print("Shape preserved:", x.shape == out.shape)

    projection = ProjectionLayer(config)
    out = projection(x)
    print("ProjectionLayer out:", out.shape)

    transformer = Transformer(config)
    src = torch.randint(0, config.vocabsize, (config.B, demo_S))
    tgt = torch.randint(0, config.vocabsize, (config.B, demo_S))
    enc_out = transformer.encode(src, None)
    print("Transformer encode out:", enc_out.shape)
    dec_out = transformer.decode(tgt, enc_out, None, None)
    print("Transformer decode out:", dec_out.shape)
    proj_out = transformer.project(dec_out)
    print("Transformer project out:", proj_out.shape)
    print("Expected:", (config.B, demo_S, config.vocabsize))
    total_params = sum(p.numel() for p in transformer.parameters())
    print("Total parameters:", total_params)
