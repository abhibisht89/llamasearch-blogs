# llamasearch-blogs

**The Context Window** — interactive tutorials and long-form notes on how modern AI systems actually work.

**Live site:** [llamasearch.dev](https://llamasearch.dev)

---

## What this is

This repository is how I learn.

I am deeply interested in machine learning and in the architectures behind the models we use every day — ChatGPT, Claude, Gemini, and everything built on top of transformers. I do not want to treat them as black boxes. I want to understand what changed between papers, why a design choice mattered, and how one model evolved into the next.

**llamasearch-blogs** is where I collect that learning: blog chapters, runnable code, diagrams, and references — all in one place so I can revisit them as my understanding grows. If it helps someone else along the way, that is a welcome bonus — but the primary audience is me, organizing my own path from curiosity to clarity.

---

## The vision

There is no shortage of excellent material on ML and LLMs. Courses, papers, YouTube lectures, threads, and repos each go deep on one topic. What I found harder to find was a **single thread** that walks through landmark architectures **in order** — showing how innovations connect, where an idea came from, and what actually changed in the code from one generation to the next.

That gap is what this project tries to fill:

- **Evolving, not isolated.** Each chapter builds on the last so you can see the lineage, not just a snapshot of one model.
- **Runnable, not abstract.** PyTorch implementations you can read, run, and diff — not slides or pseudocode alone.
- **Honest about sources.** I learn from others first; this repo is my articulation of what I understood, with pointers back to the tutorials, blogs, and videos that taught me.
- **A living notebook.** Whatever I am reading or experimenting with, I try to put it here. The repo will grow unevenly — some weeks a full chapter, other weeks a side topic that caught my attention — but I keep a loose structure so it stays navigable over time.

Over time I hope to pair chapters with **YouTube videos** (one per stop) so intuition and code stay aligned. **The Evolving Transformer** is published as a curated **9-chapter arc** — each stop is a milestone where the architecture changed in a fundamental way, not just scale or training tricks.

---

## What I am *not* claiming

> **Personal learning journal.** Almost nothing here is original research or a novel invention. I read papers, watch talks, follow blogs and social posts, study existing codebases, and then rewrite what I learned in my own words and implementations. References and attributions appear throughout each series where I drew from a specific source. I use AI tools to help reformulate drafts, tighten prose, and iterate on explanations — always starting from material I have studied elsewhere.

If you spot an error, a missing citation, or a misread of a paper, please open an issue or reach out. Correcting my understanding is part of the point.

---

## Repository layout

| Path | Description |
|------|-------------|
| [`index.html`](index.html) | Landing page — **The Context Window**, series cards, and release status |
| [`the-evolving-transformer/`](the-evolving-transformer/) | **The Evolving Transformer** — one growing codebase across **9 architectural milestones**: Transformer → GPT-2 → CLIP → LLaMA → Mistral → Mixtral → DeepSeek V2/V3 → PaliGemma → Qwen3-Next |
| [`the-archives/`](the-archives/) | Older posts ported from [llamasearch.wordpress.com](https://llamasearch.wordpress.com) (2018–2024) |

Additional series (tokens & training fundamentals, DeepSeek deep dives, reasoning / RL, and more) live in my private content repo during drafting and appear here as they are published.

Each published chapter typically includes:

- An **`index.html`** article (interactive where it helps)
- **`.py` source** for the model or component being built
- Links to **tests**, diffs, and external references

---

## Flagship series: The Evolving Transformer

The first major series we are launching is **[The Evolving Transformer](the-evolving-transformer/)**.

**Idea:** one codebase, many architectures — implemented paper by paper so you can diff what changed and why.

**Live chapters (9 stops):**

| Stop | Model | Folder |
|------|--------|--------|
| 01 | Attention Is All You Need (Transformer) | `01-attention-is-all-you-need/` |
| 02 | GPT-2 | `02-gpt-2/` |
| 03 | CLIP | `14-clip/` |
| 04 | LLaMA | `03-llama/` |
| 05 | Mistral 7B | `04-mistral-7b/` |
| 06 | Mixtral 8×7B | `05-mixtral/` |
| 07 | DeepSeek V2 & V3 | `06-deepseek/` |
| 08 | PaliGemma | `15-paligemma/` |
| 09 | Qwen3-Next 80B-A3B (finale) | `10-qwen3-next/` |

**Code:** chapter-matched Python under each folder (e.g. `01-attention-is-all-you-need/transformer.py`, `06-deepseek/deepseek_v2.py` + `deepseek_v3.py`). Local development also tracks a separate **`bumblebee`** codebase; published chapter files are synced here for readers.

All nine chapters are linked on the [series index](the-evolving-transformer/).

---

## How I work on this

1. **Read / watch** — papers, YouTube, blogs, Twitter threads, official docs, and high-quality courses (e.g. Raschka, Karpathy, Lilian Weng, Hugging Face source, and many others).
2. **Implement** — minimal, readable PyTorch that matches the idea I am trying to internalize.
3. **Write** — explain it the way I wish it had been explained to me; add diagrams and small interactives when they help.
4. **Publish** — push to this repo; the site deploys from `main` to [llamasearch.dev](https://llamasearch.dev).

Because learning is not linear, you may sometimes see detours — a one-off topic or side series that does not fit a single chapter slot. I try to file those under sensible folders rather than letting the root sprawl.

---

## Topics covered (across series, present and planned)

Hands-on material for ML practitioners, including but not limited to:

- Transformers and decoder-only LMs (attention, RoPE, GQA, MoE, linear attention, SSMs)
- Training and alignment (SFT, RLHF, GRPO, reasoning models)
- DeepSeek and open-weight ecosystem
- Diffusion and generative models (where series touch them)
- RAG, agents, benchmarking, security, and production inference
- Interactive demos embedded in the HTML chapters where possible

The tagline on the homepage still applies: from building a single neuron toward training and evaluating models you can reason about — not just call.

---

## Contributing and feedback

This is primarily a personal learning repo. Issues and suggestions are welcome, especially:

- Factual corrections or clearer explanations
- Missing attributions
- Broken links or code that no longer runs

---

## Author

**Abhishek Bisht** — learning in public.

- Site: [llamasearch.dev](https://llamasearch.dev)
- GitHub: [@abhibisht89](https://github.com/abhibisht89)

---

*If you are new here, start with [The Evolving Transformer](the-evolving-transformer/) series index — read stop 01, then follow the evolution strip through stop 09. Read the code on GitHub, run it locally, and treat every post as one stop on a longer map — not the final word.*
