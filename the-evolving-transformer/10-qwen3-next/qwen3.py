from dataclasses import dataclass
import torch
import torch.nn as nn
import torch.nn.functional as F
import math


# ============================================================
# Config — Qwen3-Next 80B-A3B (Qwen Team, 2025)
# Production: d_model=5120, N=48, H=40, n_kv_heads=8, vocab=152k,
#             max_seq_len=262144, d_ff=13824, num_experts=128, top_k=8,
#             ~80B total / ~3B active per token, 3:1 DeltaNet:GatedAttention
# Teaching code scales these down for fast local smoke tests.
# ============================================================
@dataclass
class Qwen3Config:
    dmodel: int = 512
    N: int = 8
    H: int = 8
    n_kv_heads: int = 2
    vocabsize: int = 65
    max_seq_len: int = 256
    norm_eps: float = 1e-6
    B: int = 2
    num_experts: int = 4
    top_k: int = 2
    full_attn_every: int = 4
    mtp_depth: int = 1

    @property
    def dk(self):
        return self.dmodel // self.H

    @property
    def dff(self):
        return 4 * self.dmodel


config = Qwen3Config()


class RMSNorm(nn.Module):
    def __init__(self, config) -> None:
        super().__init__()
        self.norm_eps = config.norm_eps
        self.gamma = nn.Parameter(torch.ones(config.dmodel))

    def forward(self, x):
        rms = torch.rsqrt(x.pow(2).mean(dim=-1, keepdim=True) + self.norm_eps)
        return x * rms * self.gamma


class RotaryPositionalEmbedding(nn.Module):
    """Partial RoPE — applied only on GatedAttention layers."""
    def __init__(self, config, base: float = 10000.0) -> None:
        super().__init__()
        self.dk = config.dk
        freqs = 1.0 / (base ** (torch.arange(0, self.dk, 2).float() / self.dk))
        pos = torch.arange(0, config.max_seq_len).float()
        angles = torch.outer(pos, freqs)
        self.register_buffer("cos_cached", torch.cos(angles))
        self.register_buffer("sin_cached", torch.sin(angles))

    def forward(self, x):
        B, H, S, dk = x.shape
        x_even, x_odd = x[..., 0::2], x[..., 1::2]
        cos = self.cos_cached[:S].unsqueeze(0).unsqueeze(0)
        sin = self.sin_cached[:S].unsqueeze(0).unsqueeze(0)
        rotated = torch.stack(
            [x_even * cos - x_odd * sin, x_even * sin + x_odd * cos], dim=-1
        )
        return rotated.view(B, H, S, dk)


class GatedDeltaNet(nn.Module):
    """Linear attention via gated delta rule — O(S) per layer at inference."""
    def __init__(self, config) -> None:
        super().__init__()
        D = config.dmodel
        self.wq = nn.Linear(D, D, bias=False)
        self.wk = nn.Linear(D, D, bias=False)
        self.wv = nn.Linear(D, D, bias=False)
        self.wb = nn.Linear(D, 1, bias=True)
        self.wa = nn.Linear(D, D, bias=True)
        self.wo = nn.Linear(D, D, bias=False)

    def forward(self, x):
        B, S, D = x.shape
        Q = self.wq(x)
        K = F.normalize(self.wk(x), dim=-1)
        V = self.wv(x)
        beta = torch.sigmoid(self.wb(x))
        alpha = torch.sigmoid(self.wa(x))

        W = torch.zeros(B, D, D, device=x.device)
        outputs = []
        for t in range(S):
            qt, kt, vt = Q[:, t], K[:, t], V[:, t]
            bt, at = beta[:, t], alpha[:, t]
            Wkt = (W @ kt.unsqueeze(-1)).squeeze(-1)
            W = at.unsqueeze(-1) * W + bt.unsqueeze(-1) * (vt - Wkt).unsqueeze(-1) * kt.unsqueeze(-2)
            yt = (W @ qt.unsqueeze(-1)).squeeze(-1)
            outputs.append(yt)

        out = torch.stack(outputs, dim=1)
        return self.wo(out)


class GatedAttention(nn.Module):
    """Full GQA with QK-norm and sigmoid-gated attention scores."""
    def __init__(self, config) -> None:
        super().__init__()
        self.H = config.H
        self.n_kv_heads = config.n_kv_heads
        self.n_rep = config.H // config.n_kv_heads
        self.dk = config.dk
        self.wq = nn.Linear(config.dmodel, config.H * self.dk, bias=False)
        self.wk = nn.Linear(config.dmodel, config.n_kv_heads * self.dk, bias=False)
        self.wv = nn.Linear(config.dmodel, config.n_kv_heads * self.dk, bias=False)
        self.wo = nn.Linear(config.dmodel, config.dmodel, bias=False)

    @staticmethod
    def repeat_kv(x, n_rep):
        if n_rep == 1:
            return x
        B, h, S, dk = x.shape
        return x.unsqueeze(2).expand(B, h, n_rep, S, dk).contiguous().view(B, h * n_rep, S, dk)

    def forward(self, x, rope, mask):
        B, S, _ = x.shape
        q = self.wq(x).view(B, S, self.H, self.dk).transpose(1, 2)
        k = self.wk(x).view(B, S, self.n_kv_heads, self.dk).transpose(1, 2)
        v = self.wv(x).view(B, S, self.n_kv_heads, self.dk).transpose(1, 2)
        q = F.normalize(q, dim=-1)
        k = F.normalize(k, dim=-1)
        q = rope(q)
        k = rope(k)
        k = GatedAttention.repeat_kv(k, self.n_rep)
        v = GatedAttention.repeat_kv(v, self.n_rep)
        scores = q @ k.transpose(-1, -2) / math.sqrt(self.dk)
        scores = scores.masked_fill(mask[:S, :S] == 0, float("-inf"))
        out = torch.sigmoid(scores) @ v
        out = out.transpose(1, 2).contiguous().view(B, S, self.H * self.dk)
        return self.wo(out)


class SwiGLUFeedForward(nn.Module):
    def __init__(self, config) -> None:
        super().__init__()
        self.w1 = nn.Linear(config.dmodel, config.dff, bias=False)
        self.w2 = nn.Linear(config.dmodel, config.dff, bias=False)
        self.w3 = nn.Linear(config.dff, config.dmodel, bias=False)

    def forward(self, x):
        return self.w3(F.silu(self.w1(x)) * self.w2(x))


class MoERouter(nn.Module):
    def __init__(self, config) -> None:
        super().__init__()
        self.top_k = config.top_k
        self.router = nn.Linear(config.dmodel, config.num_experts, bias=False)

    def forward(self, x):
        weight = F.softmax(self.router(x), dim=-1)
        weight, indices = torch.topk(weight, self.top_k, dim=-1)
        weight = weight / weight.sum(dim=-1, keepdim=True)
        return weight, indices


class MoE(nn.Module):
    """Sparse MoE with shared expert (always active) + routed experts."""
    def __init__(self, config) -> None:
        super().__init__()
        self.shared_expert = SwiGLUFeedForward(config)
        self.experts = nn.ModuleList(
            [SwiGLUFeedForward(config) for _ in range(config.num_experts)]
        )
        self.router = MoERouter(config)
        self.top_k = config.top_k

    def forward(self, x):
        shared_expert_out = self.shared_expert(x)
        weights, indices = self.router(x)
        output = torch.zeros_like(x)
        for k in range(self.top_k):
            for i, expert in enumerate(self.experts):
                mask = indices[:, :, k] == i
                if mask.any():
                    expert_out = expert(x[mask])
                    selected_weights = weights[:, :, k][mask].unsqueeze(-1)
                    output[mask] += selected_weights * expert_out
        return shared_expert_out + output


class MultiTokenPrediction(nn.Module):
    def __init__(self, config) -> None:
        super().__init__()
        self.heads = nn.ModuleList(
            [
                nn.Sequential(
                    RMSNorm(config),
                    nn.Linear(config.dmodel, config.vocabsize, bias=False),
                )
                for _ in range(config.mtp_depth)
            ]
        )

    def forward(self, x):
        return [head(x) for head in self.heads]


class Block(nn.Module):
    def __init__(self, config, layer_idx: int) -> None:
        super().__init__()
        self.use_full_attn = layer_idx % config.full_attn_every == (
            config.full_attn_every - 1
        )
        if self.use_full_attn:
            self.attn = GatedAttention(config)
        else:
            self.attn = GatedDeltaNet(config)
        self.moe = MoE(config)
        self.rms_1 = RMSNorm(config)
        self.rms_2 = RMSNorm(config)

    def forward(self, x, rope, mask):
        normed = self.rms_1(x)
        if self.use_full_attn:
            x = x + self.attn(normed, rope, mask)
        else:
            x = x + self.attn(normed)
        x = x + self.moe(self.rms_2(x))
        return x


class Qwen3(nn.Module):
    def __init__(self, config) -> None:
        super().__init__()
        self.wte = nn.Embedding(config.vocabsize, config.dmodel)
        self.rope = RotaryPositionalEmbedding(config)
        self.blocks = nn.ModuleList([Block(config, i) for i in range(config.N)])
        self.norm = RMSNorm(config)
        self.lm_head = nn.Linear(config.dmodel, config.vocabsize, bias=False)
        self.lm_head.weight = self.wte.weight
        self.mtp = MultiTokenPrediction(config)
        self.register_buffer(
            "mask",
            torch.tril(torch.ones(config.max_seq_len, config.max_seq_len)),
        )

    def forward(self, x):
        x = self.wte(x)
        for block in self.blocks:
            x = block(x, self.rope, self.mask)
        x = self.norm(x)
        return self.lm_head(x), self.mtp(x)


if __name__ == "__main__":
    demo_S = 32
    x = torch.randn(config.B, demo_S, config.dmodel)
    mask = torch.tril(torch.ones(config.max_seq_len, config.max_seq_len))
    rope = RotaryPositionalEmbedding(config)

    out = RMSNorm(config)(x)
    print("RMSNorm out:", out.shape)
    print("Shape preserved:", x.shape == out.shape)

    out = GatedDeltaNet(config)(x)
    print("GatedDeltaNet out:", out.shape)

    out = GatedAttention(config)(x, rope, mask)
    print("GatedAttention out:", out.shape)

    out = MoE(config)(x)
    print("MoE (shared + routed) out:", out.shape)

    block_linear = Block(config, layer_idx=0)
    block_full = Block(config, layer_idx=3)
    print("Block (DeltaNet) out:", block_linear(x, rope, mask).shape)
    print("Block (GatedAttn) out:", block_full(x, rope, mask).shape)

    model = Qwen3(config)
    ids = torch.randint(0, config.vocabsize, (config.B, demo_S))
    main_logits, mtp_logits = model(ids)
    print("Input shape:", ids.shape)
    print("Main logits:", main_logits.shape)
    print("MTP logits:", [t.shape for t in mtp_logits])
    print(
        "Weights tied:",
        model.lm_head.weight.data_ptr() == model.wte.weight.data_ptr(),
    )
    total_params = sum(p.numel() for p in model.parameters())
    print("Total parameters:", total_params)
