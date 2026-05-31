"""Test suite for qwen3.py — run with: python test.py"""

import torch
import pytest

from qwen3 import (
    Qwen3Config,
    RMSNorm,
    GatedDeltaNet,
    GatedAttention,
    RotaryPositionalEmbedding,
    MoE,
    MultiTokenPrediction,
    Block,
    Qwen3,
)

cfg = Qwen3Config(
    dmodel=64,
    vocabsize=100,
    B=2,
    max_seq_len=20,
    N=4,
    H=4,
    n_kv_heads=2,
    num_experts=4,
    top_k=2,
    full_attn_every=4,
    mtp_depth=1,
)

B, S, D = cfg.B, cfg.max_seq_len, cfg.dmodel
mask = torch.tril(torch.ones(S, S))
rope = RotaryPositionalEmbedding(cfg)


class TestRMSNorm:
    def test_shape(self):
        x = torch.randn(B, S, D)
        assert RMSNorm(cfg)(x).shape == x.shape


class TestGatedDeltaNet:
    def test_shape(self):
        x = torch.randn(B, S, D)
        assert GatedDeltaNet(cfg)(x).shape == x.shape


class TestGatedAttention:
    def test_shape(self):
        x = torch.randn(B, S, D)
        assert GatedAttention(cfg)(x, rope, mask).shape == x.shape


class TestMoE:
    def test_shape(self):
        x = torch.randn(B, S, D)
        assert MoE(cfg)(x).shape == x.shape


class TestBlock:
    def test_deltanet_layer(self):
        x = torch.randn(B, S, D)
        assert Block(cfg, layer_idx=0)(x, rope, mask).shape == x.shape

    def test_attention_layer(self):
        x = torch.randn(B, S, D)
        assert Block(cfg, layer_idx=3)(x, rope, mask).shape == x.shape


class TestQwen3:
    def test_forward(self):
        model = Qwen3(cfg)
        ids = torch.randint(0, cfg.vocabsize, (B, S))
        main_logits, mtp_logits = model(ids)
        assert main_logits.shape == (B, S, cfg.vocabsize)
        assert len(mtp_logits) == cfg.mtp_depth

    def test_weight_tying(self):
        model = Qwen3(cfg)
        assert model.lm_head.weight.data_ptr() == model.wte.weight.data_ptr()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
