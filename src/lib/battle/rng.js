/**
 * @returns {() => number} uniform in [0, 1)
 */
export function createMathRng() {
  return () => Math.random();
}

/**
 * Deterministic RNG for tests / reproducible sims (mulberry32).
 * @param {number} seed
 * @returns {() => number}
 */
export function createSeededRng(seed) {
  let t = seed >>> 0;
  return function next() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
