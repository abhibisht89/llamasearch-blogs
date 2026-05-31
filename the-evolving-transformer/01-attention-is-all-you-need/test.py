"""
Test suite for the config-based Transformer implementation.

Tests each class individually, then in combination.
Run with: python -m pytest test_transformer.py -v
Or simply: python test_transformer.py
"""

import torch
import torch.nn as nn
import math
import pytest

from transformer import (
    TransformerConfig,
    InputEmbedding,
    PositionalEncoding,
    LayerNormalization,
    FeedForward,
    MultiHeadAttention,
    ResidualConnection,
    EncoderBlock,
    Encoder,
    DecoderBlock,
    Decoder,
    ProjectionLayer,
    Transformer,
)

# ============================================================
# Common test config — small values for fast tests
# ============================================================
cfg = TransformerConfig(
    dmodel=64,
    vocabsize=100,
    B=2,
    max_seq_len=10,
    dff=128,
    H=4,
    N=2,
    dropout=0.0,   # zero dropout for deterministic tests
    norm_eps=1e-7,
)

B       = cfg.B
S       = cfg.max_seq_len
D_MODEL = cfg.dmodel


# ============================================================
# 1. InputEmbedding Tests
# ============================================================
class TestInputEmbedding:

    def test_output_shape(self):
        """Embedding should map (B, S) token IDs to (B, S, dmodel)."""
        embed = InputEmbedding(cfg)
        x = torch.randint(0, cfg.vocabsize, (B, S))
        out = embed(x)
        assert out.shape == (B, S, D_MODEL), f"Expected (B, S, dmodel), got {out.shape}"

    def test_scaling_factor(self):
        """Output should be scaled by sqrt(dmodel)."""
        embed = InputEmbedding(cfg)
        x = torch.randint(0, cfg.vocabsize, (B, S))
        raw = embed.embedding(x)
        scaled = embed(x)
        expected = raw * math.sqrt(D_MODEL)
        assert torch.allclose(scaled, expected), "Scaling factor mismatch"

    def test_different_vocab_sizes(self):
        """Should work with different vocabulary sizes."""
        for vocab in [10, 500, 5000]:
            c = TransformerConfig(dmodel=D_MODEL, vocabsize=vocab, H=4)
            embed = InputEmbedding(c)
            x = torch.randint(0, vocab, (B, S))
            out = embed(x)
            assert out.shape == (B, S, D_MODEL)

    def test_single_token(self):
        """Should work with a single token (seq_len=1)."""
        embed = InputEmbedding(cfg)
        x = torch.randint(0, cfg.vocabsize, (1, 1))
        out = embed(x)
        assert out.shape == (1, 1, D_MODEL)


# ============================================================
# 2. PositionalEncoding Tests
# ============================================================
class TestPositionalEncoding:

    def test_output_shape(self):
        """Output shape should match input shape."""
        pe = PositionalEncoding(cfg)
        x = torch.randn(B, S, D_MODEL)
        out = pe(x)
        assert out.shape == (B, S, D_MODEL), f"Expected (B, S, dmodel), got {out.shape}"

    def test_adds_positional_info(self):
        """Output should differ from input (positional values are added)."""
        pe = PositionalEncoding(cfg)
        x = torch.zeros(B, S, D_MODEL)
        out = pe(x)
        assert not torch.allclose(out, x), "PE should add non-zero values"

    def test_shorter_sequence(self):
        """Should handle sequences shorter than max_seq_len."""
        pe = PositionalEncoding(cfg)
        x = torch.randn(B, 5, D_MODEL)
        out = pe(x)
        assert out.shape == (B, 5, D_MODEL), "Should handle shorter sequences"

    def test_pe_buffer_not_trainable(self):
        """Positional encoding should be a buffer, not a trainable parameter."""
        pe = PositionalEncoding(cfg)
        assert not pe.pe.requires_grad, "PE buffer should not require grad"

    def test_pe_values_bounded(self):
        """Positional encoding values should be in [-1, 1] (sin/cos range)."""
        pe = PositionalEncoding(cfg)
        assert pe.pe.min() >= -1.0, "PE values should be >= -1"
        assert pe.pe.max() <= 1.0,  "PE values should be <= 1"

    def test_different_positions_different_encodings(self):
        """Each position should have a unique encoding."""
        pe = PositionalEncoding(cfg)
        pos0 = pe.pe[0, 0, :]
        pos1 = pe.pe[0, 1, :]
        assert not torch.allclose(pos0, pos1), "Different positions should have different encodings"


# ============================================================
# 3. LayerNormalization Tests
# ============================================================
class TestLayerNormalization:

    def test_output_shape(self):
        """Output shape should match input shape."""
        ln = LayerNormalization(cfg)
        x = torch.randn(B, S, D_MODEL)
        out = ln(x)
        assert out.shape == (B, S, D_MODEL)

    def test_normalized_output_mean(self):
        """After normalization, mean across last dim should be ~0."""
        ln = LayerNormalization(cfg)
        x = torch.randn(B, S, D_MODEL) * 10 + 5
        out = ln(x)
        out_mean = out.mean(dim=-1)
        assert torch.allclose(out_mean, torch.zeros_like(out_mean), atol=1e-5), \
            f"Mean should be ~0, got {out_mean.mean().item():.6f}"

    def test_learnable_parameters(self):
        """Alpha and bias should be learnable parameters."""
        ln = LayerNormalization(cfg)
        params = list(ln.parameters())
        assert len(params) == 2, f"Expected 2 params (alpha, bias), got {len(params)}"

    def test_parameter_shapes(self):
        """Alpha and bias should be vectors of shape (dmodel,)."""
        ln = LayerNormalization(cfg)
        assert ln.alpha.shape == (D_MODEL,), f"Alpha shape should be (dmodel,), got {ln.alpha.shape}"
        assert ln.bias.shape  == (D_MODEL,), f"Bias shape should be (dmodel,), got {ln.bias.shape}"

    def test_identity_with_default_params(self):
        """With alpha=1 and bias=0 (defaults), output should be normalized."""
        ln = LayerNormalization(cfg)
        x = torch.randn(B, S, D_MODEL)
        out = ln(x)
        # std of output across last dim should be close to 1
        out_std = out.std(dim=-1)
        assert torch.allclose(out_std, torch.ones_like(out_std), atol=0.1)


# ============================================================
# 4. FeedForward Tests
# ============================================================
class TestFeedForward:

    def test_output_shape(self):
        """Output shape should match input: (B, S, dmodel)."""
        ffn = FeedForward(cfg)
        x = torch.randn(B, S, D_MODEL)
        out = ffn(x)
        assert out.shape == (B, S, D_MODEL)

    def test_transforms_input(self):
        """Output should differ from input."""
        ffn = FeedForward(cfg)
        x = torch.randn(B, S, D_MODEL)
        out = ffn(x)
        assert not torch.allclose(x, out), "FFN should transform the input"

    def test_parameter_count(self):
        """Should have 4 param tensors: weight + bias for each of 2 linear layers."""
        ffn = FeedForward(cfg)
        params = list(ffn.parameters())
        assert len(params) == 4, f"Expected 4 params, got {len(params)}"

    def test_inner_dimension(self):
        """Internal expansion should use dff."""
        ffn = FeedForward(cfg)
        assert ffn.layer1.weight.shape == (cfg.dff, D_MODEL)
        assert ffn.layer2.weight.shape == (D_MODEL, cfg.dff)

    def test_different_dff(self):
        """Should work with various dff sizes."""
        for dff in [32, 256, 1024]:
            c = TransformerConfig(dmodel=D_MODEL, dff=dff, H=4)
            ffn = FeedForward(c)
            x = torch.randn(B, S, D_MODEL)
            out = ffn(x)
            assert out.shape == (B, S, D_MODEL)


# ============================================================
# 5. MultiHeadAttention Tests
# ============================================================
class TestMultiHeadAttention:

    def test_self_attention_shape(self):
        """Self-attention (Q=K=V) should return (B, S, dmodel)."""
        mha = MultiHeadAttention(cfg)
        x = torch.randn(B, S, D_MODEL)
        out = mha(x, x, x, None)
        assert out.shape == (B, S, D_MODEL)

    def test_cross_attention_shape(self):
        """Cross-attention with different src/tgt lengths."""
        mha = MultiHeadAttention(cfg)
        q = torch.randn(B, 8, D_MODEL)
        kv = torch.randn(B, S, D_MODEL)
        out = mha(q, kv, kv, None)
        assert out.shape == (B, 8, D_MODEL), "Output seq_len should match query seq_len"

    def test_projection_matrices(self):
        """Should have four projection matrices: Wq, Wk, Wv, Wo."""
        mha = MultiHeadAttention(cfg)
        for name in ['wq', 'wk', 'wv', 'wo']:
            assert hasattr(mha, name), f"Missing projection matrix: {name}"

    def test_masking(self):
        """Causal mask should prevent attending to future positions."""
        mha = MultiHeadAttention(cfg)
        x = torch.randn(B, S, D_MODEL)
        # Causal mask: lower triangular
        mask = torch.tril(torch.ones(S, S)).unsqueeze(0).unsqueeze(0)
        out_masked   = mha(x, x, x, mask)
        out_unmasked = mha(x, x, x, None)
        assert not torch.allclose(out_masked, out_unmasked), \
            "Masked and unmasked outputs should differ"

    def test_dk_property(self):
        """dk should equal dmodel // H."""
        mha = MultiHeadAttention(cfg)
        assert mha.dk == D_MODEL // cfg.H


# ============================================================
# 6. ResidualConnection Tests
# ============================================================
class TestResidualConnection:

    def test_output_shape(self):
        """Output shape should match input shape."""
        rc = ResidualConnection(cfg)
        x = torch.randn(B, S, D_MODEL)
        out = rc(x, lambda x: x)
        assert out.shape == (B, S, D_MODEL)

    def test_adds_residual(self):
        """Output should include original input (residual path)."""
        rc = ResidualConnection(cfg)
        x = torch.randn(B, S, D_MODEL)
        # Identity sublayer — output should include x
        out = rc(x, lambda x: torch.zeros_like(x))
        # With zero sublayer, output = norm(x + 0) = norm(x) ≠ x in general,
        # but it should be normalized, not zero
        assert not torch.allclose(out, torch.zeros_like(out)), \
            "Residual should prevent zero output"

    def test_sublayer_applied(self):
        """The sublayer should be applied before adding residual."""
        rc = ResidualConnection(cfg)
        x = torch.randn(B, S, D_MODEL)
        # Pass through a linear sublayer that changes the values
        linear = nn.Linear(D_MODEL, D_MODEL, bias=False)
        nn.init.eye_(linear.weight)  # identity init
        out = rc(x, linear)
        assert out.shape == (B, S, D_MODEL)


# ============================================================
# 7. EncoderBlock Tests
# ============================================================
class TestEncoderBlock:

    def test_output_shape(self):
        """EncoderBlock output should have shape (B, S, dmodel)."""
        block = EncoderBlock(cfg)
        x = torch.randn(B, S, D_MODEL)
        out = block(x, None)
        assert out.shape == (B, S, D_MODEL)

    def test_with_mask(self):
        """Should work with a padding mask."""
        block = EncoderBlock(cfg)
        x = torch.randn(B, S, D_MODEL)
        mask = torch.ones(B, 1, 1, S)
        out = block(x, mask)
        assert out.shape == (B, S, D_MODEL)

    def test_two_residual_connections(self):
        """EncoderBlock should have exactly 2 residual connections."""
        block = EncoderBlock(cfg)
        assert len(block.ResidualConnectionLayer) == 2


# ============================================================
# 8. Encoder Tests
# ============================================================
class TestEncoder:

    def test_output_shape(self):
        """Encoder output should have shape (B, S, dmodel)."""
        encoder = Encoder(cfg)
        x = torch.randn(B, S, D_MODEL)
        out = encoder(x, None)
        assert out.shape == (B, S, D_MODEL)

    def test_n_layers(self):
        """Encoder should have N stacked blocks."""
        encoder = Encoder(cfg)
        assert len(encoder.layers) == cfg.N

    def test_different_n(self):
        """Should work with different stack depths."""
        for n in [1, 3, 6]:
            c = TransformerConfig(dmodel=D_MODEL, H=4, N=n)
            encoder = Encoder(c)
            x = torch.randn(B, S, D_MODEL)
            out = encoder(x, None)
            assert out.shape == (B, S, D_MODEL)


# ============================================================
# 9. DecoderBlock Tests
# ============================================================
class TestDecoderBlock:

    def test_output_shape(self):
        """DecoderBlock output should have shape (B, S, dmodel)."""
        block = DecoderBlock(cfg)
        x = torch.randn(B, S, D_MODEL)
        enc_out = torch.randn(B, S, D_MODEL)
        out = block(x, enc_out, None, None)
        assert out.shape == (B, S, D_MODEL)

    def test_cross_attention_different_lengths(self):
        """Decoder can attend to encoder output of different length."""
        block = DecoderBlock(cfg)
        tgt = torch.randn(B, 8, D_MODEL)
        enc_out = torch.randn(B, S, D_MODEL)
        out = block(tgt, enc_out, None, None)
        assert out.shape == (B, 8, D_MODEL)

    def test_three_residual_connections(self):
        """DecoderBlock should have exactly 3 residual connections."""
        block = DecoderBlock(cfg)
        assert len(block.ResidualConnectionLayer) == 3


# ============================================================
# 10. Decoder Tests
# ============================================================
class TestDecoder:

    def test_output_shape(self):
        """Decoder output should have shape (B, S, dmodel)."""
        decoder = Decoder(cfg)
        x = torch.randn(B, S, D_MODEL)
        enc_out = torch.randn(B, S, D_MODEL)
        out = decoder(x, enc_out, None, None)
        assert out.shape == (B, S, D_MODEL)

    def test_n_layers(self):
        """Decoder should have N stacked blocks."""
        decoder = Decoder(cfg)
        assert len(decoder.layers) == cfg.N

    def test_different_n(self):
        """Should work with different stack depths."""
        for n in [1, 3, 6]:
            c = TransformerConfig(dmodel=D_MODEL, H=4, N=n)
            decoder = Decoder(c)
            x = torch.randn(B, S, D_MODEL)
            enc = torch.randn(B, S, D_MODEL)
            out = decoder(x, enc, None, None)
            assert out.shape == (B, S, D_MODEL)


# ============================================================
# 11. ProjectionLayer Tests
# ============================================================
class TestProjectionLayer:

    def test_output_shape(self):
        """Output should be (B, S, vocabsize)."""
        proj = ProjectionLayer(cfg)
        x = torch.randn(B, S, D_MODEL)
        out = proj(x)
        assert out.shape == (B, S, cfg.vocabsize)

    def test_log_probabilities(self):
        """All output values should be <= 0 (log-probabilities)."""
        proj = ProjectionLayer(cfg)
        x = torch.randn(B, S, D_MODEL)
        out = proj(x)
        assert (out <= 0).all(), "Log-probabilities should all be <= 0"

    def test_probabilities_sum_to_one(self):
        """exp(log_probs) should sum to 1 across vocab dimension."""
        proj = ProjectionLayer(cfg)
        x = torch.randn(B, S, D_MODEL)
        out = proj(x)
        sums = torch.exp(out).sum(dim=-1)
        assert torch.allclose(sums, torch.ones_like(sums), atol=1e-5)

    def test_different_vocab_sizes(self):
        """Should work with different vocabulary sizes."""
        for vocab in [50, 500, 10000]:
            c = TransformerConfig(dmodel=D_MODEL, vocabsize=vocab, H=4)
            proj = ProjectionLayer(c)
            x = torch.randn(B, S, D_MODEL)
            out = proj(x)
            assert out.shape == (B, S, vocab)


# ============================================================
# 12. Full Transformer Tests
# ============================================================
class TestTransformer:

    def test_encode_shape(self):
        """encode() should return (B, S, dmodel)."""
        model = Transformer(cfg)
        src = torch.randint(0, cfg.vocabsize, (B, S))
        out = model.encode(src, None)
        assert out.shape == (B, S, D_MODEL)

    def test_decode_shape(self):
        """decode() should return (B, S, dmodel)."""
        model = Transformer(cfg)
        src = torch.randint(0, cfg.vocabsize, (B, S))
        tgt = torch.randint(0, cfg.vocabsize, (B, S))
        enc_out = model.encode(src, None)
        dec_out = model.decode(tgt, enc_out, None, None)
        assert dec_out.shape == (B, S, D_MODEL)

    def test_project_shape(self):
        """project() should return (B, S, vocabsize)."""
        model = Transformer(cfg)
        src = torch.randint(0, cfg.vocabsize, (B, S))
        tgt = torch.randint(0, cfg.vocabsize, (B, S))
        enc_out = model.encode(src, None)
        dec_out = model.decode(tgt, enc_out, None, None)
        proj    = model.project(dec_out)
        assert proj.shape == (B, S, cfg.vocabsize)

    def test_end_to_end(self):
        """Full forward pass should produce valid log-probabilities."""
        model = Transformer(cfg)
        src = torch.randint(0, cfg.vocabsize, (B, S))
        tgt = torch.randint(0, cfg.vocabsize, (B, S))
        enc_out = model.encode(src, None)
        dec_out = model.decode(tgt, enc_out, None, None)
        output  = model.project(dec_out)
        assert output.shape == (B, S, cfg.vocabsize)
        assert (output <= 0).all(), "Should be log-probabilities"

    def test_causal_mask(self):
        """Should work with causal (tgt) mask."""
        model = Transformer(cfg)
        src = torch.randint(0, cfg.vocabsize, (B, S))
        tgt = torch.randint(0, cfg.vocabsize, (B, S))
        tgt_mask = torch.tril(torch.ones(S, S)).unsqueeze(0).unsqueeze(0)
        enc_out = model.encode(src, None)
        dec_out = model.decode(tgt, enc_out, None, tgt_mask)
        output  = model.project(dec_out)
        assert output.shape == (B, S, cfg.vocabsize)

    def test_gradients_flow(self):
        """Gradients should flow back through the entire model."""
        model = Transformer(cfg)
        src = torch.randint(0, cfg.vocabsize, (B, S))
        tgt = torch.randint(0, cfg.vocabsize, (B, S))
        enc_out = model.encode(src, None)
        dec_out = model.decode(tgt, enc_out, None, None)
        output  = model.project(dec_out)
        loss = output.sum()
        loss.backward()
        has_grad = any(p.grad is not None and p.grad.abs().sum() > 0
                       for p in model.parameters())
        assert has_grad, "Gradients should flow through the model"

    def test_deterministic_in_eval_mode(self):
        """In eval mode (dropout disabled), same input → same output."""
        model = Transformer(cfg)
        model.eval()
        src = torch.randint(0, cfg.vocabsize, (B, S))
        enc1 = model.encode(src, None)
        enc2 = model.encode(src, None)
        assert torch.allclose(enc1, enc2), "eval mode should be deterministic"

    def test_parameter_count_positive(self):
        """Model should have a positive number of parameters."""
        model = Transformer(cfg)
        total = sum(p.numel() for p in model.parameters())
        assert total > 0

    def test_different_src_tgt_lengths(self):
        """Transformer should handle src and tgt of different lengths."""
        model = Transformer(cfg)
        src = torch.randint(0, cfg.vocabsize, (B, S))
        tgt = torch.randint(0, cfg.vocabsize, (B, 7))
        enc_out = model.encode(src, None)
        dec_out = model.decode(tgt, enc_out, None, None)
        output  = model.project(dec_out)
        assert dec_out.shape == (B, 7, D_MODEL)
        assert output.shape  == (B, 7, cfg.vocabsize)

    def test_config_controls_depth(self):
        """N in config should control the number of encoder/decoder layers."""
        for n in [1, 2, 4]:
            c = TransformerConfig(dmodel=D_MODEL, H=4, N=n)
            model = Transformer(c)
            assert len(model.encoder.layers) == n
            assert len(model.decoder.layers) == n


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
