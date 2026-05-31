"""Test suite for paligemma.py — run with: python test.py"""

import torch
import pytest

from paligemma import (
    PaliGemmaConfig,
    LayerNorm,
    RMSNorm,
    SigLIPPatchEmbedding,
    SigLIPVisionEncoder,
    LinearProjector,
    GemmaDecoder,
    PaliGemma,
)

cfg = PaliGemmaConfig(
    B=2,
    image_size=32,
    patch_size=8,
    vision_dmodel=64,
    vision_H=4,
    vision_N=2,
    gemma_dmodel=128,
    gemma_H=4,
    gemma_N=2,
    vocab_size=100,
    max_text_len=16,
)

B = cfg.B
img = torch.randn(B, cfg.C, cfg.image_size, cfg.image_size)
tokens = torch.randint(0, cfg.vocab_size, (B, cfg.max_text_len))


class TestNorms:
    def test_layer_norm(self):
        x = torch.randn(B, cfg.num_patches, cfg.vision_dmodel)
        assert LayerNorm(cfg.vision_dmodel)(x).shape == x.shape

    def test_rms_norm(self):
        x = torch.randn(B, cfg.max_text_len, cfg.gemma_dmodel)
        assert RMSNorm(cfg.gemma_dmodel)(x).shape == x.shape


class TestVision:
    def test_patch_embed(self):
        out = SigLIPPatchEmbedding(cfg)(img)
        assert out.shape == (B, cfg.num_patches, cfg.vision_dmodel)

    def test_siglip_encoder(self):
        out = SigLIPVisionEncoder(cfg)(img)
        assert out.shape == (B, cfg.num_patches, cfg.vision_dmodel)


class TestBridge:
    def test_projector(self):
        patches = SigLIPVisionEncoder(cfg)(img)
        assert LinearProjector(cfg)(patches).shape == (B, cfg.num_patches, cfg.gemma_dmodel)


class TestPaliGemma:
    def test_forward(self):
        model = PaliGemma(cfg)
        logits = model(img, tokens)
        assert logits.shape == (B, cfg.total_seq_len, cfg.vocab_size)

    def test_weight_tying(self):
        model = PaliGemma(cfg)
        assert (
            model.language_model.lm_head.weight.data_ptr()
            == model.language_model.wte.weight.data_ptr()
        )


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
