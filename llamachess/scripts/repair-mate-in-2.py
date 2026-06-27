#!/usr/bin/env python3
"""
Repair mate-in-2 puzzles: derive full 3-move lines from solutionRaw,
re-resolve FEN from PDF only when the new board validates the book line.

Run:
  python3 scripts/repair-mate-in-2.py
  python3 scripts/repair-mate-in-2.py --from 307 --to 406
"""

from __future__ import annotations

import argparse
import json
import sys
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path

import chess

ROOT = Path(__file__).resolve().parent.parent
ICHESS = Path.home() / "ichess"
sys.path.insert(0, str(ICHESS))
sys.path.insert(0, str(ICHESS / "llamachess"))

from export_mate_in_2 import (  # noqa: E402
    MATE_IN_2_END,
    MATE_IN_2_START,
    derive_solution_moves,
    extract_spatial_rank_strings,
    parse_mate2_main_line,
    pick_solution_raw,
    parse_mate2_solutions,
    resolve_puzzle_from_ranks,
    side_not_to_move_in_check,
)
from export_puzzles import fallback_fen_candidates, is_browser_valid_fen  # noqa: E402
from polgar_puzzle_books import SRC_PDF, extract_text_from_pdf, parse_puzzles  # noqa: E402

DATA_PATH = ROOT / "data/sections/mate_in_2.json"
STATUS_PATH = ROOT / "data/sections/mate_in_2_repair_status.json"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def puzzle_in_range(puzzle: dict, start: int, end: int) -> bool:
    book_id = int(puzzle["bookId"])
    return start <= book_id <= end


def flip_turn(fen: str) -> str:
    parts = fen.split()
    parts[1] = "b" if parts[1] == "w" else "w"
    return " ".join(parts)


def existing_line_valid(puzzle: dict) -> list[str] | None:
    """True when stored solutionMoves already replay to mate on the stored FEN."""
    moves = puzzle.get("solutionMoves") or []
    if len(moves) < 3:
        return None
    if not is_browser_valid_fen(puzzle["fen"]):
        return None
    if side_not_to_move_in_check(chess.Board(puzzle["fen"])):
        return None
    try:
        board = chess.Board(puzzle["fen"])
        played: list[str] = []
        for san in moves[:3]:
            clean = san.replace("##", "#")
            board.push_san(clean)
            played.append(clean if not board.is_checkmate() else clean.rstrip("+") + "#")
        return played if board.is_checkmate() else None
    except ValueError:
        return None


def try_full_line(fen: str, raw: str) -> list[str] | None:
    if not is_browser_valid_fen(fen):
        return None
    if side_not_to_move_in_check(chess.Board(fen)):
        return None
    return derive_solution_moves(fen, raw)


def try_stored_line_on_fen(puzzle: dict, fen: str) -> list[str] | None:
    trial = {**puzzle, "fen": fen}
    return existing_line_valid(trial)


def repair_puzzle(
    puzzle: dict,
    raw: str,
    rank_strings: list[str] | None,
    fallback_fens: list[str],
) -> tuple[dict, str, str]:
    """
    Return (updated_puzzle, status, detail).
    status: ok | fen_fixed | line_fixed | needs_manual
    """
    updated = deepcopy(puzzle)
    updated["solutionRaw"] = raw

    stored_line = existing_line_valid(updated)
    if stored_line:
        updated["solutionMoves"] = stored_line
        updated["sideToMove"] = updated["fen"].split()[1]
        return updated, "ok", "stored_line_valid"

    # Side-to-move corruption: try the same moves on flipped turn.
    if side_not_to_move_in_check(chess.Board(updated["fen"])):
        flipped_fen = flip_turn(updated["fen"])
        flipped_stored = try_stored_line_on_fen(puzzle, flipped_fen)
        if flipped_stored:
            updated["fen"] = flipped_fen
            updated["solutionMoves"] = flipped_stored
            updated["sideToMove"] = flipped_fen.split()[1]
            return updated, "side_fixed", "flipped_turn_stored_line"

    current_line = try_full_line(updated["fen"], raw)
    if current_line:
        updated["solutionMoves"] = current_line
        updated["sideToMove"] = updated["fen"].split()[1]
        if puzzle.get("solutionMoves") == current_line and puzzle.get("fen") == updated["fen"]:
            return updated, "ok", "already_valid"
        if len(puzzle.get("solutionMoves") or []) >= 3 and puzzle.get("solutionMoves") != current_line:
            return updated, "line_fixed", "normalized_book_line"
        return updated, "ok" if puzzle.get("solutionMoves") == current_line else "line_fixed", "current_fen_valid"

    # Common OCR issue: side to move is flipped while the diagram is otherwise right.
    flipped_fen = flip_turn(updated["fen"])
    flipped_line = try_full_line(flipped_fen, raw)
    if flipped_line:
        updated["fen"] = flipped_fen
        updated["solutionMoves"] = flipped_line
        updated["sideToMove"] = flipped_fen.split()[1]
        return updated, "side_fixed", "flipped_side_to_move"

    resolved = resolve_puzzle_from_ranks(
        int(updated["bookId"]),
        rank_strings,
        raw,
        fallback_fens,
    )
    if resolved:
        candidate_fen = resolved["fen"]
        candidate_line = try_full_line(candidate_fen, raw)
        if not candidate_line:
            candidate_line = try_stored_line_on_fen(puzzle, candidate_fen)
        if candidate_line:
            updated["fen"] = candidate_fen
            updated["solutionMoves"] = candidate_line
            updated["sideToMove"] = candidate_fen.split()[1]
            return updated, "fen_fixed", "pdf_fen_matches_book_line"

    tokens = parse_mate2_main_line(raw)
    if len(tokens) < 3:
        return updated, "needs_manual", "incomplete_solution_raw"

    return updated, "needs_manual", "no_valid_fen_for_book_line"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--from", dest="from_id", type=int, default=MATE_IN_2_START)
    parser.add_argument("--to", dest="to_id", type=int, default=MATE_IN_2_END)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--side-wrong-only",
        action="store_true",
        help="Only repair puzzles flagged side_wrong in mate_in_2_audit.json",
    )
    args = parser.parse_args()

    section = json.loads(DATA_PATH.read_text())
    existing_raw = {int(p["bookId"]): p.get("solutionRaw", "") for p in section["puzzles"]}

    side_wrong_ids: set[int] = set()
    audit_path = ROOT / "data/sections/mate_in_2_audit.json"
    if args.side_wrong_only and audit_path.exists():
        audit = json.loads(audit_path.read_text())
        side_wrong_ids = {
            int(item["bookId"])
            for item in audit.get("puzzles", [])
            if item.get("status") == "side_wrong"
        }

    lines = extract_text_from_pdf(SRC_PDF)
    book_solutions = parse_mate2_solutions(lines)
    boards = parse_puzzles(lines)
    rank_strings_by_num = extract_spatial_rank_strings(SRC_PDF)

    summary: dict[str, int] = {}
    by_book_id: dict[str, dict] = {}
    changed = 0

    for puzzle in section["puzzles"]:
        book_id = int(puzzle["bookId"])
        if args.side_wrong_only:
            if book_id not in side_wrong_ids:
                continue
        elif not puzzle_in_range(puzzle, args.from_id, args.to_id):
            continue
        raw = pick_solution_raw(book_id, book_solutions.get(book_id), existing_raw)
        repaired, status, detail = repair_puzzle(
            puzzle,
            raw,
            rank_strings_by_num.get(book_id),
            fallback_fen_candidates(book_id, lines, boards),
        )

        summary[status] = summary.get(status, 0) + 1
        by_book_id[str(book_id)] = {
            "id": puzzle["id"],
            "status": status,
            "detail": detail,
            "fen": repaired["fen"],
            "solutionMoves": repaired.get("solutionMoves"),
        }

        if repaired != puzzle:
            changed += 1
            if not args.dry_run:
                puzzle.update(
                    {
                        "fen": repaired["fen"],
                        "sideToMove": repaired["sideToMove"],
                        "solutionRaw": repaired["solutionRaw"],
                        "solutionMoves": repaired["solutionMoves"],
                    }
                )

    if not args.dry_run:
        section["available"] = len(section["puzzles"])
        DATA_PATH.write_text(json.dumps(section, indent=2) + "\n")

        status_payload = {
            "sectionId": "mate_in_2",
            "generatedAt": utc_now(),
            "bookRange": [args.from_id, args.to_id],
            "summary": summary,
            "byBookId": by_book_id,
        }
        if STATUS_PATH.exists():
            existing = json.loads(STATUS_PATH.read_text())
            existing.setdefault("byBookId", {}).update(by_book_id)
            existing["summary"] = {
                **existing.get("summary", {}),
                **{k: existing.get("summary", {}).get(k, 0) + v for k, v in summary.items()},
            }
            existing["generatedAt"] = utc_now()
            STATUS_PATH.write_text(json.dumps(existing, indent=2) + "\n")
        else:
            STATUS_PATH.write_text(json.dumps(status_payload, indent=2) + "\n")

    label = (
        f"side_wrong ({len(side_wrong_ids)} ids)"
        if args.side_wrong_only
        else f"{args.from_id}-{args.to_id}"
    )
    print(f"Repair batch {label}")
    print(f"  changed: {changed}")
    for key, count in sorted(summary.items()):
        print(f"  {key}: {count}")
    if args.dry_run:
        print("  (dry run — no files written)")


if __name__ == "__main__":
    main()
