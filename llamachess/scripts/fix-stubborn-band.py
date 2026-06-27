#!/usr/bin/env python3
"""
Fix remaining stubborn mate-in-2 puzzles in band 3507–3706.

Skips positions that are not mate-in-2 (e.g. forced mate only in 3).
"""

from __future__ import annotations

import importlib.util
import itertools
import json
import re
import sys
import time
from pathlib import Path

import chess

ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = ROOT / "data/sections/mate_in_2.json"
ICHESS = Path.home() / "ichess"
STUBBORN_IDS = [
    3533, 3589, 3599, 3600, 3611, 3612, 3628, 3631, 3634, 3641, 3647, 3649,
    3664, 3666, 3669, 3670, 3673, 3685,
]

sys.path.insert(0, str(ICHESS))
sys.path.insert(0, str(ICHESS / "llamachess"))
sys.path.insert(0, str(ICHESS / "llamachess" / "scripts"))

from export_mate_in_2 import (  # noqa: E402
    AMBIG_EXTENDED,
    MATE2_AMBIG_PRESETS,
    derive_solution_moves,
    extract_first_move_token,
    extract_spatial_rank_strings,
    match_first_move,
    normalize_polgar_token,
    parse_mate2_main_line,
    parse_mate2_solutions,
    pick_solution_raw,
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


def parse_line_tokens(raw: str) -> list[str]:
    tokens = parse_mate2_main_line(raw)
    if len(tokens) >= 3:
        return tokens[:3]
    mate_hits = re.findall(r"2\.(\S+)", raw)
    for hit in mate_hits:
        mate = normalize_polgar_token(hit)
        if mate.endswith("#") or mate.endswith("+"):
            pass
        elif mate:
            mate += "#"
        if len(tokens) == 2:
            tokens.append(mate)
            break
        if len(tokens) == 1 and mate:
            tokens.append(mate)
    return tokens[:3]


def mate_in_one(fen: str) -> bool:
    board = chess.Board(fen)
    for move in board.legal_moves:
        trial = board.copy()
        trial.push(move)
        if trial.is_checkmate():
            return True
    return False


def count_mate_in_two(fen: str) -> int:
    return len(_rsw.all_mate_in_two_lines(fen, None))


def count_mate_in_three(fen: str) -> int:
    board = chess.Board(fen)
    count = 0
    for m1 in board.legal_moves:
        b1 = board.copy()
        b1.push(m1)
        if b1.is_checkmate():
            continue
        for m2 in b1.legal_moves:
            b2 = b1.copy()
            b2.push(m2)
            if b2.is_checkmate():
                continue
            for m3 in b2.legal_moves:
                b3 = b2.copy()
                b3.push(m3)
                if b3.is_checkmate():
                    continue
                for m4 in b3.legal_moves:
                    b4 = b3.copy()
                    b4.push(m4)
                    if b4.is_checkmate():
                        count += 1
                        if count > 2:
                            return count
    return count


def classify_board(fen: str) -> str:
    if not is_browser_valid_fen(fen):
        return "invalid_fen"
    if side_not_to_move_in_check(chess.Board(fen)):
        return "side_wrong"
    if mate_in_one(fen):
        return "mate_in_1"
    m2 = count_mate_in_two(fen)
    if m2:
        return "mate_in_2"
    m3 = count_mate_in_three(fen)
    if m3:
        return "mate_in_3"
    return "no_forced_mate"


def capped_presets(rank_strings: list[str]) -> list[dict[str, str]]:
    presets: list[dict[str, str]] = list(MATE2_AMBIG_PRESETS) + [{}]
    chars = sorted(set("".join(rank_strings)) & set(AMBIG_EXTENDED))
    if not chars:
        return presets
    choices = {c: AMBIG_EXTENDED[c] for c in chars}
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
    return [dict(zip(chars, c)) for c in itertools.product(*(choices[c] for c in chars))]


def try_board(fen: str, raw: str, stored: list[str]) -> list[str] | None:
    tokens = parse_line_tokens(raw)
    if len(tokens) >= 3:
        line = derive_solution_moves(fen, raw)
        if line:
            return line
        # Retry with explicit tokens joined as synthetic raw.
        synth = f"1.{tokens[0]} {tokens[1]} 2.{tokens[2]}"
        line = derive_solution_moves(fen, synth)
        if line:
            return line
    if len(stored) >= 3:
        replayed = _rsw.replay_moves(fen, stored)
        if replayed:
            return replayed
    if len(tokens) < 3:
        board = chess.Board(fen)
        legal = [board.san(m) for m in board.legal_moves]
        first = match_first_move(legal, extract_first_move_token(raw))
        if first:
            lines = _rsw.all_mate_in_two_lines(fen, first)
            if len(lines) == 1:
                return lines[0]
            picked = _rsw.pick_mate_line(lines, stored)
            if picked:
                return picked
    return None


def search_boards(boards: list[str], raw: str, stored: list[str]) -> tuple[str, list[str]] | None:
    seen: set[str] = set()
    for board in boards:
        key = board.split()[0]
        if key in seen:
            continue
        seen.add(key)
        for oriented in fen_orientations(board):
            for turn in ("w", "b"):
                parts = oriented.split()
                parts[1] = turn
                trial = " ".join(parts)
                pos_key = trial.split()[0]
                if pos_key in seen:
                    continue
                if not is_browser_valid_fen(trial):
                    continue
                if side_not_to_move_in_check(chess.Board(trial)):
                    continue
                if mate_in_one(trial):
                    continue
                line = try_board(trial, raw, stored)
                if line:
                    return trial, line
                seen.add(pos_key)
    return None


def collect_boards(rank_strings: list[str] | None, seeds: list[str], exhaustive: bool) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()

    def add(fen: str | None) -> None:
        if not fen:
            return
        key = fen.split()[0]
        if key in seen:
            return
        seen.add(key)
        out.append(fen)

    if rank_strings:
        presets = exhaustive_presets(rank_strings) if exhaustive else capped_presets(rank_strings)
        for preset in presets:
            for ordered in (rank_strings, list(reversed(rank_strings))):
                add(ranks_to_fen(ordered, preset))

    for seed in seeds:
        add(seed)
        add(_rsw.flip_turn(seed))
        for cand in candidate_repairs(seed)[:50]:
            add(cand)
    return out


def main() -> None:
    section = json.loads(DATA_PATH.read_text())
    by_book = {int(p["bookId"]): p for p in section["puzzles"]}

    print("Loading PDF…", flush=True)
    lines = extract_text_from_pdf(SRC_PDF)
    solutions = parse_mate2_solutions(lines)
    boards = parse_puzzles(lines)
    ranks_by = extract_spatial_rank_strings(SRC_PDF)
    existing_raw = {int(p["bookId"]): p.get("solutionRaw", "") for p in section["puzzles"]}

    fixed = 0
    skipped_m3: list[int] = []
    failed: list[int] = []
    report: list[dict] = []

    for idx, book_id in enumerate(STUBBORN_IDS, 1):
        puzzle = by_book[book_id]
        raw = pick_solution_raw(book_id, solutions.get(book_id), existing_raw)
        stored = puzzle.get("solutionMoves") or []
        seeds = [puzzle["fen"], *fallback_fen_candidates(book_id, lines, boards)]
        rank_strings = ranks_by.get(book_id)

        print(f"[{idx}/{len(STUBBORN_IDS)}] book {book_id}…", flush=True)
        t0 = time.time()
        hit = search_boards(collect_boards(rank_strings, seeds, False), raw, stored)
        if not hit:
            hit = search_boards(collect_boards(rank_strings, seeds, True), raw, stored)

        if hit:
            fen, moves = hit
            puzzle["fen"] = fen
            puzzle["sideToMove"] = fen.split()[1]
            puzzle["solutionRaw"] = raw
            puzzle["solutionMoves"] = moves
            section["available"] = len(section["puzzles"])
            DATA_PATH.write_text(json.dumps(section, indent=2) + "\n")
            fixed += 1
            report.append({"bookId": book_id, "status": "fixed", "moves": moves, "fen": fen})
            print(f"  FIX {' '.join(moves[:3])} ({time.time()-t0:.0f}s)", flush=True)
            continue

        # Classify best seed board to decide skip vs fail.
        seed = boards.get(book_id) or puzzle["fen"]
        labels = set()
        for turn in ("w", "b"):
            trial = " ".join([seed.split()[0], turn, "-", "-", "0", "1"])
            labels.add(classify_board(trial))

        if "mate_in_3" in labels and "mate_in_2" not in labels:
            skipped_m3.append(book_id)
            report.append({"bookId": book_id, "status": "skip_mate_in_3", "labels": sorted(labels)})
            print(f"  SKIP mate-in-3 candidate ({time.time()-t0:.0f}s)", flush=True)
        else:
            failed.append(book_id)
            report.append({"bookId": book_id, "status": "failed", "labels": sorted(labels)})
            print(f"  FAIL {sorted(labels)} ({time.time()-t0:.0f}s)", flush=True)

    out = ROOT / "data/sections/mate_in_2_stubborn_band_report.json"
    out.write_text(
        json.dumps(
            {
                "fixed": fixed,
                "skipped_mate_in_3": skipped_m3,
                "failed": failed,
                "report": report,
            },
            indent=2,
        )
        + "\n"
    )
    print(
        f"\nDone: fixed {fixed}, skip mate-in-3 {len(skipped_m3)}, failed {len(failed)}",
        flush=True,
    )


if __name__ == "__main__":
    main()
