#!/usr/bin/env python3
"""
Repair the mate-in-2 manual queue (worst-band side_wrong failures).

Run:
  PYTHONUNBUFFERED=1 python3 scripts/repair-manual-queue.py --only-side-wrong
"""

from __future__ import annotations

import argparse
import importlib.util
import itertools
import json
import sys
import time
from pathlib import Path

import chess

ROOT = Path(__file__).resolve().parent.parent
ICHESS = Path.home() / "ichess"
QUEUE_PATH = ROOT / "data/sections/mate_in_2_side_wrong_manual_queue.json"
DATA_PATH = ROOT / "data/sections/mate_in_2.json"
PUZZLE_BUDGET_SEC = 90.0

sys.path.insert(0, str(ICHESS))
sys.path.insert(0, str(ICHESS / "llamachess"))
sys.path.insert(0, str(ICHESS / "llamachess" / "scripts"))

from export_mate_in_2 import (  # noqa: E402
    AMBIG_EXTENDED,
    MATE2_AMBIG_PRESETS,
    MAX_AMBIG_COMBOS,
    derive_solution_moves,
    extract_first_move_token,
    extract_spatial_rank_strings,
    match_first_move,
    parse_mate2_main_line,
    parse_mate2_solutions,
    pick_solution_raw,
    resolve_fen_first_move,
    side_not_to_move_in_check,
)
from export_puzzles import (  # noqa: E402
    fallback_fen_candidates,
    fen_orientations,
    is_browser_valid_fen,
    ranks_to_fen,
)
from polgar_puzzle_books import SRC_PDF, extract_text_from_pdf, parse_puzzles  # noqa: E402
from repair_browser_fens import candidate_repairs  # noqa: E402

_rsw_spec = importlib.util.spec_from_file_location(
    "repair_side_wrong", ROOT / "scripts/repair-side-wrong.py"
)
_rsw = importlib.util.module_from_spec(_rsw_spec)
_rsw_spec.loader.exec_module(_rsw)


def log(msg: str) -> None:
    print(msg, flush=True)


def capped_presets(rank_strings: list[str]) -> list[dict[str, str]]:
    presets: list[dict[str, str]] = list(MATE2_AMBIG_PRESETS) + [{}]
    chars = sorted(set("".join(rank_strings)) & set(AMBIG_EXTENDED))
    if not chars:
        return presets
    choices = {c: AMBIG_EXTENDED[c] for c in chars}
    total = 1
    for ch in chars:
        total *= len(choices[ch])
        if total > MAX_AMBIG_COMBOS:
            break
    if total <= MAX_AMBIG_COMBOS:
        for combo in itertools.product(*(choices[c] for c in chars)):
            presets.append(dict(zip(chars, combo)))
        return presets
    base = {"L": "Q"}
    for ch in chars:
        for alt in choices[ch]:
            presets.append({**base, ch: alt})
    for a, b in itertools.combinations(chars, 2):
        for alt_a in choices[a]:
            for alt_b in choices[b]:
                presets.append({**base, a: alt_a, b: alt_b})
    return presets


def exhaustive_presets(rank_strings: list[str]) -> list[dict[str, str]]:
    chars = sorted(set("".join(rank_strings)) & set(AMBIG_EXTENDED))
    if not chars:
        return []
    choices = {c: AMBIG_EXTENDED[c] for c in chars}
    return [dict(zip(chars, combo)) for combo in itertools.product(*(choices[c] for c in chars))]


def validate_hit(fen: str, raw: str, stored_moves: list[str]) -> list[str] | None:
    if not is_browser_valid_fen(fen):
        return None
    if side_not_to_move_in_check(chess.Board(fen)):
        return None

    tokens = parse_mate2_main_line(raw)
    if len(tokens) >= 3:
        line = derive_solution_moves(fen, raw)
        if line:
            return line

    if len(stored_moves) >= 3:
        replayed = _rsw.replay_moves(fen, stored_moves)
        if replayed:
            return replayed

    if len(tokens) < 3:
        token = extract_first_move_token(raw)
        board = chess.Board(fen)
        legal = [board.san(m) for m in board.legal_moves]
        first = match_first_move(legal, token)
        if first:
            lines = _rsw.all_mate_in_two_lines(fen, first)
            if len(lines) == 1:
                return lines[0]
            picked = _rsw.pick_mate_line(lines, stored_moves)
            if picked:
                return picked
    return None


def search_from_ranks(
    rank_strings: list[str],
    raw: str,
    stored_moves: list[str],
    exhaustive: bool,
    deadline: float,
) -> tuple[str, list[str]] | None:
    """Use resolve_fen_first_move on rank presets (fast, targeted)."""
    preset_lists = [capped_presets(rank_strings)]
    if exhaustive:
        preset_lists.append(exhaustive_presets(rank_strings))

    seen: set[str] = set()
    for presets in preset_lists:
        for preset in presets:
            if time.monotonic() > deadline:
                return None
            for ordered in (rank_strings, list(reversed(rank_strings))):
                base = ranks_to_fen(ordered, preset)
                if not base:
                    continue
                resolved = resolve_fen_first_move(base, raw)
                if not resolved:
                    continue
                trial_fen, _ = resolved
                key = trial_fen.split()[0]
                if key in seen:
                    continue
                seen.add(key)
                line = validate_hit(trial_fen, raw, stored_moves)
                if line:
                    return trial_fen, line
    return None


def search_local_fens(
    seed_fens: list[str],
    raw: str,
    stored_moves: list[str],
) -> tuple[str, list[str]] | None:
    seen: set[str] = set()
    candidates: list[str] = []
    for seed in seed_fens:
        candidates.append(seed)
        candidates.append(_rsw.flip_turn(seed))
        candidates.extend(candidate_repairs(seed)[:40])

    for cand in candidates:
        key = cand.split()[0]
        if key in seen:
            continue
        seen.add(key)
        for oriented in fen_orientations(cand):
            for turn in ("w", "b"):
                parts = oriented.split()
                parts[1] = turn
                trial = " ".join(parts)
                if trial.split()[0] in seen:
                    continue
                line = validate_hit(trial, raw, stored_moves)
                if line:
                    return trial, line
                seen.add(trial.split()[0])
    return None


def repair_one(
    puzzle: dict,
    raw: str,
    rank_strings: list[str] | None,
    fallback_fens: list[str],
) -> tuple[str, list[str], str] | None:
    stored = puzzle.get("solutionMoves") or []
    seeds = [puzzle["fen"], *fallback_fens]
    deadline = time.monotonic() + PUZZLE_BUDGET_SEC

    if rank_strings:
        for exhaustive, tag in ((False, "pdf_ranks"), (True, "pdf_ranks_exhaustive")):
            hit = search_from_ranks(
                rank_strings, raw, stored, exhaustive=exhaustive, deadline=deadline
            )
            if hit:
                return hit[0], hit[1], tag

    if time.monotonic() > deadline:
        return None

    hit = search_local_fens(seeds, raw, stored)
    if hit:
        return hit[0], hit[1], "local_fen"
    return None


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--only-side-wrong",
        action="store_true",
        help="Skip queue items that already pass audit",
    )
    args = parser.parse_args()

    queue = json.loads(QUEUE_PATH.read_text())
    section = json.loads(DATA_PATH.read_text())
    by_book = {int(p["bookId"]): p for p in section["puzzles"]}

    items = queue["puzzles"]
    if args.only_side_wrong:
        audit_path = ROOT / "data/sections/mate_in_2_audit.json"
        if audit_path.exists():
            audit = json.loads(audit_path.read_text())
            side_wrong_ids = {
                int(item["bookId"])
                for item in audit.get("puzzles", [])
                if item.get("status") == "side_wrong"
            }
            items = [item for item in items if int(item["bookId"]) in side_wrong_ids]
        log(f"Processing {len(items)} remaining side_wrong queue items…")

    log("Loading PDF metadata…")
    lines = extract_text_from_pdf(SRC_PDF)
    book_solutions = parse_mate2_solutions(lines)
    boards = parse_puzzles(lines)
    rank_strings_by_num = extract_spatial_rank_strings(SRC_PDF)
    existing_raw = {int(p["bookId"]): p.get("solutionRaw", "") for p in section["puzzles"]}

    fixed = 0
    failed: list[int] = []
    results: list[dict] = []

    for idx, item in enumerate(items, 1):
        book_id = int(item["bookId"])
        puzzle = by_book[book_id]
        raw = pick_solution_raw(book_id, book_solutions.get(book_id), existing_raw)
        fallback = fallback_fen_candidates(book_id, lines, boards)
        log(f"[{idx}/{len(items)}] book {book_id}…")

        hit = repair_one(puzzle, raw, rank_strings_by_num.get(book_id), fallback)
        if not hit:
            failed.append(book_id)
            results.append({"bookId": book_id, "status": "failed"})
            log(f"  FAIL #{puzzle['id']}")
            continue

        fen, moves, method = hit
        fixed += 1
        results.append(
            {
                "bookId": book_id,
                "status": "fixed",
                "method": method,
                "fen": fen,
                "solutionMoves": moves,
            }
        )
        log(f"  FIX [{method}] {' '.join(moves[:3])}")

        if not args.dry_run:
            puzzle["fen"] = fen
            puzzle["sideToMove"] = fen.split()[1]
            puzzle["solutionRaw"] = raw
            puzzle["solutionMoves"] = moves
            section["available"] = len(section["puzzles"])
            DATA_PATH.write_text(json.dumps(section, indent=2) + "\n")

    report_path = ROOT / "data/sections/mate_in_2_manual_repair_report.json"
    report_path.write_text(
        json.dumps(
            {"queue": queue["band"], "fixed": fixed, "failed": failed, "results": results},
            indent=2,
        )
        + "\n"
    )

    log(f"\nDone: fixed {fixed}/{len(items)}, failed {len(failed)}")


if __name__ == "__main__":
    main()
