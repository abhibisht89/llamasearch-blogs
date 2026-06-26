/**
 * Build repertoire line objects from raw move arrays + course meta.
 */
export function mkLine(num, topicId, title, subtitle, intro, moves, comments, tags = []) {
  return {
    lineNumber: num,
    topicId,
    title,
    subtitle,
    intro,
    moves,
    comments: comments?.length ? comments : autoComments(moves),
    tags,
  };
}

export function autoComments(moves) {
  return moves.map((san, i) => {
    const isWhite = i % 2 === 0;
    if (isWhite) return `Play ${san} — this is your move in the line.`;
    return `Black plays ${san}. Know your reply.`;
  });
}

/** Pad or trim line list to exact catalog count. */
export function fitLineCount(lines, target, prefix, maker) {
  const out = [...lines];
  let n = out.length;
  while (n < target) {
    n += 1;
    const base = out[(n - 1) % out.length];
    out.push(
      maker(n, {
        ...base,
        topicId: `${base.topicId}_${n}`,
        title: `${base.title} (Alt ${n})`,
        subtitle: `Line #${n}`,
        lineNumber: n,
      })
    );
  }
  return out.slice(0, target);
}

export function lineFromMoves(num, slug, title, moves, intro, tags = []) {
  return mkLine(
    num,
    `${slug}_line_${num}`,
    title,
    `Line #${num}`,
    intro,
    moves,
    autoComments(moves),
    tags
  );
}
