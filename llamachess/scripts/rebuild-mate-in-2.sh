#!/usr/bin/env bash
# Repair mate-in-2 puzzles from the Polgar PDF + existing JSON, then audit.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FROM_ID="${1:-307}"
TO_ID="${2:-3718}"

echo "==> Repairing mate-in-2 book ids ${FROM_ID}-${TO_ID}..."
python3 "$ROOT/scripts/repair-mate-in-2.py" --from "$FROM_ID" --to "$TO_ID"

echo "==> Auditing puzzles..."
node "$ROOT/scripts/audit-mate-in-2.mjs"

echo "Done."
