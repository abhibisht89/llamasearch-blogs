"""
Test suite for the config-based Mixtral 8×7B implementation.

Tests each class individually, then the full model end-to-end.
Run with: python -m pytest test.py -v
Or simply: python test.py
"""

import torch
import pytest

from mixtral import (
    MixtralConfig,
    make_sliding_window_mask,
    RMSNorm,
    SwiGLUFeedForward,
    MoERouter,
    MoE,
    RotaryPositionalEmbedding,
    SlidingWindowGQA,
    Block,
    Mixtral,
)

# ============================================================
# Common test config — small values for fast tests
# ============================================================
cfg = MixtralConfig(
    dmodel=64,
    vocabsize=100,
    B=2,
    max_seq_len=20,
    N=2,
    H=4,
    n_kv_heads=2,
    dff=128,
    norm_eps=1e-5,
    sliding_window=8,
    num_experts=4,
    top_k=2,
)

B = cfg.B
S = cfg.max_seq_len
D_MODEL = cfg.dmodel


def make_mask(seq_len=S):
    return make_sliding_window_mask(cfg.max_seq_len, cfg.sliding_window)


class TestMoERouter:

    def test_output_shapes(self):
        router = MoERouter(cfg)
        x = torch.randn(B, S, D_MODEL)
        weights, indices = router(x)
        assert weights.shape == (B, S, cfg.top_k)
        assert indices.shape == (B, S, cfg.top_k)

    def test_weights_renormalize(self):
        router = MoERouter(cfg)
        x = torch.randn(B, S, D_MODEL)
        weights, _ = router(x)
        assert torch.allclose(weights.sum(dim=-1), torch.ones(B, S), atol=1e-5)


class TestMoE:

    def test_output_shape(self):
        moe = MoE(cfg)
        x = torch.randn(B, S, D_MODEL)
        assert moe(x).shape == (B, S, D_MODEL)


class TestSwiGLU:

    def test_output_shape(self):
        ff = SwiGLUFeedForward(cfg)
        x = torch.randn(B, S, D_MODEL)
        assert ff(x).shape == (B, S, D_MODEL)


class TestSlidingWindowGQA:

    def test_output_shape(self):
        gqa = SlidingWindowGQA(cfg)
        rope = RotaryPositionalEmbedding(cfg)
        mask = make_mask()
        x = torch.randn(B, S, D_MODEL)
        assert gqa(x, rope, mask).shape == (B, S, D_MODEL)


class TestBlock:

    def test_output_shape(self):
        block = Block(cfg)
        rope = RotaryPositionalEmbedding(cfg)
        mask = make_mask()
        x = torch.randn(B, S, D_MODEL)
        assert block(x, rope, mask).shape == (B, S, D_MODEL)


class TestMixtral:

    def test_forward_shape(self):
        model = Mixtral(cfg)
        x = torch.randint(0, cfg.vocabsize, (B, S))
        assert model(x).shape == (B, S, cfg.vocabsize)

    def test_weight_tying(self):
        model = Mixtral(cfg)
        assert model.lm_head.weight.data_ptr() == model.wte.weight.data_ptr()

    def test_sliding_window_mask_buffer(self):
        model = Mixtral(cfg)
        assert model.mask.shape == (cfg.max_seq_len, cfg.max_seq_len)

    def test_gradients_flow(self):
        model = Mixtral(cfg)
        x = torch.randint(0, cfg.vocabsize, (B, S))
        loss = model(x).sum()
        loss.backward()
        has_grad = any(
            p.grad is not None and p.grad.abs().sum() > 0 for p in model.parameters()
        )
        assert has_grad

    def test_deterministic_in_eval_mode(self):
        model = Mixtral(cfg)
        model.eval()
        x = torch.randint(0, cfg.vocabsize, (B, S))
        assert torch.allclose(model(x), model(x))


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
