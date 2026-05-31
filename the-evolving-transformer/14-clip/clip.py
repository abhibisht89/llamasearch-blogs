from dataclasses import dataclass
import math
import torch
import torch.nn as nn
import torch.nn.functional as F


# ─────────────────────────────────────────────────────────────────────────────
# CONFIG
# small values — optimised for learning, not performance
# same style as transformer.py
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class CLIPConfig:
    # --- shared transformer params ---
    dmodel: int = 64        # hidden dim for both encoders (must be divisible by H)
    H: int = 8              # number of attention heads  →  dk = dmodel/H = 8
    N: int = 2              # number of transformer blocks in each encoder
    dff: int = 256          # feedforward inner dim — CLIP paper uses 4 × dmodel
    dropout: float = 0.1
    norm_eps: float = 1e-7
    embed_dim: int = 32     # final joint embedding dim — both encoders project here
    B: int = 2              # batch size (image-text pairs per step)

    # --- image encoder ---
    image_size: int = 32    # image H = W (kept small for learning)
    patch_size: int = 8     # each patch is patch_size × patch_size pixels
    C: int = 3              # 3 colour channels (RGB)

    # --- text encoder ---
    vocab_size: int = 1000  # text vocabulary size
    max_text_len: int = 16  # max tokens per sentence

    @property
    def dk(self):
        # per-head key/query/value dimension
        return self.dmodel // self.H

    @property
    def num_patches(self):
        # image is divided into a grid of patches
        # e.g. 32×32 image with 8×8 patches → 4×4 grid → 16 patches
        return (self.image_size // self.patch_size) ** 2


config = CLIPConfig()


# ─────────────────────────────────────────────────────────────────────────────
# SHARED BUILDING BLOCKS
# ─────────────────────────────────────────────────────────────────────────────

# z = alpha * (x - mean) / (std + eps) + bias
class LayerNormalization(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.eps   = config.norm_eps
        self.alpha = nn.Parameter(torch.ones(config.dmodel))   # learnable scale
        self.bias  = nn.Parameter(torch.zeros(config.dmodel))  # learnable shift

    def forward(self, x):
        mean = x.mean(dim=-1, keepdim=True)
        std  = x.std(dim=-1, keepdim=True)
        return self.alpha * ((x - mean) / (std + self.eps)) + self.bias


class MultiHeadAttention(nn.Module):
    # single input x — CLIP only uses self-attention (Q = K = V = x)
    # supports optional causal mask for text encoder
    def __init__(self, config):
        super().__init__()
        self.dmodel = config.dmodel
        self.dk     = config.dk
        self.h      = config.H
        self.wq     = nn.Linear(self.dmodel, self.dmodel)
        self.wk     = nn.Linear(self.dmodel, self.dmodel)
        self.wv     = nn.Linear(self.dmodel, self.dmodel)
        self.wo     = nn.Linear(self.dmodel, self.dmodel)
        self.dropout = nn.Dropout(p=config.dropout)

    def forward(self, x, mask=None):
        # x: (B, S, dmodel)
        B, S, _ = x.shape
        query = self.wq(x)   # (B, S, dmodel)
        key   = self.wk(x)   # (B, S, dmodel)
        value = self.wv(x)   # (B, S, dmodel)

        # split into H heads: (B, S, dmodel) → (B, H, S, dk)
        query = query.view(B, S, self.h, self.dk).transpose(1, 2)
        key   = key.view(B, S, self.h, self.dk).transpose(1, 2)
        value = value.view(B, S, self.h, self.dk).transpose(1, 2)

        # scaled dot-product attention: (B, H, S, S)
        attn_score = query @ key.transpose(-1, -2) / math.sqrt(self.dk)

        if mask is not None:
            # lower-triangular mask: 0 = blocked, fill with -inf → 0 after softmax
            attn_score = attn_score.masked_fill(mask[:S, :S] == 0, float("-inf"))

        attn_score = F.softmax(attn_score, dim=-1)
        attn_score = self.dropout(attn_score)

        # (B, H, S, S) @ (B, H, S, dk) → (B, H, S, dk) → (B, S, dmodel)
        out = attn_score @ value
        out = out.transpose(1, 2).contiguous().view(B, S, self.dk * self.h)
        return self.wo(out)


class FeedForward(nn.Module):
    # CLIP uses GELU activation (smoother than ReLU — better gradient flow)
    # dmodel → dff → GELU → dropout → dmodel
    def __init__(self, config):
        super().__init__()
        self.w_up   = nn.Linear(config.dmodel, config.dff)
        self.w_proj = nn.Linear(config.dff, config.dmodel)
        self.dropout = nn.Dropout(config.dropout)

    def forward(self, x):
        x = self.w_up(x)
        x = self.dropout(F.gelu(x))
        x = self.w_proj(x)
        return x


class TransformerBlock(nn.Module):
    # CLIP uses pre-norm: LayerNorm BEFORE each sublayer
    #   pre-norm:  x = x + sublayer(norm(x))   ← used here
    #   post-norm: x = norm(x + sublayer(x))   ← used in transformer.py
    # pre-norm is more stable for deeper networks
    def __init__(self, config):
        super().__init__()
        self.norm1 = LayerNormalization(config)   # before self-attention
        self.norm2 = LayerNormalization(config)   # before feedforward
        self.mha   = MultiHeadAttention(config)
        self.ff    = FeedForward(config)

    def forward(self, x, mask=None):
        # pre-norm → self-attention → residual
        x = x + self.mha(self.norm1(x), mask)
        # pre-norm → feedforward → residual
        x = x + self.ff(self.norm2(x))
        return x


# ─────────────────────────────────────────────────────────────────────────────
# TEXT ENCODER  (GPT-style causal transformer)
#
# flow:
#   tokens → token embed + pos embed → dropout
#          → N × TransformerBlock (causal mask)
#          → norm → take last token → proj → embed_dim vector
# ─────────────────────────────────────────────────────────────────────────────

class TextEncoder(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.wte  = nn.Embedding(config.vocab_size, config.dmodel)
        # learnable positional embedding — shape (1, max_text_len, dmodel)
        # the 1 in batch dim broadcasts over any batch size automatically
        self.wpe  = nn.Parameter(torch.randn(1, config.max_text_len, config.dmodel))
        self.drop = nn.Dropout(config.dropout)
        self.blocks = nn.ModuleList([TransformerBlock(config) for _ in range(config.N)])
        self.norm = LayerNormalization(config)
        # project from dmodel → embed_dim (shared contrastive space)
        self.proj = nn.Linear(config.dmodel, config.embed_dim, bias=False)

        # causal mask: lower-triangular (1=attend, 0=blocked)
        # register_buffer: not a parameter, but moves to GPU with the model
        self.register_buffer(
            "mask", torch.tril(torch.ones(config.max_text_len, config.max_text_len))
        )

    def forward(self, x):
        # x: (B, S) — integer token ids
        x = self.wte(x) + self.wpe   # (B, S, dmodel) — token + position
        x = self.drop(x)

        for block in self.blocks:
            x = block(x, self.mask)   # causal mask — each token sees only past tokens

        x = self.norm(x)              # (B, S, dmodel)
        x = x[:, -1, :]              # last token has attended to whole sentence → (B, dmodel)
        return self.proj(x)           # (B, embed_dim)


# ─────────────────────────────────────────────────────────────────────────────
# IMAGE ENCODER  (Vision Transformer — ViT)
#
# flow:
#   image → PatchEmbedding → [CLS, p1, ..., p16]
#         → + pos embed → dropout
#         → N × TransformerBlock (full attention, no mask)
#         → norm → take CLS token → proj → embed_dim vector
# ─────────────────────────────────────────────────────────────────────────────

class PatchEmbedding(nn.Module):
    # splits image into non-overlapping patches and projects each to dmodel
    # Conv2d with kernel=patch_size, stride=patch_size does both in one step
    # Input:  (B, C, image_size, image_size)
    # Output: (B, num_patches, dmodel)
    def __init__(self, config):
        super().__init__()
        self.proj = nn.Conv2d(
            in_channels  = config.C,
            out_channels = config.dmodel,
            kernel_size  = config.patch_size,
            stride       = config.patch_size,
            bias         = False
        )

    def forward(self, x):
        # x: (B, C, H, W)
        x = self.proj(x)       # (B, dmodel, grid_h, grid_w) — e.g. (2, 64, 4, 4)
        x = x.flatten(2)       # (B, dmodel, num_patches)    — flatten spatial dims
        x = x.transpose(1, 2)  # (B, num_patches, dmodel)   — tokens × features
        return x


class ImageEncoder(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.patch_embed = PatchEmbedding(config)

        # CLS token: learnable vector prepended to patches
        # after the transformer, CLS at position 0 aggregates all patch info
        self.cls_token = nn.Parameter(torch.randn(1, 1, config.dmodel))

        # positional embedding: num_patches + 1 (the +1 is for CLS at position 0)
        self.pos_embed = nn.Parameter(torch.randn(1, config.num_patches + 1, config.dmodel))

        self.dropout = nn.Dropout(config.dropout)
        self.blocks   = nn.ModuleList([TransformerBlock(config) for _ in range(config.N)])
        self.norm     = LayerNormalization(config)
        # project from dmodel → embed_dim (same shared space as text encoder)
        self.proj = nn.Linear(config.dmodel, config.embed_dim, bias=False)

    def forward(self, x):
        B = x.shape[0]
        x = self.patch_embed(x)                      # (B, num_patches, dmodel)

        # expand CLS token for the whole batch then prepend at position 0
        cls = self.cls_token.expand(B, -1, -1)       # (B, 1, dmodel)
        x   = torch.cat([cls, x], dim=1)             # (B, num_patches+1, dmodel)

        # add positional embedding — tells model where each patch sits in the grid
        x = x + self.pos_embed                        # (B, num_patches+1, dmodel)
        x = self.dropout(x)

        # full attention — no causal mask (every patch can attend to every other)
        for block in self.blocks:
            x = block(x, mask=None)

        x = self.norm(x)

        # CLS token (position 0) has attended to all patches → image summary
        cls_out = x[:, 0, :]                         # (B, dmodel)
        return self.proj(cls_out)                     # (B, embed_dim)


# ─────────────────────────────────────────────────────────────────────────────
# CLIP LOSS — symmetric contrastive loss
#
# logits is (B, B) — similarity of every image with every text
# diagonal = correct matches → should have highest similarity in each row/col
# loss = average of row-wise CE (image→text) + col-wise CE (text→image)
# ─────────────────────────────────────────────────────────────────────────────

class CLIPLoss(nn.Module):
    def __init__(self):
        super().__init__()

    def forward(self, logits):
        B = logits.shape[0]
        # labels = [0, 1, ..., B-1] — correct match for row i is column i
        labels = torch.arange(B, device=logits.device)
        # image → text: each row should peak at column i
        loss_img_to_txt = F.cross_entropy(logits, labels)
        # text → image: each column should peak at row i (transpose)
        loss_txt_to_img = F.cross_entropy(logits.T, labels)
        return (loss_img_to_txt + loss_txt_to_img) / 2


# ─────────────────────────────────────────────────────────────────────────────
# CLIP — full model
#
# ties both encoders together:
#   1. encode image  → (B, embed_dim)
#   2. encode text   → (B, embed_dim)
#   3. L2-normalise both  (dot product = cosine similarity)
#   4. scale by learned temperature
#   5. compute (B, B) similarity matrix
#   6. symmetric contrastive loss
# ─────────────────────────────────────────────────────────────────────────────

class CLIP(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.img_encoder  = ImageEncoder(config)
        self.text_encoder = TextEncoder(config)

        # temperature: scales similarities before softmax
        # learned in log space → exp() keeps it always positive
        # init to log(1/0.07) ≈ 2.66 from the CLIP paper → exp ≈ 14.3
        self.logit_scale = nn.Parameter(torch.tensor(math.log(1 / 0.07)))
        self.loss_fn     = CLIPLoss()

    def encode_image(self, images):
        # encode + L2-normalize → ready for cosine similarity
        return F.normalize(self.img_encoder(images), dim=-1)

    def encode_text(self, tokens):
        # encode + L2-normalize → ready for cosine similarity
        return F.normalize(self.text_encoder(tokens), dim=-1)

    def forward(self, images, tokens):
        img_feat = self.img_encoder(images)    # (B, embed_dim)
        txt_feat = self.text_encoder(tokens)   # (B, embed_dim)

        # L2-normalize: makes dot product equal to cosine similarity
        img_feat = F.normalize(img_feat, dim=-1)
        txt_feat = F.normalize(txt_feat, dim=-1)

        # scale by temperature (always positive via exp)
        scale  = self.logit_scale.exp()
        logits = scale * img_feat @ txt_feat.T   # (B, B) similarity matrix

        loss = self.loss_fn(logits)
        return logits, loss


# ─────────────────────────────────────────────────────────────────────────────
# TEST — forward pass through full model
# ─────────────────────────────────────────────────────────────────────────────

# ─────────────────────────────────────────────────────────────────────────────
# ZERO-SHOT INFERENCE
#
# given one image and N candidate labels:
#   1. encode image → (1, embed_dim)
#   2. encode all labels → (N, embed_dim)
#   3. cosine similarity → (1, N)
#   4. argmax → predicted label index
#
# no retraining needed for new classes — just write new text prompts
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    demo_B = config.B
    x = torch.randn(demo_B, config.max_text_len, config.dmodel)
    print("LayerNormalization:", LayerNormalization(config)(x).shape)
    print("MultiHeadAttention:", MultiHeadAttention(config)(x).shape)
    print("FeedForward:", FeedForward(config)(x).shape)
    print("TransformerBlock:", TransformerBlock(config)(x).shape)

    tokens = torch.randint(0, config.vocab_size, (demo_B, config.max_text_len))
    print("TextEncoder:", TextEncoder(config)(tokens).shape)

    img = torch.randn(demo_B, config.C, config.image_size, config.image_size)
    print("PatchEmbedding:", PatchEmbedding(config)(img).shape)
    print("ImageEncoder:", ImageEncoder(config)(img).shape)

    logits = torch.randn(demo_B, demo_B)
    print("CLIPLoss:", CLIPLoss()(logits).item())

    model = CLIP(config)
    logits, loss = model(img, tokens)
    print("CLIP logits:", logits.shape, "loss:", loss.item())
    print("Total parameters:", sum(p.numel() for p in model.parameters()))

    model.eval()
    with torch.no_grad():
        image = torch.randn(1, config.C, config.image_size, config.image_size)
        label_tokens = torch.randint(0, config.vocab_size, (3, config.max_text_len))
        sim = model.encode_image(image) @ model.encode_text(label_tokens).T
        print("Zero-shot similarities:", sim, "pred:", sim.argmax().item())
