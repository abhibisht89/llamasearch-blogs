"""
Test suite for the config-based Mistral 7B implementation.

Tests each class individually, then the full model end-to-end.
Run with: python -m pytest test.py -v
Or simply: python test.py
"""

import torch
import pytest

from mistral import (
    MistralConfig,
    make_sliding_window_mask,
    RMSNorm,
    RotaryPositionalEmbedding,
    SwiGLUFeedForward,
    SlidingWindowGQA,
    Block,
    Mistral,
)

# ============================================================
# Common test config — small values for fast tests
# ============================================================
cfg = MistralConfig(
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
)

B = cfg.B
S = cfg.max_seq_len
D_MODEL = cfg.dmodel
W = cfg.sliding_window


def make_mask(seq_len=S):
    return make_sliding_window_mask(cfg.max_seq_len, cfg.sliding_window)


# ============================================================
# 1. Sliding window mask Tests
# ============================================================
class TestSlidingWindowMask:

    def test_causal_and_window(self):
        mask = make_sliding_window_mask(10, 4)
        assert mask.shape == (10, 10)
        # row 5: can attend to positions 2,3,4,5 (window=4)
        assert mask[5, 5] == 1
        assert mask[5, 4] == 1
        assert mask[5, 2] == 1
        assert mask[5, 1] == 0  # outside window
        assert mask[5, 6] == 0  # future

    def test_narrower_than_full_causal(self):
        full = torch.tril(torch.ones(S, S))
        windowed = make_sliding_window_mask(S, W)
        assert windowed.sum() < full.sum()


# ============================================================
# 2. RMSNorm Tests
# ============================================================
class TestRMSNorm:

    def test_output_shape(self):
        norm = RMSNorm(cfg)
        x = torch.randn(B, S, D_MODEL)
        assert norm(x).shape == (B, S, D_MODEL)


# ============================================================
# 3. SlidingWindowGQA Tests
# ============================================================
class TestSlidingWindowGQA:

    def test_output_shape(self):
        gqa = SlidingWindowGQA(cfg)
        rope = RotaryPositionalEmbedding(cfg)
        mask = make_mask()
        x = torch.randn(B, S, D_MODEL)
        assert gqa(x, rope, mask).shape == (B, S, D_MODEL)

    def test_window_changes_output_vs_full_causal(self):
        gqa = SlidingWindowGQA(cfg)
        rope = RotaryPositionalEmbedding(cfg)
        x = torch.randn(B, S, D_MODEL)
        full = torch.tril(torch.ones(S, S))
        windowed = make_mask()
        out_full = gqa(x, rope, full)
        out_window = gqa(x, rope, windowed)
        assert not torch.allclose(out_full, out_window)


# ============================================================
# 4. Block Tests
# ============================================================
class TestBlock:

    def test_output_shape(self):
        block = Block(cfg)
        rope = RotaryPositionalEmbedding(cfg)
        mask = make_mask()
        x = torch.randn(B, S, D_MODEL)
        assert block(x, rope, mask).shape == (B, S, D_MODEL)


# ============================================================
# 5. Full Mistral Tests
# ============================================================
class TestMistral:

    def test_forward_shape(self):
        model = Mistral(cfg)
        x = torch.randint(0, cfg.vocabsize, (B, S))
        assert model(x).shape == (B, S, cfg.vocabsize)

    def test_weight_tying(self):
        model = Mistral(cfg)
        assert model.lm_head.weight.data_ptr() == model.wte.weight.data_ptr()

    def test_sliding_window_mask_buffer(self):
        model = Mistral(cfg)
        assert hasattr(model, "mask")
        assert model.mask.shape == (cfg.max_seq_len, cfg.max_seq_len)
        assert model.mask.sum() < torch.tril(torch.ones_like(model.mask)).sum()

    def test_gradients_flow(self):
        model = Mistral(cfg)
        x = torch.randint(0, cfg.vocabsize, (B, S))
        loss = model(x).sum()
        loss.backward()
        has_grad = any(
            p.grad is not None and p.grad.abs().sum() > 0 for p in model.parameters()
        )
        assert has_grad

    def test_deterministic_in_eval_mode(self):
        model = Mistral(cfg)
        model.eval()
        x = torch.randint(0, cfg.vocabsize, (B, S))
        assert torch.allclose(model(x), model(x))


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
