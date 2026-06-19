// Find the next unplayed hole after a hole was just completed.
// `holes`: array of hole numbers (positional order). `completedHoles`: hole numbers already scored.
// `fromIndex`: index in `holes` of the hole just completed.
// Returns { index, wrapped } for the target hole, or null when all holes are played.
// Forward search (fromIndex+1..end) means no wrap; if nothing forward, wrap to the
// earliest unplayed hole (0..fromIndex) and flag wrapped=true.
export function findNextUnplayedHole(holes, completedHoles, fromIndex) {
  const played = new Set(completedHoles);
  for (let i = fromIndex + 1; i < holes.length; i++) {
    if (!played.has(holes[i])) return { index: i, wrapped: false };
  }
  for (let i = 0; i <= fromIndex; i++) {
    if (!played.has(holes[i])) return { index: i, wrapped: true };
  }
  return null;
}
