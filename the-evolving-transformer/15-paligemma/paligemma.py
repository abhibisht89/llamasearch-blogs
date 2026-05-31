from dataclasses import dataclass
import math
import torch
import torch.nn as nn
import torch.nn.functional as F


# ─────────────────────────────────────────────────────────────────────────────
# CONFIG
# Two sub-models with different hidden dims: SigLIP (vision) + Gemma (language)
# Small values — optimised for learning, not performance
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class PaliGemmaConfig:
    B: int = 2               # batch size
    dropout: float = 0.1
    norm_eps: float = 1e-6

    # --- SigLIP vision encoder ---
    image_size: int = 32     # image H = W (kept small for learning)
    patch_size: int = 8      # each patch is patch_size × patch_size pixels
    C: int = 3               # RGB channels
    vision_dmodel: int = 64  # hidden dim for the vision transformer
    vision_H: int = 8        # attention heads for vision → dk = 64/8 = 8
    vision_N: int = 2        # number of vision encoder blocks
    vision_dff: int = 256    # feedforward inner dim for vision

    # --- Gemma language model ---
    vocab_size: int = 1000   # text vocabulary
    max_text_len: int = 16   # max text tokens per sample
    gemma_dmodel: int = 128  # hidden dim for language model (different from vision)
    gemma_H: int = 8         # attention heads for Gemma → dk = 128/8 = 16
    gemma_N: int = 2         # number of Gemma decoder layers

    @property
    def vision_dk(self):
        return self.vision_dmodel // self.vision_H

    @property
    def gemma_dk(self):
        return self.gemma_dmodel // self.gemma_H

    @property
    def gemma_dff(self):
        # SwiGLU typically uses 4 × dmodel for inner dim
        return 4 * self.gemma_dmodel

    @property
    def num_patches(self):
        # 32×32 image, 8×8 patches → 4×4 grid → 16 patches
        return (self.image_size // self.patch_size) ** 2

    @property
    def total_seq_len(self):
        # Gemma receives: [image patches] + [text tokens]
        return self.num_patches + self.max_text_len


config = PaliGemmaConfig()


# ─────────────────────────────────────────────────────────────────────────────
# NORMALIZATION LAYERS
# SigLIP uses LayerNorm (subtracts mean)
# Gemma uses RMSNorm  (no mean subtraction — simpler, faster for LLMs)
# ─────────────────────────────────────────────────────────────────────────────

class LayerNorm(nn.Module):
    # z = alpha * (x - mean) / (std + eps) + bias
    def __init__(self, dmodel, eps=1e-6):
        super().__init__()
        self.eps   = eps
        self.alpha = nn.Parameter(torch.ones(dmodel))
        self.bias  = nn.Parameter(torch.zeros(dmodel))

    def forward(self, x):
        mean = x.mean(dim=-1, keepdim=True)
        std  = x.std(dim=-1, keepdim=True)
        return self.alpha * ((x - mean) / (std + self.eps)) + self.bias


class RMSNorm(nn.Module):
    # z = x / rms(x) * weight    where rms(x) = sqrt(mean(x²) + eps)
    # no mean subtraction — used in LLaMA, Gemma, and most modern LLMs
    # rsqrt(x) = 1 / sqrt(x) — more numerically stable than dividing by sqrt
    def __init__(self, dmodel, eps=1e-6):
        super().__init__()
        self.eps    = eps
        self.weight = nn.Parameter(torch.ones(dmodel))

    def forward(self, x):
        rms = torch.rsqrt(x.pow(2).mean(dim=-1, keepdim=True) + self.eps)
        return x * rms * self.weight


# ─────────────────────────────────────────────────────────────────────────────
# SIGLIP VISION ENCODER
#
# Key differences from CLIP's ImageEncoder:
#   1. NO CLS token — outputs ALL patch tokens  (B, num_patches, vision_dmodel)
#      CLIP: compressed to 1 vector for matching
#      SigLIP: keeps all patches so Gemma can reason spatially
#   2. Position embedding uses nn.Embedding (lookup table) — consistent with GPT-2
#      not nn.Parameter like clip.py
#   3. No final projection — SigLIP hands off raw patch tokens to the LinearProjector
#
# Flow:
#   image → PatchEmbedding + positional embed
#         → N × SigLIPEncoderBlock (full attention, no mask)
#         → LayerNorm
#         → (B, num_patches, vision_dmodel)
# ─────────────────────────────────────────────────────────────────────────────

class SigLIPPatchEmbedding(nn.Module):
    # Conv2d with kernel=stride=patch_size: extracts + projects patches in one step
    # position embedding: nn.Embedding lookup (same as GPT-2's wpe)
    def __init__(self, config):
        super().__init__()
        self.patch_proj = nn.Conv2d(
            in_channels  = config.C,
            out_channels = config.vision_dmodel,
            kernel_size  = config.patch_size,
            stride       = config.patch_size,
            bias         = False,
        )
        # position lookup table: one embedding per patch position
        self.pos_embed = nn.Embedding(config.num_patches, config.vision_dmodel)
        # position_ids = [0, 1, 2, ..., num_patches-1] — fixed, not learnable
        # register_buffer: not a parameter, but moves to GPU with the model
        self.register_buffer(
            "position_ids", torch.arange(config.num_patches).unsqueeze(0)
        )

    def forward(self, x):
        # x: (B, C, H, W)
        x = self.patch_proj(x)      # (B, vision_dmodel, grid_h, grid_w)
        x = x.flatten(2)            # (B, vision_dmodel, num_patches)
        x = x.transpose(1, 2)       # (B, num_patches, vision_dmodel)
        # self.pos_embed(self.position_ids): (1, num_patches, vision_dmodel) → broadcasts over B
        x = x + self.pos_embed(self.position_ids)
        return x                    # (B, num_patches, vision_dmodel)


class SigLIPAttention(nn.Module):
    # full (bidirectional) self-attention — no causal mask
    # every patch can attend to every other patch freely
    def __init__(self, config):
        super().__init__()
        self.h      = config.vision_H
        self.dk     = config.vision_dk
        self.dmodel = config.vision_dmodel
        self.wq = nn.Linear(self.dmodel, self.dmodel)
        self.wk = nn.Linear(self.dmodel, self.dmodel)
        self.wv = nn.Linear(self.dmodel, self.dmodel)
        self.wo = nn.Linear(self.dmodel, self.dmodel)
        self.dropout = nn.Dropout(config.dropout)

    def forward(self, x):
        B, S, _ = x.shape
        q = self.wq(x).view(B, S, self.h, self.dk).transpose(1, 2)
        k = self.wk(x).view(B, S, self.h, self.dk).transpose(1, 2)
        v = self.wv(x).view(B, S, self.h, self.dk).transpose(1, 2)
        scores = q @ k.transpose(-1, -2) / math.sqrt(self.dk)
        # no mask — every patch attends to every other patch
        scores = F.softmax(scores, dim=-1)
        scores = self.dropout(scores)
        out = (scores @ v).transpose(1, 2).contiguous().view(B, S, self.dmodel)
        return self.wo(out)


class SigLIPFeedForward(nn.Module):
    # standard GELU MLP — same as CLIP's FeedForward
    # dmodel → dff → GELU → dmodel
    def __init__(self, config):
        super().__init__()
        self.w_up   = nn.Linear(config.vision_dmodel, config.vision_dff)
        self.w_proj = nn.Linear(config.vision_dff, config.vision_dmodel)
        self.dropout = nn.Dropout(config.dropout)

    def forward(self, x):
        return self.w_proj(self.dropout(F.gelu(self.w_up(x))))


class SigLIPEncoderBlock(nn.Module):
    # pre-norm transformer block: x = x + sublayer(norm(x))
    # uses LayerNorm (not RMSNorm — SigLIP is a vision model, not LLM)
    def __init__(self, config):
        super().__init__()
        self.norm1 = LayerNorm(config.vision_dmodel, config.norm_eps)
        self.norm2 = LayerNorm(config.vision_dmodel, config.norm_eps)
        self.attn  = SigLIPAttention(config)
        self.ff    = SigLIPFeedForward(config)

    def forward(self, x):
        x = x + self.attn(self.norm1(x))
        x = x + self.ff(self.norm2(x))
        return x


class SigLIPVisionEncoder(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.patch_embed = SigLIPPatchEmbedding(config)
        self.blocks      = nn.ModuleList([SigLIPEncoderBlock(config) for _ in range(config.vision_N)])
        self.norm        = LayerNorm(config.vision_dmodel, config.norm_eps)

    def forward(self, images):
        x = self.patch_embed(images)     # (B, num_patches, vision_dmodel)
        for block in self.blocks:
            x = block(x)
        x = self.norm(x)
        return x                          # (B, num_patches, vision_dmodel) — ALL patches kept


# ─────────────────────────────────────────────────────────────────────────────
# LINEAR PROJECTOR
#
# Bridges SigLIP and Gemma.
# Problem: SigLIP outputs vision_dmodel=64, Gemma expects gemma_dmodel=128.
# Solution: one nn.Linear maps all patch tokens into Gemma's embedding space.
#
# (B, num_patches, vision_dmodel) → (B, num_patches, gemma_dmodel)
#
# No activation, no norm — just a learned linear map.
# ─────────────────────────────────────────────────────────────────────────────

class LinearProjector(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.proj = nn.Linear(config.vision_dmodel, config.gemma_dmodel)

    def forward(self, x):
        return self.proj(x)   # (B, num_patches, gemma_dmodel)


# ─────────────────────────────────────────────────────────────────────────────
# GEMMA LANGUAGE MODEL
#
# Key differences from GPT-2:
#   1. RMSNorm instead of LayerNorm — no mean subtraction, simpler and faster
#   2. SwiGLU MLP instead of simple GELU — gated projection for more expressivity
#   3. No bias in linear layers — common in modern LLMs
#   4. Input is image tokens + text tokens concatenated (not text-only like GPT-2)
#
# Flow:
#   image_tokens (B, num_patches, gemma_dmodel)  — already projected
#   text_tokens  (B, S)  →  wte  →  (B, S, gemma_dmodel)
#   concat  →  (B, num_patches+S, gemma_dmodel)
#   + wpe (positional embed over full sequence)
#   → N × GemmaDecoderBlock (causal mask)
#   → RMSNorm → lm_head → logits (B, num_patches+S, vocab_size)
# ─────────────────────────────────────────────────────────────────────────────

class GemmaSwiGLU(nn.Module):
    # SwiGLU: two parallel projections — gate controls how much up_proj passes through
    #
    # gate = GELU(gate_proj(x))   ← activation gate
    # up   = up_proj(x)           ← content
    # out  = down_proj(gate * up) ← element-wise multiply then project down
    #
    # why better than simple GELU?
    # gating is multiplicative — model can suppress or amplify features dynamically
    # used in LLaMA, Gemma, PaLM and most state-of-the-art LLMs
    def __init__(self, config):
        super().__init__()
        self.gate_proj = nn.Linear(config.gemma_dmodel, config.gemma_dff, bias=False)
        self.up_proj   = nn.Linear(config.gemma_dmodel, config.gemma_dff, bias=False)
        self.down_proj = nn.Linear(config.gemma_dff, config.gemma_dmodel, bias=False)

    def forward(self, x):
        gate = F.gelu(self.gate_proj(x), approximate="tanh")
        up   = self.up_proj(x)
        return self.down_proj(gate * up)


class GemmaAttention(nn.Module):
    # causal self-attention — same structure as all our other models
    # no bias in projections (Gemma convention)
    def __init__(self, config):
        super().__init__()
        self.h      = config.gemma_H
        self.dk     = config.gemma_dk
        self.dmodel = config.gemma_dmodel
        self.wq = nn.Linear(self.dmodel, self.dmodel, bias=False)
        self.wk = nn.Linear(self.dmodel, self.dmodel, bias=False)
        self.wv = nn.Linear(self.dmodel, self.dmodel, bias=False)
        self.wo = nn.Linear(self.dmodel, self.dmodel, bias=False)
        self.dropout = nn.Dropout(config.dropout)

    def forward(self, x, mask=None):
        B, S, _ = x.shape
        q = self.wq(x).view(B, S, self.h, self.dk).transpose(1, 2)
        k = self.wk(x).view(B, S, self.h, self.dk).transpose(1, 2)
        v = self.wv(x).view(B, S, self.h, self.dk).transpose(1, 2)
        scores = q @ k.transpose(-1, -2) / math.sqrt(self.dk)
        if mask is not None:
            scores = scores.masked_fill(mask[:S, :S] == 0, float("-inf"))
        scores = F.softmax(scores, dim=-1)
        scores = self.dropout(scores)
        out = (scores @ v).transpose(1, 2).contiguous().view(B, S, self.dmodel)
        return self.wo(out)


class GemmaDecoderBlock(nn.Module):
    # pre-norm decoder block with RMSNorm + SwiGLU
    # same pre-norm pattern as CLIP: x = x + sublayer(norm(x))
    def __init__(self, config):
        super().__init__()
        self.norm1 = RMSNorm(config.gemma_dmodel, config.norm_eps)
        self.norm2 = RMSNorm(config.gemma_dmodel, config.norm_eps)
        self.attn  = GemmaAttention(config)
        self.mlp   = GemmaSwiGLU(config)

    def forward(self, x, mask=None):
        x = x + self.attn(self.norm1(x), mask)
        x = x + self.mlp(self.norm2(x))
        return x


class GemmaDecoder(nn.Module):
    def __init__(self, config):
        super().__init__()
        # token embedding: text token ids → vectors
        self.wte = nn.Embedding(config.vocab_size, config.gemma_dmodel)
        # positional embedding: covers the full combined sequence (patches + text)
        self.wpe = nn.Embedding(config.total_seq_len, config.gemma_dmodel)
        self.drop   = nn.Dropout(config.dropout)
        self.blocks = nn.ModuleList([GemmaDecoderBlock(config) for _ in range(config.gemma_N)])
        self.norm   = RMSNorm(config.gemma_dmodel, config.norm_eps)
        # lm_head: project from dmodel → vocab_size to predict next token
        self.lm_head = nn.Linear(config.gemma_dmodel, config.vocab_size, bias=False)
        # weight tying: lm_head shares weights with wte
        # token embedding and output projection are inverse operations — sharing saves params
        # and improves performance (used in GPT-2, Gemma, LLaMA)
        self.lm_head.weight = self.wte.weight

        # causal mask over the full sequence (image patches + text)
        # image tokens come first — text can attend to them + all previous text
        self.register_buffer(
            "mask", torch.tril(torch.ones(config.total_seq_len, config.total_seq_len))
        )

    def forward(self, image_tokens, text_tokens):
        # image_tokens: (B, num_patches, gemma_dmodel) — already projected, ready to use
        # text_tokens:  (B, S) — integer token ids
        B, S = text_tokens.shape

        # embed text tokens into the same space as image tokens
        text_embeds = self.wte(text_tokens)                          # (B, S, gemma_dmodel)

        # concatenate: image patches first, text after
        # this is the core of PaliGemma — image is the prefix the LM conditions on
        x = torch.cat([image_tokens, text_embeds], dim=1)            # (B, num_patches+S, gemma_dmodel)

        # add positional embeddings over the full combined sequence
        full_len = x.shape[1]
        pos = torch.arange(0, full_len, device=x.device)
        x = self.drop(x + self.wpe(pos))

        # causal transformer over the concatenated sequence
        for block in self.blocks:
            x = block(x, self.mask)

        x = self.norm(x)
        return self.lm_head(x)    # (B, num_patches+S, vocab_size)


# ─────────────────────────────────────────────────────────────────────────────
# PALIGEMMA — full model
#
# Flow:
#   image  → SigLIPVisionEncoder  →  (B, num_patches, vision_dmodel)
#          → LinearProjector      →  (B, num_patches, gemma_dmodel)
#   text   →  (B, S) integer ids
#   both   → GemmaDecoder         →  (B, num_patches+S, vocab_size)  logits
# ─────────────────────────────────────────────────────────────────────────────

class PaliGemma(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.vision_encoder = SigLIPVisionEncoder(config)
        self.projector      = LinearProjector(config)
        self.language_model = GemmaDecoder(config)

    def forward(self, images, text_tokens):
        # step 1: encode all image patches with SigLIP
        image_features = self.vision_encoder(images)           # (B, num_patches, vision_dmodel)

        # step 2: project into Gemma's embedding space
        image_tokens = self.projector(image_features)          # (B, num_patches, gemma_dmodel)

        # step 3: Gemma generates logits over the combined image + text sequence
        logits = self.language_model(image_tokens, text_tokens)  # (B, num_patches+S, vocab_size)

        return logits


if __name__ == "__main__":
    demo_cfg = PaliGemmaConfig()
    images = torch.randn(demo_cfg.B, demo_cfg.C, demo_cfg.image_size, demo_cfg.image_size)
    text_tokens = torch.randint(0, demo_cfg.vocab_size, (demo_cfg.B, demo_cfg.max_text_len))
    model = PaliGemma(demo_cfg)
    logits = model(images, text_tokens)
    print("PaliGemma logits:", logits.shape)
    print("Total parameters:", sum(p.numel() for p in model.parameters()))
