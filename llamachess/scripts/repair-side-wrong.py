#!/usr/bin/env python3
"""
Aggressive repair for side_wrong mate-in-2 puzzles.

For each flagged puzzle, search:
  1) stored solutionMoves on flipped current FEN
  2) PDF rank ambiguity (presets + deep search) validating stored moves
  3) PDF rank ambiguity validating full book raw line (when complete)
  4) local FEN mutations (candidate_repairs) + orientations

Run:
  python3 scripts/repair-side-wrong.py --from 3507 --to 3706
  python3 scripts/repair-side-wrong.py --all-audit
"""

from __future__ import annotations

import argparse
import itertools
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import chess

ROOT = Path(__file__).resolve().parent.parent
ICHESS = Path.home() / "ichess"
sys.path.insert(0, str(ICHESS))
sys.path.insert(0, str(ICHESS / "llamachess"))
sys.path.insert(0, str(ICHESS / "llamachess" / "scripts"))

from export_mate_in_2 import (  # noqa: E402
    AMBIG_CORE,
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

DATA_PATH = ROOT / "data/sections/mate_in_2.json"
AUDIT_PATH = ROOT / "data/sections/mate_in_2_audit.json"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def flip_turn(fen: str) -> str:
    parts = fen.split()
    parts[1] = "b" if parts[1] == "w" else "w"
    return " ".join(parts)


def replay_moves(fen: str, moves: list[str]) -> list[str] | None:
    if not is_browser_valid_fen(fen):
        return None
    if side_not_to_move_in_check(chess.Board(fen)):
        return None
    try:
        board = chess.Board(fen)
        played: list[str] = []
        for san in moves[:3]:
            clean = san.replace("##", "#")
            board.push_san(clean)
            played.append(clean if not board.is_checkmate() else clean.rstrip("+") + "#")
        return played if board.is_checkmate() else None
    except ValueError:
        return None


def resolve_fen_with_moves(fen: str, moves: list[str]) -> tuple[str, list[str]] | None:
    """Try orientations and side-to-move until stored/book moves replay to mate."""
    if len(moves) < 3:
        return None
    for oriented in fen_orientations(fen):
        for turn in ("w", "b"):
            parts = oriented.split()
            parts[1] = turn
            trial_fen = " ".join(parts)
            replayed = replay_moves(trial_fen, moves)
            if replayed:
                return trial_fen, replayed
    return None


def try_overrides_with_moves(
    rank_strings: list[str],
    moves: list[str],
    overrides: dict[str, str],
) -> tuple[str, list[str]] | None:
    for ordered in (rank_strings, list(reversed(rank_strings))):
        base_fen = ranks_to_fen(ordered, overrides)
        if not base_fen:
            continue
        hit = resolve_fen_with_moves(base_fen, moves)
        if hit:
            return hit
    return None


def ambiguity_search_stored(
    rank_strings: list[str],
    moves: list[str],
    ambig: dict[str, tuple[str, ...]],
) -> tuple[str, list[str]] | None:
    for preset in MATE2_AMBIG_PRESETS:
        hit = try_overrides_with_moves(rank_strings, moves, preset)
        if hit:
            return hit

    chars = sorted(set("".join(rank_strings)) & set(ambig))
    if not chars:
        return None

    choices = {c: ambig[c] for c in chars}
    total = 1
    for c in chars:
        total *= len(choices[c])
        if total > MAX_AMBIG_COMBOS:
            break

    if total <= MAX_AMBIG_COMBOS:
        for combo in itertools.product(*(choices[c] for c in chars)):
            overrides = dict(zip(chars, combo))
            hit = try_overrides_with_moves(rank_strings, moves, overrides)
            if hit:
                return hit
    else:
        base = {"L": "Q"}
        for ch in chars:
            for alt in choices[ch]:
                hit = try_overrides_with_moves(rank_strings, moves, {**base, ch: alt})
                if hit:
                    return hit
        for a, b in itertools.combinations(chars, 2):
            for alt_a in choices[a]:
                for alt_b in choices[b]:
                    hit = try_overrides_with_moves(
                        rank_strings,
                        moves,
                        {**base, a: alt_a, b: alt_b},
                    )
                    if hit:
                        return hit
    return None


def all_mate_in_two_lines(fen: str, required_first: str | None = None) -> list[list[str]]:
    """Enumerate 3-move mate lines; optionally require a specific first SAN."""
    if not is_browser_valid_fen(fen):
        return []
    if side_not_to_move_in_check(chess.Board(fen)):
        return []
    board = chess.Board(fen)
    results: list[list[str]] = []
    for move1 in board.legal_moves:
        san1 = board.san(move1)
        if required_first and san1 != required_first:
            continue
        board1 = board.copy()
        board1.push(move1)
        for move2 in board1.legal_moves:
            board2 = board1.copy()
            board2.push(move2)
            for move3 in board2.legal_moves:
                board3 = board2.copy()
                board3.push(move3)
                if board3.is_checkmate():
                    results.append([san1, board1.san(move2), board2.san(move3)])
    return results


def pick_mate_line(lines: list[list[str]], stored_moves: list[str]) -> list[str] | None:
    if not lines:
        return None
    if len(lines) == 1:
        return lines[0]
    if len(stored_moves) >= 3:
        for line in lines:
            if line == stored_moves[:3]:
                return line
        for line in lines:
            if line[0] == stored_moves[0]:
                return line
    return None


def search_compute_line_from_pdf(
    rank_strings: list[str],
    raw: str,
    stored_moves: list[str],
) -> tuple[str, list[str]] | None:
    """When solutionRaw is truncated, resolve FEN from PDF then derive the mate line."""
    token = extract_first_move_token(raw)
    if not token:
        return None

    presets: list[dict[str, str]] = list(MATE2_AMBIG_PRESETS) + [{}]
    chars = sorted(set("".join(rank_strings)) & set(AMBIG_EXTENDED))
    if chars:
        choices = {c: AMBIG_EXTENDED[c] for c in chars}
        total = 1
        for c in chars:
            total *= len(choices[c])
            if total > MAX_AMBIG_COMBOS:
                break
        if total <= MAX_AMBIG_COMBOS:
            for combo in itertools.product(*(choices[c] for c in chars)):
                presets.append(dict(zip(chars, combo)))

    for preset in presets:
        for ordered in (rank_strings, list(reversed(rank_strings))):
            base_fen = ranks_to_fen(ordered, preset)
            if not base_fen:
                continue
            resolved = resolve_fen_first_move(base_fen, raw)
            if not resolved:
                continue
            trial_fen, _ = resolved
            if not is_browser_valid_fen(trial_fen):
                continue
            if side_not_to_move_in_check(chess.Board(trial_fen)):
                continue
            legal = [chess.Board(trial_fen).san(m) for m in chess.Board(trial_fen).legal_moves]
            first = match_first_move(legal, token)
            lines = all_mate_in_two_lines(trial_fen, first)
            picked = pick_mate_line(lines, stored_moves)
            if picked:
                return trial_fen, picked
    return None


def search_pdf_fen(
    rank_strings: list[str] | None,
    raw: str,
    stored_moves: list[str],
) -> tuple[str, list[str]] | None:
    if not rank_strings:
        return None

    if len(stored_moves) >= 3:
        for fn in (
            lambda: ambiguity_search_stored(rank_strings, stored_moves, AMBIG_CORE),
            lambda: ambiguity_search_stored(rank_strings, stored_moves, AMBIG_EXTENDED),
        ):
            hit = fn()
            if hit:
                return hit

    tokens = parse_mate2_main_line(raw)
    if len(tokens) >= 3:
        for preset in MATE2_AMBIG_PRESETS:
            for ordered in (rank_strings, list(reversed(rank_strings))):
                base_fen = ranks_to_fen(ordered, preset)
                if not base_fen:
                    continue
                for oriented in fen_orientations(base_fen):
                    for turn in ("w", "b"):
                        parts = oriented.split()
                        parts[1] = turn
                        trial_fen = " ".join(parts)
                        line = derive_solution_moves(trial_fen, raw)
                        if line:
                            return trial_fen, line
    return None


def search_local_fen(
    fen: str,
    stored_moves: list[str],
    raw: str,
) -> tuple[str, list[str]] | None:
    candidates = [fen, flip_turn(fen)]
    for base in list(candidates):
        candidates.extend(candidate_repairs(base)[:80])

    seen: set[str] = set()
    for cand in candidates:
        key = cand.split()[0]
        if key in seen:
            continue
        seen.add(key)

        if len(stored_moves) >= 3:
            hit = resolve_fen_with_moves(cand, stored_moves)
            if hit:
                return hit

        line = derive_solution_moves(cand, raw)
        if line and not side_not_to_move_in_check(chess.Board(cand)):
            return cand, line

        flipped = flip_turn(cand)
        if len(stored_moves) >= 3:
            hit = resolve_fen_with_moves(flipped, stored_moves)
            if hit:
                return hit
        line = derive_solution_moves(flipped, raw)
        if line:
            return flipped, line
    return None


def repair_one(
    puzzle: dict,
    raw: str,
    rank_strings: list[str] | None,
    fallback_fens: list[str],
) -> tuple[str, list[str]] | None:
    stored = puzzle.get("solutionMoves") or []

    # Same FEN, flipped turn (cheap win).
    if len(stored) >= 3:
        hit = resolve_fen_with_moves(flip_turn(puzzle["fen"]), stored)
        if hit:
            return hit

    hit = search_pdf_fen(rank_strings, raw, stored)
    if hit:
        return hit

    hit = search_compute_line_from_pdf(rank_strings, raw, stored)
    if hit:
        return hit

    hit = search_local_fen(puzzle["fen"], stored, raw)
    if hit:
        return hit

    for fallback in fallback_fens:
        if len(stored) >= 3:
            hit = resolve_fen_with_moves(fallback, stored)
            if hit:
                return hit
        line = derive_solution_moves(fallback, raw)
        if line and not side_not_to_move_in_check(chess.Board(fallback)):
            return fallback, line

    return None


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--from", dest="from_id", type=int, default=3507)
    parser.add_argument("--to", dest="to_id", type=int, default=3706)
    parser.add_argument(
        "--all-audit",
        action="store_true",
        help="Repair every puzzle flagged side_wrong in mate_in_2_audit.json",
    )
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    section = json.loads(DATA_PATH.read_text())
    by_book = {int(p["bookId"]): p for p in section["puzzles"]}

    target_ids: set[int] = set()
    if args.all_audit and AUDIT_PATH.exists():
        audit = json.loads(AUDIT_PATH.read_text())
        target_ids = {
            int(item["bookId"])
            for item in audit.get("puzzles", [])
            if item.get("status") == "side_wrong"
        }
    else:
        target_ids = {bid for bid in by_book if args.from_id <= bid <= args.to_id}

    existing_raw = {bid: p.get("solutionRaw", "") for bid, p in by_book.items()}
    lines = extract_text_from_pdf(SRC_PDF)
    book_solutions = parse_mate2_solutions(lines)
    boards = parse_puzzles(lines)
    rank_strings_by_num = extract_spatial_rank_strings(SRC_PDF)

    fixed = 0
    failed = 0
    reports: list[str] = []

    for book_id in sorted(target_ids):
        puzzle = by_book[book_id]
        if not side_not_to_move_in_check(chess.Board(puzzle["fen"])):
            continue

        raw = pick_solution_raw(book_id, book_solutions.get(book_id), existing_raw)
        fallback = fallback_fen_candidates(book_id, lines, boards)
        hit = repair_one(puzzle, raw, rank_strings_by_num.get(book_id), fallback)

        if not hit:
            failed += 1
            reports.append(f"FAIL book {book_id} (#{puzzle['id']})")
            continue

        fen, moves = hit
        if not is_browser_valid_fen(fen):
            failed += 1
            reports.append(f"FAIL book {book_id} (#{puzzle['id']}) bad_fen")
            continue

        if not args.dry_run:
            puzzle["fen"] = fen
            puzzle["sideToMove"] = fen.split()[1]
            puzzle["solutionRaw"] = raw
            puzzle["solutionMoves"] = moves
        fixed += 1
        reports.append(
            f"FIX  book {book_id} (#{puzzle['id']})  {' '.join(moves[:3])}"
        )

    if not args.dry_run and fixed:
        section["available"] = len(section["puzzles"])
        DATA_PATH.write_text(json.dumps(section, indent=2) + "\n")

    label = (
        f"all side_wrong ({len(target_ids)})"
        if args.all_audit
        else f"{args.from_id}-{args.to_id}"
    )
    print(f"Aggressive side_wrong repair: {label}")
    print(f"  fixed: {fixed}")
    print(f"  failed: {failed}")
    for line in reports[:25]:
        print(f"  {line}")
    if len(reports) > 25:
        print(f"  ... and {len(reports) - 25} more")
    if args.dry_run:
        print("  (dry run — no files written)")


if __name__ == "__main__":
    main()
