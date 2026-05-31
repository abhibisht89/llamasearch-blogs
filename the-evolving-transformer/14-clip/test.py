"""Test suite for clip.py — run with: python test.py"""

import torch
import pytest

from clip import (
    CLIPConfig,
    LayerNormalization,
    MultiHeadAttention,
    FeedForward,
    TransformerBlock,
    TextEncoder,
    PatchEmbedding,
    ImageEncoder,
    CLIPLoss,
    CLIP,
)

cfg = CLIPConfig(
    dmodel=64,
    H=4,
    N=2,
    dff=128,
    embed_dim=32,
    B=2,
    image_size=32,
    patch_size=8,
    vocab_size=100,
    max_text_len=16,
)

B = cfg.B
img = torch.randn(B, cfg.C, cfg.image_size, cfg.image_size)
tokens = torch.randint(0, cfg.vocab_size, (B, cfg.max_text_len))
x_seq = torch.randn(B, cfg.max_text_len, cfg.dmodel)


class TestSharedBlocks:
    def test_layer_norm(self):
        assert LayerNormalization(cfg)(x_seq).shape == x_seq.shape

    def test_mha(self):
        assert MultiHeadAttention(cfg)(x_seq).shape == x_seq.shape

    def test_ff(self):
        assert FeedForward(cfg)(x_seq).shape == x_seq.shape

    def test_block(self):
        assert TransformerBlock(cfg)(x_seq).shape == x_seq.shape


class TestEncoders:
    def test_text_encoder(self):
        assert TextEncoder(cfg)(tokens).shape == (B, cfg.embed_dim)

    def test_patch_embed(self):
        assert PatchEmbedding(cfg)(img).shape == (B, cfg.num_patches, cfg.dmodel)

    def test_image_encoder(self):
        assert ImageEncoder(cfg)(img).shape == (B, cfg.embed_dim)


class TestCLIP:
    def test_forward(self):
        model = CLIP(cfg)
        logits, loss = model(img, tokens)
        assert logits.shape == (B, B)
        assert loss.ndim == 0

    def test_clip_loss(self):
        logits = torch.randn(B, B)
        assert CLIPLoss()(logits).ndim == 0

    def test_encode_normalized(self):
        model = CLIP(cfg)
        i = model.encode_image(img)
        t = model.encode_text(tokens)
        assert torch.allclose(i.norm(dim=-1), torch.ones(B), atol=1e-5)
        assert torch.allclose(t.norm(dim=-1), torch.ones(B), atol=1e-5)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
