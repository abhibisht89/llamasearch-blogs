from dataclasses import dataclass
import torch
import torch.nn as nn
import torch.nn.functional as F
import math


@dataclass
class DeepseekConfig:
    dmodel: int = 512  # hidden size
    N: int = 6  # number of transformer blocks
    H: int = 8  # attention heads — dk = rope_head_dim + nope_head_dim = 32+32 = 64
    vocabsize: int = 65  # TinyShakespeare char-level vocab
    max_seq_len: int = 256  # context length
    norm_eps: float = 1e-6
    B: int = 2
    # MoE
    num_experts: int = 4  # scaled from 256 — preserves sparse routing architecture
    num_shared_experts: int = 1  # always-active expert (same as real DeepSeek)
    top_k: int = 2  # each token uses 2 routed experts
    n_dense_layers: int = 1  # first layer uses dense FFN, rest use MoE
    # MLA
    kv_lora_rank: int = 64  # compressed KV latent — scaled from 512
    q_lora_rank: int = 128  # compressed Q latent — scaled from 1536
    rope_head_dim: int = 32  # RoPE part of each head — scaled from 64
    nope_head_dim: int = 32  # content part of each head — scaled from 128

    @property
    def dk(self):
        return self.rope_head_dim + self.nope_head_dim  # 8 + 8 = 16

    @property
    def dff(self):
        return 4 * self.dmodel


class RMSNorm(nn.Module):
    def __init__(self, config) -> None:
        super().__init__()
        self.norm_eps = config.norm_eps
        self.gamma = nn.Parameter(torch.ones(config.dmodel))

    def forward(self, x):
        rms = torch.rsqrt(x.pow(2).mean(dim=-1, keepdim=True) + self.norm_eps)
        return x * rms * self.gamma


class SwiGLUFeedForward(nn.Module):
    def __init__(self, config) -> None:
        super().__init__()
        self.w1 = nn.Linear(config.dmodel, config.dff, bias=False)  # gate
        self.w2 = nn.Linear(config.dmodel, config.dff, bias=False)  # up
        self.w3 = nn.Linear(config.dff, config.dmodel, bias=False)  # down

    def forward(self, x):
        return self.w3(F.silu(self.w1(x)) * self.w2(x))


class MoERouter(nn.Module):
    def __init__(self, config) -> None:
        super().__init__()
        self.num_experts = config.num_experts
        self.top_k = config.top_k
        self.dmodel = config.dmodel
        self.router = nn.Linear(self.dmodel, self.num_experts, bias=False)

    def forward(self, x):
        # Router scores all experts
        scores = self.router(x)  # (B,S,num_experts)
        # Softmax to get probabilities
        prob = F.softmax(scores, dim=-1)  # (B, S, num_experts)
        # Pick top 2
        weight, indices = torch.topk(prob, self.top_k, dim=-1)
        # weights: (B, S, 2) — the probabilities of the 2 chosen experts
        # indices: (B, S, 2) — WHICH 2 experts (e.g. [3, 5])
        weight = weight / weight.sum(dim=-1, keepdim=True)  # renormalize
        return weight, indices


class MoE(nn.Module):
    def __init__(self, config) -> None:
        super().__init__()
        self.experts = nn.ModuleList([SwiGLUFeedForward(config) for _ in range(config.num_experts)])
        self.shared_expert = SwiGLUFeedForward(config)
        self.router = MoERouter(config)
        self.top_k = config.top_k

    def forward(self, x):
        # x: (B, S, dmodel)
        shared_expert_out = self.shared_expert(x)  # always runs for every token
        weights, indices = self.router(x)  # (B, S, top_k)
        output = torch.zeros_like(x)  # (B, S, dmodel)

        for k in range(self.top_k):
            for i, expert in enumerate(self.experts):
                mask = indices[:, :, k] == i  # (B, S) — tokens routed to expert i at slot k
                if mask.any():
                    expert_out = expert(x[mask])  # (num_selected, dmodel)
                    selected_weights = weights[:, :, k][mask].unsqueeze(-1)  # (num_selected, 1)
                    output[mask] += selected_weights * expert_out
        return shared_expert_out + output


class RotaryPositionalEmbedding(nn.Module):
    def __init__(self, config, head_dim: int, base: float = 10000.0) -> None:
        super().__init__()
        # head_dim must always be passed explicitly — MLA uses rope_head_dim, not full dk
        self.dk = head_dim
        freqs = 1.0 / (base ** (torch.arange(0, self.dk, 2).float() / self.dk))  # (dk//2,)
        pos = torch.arange(0, config.max_seq_len).float()  # (max_seq_len,)
        angles = torch.outer(pos, freqs)  # (max_seq_len, dk//2)
        self.register_buffer("cos_cached", torch.cos(angles))  # (max_seq_len, dk//2)
        self.register_buffer("sin_cached", torch.sin(angles))  # (max_seq_len, dk//2)

    def forward(self, x):
        B, H, S, dk = x.shape
        x_even = x[..., 0::2]  # (B, H, S, dk//2)
        x_odd = x[..., 1::2]  # (B, H, S, dk//2)
        cos = self.cos_cached[:S].unsqueeze(0).unsqueeze(0)  # (1, 1, S, dk//2)
        sin = self.sin_cached[:S].unsqueeze(0).unsqueeze(0)  # (1, 1, S, dk//2)
        rotated_even = x_even * cos - x_odd * sin  # (B, H, S, dk//2)
        rotated_odd = x_even * sin + x_odd * cos  # (B, H, S, dk//2)
        rotated = torch.stack([rotated_even, rotated_odd], dim=-1)  # (B, H, S, dk//2, 2)
        return rotated.view(B, H, S, dk)  # (B, H, S, dk)


class MultiHeadLatentAttention(nn.Module):
    def __init__(self, config) -> None:
        super().__init__()
        self.dk = config.dk  # total head dim = nope + rope
        self.H = config.H
        self.kv_lora_rank = config.kv_lora_rank
        self.q_lora_rank = config.q_lora_rank
        self.dmodel = config.dmodel
        self.nope_head_dim = config.nope_head_dim  # content part of head (no RoPE)
        self.rope_head_dim = config.rope_head_dim  # position part of head (gets RoPE)

        # KV path: compress x into small latent, then expand to K and V
        # only c_kv (latent) gets cached during inference — not full K and V
        self.w_down_kv = nn.Linear(self.dmodel, self.kv_lora_rank, bias=False)
        # dmodel → kv_lora_rank: shared down-projection for both K and V

        self.w_up_k = nn.Linear(self.kv_lora_rank, self.H * self.nope_head_dim, bias=False)
        # kv_lora_rank → H * nope_head_dim: expand latent to content part of keys (no RoPE)

        self.w_up_v = nn.Linear(self.kv_lora_rank, self.H * self.nope_head_dim, bias=False)
        # kv_lora_rank → H * nope_head_dim: expand latent to values (V never gets RoPE)

        self.w_kr = nn.Linear(self.dmodel, self.H * self.rope_head_dim, bias=False)
        # dmodel → H * rope_head_dim: RoPE keys bypass the latent (cached separately during inference)
        # goes directly from x, not from c_kv — needed for correct positional encoding

        # Q path: compress x into small latent, then expand to Q_nope and Q_rope
        # Q is never cached — this compression only saves training activation memory
        self.w_down_q = nn.Linear(self.dmodel, self.q_lora_rank, bias=False)
        # dmodel → q_lora_rank: down-projection for queries

        self.w_up_q = nn.Linear(self.q_lora_rank, self.H * self.nope_head_dim, bias=False)
        # q_lora_rank → H * nope_head_dim: expand to content part of queries (no RoPE)

        self.w_qr = nn.Linear(self.q_lora_rank, self.H * self.rope_head_dim, bias=False)
        # q_lora_rank → H * rope_head_dim: RoPE queries come from latent (unlike w_kr)
        # Q doesn't get cached so no need to bypass the latent here

        # output projection: V only has nope_head_dim per head (no RoPE in values)
        self.wo = nn.Linear(self.H * self.nope_head_dim, self.dmodel, bias=False)

    def forward(self, x, rope, mask):
        B, S, dmodel = x.shape

        # ── KV path ─────────────────────────────────────────────────────────────────
        c_kv = self.w_down_kv(x)  # (B, S, kv_lora_rank)

        K_nope = self.w_up_k(c_kv)  # (B, S, H*nope_head_dim)
        K_nope = K_nope.view(B, S, self.H, self.nope_head_dim).transpose(1, 2)  # (B, S, H, nope_head_dim) → (B, H, S, nope_head_dim)

        K_rope = self.w_kr(x)  # (B, S, H*rope_head_dim)
        K_rope = K_rope.view(B, S, self.H, self.rope_head_dim).transpose(1, 2)  # (B, S, H, rope_head_dim) → (B, H, S, rope_head_dim)
        K_rope = rope(K_rope)  # (B, H, S, rope_head_dim)

        K = torch.cat([K_nope, K_rope], dim=-1)  # (B, H, S, dk)

        # ── Value path ───────────────────────────────────────────────────────────────
        V = self.w_up_v(c_kv)  # (B, S, H*nope_head_dim)
        V = V.view(B, S, self.H, self.nope_head_dim).transpose(1, 2)  # (B, S, H, nope_head_dim) → (B, H, S, nope_head_dim)

        # ── Q path ───────────────────────────────────────────────────────────────────
        c_q = self.w_down_q(x)  # (B, S, q_lora_rank)

        Q_nope = self.w_up_q(c_q)  # (B, S, H*nope_head_dim)
        Q_nope = Q_nope.view(B, S, self.H, self.nope_head_dim).transpose(1, 2)  # (B, S, H, nope_head_dim) → (B, H, S, nope_head_dim)

        Q_rope = self.w_qr(c_q)  # (B, S, H*rope_head_dim)
        Q_rope = Q_rope.view(B, S, self.H, self.rope_head_dim).transpose(1, 2)  # (B, S, H, rope_head_dim) → (B, H, S, rope_head_dim)
        Q_rope = rope(Q_rope)  # (B, H, S, rope_head_dim)

        Q = torch.cat([Q_nope, Q_rope], dim=-1)  # (B, H, S, dk)

        # ── Attention ────────────────────────────────────────────────────────────────
        attn_score = Q @ K.transpose(-1, -2) / math.sqrt(self.dk)  # (B, H, S, S)
        attn_score = attn_score.masked_fill(mask[:S, :S] == 0, float("-inf"))  # (B, H, S, S)
        attn_score = F.softmax(attn_score, dim=-1)  # (B, H, S, S)
        x = attn_score @ V  # (B, H, S, nope_head_dim)
        x = x.transpose(1, 2).contiguous().view(B, S, self.H * self.nope_head_dim)  # (B, S, H*nope_head_dim)
        return self.wo(x)  # (B, S, dmodel)


# MLA uses rope_head_dim only — not full dk


class Block(nn.Module):
    def __init__(self, config, layer_idx) -> None:
        super().__init__()
        self.mhla = MultiHeadLatentAttention(config)

        if layer_idx >= config.n_dense_layers:
            self.ff = MoE(config)
        else:
            self.ff = SwiGLUFeedForward(config)
        self.rms_1 = RMSNorm(config)
        self.rms_2 = RMSNorm(config)

    def forward(self, x, rope, mask):
        norm_x = self.rms_1(x)
        x = x + self.mhla(norm_x, rope, mask)
        x = x + self.ff(self.rms_2(x))
        return x


class Deepseek(nn.Module):
    def __init__(self, config) -> None:
        super().__init__()
        self.wte = nn.Embedding(config.vocabsize, config.dmodel)
        self.rope = RotaryPositionalEmbedding(config, config.rope_head_dim)
        self.blocks = nn.ModuleList([Block(config, layer_idx) for layer_idx in range(config.N)])
        self.norm = RMSNorm(config)
        self.lm_head = nn.Linear(config.dmodel, config.vocabsize, bias=False)
        self.lm_head.weight = self.wte.weight
        self.register_buffer(
            "mask",
            torch.tril(torch.ones(config.max_seq_len, config.max_seq_len)),
        )

    def forward(self, x):
        x = self.wte(x)
        for block in self.blocks:
            x = block(x, self.rope, self.mask)
        x = self.norm(x)
        return self.lm_head(x)


if __name__ == "__main__":
    config = DeepseekConfig()

    rms_norm = RMSNorm(config)
    x = torch.randn(config.B, config.max_seq_len, config.dmodel)
    out = rms_norm(x)
    print("RMSNorm out:", out.shape)
    ff = SwiGLUFeedForward(config)
    x = torch.randn(config.B, config.max_seq_len, config.dmodel)
    out = ff(x)
    print("SwiGLUFeedForward out:", out.shape)
    router = MoERouter(config)
    x = torch.randn(config.B, config.max_seq_len, config.dmodel)
    weights, indices = router(x)
    print("weights:", weights.shape)  # expect (2, 32, 2)
    print("indices:", indices.shape)  # expect (2, 32, 2)
    print("weights sum to 1?", weights.sum(dim=-1)[0, :3])  # should be ~1.0
    print("sample indices:", indices[0, :3])  # which 2 experts for first 3 tokens
    moe = MoE(config)
    x = torch.randn(config.B, config.max_seq_len, config.dmodel)
    out = moe(x)
    print("MoE out:", out.shape)  # expect (2, 32, 64)
    print("Shape preserved:", x.shape == out.shape)
    rope = RotaryPositionalEmbedding(config, head_dim=config.rope_head_dim)
    x = torch.randn(config.B, config.H, config.max_seq_len, config.rope_head_dim)
    out = rope(x)
    print("RotaryPositionalEmbedding out:", out.shape)
    mla = MultiHeadLatentAttention(config)
    rope = RotaryPositionalEmbedding(config, head_dim=config.rope_head_dim)
    mask = torch.tril(torch.ones(config.max_seq_len, config.max_seq_len))
    x = torch.randn(config.B, config.max_seq_len, config.dmodel)
    out = mla(x, rope, mask)
    print("MLA out:", out.shape)  # expect (2, 32, 64)
    print("Shape preserved:", x.shape == out.shape)
    block = Block(config, layer_idx=0)  # dense block (layer 0 < n_dense_layers=1)
    x = torch.randn(config.B, config.max_seq_len, config.dmodel)
    rope = RotaryPositionalEmbedding(config, head_dim=config.rope_head_dim)
    mask = torch.tril(torch.ones(config.max_seq_len, config.max_seq_len))
    out = block(x, rope, mask)
    print("Block (dense) out:", out.shape)  # expect (2, 32, 64)
    print("Block ff type:", type(block.ff))  # expect SwiGLUFeedForward
    block_moe = Block(config, layer_idx=1)  # MoE block (layer 1 >= n_dense_layers=1)
    out_moe = block_moe(x, rope, mask)
    print("Block (MoE) out:", out_moe.shape)  # expect (2, 32, 64)
    print("Block ff type:", type(block_moe.ff))  # expect MoE
    deepseek = Deepseek(config)
    x = torch.randint(0, config.vocabsize, (config.B, config.max_seq_len))
    logits = deepseek(x)
    print("Input shape:", x.shape)
    print("Output shape:", logits.shape)
    print("Expected:", (config.B, config.max_seq_len, config.vocabsize))
    print(
        "Weights tied:",
        deepseek.lm_head.weight.data_ptr() == deepseek.wte.weight.data_ptr(),
    )
    total_params = sum(p.numel() for p in deepseek.parameters())
    print("Total parameters:", total_params)
