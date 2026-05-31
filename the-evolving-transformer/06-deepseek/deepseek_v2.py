from dataclasses import dataclass
import torch
import torch.nn as nn
import torch.nn.functional as F
import math


# ── CONFIG ────────────────────────────────────────────────────────────────────
@dataclass
class DeepseekV2Config:
    dmodel: int = 512  # hidden size
    N: int = 6  # number of transformer blocks
    H: int = 8  # attention heads
    vocabsize: int = 65  # TinyShakespeare char-level vocab
    max_seq_len: int = 256  # context length
    norm_eps: float = 1e-6
    B: int = 2
    # MoE
    num_experts: int = 4  # scaled from 256
    num_shared_experts: int = 1  # always-active expert
    top_k: int = 2  # each token uses 2 routed experts
    n_dense_layers: int = 1  # first layer uses dense FFN, rest use MoE
    # Basic MLA (no RoPE — just low-rank KV compression)
    # Paper Eq. 9-13: compress x → latent → expand to Q/K/V
    kv_lora_rank: int = 64  # d_c in paper — compressed KV latent dimension
    q_lora_rank: int = 128  # d_c' in paper — compressed Q latent dimension

    @property
    def dk(self):
        # Simple head dim — no rope/nope split unlike V3
        return self.dmodel // self.H

    @property
    def dff(self):
        return 4 * self.dmodel


# ── RMSNorm ───────────────────────────────────────────────────────────────────
class RMSNorm(nn.Module):
    def __init__(self, dim, eps=1e-6) -> None:
        super().__init__()
        self.eps = eps
        self.gamma = nn.Parameter(torch.ones(dim))

    def forward(self, x):
        rms = torch.rsqrt(x.pow(2).mean(dim=-1, keepdim=True) + self.eps)
        return x * rms * self.gamma


# ── SwiGLU Feed-Forward ──────────────────────────────────────────────────────
class SwiGLUFeedForward(nn.Module):
    def __init__(self, config) -> None:
        super().__init__()
        self.w1 = nn.Linear(config.dmodel, config.dff, bias=False)  # gate
        self.w2 = nn.Linear(config.dmodel, config.dff, bias=False)  # up
        self.w3 = nn.Linear(config.dff, config.dmodel, bias=False)  # down

    def forward(self, x):
        return self.w3(F.silu(self.w1(x)) * self.w2(x))


# ── MoE Router ───────────────────────────────────────────────────────────────
class MoERouter(nn.Module):
    def __init__(self, config) -> None:
        super().__init__()
        self.num_experts = config.num_experts
        self.top_k = config.top_k
        self.router = nn.Linear(config.dmodel, self.num_experts, bias=False)

    def forward(self, x):
        scores = self.router(x)  # (B, S, num_experts)
        prob = F.softmax(scores, dim=-1)
        weight, indices = torch.topk(prob, self.top_k, dim=-1)
        weight = weight / weight.sum(dim=-1, keepdim=True)  # renormalize
        return weight, indices


# ── MoE ──────────────────────────────────────────────────────────────────────
class MoE(nn.Module):
    def __init__(self, config) -> None:
        super().__init__()
        self.experts = nn.ModuleList(
            [SwiGLUFeedForward(config) for _ in range(config.num_experts)]
        )
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


# ── Basic Multi-Head Latent Attention ─────────────────────────────────────────
# DeepSeek V2 paper, Section 2.1.2 — Equations 9-13
# Core idea: compress KV into a shared latent c_kv, then expand to K and V.
# Also compress Q into a latent c_q, then expand to Q.
# No RoPE — uses learned positional embeddings instead.
# This is the PURE low-rank compression version, before decoupled RoPE was added.
#
# Why this works:
#   Standard MHA caches K and V → 2 * H * dk * S elements per layer
#   Basic MLA caches only c_kv → kv_lora_rank * S elements per layer
#   kv_lora_rank << H * dk, so massive KV cache reduction
#
# Bonus: during inference, W_UK can be absorbed into W_Q,
# and W_UV can be absorbed into W_O — so we never even need to
# compute full K and V! (absorption only works WITHOUT RoPE on K)
class BasicMLA(nn.Module):
    def __init__(self, config) -> None:
        super().__init__()
        self.dk = config.dk
        self.H = config.H
        self.kv_lora_rank = config.kv_lora_rank
        self.q_lora_rank = config.q_lora_rank
        self.dmodel = config.dmodel

        # KV path (Eq. 9-11): x → c_kv → K, V
        # Step 1: compress x down to a small latent vector
        # Eq. 9: c_kv = W_DKV @ h_t
        self.w_down_kv = nn.Linear(self.dmodel, self.kv_lora_rank, bias=False)

        # Step 2: expand latent back up to full-size keys
        # Eq. 10: k_t = W_UK @ c_kv
        self.w_up_k = nn.Linear(self.kv_lora_rank, self.H * self.dk, bias=False)

        # Step 3: expand same latent to full-size values
        # Eq. 11: v_t = W_UV @ c_kv
        self.w_up_v = nn.Linear(self.kv_lora_rank, self.H * self.dk, bias=False)

        # Q path (Eq. 12-13): x → c_q → Q
        # Compressing Q doesn't reduce KV cache, but saves activation memory
        # Eq. 12: c_q = W_DQ @ h_t
        self.w_down_q = nn.Linear(self.dmodel, self.q_lora_rank, bias=False)

        # Eq. 13: q_t = W_UQ @ c_q
        self.w_up_q = nn.Linear(self.q_lora_rank, self.H * self.dk, bias=False)

        # Output projection
        self.wo = nn.Linear(self.H * self.dk, self.dmodel, bias=False)

    def forward(self, x, mask):
        B, S, dmodel = x.shape

        # ── KV path ──────────────────────────────────────────────────────────
        # Eq. 9: compress input to shared KV latent
        c_kv = self.w_down_kv(x)  # (B, S, kv_lora_rank)
        # During inference, only c_kv needs to be cached — not full K and V!

        # Eq. 10: expand latent to keys
        K = self.w_up_k(c_kv)  # (B, S, H*dk)
        K = K.view(B, S, self.H, self.dk).transpose(1, 2)  # (B, H, S, dk)

        # Eq. 11: expand same latent to values
        V = self.w_up_v(c_kv)  # (B, S, H*dk)
        V = V.view(B, S, self.H, self.dk).transpose(1, 2)  # (B, H, S, dk)

        # ── Q path ───────────────────────────────────────────────────────────
        # Eq. 12: compress input to query latent
        c_q = self.w_down_q(x)  # (B, S, q_lora_rank)

        # Eq. 13: expand latent to queries
        Q = self.w_up_q(c_q)  # (B, S, H*dk)
        Q = Q.view(B, S, self.H, self.dk).transpose(1, 2)  # (B, H, S, dk)

        # ── Standard scaled dot-product attention ────────────────────────────
        # Eq. 7: attn = softmax(Q @ K^T / sqrt(dk)) @ V
        attn_score = Q @ K.transpose(-1, -2) / math.sqrt(self.dk)  # (B, H, S, S)
        attn_score = attn_score.masked_fill(mask[:S, :S] == 0, float("-inf"))
        attn_score = F.softmax(attn_score, dim=-1)  # (B, H, S, S)
        x = attn_score @ V  # (B, H, S, dk)

        # Eq. 8: concatenate heads and project
        x = x.transpose(1, 2).contiguous().view(B, S, self.H * self.dk)
        return self.wo(x)  # (B, S, dmodel)


# ── Transformer Block ────────────────────────────────────────────────────────
class Block(nn.Module):
    def __init__(self, config, layer_idx) -> None:
        super().__init__()
        # Basic MLA — no RoPE needed, so no rope arg in forward
        self.mla = BasicMLA(config)

        if layer_idx >= config.n_dense_layers:
            self.ff = MoE(config)
        else:
            self.ff = SwiGLUFeedForward(config)

        self.rms_1 = RMSNorm(config.dmodel, config.norm_eps)
        self.rms_2 = RMSNorm(config.dmodel, config.norm_eps)

    def forward(self, x, mask):
        # Pre-norm + residual (no rope arg — that's the V3 addition)
        x = x + self.mla(self.rms_1(x), mask)
        x = x + self.ff(self.rms_2(x))
        return x


# ── DeepSeek V2 ──────────────────────────────────────────────────────────────
# Uses learned positional embeddings instead of RoPE.
# RoPE is incompatible with MLA's absorption trick (paper Section 2.1.3),
# so the basic MLA version uses simple positional embeddings.
# DeepSeek V2 later solves this with "decoupled RoPE" — that's in deepseek.py (V3).
class DeepseekV2(nn.Module):
    def __init__(self, config) -> None:
        super().__init__()
        self.wte = nn.Embedding(config.vocabsize, config.dmodel)
        # Learned positional embeddings — like GPT-2
        # Basic MLA has no RoPE, so positions come from here
        self.wpe = nn.Embedding(config.max_seq_len, config.dmodel)

        self.blocks = nn.ModuleList(
            [Block(config, layer_idx) for layer_idx in range(config.N)]
        )
        self.norm = RMSNorm(config.dmodel, config.norm_eps)
        self.lm_head = nn.Linear(config.dmodel, config.vocabsize, bias=False)
        # Weight tying
        self.lm_head.weight = self.wte.weight

        self.register_buffer(
            "mask",
            torch.tril(torch.ones(config.max_seq_len, config.max_seq_len)),
        )

    def forward(self, x):
        B, S = x.shape
        pos = torch.arange(0, S, device=x.device)  # (S,)
        x = self.wte(x) + self.wpe(pos)  # (B, S, dmodel)

        for block in self.blocks:
            x = block(x, self.mask)

        x = self.norm(x)
        return self.lm_head(x)


# ── Tests ────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    config = DeepseekV2Config()

    # Test RMSNorm
    rms_norm = RMSNorm(config.dmodel, config.norm_eps)
    x = torch.randn(config.B, config.max_seq_len, config.dmodel)
    out = rms_norm(x)
    print("RMSNorm out:", out.shape)

    # Test SwiGLUFeedForward
    ff = SwiGLUFeedForward(config)
    x = torch.randn(config.B, config.max_seq_len, config.dmodel)
    out = ff(x)
    print("SwiGLUFeedForward out:", out.shape)

    # Test MoERouter
    router = MoERouter(config)
    x = torch.randn(config.B, config.max_seq_len, config.dmodel)
    weights, indices = router(x)
    print("weights:", weights.shape)  # expect (2, 256, 2)
    print("indices:", indices.shape)
    print("weights sum to 1?", weights.sum(dim=-1)[0, :3])
    print("sample indices:", indices[0, :3])

    # Test MoE
    moe = MoE(config)
    x = torch.randn(config.B, config.max_seq_len, config.dmodel)
    out = moe(x)
    print("MoE out:", out.shape)
    print("Shape preserved:", x.shape == out.shape)

    # Test BasicMLA
    mla = BasicMLA(config)
    mask = torch.tril(torch.ones(config.max_seq_len, config.max_seq_len))
    x = torch.randn(config.B, config.max_seq_len, config.dmodel)
    out = mla(x, mask)
    print("BasicMLA out:", out.shape)
    print("Shape preserved:", x.shape == out.shape)

    # Test Block (dense — layer 0)
    block = Block(config, layer_idx=0)
    x = torch.randn(config.B, config.max_seq_len, config.dmodel)
    mask = torch.tril(torch.ones(config.max_seq_len, config.max_seq_len))
    out = block(x, mask)
    print("Block (dense) out:", out.shape)
    print("Block ff type:", type(block.ff))  # expect SwiGLUFeedForward

    # Test Block (MoE — layer 1)
    block_moe = Block(config, layer_idx=1)
    out_moe = block_moe(x, mask)
    print("Block (MoE) out:", out_moe.shape)
    print("Block ff type:", type(block_moe.ff))  # expect MoE

    # Test full DeepseekV2 model
    model = DeepseekV2(config)
    x = torch.randint(0, config.vocabsize, (config.B, config.max_seq_len))
    logits = model(x)
    print("Input shape:", x.shape)
    print("Output shape:", logits.shape)
    print("Expected:", (config.B, config.max_seq_len, config.vocabsize))
    print(
        "Weights tied:",
        model.lm_head.weight.data_ptr() == model.wte.weight.data_ptr(),
    )
    total_params = sum(p.numel() for p in model.parameters())
    print("Total parameters:", total_params)
