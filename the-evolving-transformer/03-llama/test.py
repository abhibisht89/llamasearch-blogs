"""
Test suite for the config-based LLaMA implementation.

Tests each class individually, then the full model end-to-end.
Run with: python -m pytest test.py -v
Or simply: python test.py
"""

import torch
import pytest

from llama import (
    LlamaConfig,
    RMSNorm,
    RotaryPositionalEmbedding,
    SwiGLUFeedForward,
    GQABlock,
    Block,
    LLAMA,
)

# ============================================================
# Common test config — small values for fast tests
# ============================================================
cfg = LlamaConfig(
    dmodel=64,
    vocabsize=100,
    B=2,
    max_seq_len=10,
    N=2,
    H=4,
    n_kv_heads=2,
    dff=128,
    norm_eps=1e-5,
)

B = cfg.B
S = cfg.max_seq_len
D_MODEL = cfg.dmodel


def make_causal_mask(seq_len=S):
    return torch.tril(torch.ones(seq_len, seq_len))


# ============================================================
# 1. RMSNorm Tests
# ============================================================
class TestRMSNorm:

    def test_output_shape(self):
        norm = RMSNorm(cfg)
        x = torch.randn(B, S, D_MODEL)
        out = norm(x)
        assert out.shape == (B, S, D_MODEL)

    def test_transforms_input(self):
        norm = RMSNorm(cfg)
        x = torch.randn(B, S, D_MODEL)
        out = norm(x)
        assert not torch.allclose(x, out)

    def test_gamma_learnable(self):
        norm = RMSNorm(cfg)
        assert norm.gamma.requires_grad


# ============================================================
# 2. RoPE Tests
# ============================================================
class TestRotaryPositionalEmbedding:

    def test_output_shape(self):
        rope = RotaryPositionalEmbedding(cfg)
        x = torch.randn(B, cfg.H, S, cfg.dk)
        out = rope(x)
        assert out.shape == (B, cfg.H, S, cfg.dk)

    def test_preserves_norm_approx(self):
        rope = RotaryPositionalEmbedding(cfg)
        x = torch.randn(B, cfg.H, S, cfg.dk)
        out = rope(x)
        in_norm = x.norm(dim=-1)
        out_norm = out.norm(dim=-1)
        assert torch.allclose(in_norm, out_norm, atol=1e-4)


# ============================================================
# 3. SwiGLU FFN Tests
# ============================================================
class TestSwiGLUFeedForward:

    def test_output_shape(self):
        ff = SwiGLUFeedForward(cfg)
        x = torch.randn(B, S, D_MODEL)
        out = ff(x)
        assert out.shape == (B, S, D_MODEL)

    def test_no_bias(self):
        ff = SwiGLUFeedForward(cfg)
        for layer in [ff.w1, ff.w2, ff.w3]:
            assert layer.bias is None


# ============================================================
# 4. GQA Tests
# ============================================================
class TestGQABlock:

    def test_output_shape(self):
        gqa = GQABlock(cfg)
        rope = RotaryPositionalEmbedding(cfg)
        mask = make_causal_mask(cfg.max_seq_len)
        x = torch.randn(B, S, D_MODEL)
        out = gqa(x, rope, mask)
        assert out.shape == (B, S, D_MODEL)

    def test_repeat_kv_expands_heads(self):
        x = torch.randn(B, cfg.n_kv_heads, S, cfg.dk)
        expanded = GQABlock.repeat_kv(x, cfg.H // cfg.n_kv_heads)
        assert expanded.shape == (B, cfg.H, S, cfg.dk)

    def test_n_rep_property(self):
        gqa = GQABlock(cfg)
        assert gqa.n_rep == cfg.H // cfg.n_kv_heads


# ============================================================
# 5. Block Tests
# ============================================================
class TestBlock:

    def test_output_shape(self):
        block = Block(cfg)
        rope = RotaryPositionalEmbedding(cfg)
        mask = make_causal_mask(cfg.max_seq_len)
        x = torch.randn(B, S, D_MODEL)
        out = block(x, rope, mask)
        assert out.shape == (B, S, D_MODEL)


# ============================================================
# 6. Full LLAMA Tests
# ============================================================
class TestLLAMA:

    def test_forward_shape(self):
        model = LLAMA(cfg)
        x = torch.randint(0, cfg.vocabsize, (B, S))
        out = model(x)
        assert out.shape == (B, S, cfg.vocabsize)

    def test_weight_tying(self):
        model = LLAMA(cfg)
        assert model.lm_head.weight.data_ptr() == model.wte.weight.data_ptr()

    def test_no_position_embedding_table(self):
        model = LLAMA(cfg)
        assert not hasattr(model, "wpe")

    def test_rope_shared_across_blocks(self):
        model = LLAMA(cfg)
        assert isinstance(model.rope, RotaryPositionalEmbedding)

    def test_gradients_flow(self):
        model = LLAMA(cfg)
        x = torch.randint(0, cfg.vocabsize, (B, S))
        out = model(x)
        loss = out.sum()
        loss.backward()
        has_grad = any(
            p.grad is not None and p.grad.abs().sum() > 0 for p in model.parameters()
        )
        assert has_grad

    def test_deterministic_in_eval_mode(self):
        model = LLAMA(cfg)
        model.eval()
        x = torch.randint(0, cfg.vocabsize, (B, S))
        assert torch.allclose(model(x), model(x))


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
