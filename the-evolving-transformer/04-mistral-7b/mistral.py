from dataclasses import dataclass
import torch
import torch.nn as nn
import torch.nn.functional as F
import math


# ============================================================
# Config — Mistral 7B from Jiang et al., 2023 (Mistral AI)
# d_model=4096, N=32, H=32, n_kv_heads=8, vocab=32000, W=4096 sliding window
# ============================================================
@dataclass
class MistralConfig:
    dmodel: int = 4096           # Mistral 7B
    N: int = 32                  # transformer blocks
    H: int = 32                  # query heads
    n_kv_heads: int = 8          # GQA — 4:1 ratio (32 Q / 8 KV)
    vocabsize: int = 32000       # BPE vocabulary size (Mistral 7B)
    max_seq_len: int = 8192      # max context length
    dff: int = 14336             # SwiGLU inner dim
    norm_eps: float = 1e-5       # RMSNorm epsilon
    sliding_window: int = 4096   # attention window W — each token sees W past tokens
    B: int = 2                   # batch size (for demo runs)

    @property
    def dk(self):
        # per-head dimension — dmodel must be divisible by H
        return self.dmodel // self.H


config = MistralConfig()  # Mistral 7B — shared by every module below


def make_sliding_window_mask(max_seq_len, sliding_window):
    """Causal mask ∩ sliding window band: token i attends to [max(0, i-W+1) .. i]."""
    causal = torch.tril(torch.ones(max_seq_len, max_seq_len))
    window = torch.triu(torch.ones(max_seq_len, max_seq_len), diagonal=-(sliding_window - 1))
    return causal * window  # (max_seq_len, max_seq_len)


class RMSNorm(nn.Module):
    def __init__(self, config) -> None:
        super().__init__()
        self.norm_eps = config.norm_eps
        self.gamma = nn.Parameter(torch.ones(config.dmodel))  # (dmodel,)

    def forward(self, x):
        # x: (B, S, dmodel)
        rms = torch.rsqrt(x.pow(2).mean(dim=-1, keepdim=True) + self.norm_eps)  # (B, S, 1)
        return x * rms * self.gamma  # (B, S, dmodel)


class SwiGLUFeedForward(nn.Module):
    def __init__(self, config) -> None:
        super().__init__()
        self.w1 = nn.Linear(config.dmodel, config.dff, bias=False)  # gate
        self.w2 = nn.Linear(config.dmodel, config.dff, bias=False)  # up
        self.w3 = nn.Linear(config.dff, config.dmodel, bias=False)  # down

    def forward(self, x):
        # x: (B, S, dmodel) → silu(w1) * w2 → w3 → (B, S, dmodel)
        return self.w3(F.silu(self.w1(x)) * self.w2(x))


class RotaryPositionalEmbedding(nn.Module):
    def __init__(self, config, base: float = 10000.0) -> None:
        super().__init__()
        self.dk = config.dk
        freqs = 1.0 / (
            base ** (torch.arange(0, self.dk, 2).float() / self.dk)
        )  # (dk//2,)
        pos = torch.arange(0, config.max_seq_len).float()  # (max_seq_len,)
        angles = torch.outer(pos, freqs)  # (max_seq_len, dk//2)
        self.register_buffer("cos_cached", torch.cos(angles))  # (max_seq_len, dk//2)
        self.register_buffer("sin_cached", torch.sin(angles))  # (max_seq_len, dk//2)

    def forward(self, x):
        B, H, S, dk = x.shape  # x: (B, H, S, dk)
        x_even = x[..., 0::2]  # (B, H, S, dk//2)
        x_odd = x[..., 1::2]  # (B, H, S, dk//2)
        cos = self.cos_cached[:S].unsqueeze(0).unsqueeze(0)  # (1, 1, S, dk//2)
        sin = self.sin_cached[:S].unsqueeze(0).unsqueeze(0)  # (1, 1, S, dk//2)
        rotated_even = x_even * cos - x_odd * sin  # (B, H, S, dk//2)
        rotated_odd = x_even * sin + x_odd * cos  # (B, H, S, dk//2)
        rotated = torch.stack([rotated_even, rotated_odd], dim=-1)  # (B, H, S, dk//2, 2)
        return rotated.view(B, H, S, dk)  # (B, H, S, dk)


class SlidingWindowGQA(nn.Module):
    def __init__(self, config) -> None:
        super().__init__()
        self.dk = config.dk
        self.H = config.H
        self.n_kv_heads = config.n_kv_heads
        self.n_rep = self.H // config.n_kv_heads
        self.wq = nn.Linear(config.dmodel, config.H * self.dk, bias=False)
        self.wk = nn.Linear(config.dmodel, config.n_kv_heads * self.dk, bias=False)
        self.wv = nn.Linear(config.dmodel, config.n_kv_heads * self.dk, bias=False)
        self.wo = nn.Linear(config.dmodel, config.dmodel, bias=False)

    @staticmethod
    def repeat_kv(x, n_rep):
        if n_rep == 1:
            return x
        B, n_kv_heads, S, dk = x.shape
        x = x.unsqueeze(2).expand(B, n_kv_heads, n_rep, S, dk)
        return x.contiguous().view(B, n_kv_heads * n_rep, S, dk)  # (B, H, S, dk)

    def forward(self, x, rope, mask):
        B, S, _ = x.shape  # x: (B, S, dmodel)
        query = self.wq(x).view(B, S, self.H, self.dk).transpose(1, 2)  # (B, H, S, dk)
        key = self.wk(x).view(B, S, self.n_kv_heads, self.dk).transpose(1, 2)  # (B, n_kv, S, dk)
        value = self.wv(x).view(B, S, self.n_kv_heads, self.dk).transpose(1, 2)  # (B, n_kv, S, dk)
        query = rope(query)  # (B, H, S, dk)
        key = rope(key)  # (B, n_kv, S, dk)
        key = SlidingWindowGQA.repeat_kv(key, self.n_rep)  # (B, H, S, dk)
        value = SlidingWindowGQA.repeat_kv(value, self.n_rep)  # (B, H, S, dk)
        attn_score = query @ key.transpose(-1, -2) / math.sqrt(self.dk)  # (B, H, S, S)
        attn_score = attn_score.masked_fill(mask[:S, :S] == 0, float("-inf"))
        attn_score = F.softmax(attn_score, dim=-1)  # (B, H, S, S)
        x = attn_score @ value  # (B, H, S, dk)
        x = x.transpose(1, 2).contiguous().view(B, S, self.H * self.dk)  # (B, S, dmodel)
        return self.wo(x)  # (B, S, dmodel)


class Block(nn.Module):
    def __init__(self, config) -> None:
        super().__init__()
        self.gqa = SlidingWindowGQA(config)
        self.ff = SwiGLUFeedForward(config)
        self.rms_1 = RMSNorm(config)  # pre-norm before attention
        self.rms_2 = RMSNorm(config)  # pre-norm before FFN

    def forward(self, x, rope, mask):
        # x: (B, S, dmodel)
        x = x + self.gqa(self.rms_1(x), rope, mask)  # (B, S, dmodel)
        x = x + self.ff(self.rms_2(x))  # (B, S, dmodel)
        return x  # (B, S, dmodel)


class Mistral(nn.Module):
    def __init__(self, config) -> None:
        super().__init__()
        self.wte = nn.Embedding(config.vocabsize, config.dmodel)  # wte(x): (B, S, dmodel)
        self.rope = RotaryPositionalEmbedding(config)
        self.blocks = nn.ModuleList([Block(config) for _ in range(config.N)])
        self.norm = RMSNorm(config)  # (B, S, dmodel) → (B, S, dmodel)
        self.lm_head = nn.Linear(config.dmodel, config.vocabsize, bias=False)
        self.lm_head.weight = self.wte.weight  # weight tying
        # sliding window mask — causal ∩ band of width W
        self.register_buffer(
            "mask",
            make_sliding_window_mask(config.max_seq_len, config.sliding_window),
        )  # (max_seq_len, max_seq_len)

    def forward(self, x):
        _, S = x.shape  # x: (B, S)
        x = self.wte(x)  # (B, S, dmodel)
        for block in self.blocks:
            x = block(x, self.rope, self.mask)  # (B, S, dmodel)
        x = self.norm(x)  # (B, S, dmodel)
        return self.lm_head(x)  # (B, S, vocabsize)


if __name__ == "__main__":
    demo_S = 32  # short seq for smoke test — full 8192 context is heavy at 7B scale
    x = torch.randn(config.B, demo_S, config.dmodel)
    mask = make_sliding_window_mask(config.max_seq_len, config.sliding_window)

    rms_norm = RMSNorm(config)
    out = rms_norm(x)
    print("RMSNorm out:", out.shape)
    print("Shape preserved:", x.shape == out.shape)

    ff = SwiGLUFeedForward(config)
    out = ff(x)
    print("SwiGLUFeedForward out:", out.shape)
    print("Shape preserved:", x.shape == out.shape)

    print("Sliding window mask shape:", mask.shape)
    print("Window width at row 100:", int(mask[100, :101].sum()))

    rope = RotaryPositionalEmbedding(config)
    rope_in = torch.randn(config.B, config.H, demo_S, config.dk)
    out = rope(rope_in)
    print("RotaryPositionalEmbedding out:", out.shape)

    gqa = SlidingWindowGQA(config)
    out = gqa(x, rope, mask)
    print("SlidingWindowGQA out:", out.shape)
    print("Shape preserved:", x.shape == out.shape)

    block = Block(config)
    out = block(x, rope, mask)
    print("Block out:", out.shape)
    print("Shape preserved:", x.shape == out.shape)
    print("Block ff type:", type(block.ff))

    mistral = Mistral(config)
    ids = torch.randint(0, config.vocabsize, (config.B, demo_S))
    logits = mistral(ids)
    print("Input shape:", ids.shape)
    print("Output shape:", logits.shape)
    print("Expected:", (config.B, demo_S, config.vocabsize))
    print(
        "Weights tied:",
        mistral.lm_head.weight.data_ptr() == mistral.wte.weight.data_ptr(),
    )
    total_params = sum(p.numel() for p in mistral.parameters())
    print("Total parameters:", total_params)
