/**
 * Dice flip animation frames; uses rng so seeded fights get consistent flicker.
 * @param {number} maxFace
 * @param {() => number} rng
 * @returns {number[]}
 */
export function rollSequence(maxFace = 6, rng = Math.random) {
  const cap = Math.max(2, Math.min(6, maxFace));
  const diceFaces = [1, 2, 3, 4, 5, 6].slice(0, cap);
  const picks = [];
  let last = -1;
  for (let i = 0; i < 12; i++) {
    let next;
    let guard = 0;
    do {
      next = diceFaces[Math.floor(rng() * diceFaces.length)];
      guard += 1;
      if (guard > 20) break;
    } while (next === last);
    picks.push(next);
    last = next;
  }
  return picks;
}
