from dataclasses import dataclass
import torch
import torch.nn as nn
import torch.nn.functional as F
import math


# ============================================================
# Config — GPT-2 Small (117M) from Radford et al., 2019
# d_model=768, N=12, H=12, vocab=50257, context=1024, d_ff=3072
# ============================================================
@dataclass
class GPTConfig:
    dmodel: int = 768            # GPT-2 Small (117M)
    vocabsize: int = 50257       # BPE vocabulary size (GPT-2)
    B: int = 2                   # batch size (for demo runs)
    max_seq_len: int = 1024      # context length (GPT-2)
    N: int = 12                  # transformer blocks (GPT-2 Small)
    H: int = 12                  # attention heads (GPT-2 Small)
    dropout: float = 0.1         # dropout probability

    @property
    def dk(self):
        # per-head dimension — dmodel must be divisible by H
        return self.dmodel // self.H

    @property
    def dff(self):
        return 4 * self.dmodel


config = GPTConfig()  # GPT-2 Small (117M) — shared by every module below


class MLP(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.w1 = nn.Linear(config.dmodel, config.dff)  # (B, S, dmodel) → (B, S, dff)
        self.w2 = nn.Linear(config.dff, config.dmodel)  # (B, S, dff) → (B, S, dmodel)
        self.dropout = nn.Dropout(config.dropout)

    def forward(self, x):
        # x: (B, S, dmodel) → w1 → gelu → dropout → w2 → (B, S, dmodel)
        return self.w2(self.dropout(F.gelu(self.w1(x))))  # (B, S, dmodel)


class CausalSelfAttention(nn.Module):
    def __init__(self, config) -> None:
        super().__init__()
        self.dmodel = config.dmodel
        self.H = config.H
        self.dk = config.dk
        self.wq = nn.Linear(config.dmodel, config.dmodel)  # dmodel → dmodel
        self.wk = nn.Linear(config.dmodel, config.dmodel)  # dmodel → dmodel
        self.wv = nn.Linear(config.dmodel, config.dmodel)  # dmodel → dmodel
        self.wo = nn.Linear(config.dmodel, config.dmodel)  # dmodel → dmodel
        self.attn_dropout = nn.Dropout(config.dropout)
        self.resid_dropout = nn.Dropout(config.dropout)

    def attention(self, q, k, v, S, mask):
        # q, k, v: (B, H, S, dk)
        attn_score = q @ k.transpose(-1, -2) / math.sqrt(self.dk)  # (B, H, S, S)
        attn_score = attn_score.masked_fill(mask[:S, :S] == 0, -1e9)  # mask: (S, S)
        attn_score = attn_score.softmax(dim=-1)  # (B, H, S, S)
        attn_score = self.attn_dropout(attn_score)  # (B, H, S, S)
        return attn_score @ v  # (B, H, S, dk)

    def forward(self, x, mask):
        B, S, _ = x.shape  # x: (B, S, dmodel)
        # project and split into H heads — same Wq, Wk, Wv pattern as chapter 01
        query = self.wq(x).view(B, S, self.H, self.dk).transpose(1, 2)  # (B, H, S, dk)
        key = self.wk(x).view(B, S, self.H, self.dk).transpose(1, 2)  # (B, H, S, dk)
        value = self.wv(x).view(B, S, self.H, self.dk).transpose(1, 2)  # (B, H, S, dk)
        x = self.attention(query, key, value, S, mask)  # (B, H, S, dk)
        # (B, H, S, dk) -> (B, S, H, dk) -> (B, S, dmodel)
        x = x.transpose(1, 2).contiguous().view(B, S, self.dmodel)  # (B, S, dmodel)
        return self.resid_dropout(self.wo(x))  # (B, S, dmodel)


class Block(nn.Module):
    def __init__(self, config) -> None:
        super().__init__()
        self.norm_1 = nn.LayerNorm(config.dmodel)
        self.attn = CausalSelfAttention(config)
        self.norm_2 = nn.LayerNorm(config.dmodel)
        self.ff = MLP(config)

    def forward(self, x, mask):
        # x: (B, S, dmodel)
        x = x + self.attn(self.norm_1(x), mask)  # norm_1(x): (B, S, dmodel); attn: (B, S, dmodel)
        x = x + self.ff(self.norm_2(x))  # norm_2(x): (B, S, dmodel); ff: (B, S, dmodel)
        return x  # (B, S, dmodel)


class GPT(nn.Module):
    def __init__(self, config) -> None:
        super().__init__()
        self.wte = nn.Embedding(config.vocabsize, config.dmodel)  # wte(x): (B, S, dmodel)
        self.wpe = nn.Embedding(config.max_seq_len, config.dmodel)  # wpe(pos): (S, dmodel)
        self.drop = nn.Dropout(config.dropout)
        self.blocks = nn.ModuleList([Block(config) for _ in range(config.N)])
        self.norm = nn.LayerNorm(config.dmodel)  # (B, S, dmodel) → (B, S, dmodel)
        self.lm_head = nn.Linear(config.dmodel, config.vocabsize, bias=False)  # (B, S, dmodel) → (B, S, vocabsize)
        self.lm_head.weight = (
            self.wte.weight
        )  # weight tying — lm_head shares weights with wte
        # full causal mask — every token attends to all previous tokens
        self.register_buffer(
            "mask", torch.tril(torch.ones(config.max_seq_len, config.max_seq_len))
        )  # (max_seq_len, max_seq_len)

    def forward(self, x):
        _, S = x.shape  # x: (B, S)
        pos = torch.arange(0, S, device=x.device)  # (S,)
        x = self.drop(self.wte(x) + self.wpe(pos))  # (B, S, dmodel) + (S, dmodel) → (B, S, dmodel)
        for block in self.blocks:
            x = block(x, self.mask)  # (B, S, dmodel)
        x = self.norm(x)  # (B, S, dmodel)
        return self.lm_head(x)  # (B, S, vocabsize)


if __name__ == "__main__":
    demo_S = 32  # short seq for smoke test — full 1024 context is heavy at 117M scale

    mlp = MLP(config)
    x = torch.randn(config.B, demo_S, config.dmodel)
    out = mlp(x)
    print("MLP out:", out.shape)
    print("Shape preserved:", x.shape == out.shape)

    mask = torch.tril(torch.ones(config.max_seq_len, config.max_seq_len))
    csa = CausalSelfAttention(config)
    out = csa(x, mask)
    print("CausalSelfAttention out:", out.shape)
    print("Shape preserved:", x.shape == out.shape)
    print("dk:", csa.dk)

    block = Block(config)
    out = block(x, mask)
    print("Block out:", out.shape)
    print("Shape preserved:", x.shape == out.shape)
    print("Block ff type:", type(block.ff))

    gpt = GPT(config)
    ids = torch.randint(0, config.vocabsize, (config.B, demo_S))
    logits = gpt(ids)
    print("Input shape:", ids.shape)
    print("Output shape:", logits.shape)
    print("Expected:", (config.B, demo_S, config.vocabsize))
    print(
        "Weights tied:",
        gpt.lm_head.weight.data_ptr() == gpt.wte.weight.data_ptr(),
    )
    total_params = sum(p.numel() for p in gpt.parameters())
    print("Total parameters:", total_params)
