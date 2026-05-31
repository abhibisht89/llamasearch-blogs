"""
Test suite for the config-based GPT-2 implementation.

Tests each class individually, then the full model end-to-end.
Run with: python -m pytest test.py -v
Or simply: python test.py
"""

import torch
import pytest

from gpt2 import (
    GPTConfig,
    MLP,
    CausalSelfAttention,
    Block,
    GPT,
)

# ============================================================
# Common test config — small values for fast tests
# ============================================================
cfg = GPTConfig(
    dmodel=64,
    vocabsize=100,
    B=2,
    max_seq_len=10,
    N=2,
    H=4,
    dropout=0.0,  # zero dropout for deterministic tests
)

B = cfg.B
S = cfg.max_seq_len
D_MODEL = cfg.dmodel


def make_causal_mask(seq_len=S):
    """Lower-triangular causal mask used by attention tests."""
    return torch.tril(torch.ones(seq_len, seq_len))


# ============================================================
# 1. MLP Tests
# ============================================================
class TestMLP:

    def test_output_shape(self):
        """MLP should preserve (B, S, dmodel)."""
        mlp = MLP(cfg)
        x = torch.randn(B, S, D_MODEL)
        out = mlp(x)
        assert out.shape == (B, S, D_MODEL)

    def test_transforms_input(self):
        """Output should differ from input."""
        mlp = MLP(cfg)
        x = torch.randn(B, S, D_MODEL)
        out = mlp(x)
        assert not torch.allclose(x, out)

    def test_inner_dimension(self):
        """Internal expansion should use dff = 4 * dmodel."""
        mlp = MLP(cfg)
        assert mlp.w1.weight.shape == (cfg.dff, D_MODEL)
        assert mlp.w2.weight.shape == (D_MODEL, cfg.dff)


# ============================================================
# 2. CausalSelfAttention Tests
# ============================================================
class TestCausalSelfAttention:

    def test_output_shape(self):
        """Self-attention should return (B, S, dmodel)."""
        attn = CausalSelfAttention(cfg)
        x = torch.randn(B, S, D_MODEL)
        mask = make_causal_mask()
        out = attn(x, mask)
        assert out.shape == (B, S, D_MODEL)

    def test_projection_matrices(self):
        """Should have four projection matrices: wq, wk, wv, wo."""
        attn = CausalSelfAttention(cfg)
        for name in ["wq", "wk", "wv", "wo"]:
            assert hasattr(attn, name), f"Missing projection matrix: {name}"

    def test_causal_mask_changes_output(self):
        """Causal mask should change attention output vs no mask."""
        attn = CausalSelfAttention(cfg)
        x = torch.randn(B, S, D_MODEL)
        causal = make_causal_mask()
        full = torch.ones(S, S)
        out_causal = attn(x, causal)
        out_full = attn(x, full)
        assert not torch.allclose(out_causal, out_full)

    def test_dk_property(self):
        """dk should equal dmodel // H."""
        attn = CausalSelfAttention(cfg)
        assert attn.dk == D_MODEL // cfg.H

    def test_shorter_sequence(self):
        """Should handle sequences shorter than max_seq_len."""
        attn = CausalSelfAttention(cfg)
        short = 5
        x = torch.randn(B, short, D_MODEL)
        mask = make_causal_mask(cfg.max_seq_len)
        out = attn(x, mask)
        assert out.shape == (B, short, D_MODEL)


# ============================================================
# 3. Block Tests
# ============================================================
class TestBlock:

    def test_output_shape(self):
        """Block output should have shape (B, S, dmodel)."""
        block = Block(cfg)
        x = torch.randn(B, S, D_MODEL)
        mask = make_causal_mask(cfg.max_seq_len)
        out = block(x, mask)
        assert out.shape == (B, S, D_MODEL)

    def test_pre_norm_layers(self):
        """Block should have two LayerNorms (pre-norm)."""
        block = Block(cfg)
        assert hasattr(block, "norm_1")
        assert hasattr(block, "norm_2")

    def test_has_attention_and_ffn(self):
        """Block should wire attention and MLP sublayers."""
        block = Block(cfg)
        assert hasattr(block, "attn")
        assert hasattr(block, "ff")


# ============================================================
# 4. Full GPT Tests
# ============================================================
class TestGPT:

    def test_forward_shape(self):
        """forward() should return raw logits (B, S, vocabsize)."""
        model = GPT(cfg)
        x = torch.randint(0, cfg.vocabsize, (B, S))
        out = model(x)
        assert out.shape == (B, S, cfg.vocabsize)

    def test_weight_tying(self):
        """lm_head should share weights with wte."""
        model = GPT(cfg)
        assert model.lm_head.weight.data_ptr() == model.wte.weight.data_ptr()

    def test_causal_mask_buffer(self):
        """Model should register a lower-triangular causal mask buffer."""
        model = GPT(cfg)
        assert hasattr(model, "mask")
        assert model.mask.shape == (cfg.max_seq_len, cfg.max_seq_len)
        assert torch.allclose(model.mask, torch.tril(model.mask))

    def test_n_blocks(self):
        """N in config should control the number of transformer blocks."""
        for n in [1, 2, 4]:
            c = GPTConfig(dmodel=D_MODEL, vocabsize=cfg.vocabsize, H=cfg.H, N=n)
            model = GPT(c)
            assert len(model.blocks) == n

    def test_shorter_sequence(self):
        """Should handle sequences shorter than max_seq_len."""
        model = GPT(cfg)
        short = 7
        x = torch.randint(0, cfg.vocabsize, (B, short))
        out = model(x)
        assert out.shape == (B, short, cfg.vocabsize)

    def test_gradients_flow(self):
        """Gradients should flow back through the entire model."""
        model = GPT(cfg)
        x = torch.randint(0, cfg.vocabsize, (B, S))
        out = model(x)
        loss = out.sum()
        loss.backward()
        has_grad = any(
            p.grad is not None and p.grad.abs().sum() > 0 for p in model.parameters()
        )
        assert has_grad, "Gradients should flow through the model"

    def test_deterministic_in_eval_mode(self):
        """In eval mode (dropout disabled), same input → same output."""
        model = GPT(cfg)
        model.eval()
        x = torch.randint(0, cfg.vocabsize, (B, S))
        out1 = model(x)
        out2 = model(x)
        assert torch.allclose(out1, out2)

    def test_raw_logits_not_log_probs(self):
        """GPT returns raw logits — values are not constrained to log-prob range."""
        model = GPT(cfg)
        model.eval()
        x = torch.randint(0, cfg.vocabsize, (B, S))
        out = model(x)
        # Log-probs would all be <= 0; logits can be positive
        assert (out > 0).any(), "Raw logits should include positive values"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
