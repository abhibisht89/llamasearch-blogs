"""
Test suite for DeepSeek V2 (basic MLA + wpe) and V3 (decoupled RoPE MLA + MoE).

Run with: python -m pytest test.py -v
Or simply: python test.py
"""

import torch
import pytest

from deepseek_v2 import (
    DeepseekV2Config,
    BasicMLA,
    Block as BlockV2,
    DeepseekV2,
    MoE as MoEV2,
    MoERouter as MoERouterV2,
    SwiGLUFeedForward as SwiGLUFeedForwardV2,
)
from deepseek_v3 import (
    DeepseekConfig,
    Block as BlockV3,
    Deepseek,
    MoE,
    MoERouter,
    MultiHeadLatentAttention,
    RotaryPositionalEmbedding,
    SwiGLUFeedForward,
)

# Small configs for fast tests
v2_cfg = DeepseekV2Config(
    dmodel=64,
    vocabsize=100,
    B=2,
    max_seq_len=20,
    N=2,
    H=4,
    kv_lora_rank=16,
    q_lora_rank=32,
    num_experts=4,
    top_k=2,
    n_dense_layers=1,
)

v3_cfg = DeepseekConfig(
    dmodel=64,
    vocabsize=100,
    B=2,
    max_seq_len=20,
    N=2,
    H=4,
    kv_lora_rank=16,
    q_lora_rank=32,
    rope_head_dim=8,
    nope_head_dim=8,
    num_experts=4,
    top_k=2,
    n_dense_layers=1,
)

B = 2
S = 20
D_MODEL = 64


def make_mask(seq_len=S):
    return torch.tril(torch.ones(seq_len, seq_len))


class TestDeepSeekV3Components:

    def test_moe_router_shapes(self):
        router = MoERouter(v3_cfg)
        x = torch.randn(B, S, D_MODEL)
        weights, indices = router(x)
        assert weights.shape == (B, S, v3_cfg.top_k)
        assert indices.shape == (B, S, v3_cfg.top_k)
        assert torch.allclose(weights.sum(dim=-1), torch.ones(B, S), atol=1e-5)

    def test_mla_output_shape(self):
        mla = MultiHeadLatentAttention(v3_cfg)
        rope = RotaryPositionalEmbedding(v3_cfg, head_dim=v3_cfg.rope_head_dim)
        x = torch.randn(B, S, D_MODEL)
        assert mla(x, rope, make_mask()).shape == (B, S, D_MODEL)

    def test_block_dense_vs_moe(self):
        rope = RotaryPositionalEmbedding(v3_cfg, head_dim=v3_cfg.rope_head_dim)
        mask = make_mask()
        x = torch.randn(B, S, D_MODEL)

        dense_block = BlockV3(v3_cfg, layer_idx=0)
        moe_block = BlockV3(v3_cfg, layer_idx=1)
        assert isinstance(dense_block.ff, SwiGLUFeedForward)
        assert isinstance(moe_block.ff, MoE)
        assert dense_block(x, rope, mask).shape == (B, S, D_MODEL)
        assert moe_block(x, rope, mask).shape == (B, S, D_MODEL)


class TestDeepSeekV3Model:

    def test_forward_shape(self):
        model = Deepseek(v3_cfg)
        x = torch.randint(0, v3_cfg.vocabsize, (B, S))
        assert model(x).shape == (B, S, v3_cfg.vocabsize)

    def test_weight_tying(self):
        model = Deepseek(v3_cfg)
        assert model.lm_head.weight.data_ptr() == model.wte.weight.data_ptr()

    def test_gradients_flow(self):
        model = Deepseek(v3_cfg)
        x = torch.randint(0, v3_cfg.vocabsize, (B, S))
        loss = model(x).sum()
        loss.backward()
        assert any(p.grad is not None and p.grad.abs().sum() > 0 for p in model.parameters())


class TestDeepSeekV2Components:

    def test_basic_mla_output_shape(self):
        mla = BasicMLA(v2_cfg)
        x = torch.randn(B, S, D_MODEL)
        assert mla(x, make_mask()).shape == (B, S, D_MODEL)

    def test_moe_output_shape(self):
        moe = MoEV2(v2_cfg)
        x = torch.randn(B, S, D_MODEL)
        assert moe(x).shape == (B, S, D_MODEL)

    def test_router_renormalizes(self):
        router = MoERouterV2(v2_cfg)
        x = torch.randn(B, S, D_MODEL)
        weights, _ = router(x)
        assert torch.allclose(weights.sum(dim=-1), torch.ones(B, S), atol=1e-5)


class TestDeepSeekV2Model:

    def test_forward_shape(self):
        model = DeepseekV2(v2_cfg)
        x = torch.randint(0, v2_cfg.vocabsize, (B, S))
        assert model(x).shape == (B, S, v2_cfg.vocabsize)

    def test_weight_tying(self):
        model = DeepseekV2(v2_cfg)
        assert model.lm_head.weight.data_ptr() == model.wte.weight.data_ptr()

    def test_has_learned_positional_embeddings(self):
        model = DeepseekV2(v2_cfg)
        assert hasattr(model, "wpe")
        assert model.wpe.num_embeddings == v2_cfg.max_seq_len


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
