#!/usr/bin/env bash
# Repair mate-in-2 in book-id batches, audit after each batch, print a summary line.
# Usage: ./scripts/repair-mate-in-2-batches.sh [start_book_id] [end_book_id] [batch_size]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
START="${1:-807}"
END="${2:-3718}"
SIZE="${3:-100}"

echo "Mate-in-2 batch repair: book ids ${START}-${END} (size ${SIZE})"
echo "============================================================"

for ((from = START; from <= END; from += SIZE)); do
  to=$((from + SIZE - 1))
  if ((to > END)); then to=$END; fi

  echo ""
  echo "--- Batch book ${from}-${to} ---"
  python3 "$ROOT/scripts/repair-mate-in-2.py" --from "$from" --to "$to"

  pass=$(node "$ROOT/scripts/validate-mate-in-2.mjs" "$from" "$to" 2>&1 | rg -o '[0-9]+/[0-9]+ passed' || true)
  node "$ROOT/scripts/audit-mate-in-2.mjs" >/dev/null
  audit=$(node -e "
    const a=require('$ROOT/data/sections/mate_in_2_audit.json');
    console.log('verified='+a.summary.ok+', side_wrong='+ (a.summary.side_wrong||0));
  ")

  echo "BATCH REPORT ${from}-${to}: ${pass:-validate failed} | ${audit}"
done

echo ""
echo "==> Final audit..."
node "$ROOT/scripts/audit-mate-in-2.mjs"
