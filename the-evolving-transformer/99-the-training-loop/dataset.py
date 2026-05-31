"""
dataset.py — TinyShakespeare character-level dataset

Downloads TinyShakespeare (~1MB) on first run if not already present.
Source: https://github.com/karpathy/char-rnn/blob/master/data/tinyshakespeare/input.txt

Builds a char-level vocabulary and returns (input, target) batches for next-token prediction.
"""

import os
import urllib.request
import torch
from torch.utils.data import Dataset, DataLoader

DATA_URL = "https://raw.githubusercontent.com/karpathy/char-rnn/master/data/tinyshakespeare/input.txt"
DATA_PATH = "tinyshakespeare.txt"


def download_dataset():
    """Download TinyShakespeare if not already on disk."""
    if not os.path.exists(DATA_PATH):
        print(f"Downloading TinyShakespeare to {DATA_PATH}...")
        urllib.request.urlretrieve(DATA_URL, DATA_PATH)
        print("Done.")
    else:
        print(f"Dataset already exists at {DATA_PATH}")


class CharTokenizer:
    """Maps each unique character in the corpus to an integer id."""

    def __init__(self, text: str):
        chars = sorted(set(text))
        self.vocab_size = len(chars)
        self.char_to_id = {c: i for i, c in enumerate(chars)}
        self.id_to_char = {i: c for i, c in enumerate(chars)}

    def encode(self, text: str) -> list[int]:
        return [self.char_to_id[c] for c in text]

    def decode(self, ids: list[int]) -> str:
        return "".join(self.id_to_char[i] for i in ids)


class CharDataset(Dataset):
    """
    Sliding windows for next-token prediction.
    x = tokens[0:S], y = tokens[1:S+1] (shifted by one).
    """

    def __init__(self, token_ids: list[int], max_seq_len: int):
        self.data = torch.tensor(token_ids, dtype=torch.long)
        self.max_seq_len = max_seq_len

    def __len__(self):
        return len(self.data) - self.max_seq_len

    def __getitem__(self, idx):
        chunk = self.data[idx : idx + self.max_seq_len + 1]
        return chunk[:-1], chunk[1:]


def get_dataloaders(max_seq_len: int, batch_size: int, val_fraction: float = 0.1):
    """Build train/val DataLoaders. Returns (train_loader, val_loader, tokenizer)."""
    download_dataset()

    with open(DATA_PATH, "r", encoding="utf-8") as f:
        text = f.read()

    tokenizer = CharTokenizer(text)
    token_ids = tokenizer.encode(text)

    print(f"Total characters : {len(text):,}")
    print(f"Vocab size        : {tokenizer.vocab_size}")
    print(f"Total tokens      : {len(token_ids):,}")

    split = int(len(token_ids) * (1 - val_fraction))
    train_dataset = CharDataset(token_ids[:split], max_seq_len)
    val_dataset = CharDataset(token_ids[split:], max_seq_len)

    print(f"Train samples     : {len(train_dataset):,}")
    print(f"Val samples       : {len(val_dataset):,}")

    train_loader = DataLoader(
        train_dataset, batch_size=batch_size, shuffle=True, drop_last=True
    )
    val_loader = DataLoader(
        val_dataset, batch_size=batch_size, shuffle=False, drop_last=True
    )

    return train_loader, val_loader, tokenizer
