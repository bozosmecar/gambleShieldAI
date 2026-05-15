import { describe, it, expect } from "vitest";
import { runBattleSummary, buildQueueFromOrder, computeRoundResolution, applyRoundDamage } from "./engine.js";
import { createSeededRng, createMathRng } from "./rng.js";
import { DEFAULT_THRESHOLDS } from "./constants.js";

const defaultHp = {
  archer: 1,
  spearmen: 2,
  konjanik: 3,
  swordsman: 2,
};

describe("runBattleSummary", () => {
  it("same seed + same orders => identical outcome", () => {
    const left = ["archer", "spearmen", "konjanik"];
    const right = ["archer", "archer", "spearmen"];
    const seed = 42_424_242;
    const a = runBattleSummary({
      leftOrder: left,
      rightOrder: right,
      hpByType: defaultHp,
      thresholds: DEFAULT_THRESHOLDS,
      cavalryChargeEnabled: true,
      rng: createSeededRng(seed),
    });
    const b = runBattleSummary({
      leftOrder: left,
      rightOrder: right,
      hpByType: defaultHp,
      thresholds: DEFAULT_THRESHOLDS,
      cavalryChargeEnabled: true,
      rng: createSeededRng(seed),
    });
    expect(a).toEqual(b);
  });

  it("finishes with a winner or draw for tiny armies", () => {
    const r = runBattleSummary({
      leftOrder: ["archer"],
      rightOrder: ["archer"],
      hpByType: defaultHp,
      thresholds: DEFAULT_THRESHOLDS,
      cavalryChargeEnabled: false,
      rng: createMathRng(),
    });
    expect(["left", "right", "draw"]).toContain(r.winner);
    expect(r.rounds).toBeGreaterThanOrEqual(1);
    expect(r.exhausted).toBe(false);
  });
});

describe("computeRoundResolution + applyRoundDamage", () => {
  it("applies damage and removes dead units", () => {
    const rng = createSeededRng(99);
    const left = buildQueueFromOrder(["archer"], rng);
    const right = buildQueueFromOrder(["archer"], rng);
    left.forEach((u) => {
      u.hp = 1;
    });
    right.forEach((u) => {
      u.hp = 1;
    });
    const { pendingDamage } = computeRoundResolution({
      leftQueue: left,
      rightQueue: right,
      thresholds: { ...DEFAULT_THRESHOLDS, archerFront: 6 },
      cavalryChargeEnabled: false,
      rng: createSeededRng(1),
    });
    applyRoundDamage(left, right, pendingDamage);
    expect(left.length).toBe(0);
    expect(right.length).toBe(0);
  });
});
