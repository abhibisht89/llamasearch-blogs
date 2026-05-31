"""
train.py — Generic decoder LM training loop on TinyShakespeare.

The loop is model-agnostic: any module with forward(x) -> (B, S, vocab) works.
Default example model: GPT-2 from ../02-gpt-2/gpt2.py (Stop 02).

Usage:
    python3 train.py
    python3 train.py --prompt "First Citizen:"

TensorBoard (optional):
    tensorboard --logdir runs
"""

import json
import sys
import time
import argparse
from pathlib import Path

import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.utils.tensorboard import SummaryWriter

from dataset import get_dataloaders, DATA_URL

# Reuse GPT-2 from Stop 02 — single source of truth, no duplicate gpt2.py here.
_GPT2_DIR = Path(__file__).resolve().parent.parent / "02-gpt-2"
if str(_GPT2_DIR) not in sys.path:
    sys.path.insert(0, str(_GPT2_DIR))
from gpt2 import GPT, GPTConfig  # noqa: E402

N_STEPS = 500
EVAL_INTERVAL = 50
EVAL_STEPS = 20
BATCH_SIZE = 16
LR = 3e-4
MAX_SEQ_LEN = 256

if torch.cuda.is_available():
    DEVICE = "cuda"
elif torch.backends.mps.is_available():
    DEVICE = "mps"
else:
    DEVICE = "cpu"


def build_model(vocab_size: int):
    """
    Instantiate the decoder LM to train.
    Swap this function to train LLaMA, Mistral, etc. from other series chapters.
    """
    config = GPTConfig(vocabsize=vocab_size, max_seq_len=MAX_SEQ_LEN)
    return GPT(config)


def get_val_loss(model, val_loader, criterion, n_steps=EVAL_STEPS):
    model.eval()
    total_loss = 0.0
    steps = 0
    with torch.no_grad():
        for x, y in val_loader:
            x, y = x.to(DEVICE), y.to(DEVICE)
            logits = model(x)
            loss = criterion(logits.view(-1, logits.size(-1)), y.view(-1))
            total_loss += loss.item()
            steps += 1
            if steps >= n_steps:
                break
    model.train()
    return total_loss / steps


def train():
    print(f"Device: {DEVICE}")
    print(f"Dataset URL: {DATA_URL}\n")

    print("Loading dataset...")
    train_loader, val_loader, tokenizer = get_dataloaders(
        max_seq_len=MAX_SEQ_LEN,
        batch_size=BATCH_SIZE,
    )

    model = build_model(tokenizer.vocab_size).to(DEVICE)
    model.train()

    total_params = sum(p.numel() for p in model.parameters())
    print(f"\n{'='*55}")
    print("  Capstone : The Training Loop")
    print(f"  Params   : {total_params:,}")
    print(f"  Device   : {DEVICE}")
    print(f"  Steps    : {N_STEPS}  (eval every {EVAL_INTERVAL})")
    print(f"{'='*55}\n")

    optimizer = AdamW(model.parameters(), lr=LR)
    criterion = nn.CrossEntropyLoss()
    writer = SummaryWriter(log_dir="runs/training-loop")

    history = {"train_loss": [], "val_loss": [], "steps": []}
    train_iter = iter(train_loader)
    running_loss = 0.0
    t0 = time.time()

    for step in range(1, N_STEPS + 1):
        try:
            x, y = next(train_iter)
        except StopIteration:
            train_iter = iter(train_loader)
            x, y = next(train_iter)

        x, y = x.to(DEVICE), y.to(DEVICE)

        optimizer.zero_grad()
        logits = model(x)
        loss = criterion(logits.view(-1, logits.size(-1)), y.view(-1))
        loss.backward()
        nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()

        running_loss += loss.item()

        if step % EVAL_INTERVAL == 0:
            avg_train_loss = running_loss / EVAL_INTERVAL
            val_loss = get_val_loss(model, val_loader, criterion)
            elapsed = time.time() - t0

            history["steps"].append(step)
            history["train_loss"].append(round(avg_train_loss, 4))
            history["val_loss"].append(round(val_loss, 4))

            writer.add_scalar("Loss/train", avg_train_loss, step)
            writer.add_scalar("Loss/val", val_loss, step)

            print(
                f"  step {step:4d}/{N_STEPS} | "
                f"train: {avg_train_loss:.4f} | val: {val_loss:.4f} | {elapsed:.1f}s"
            )
            running_loss = 0.0

    writer.close()

    with open("training_losses.json", "w") as f:
        json.dump(history, f, indent=2)

    print(f"\nDone in {(time.time() - t0) / 60:.1f} minutes.")
    print("Loss history saved : training_losses.json")
    print("TensorBoard logs   : runs/training-loop/")

    return model, tokenizer


@torch.no_grad()
def generate(model, tokenizer, prompt="ROMEO:", max_new_tokens=200, temperature=0.8):
    model.eval()
    token_ids = tokenizer.encode(prompt)
    x = torch.tensor([token_ids], dtype=torch.long, device=DEVICE)

    for _ in range(max_new_tokens):
        x_cond = x[:, -MAX_SEQ_LEN:]
        logits = model(x_cond)
        logits = logits[:, -1, :] / temperature
        probs = torch.softmax(logits, dim=-1)
        next_token = torch.multinomial(probs, num_samples=1)
        x = torch.cat([x, next_token], dim=1)

    return tokenizer.decode(x[0].tolist())


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Train a decoder LM on TinyShakespeare (default: GPT-2)"
    )
    parser.add_argument(
        "--prompt",
        type=str,
        default="ROMEO:",
        help="Prompt for generation after training",
    )
    args = parser.parse_args()

    model, tokenizer = train()

    print(f"\n{'='*55}")
    print(f"  Generating from prompt: {repr(args.prompt)}")
    print(f"{'='*55}\n")
    print(generate(model, tokenizer, prompt=args.prompt))
