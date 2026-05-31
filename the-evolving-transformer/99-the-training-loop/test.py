"""
Smoke tests for dataset.py + train.py (fast — no full 500-step run).

Run: python test.py
"""

import sys
from pathlib import Path

import torch
import torch.nn as nn

from dataset import CharTokenizer, CharDataset, get_dataloaders

_GPT2_DIR = Path(__file__).resolve().parent.parent / "02-gpt-2"
if str(_GPT2_DIR) not in sys.path:
    sys.path.insert(0, str(_GPT2_DIR))
from gpt2 import GPTConfig, GPT  # noqa: E402

from train import build_model, get_val_loss, MAX_SEQ_LEN, DEVICE


def test_char_dataset_shift():
    ids = list(range(20))
    ds = CharDataset(ids, max_seq_len=4)
    x, y = ds[0]
    assert x.tolist() == [0, 1, 2, 3]
    assert y.tolist() == [1, 2, 3, 4]


def test_tokenizer_roundtrip():
    tok = CharTokenizer("abc")
    assert tok.vocab_size == 3
    assert tok.decode(tok.encode("cab")) == "cab"


def test_one_training_step():
    cfg = GPTConfig(dmodel=64, vocabsize=50, max_seq_len=16, N=2, H=4, dropout=0.0)
    model = GPT(cfg).to(DEVICE)
    model.train()
    x = torch.randint(0, 50, (2, 16), device=DEVICE)
    y = torch.randint(0, 50, (2, 16), device=DEVICE)
    opt = torch.optim.AdamW(model.parameters(), lr=1e-3)
    logits = model(x)
    loss = nn.CrossEntropyLoss()(logits.view(-1, 50), y.view(-1))
    loss.backward()
    opt.step()
    assert loss.item() > 0


def test_build_model_matches_vocab():
    model = build_model(vocab_size=65)
    assert model.lm_head.out_features == 65


def test_val_loss_runs():
    train_loader, val_loader, tok = get_dataloaders(max_seq_len=32, batch_size=4)
    model = build_model(tok.vocab_size).to(DEVICE)
    crit = nn.CrossEntropyLoss()
    v = get_val_loss(model, val_loader, crit, n_steps=2)
    assert v > 0


if __name__ == "__main__":
    test_char_dataset_shift()
    test_tokenizer_roundtrip()
    test_one_training_step()
    test_build_model_matches_vocab()
    print("dataset download + val loss (2 batches)...")
    test_val_loss_runs()
    print("All tests passed.")
