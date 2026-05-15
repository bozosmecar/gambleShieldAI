/** @typedef {{ id: string, label: string, image: string, defaultHp: number }} TroopDef */

/** @type {TroopDef[]} */
export const TROOPS = [
  {
    id: "archer",
    label: "Archer",
    image: "/characters/archer.png",
    defaultHp: 1,
  },
  {
    id: "spearmen",
    label: "Spearmen",
    image: "/characters/spearman.png",
    defaultHp: 2,
  },
  {
    id: "konjanik",
    label: "Konjanik",
    image: "/characters/cavalry.png",
    defaultHp: 3,
  },
  {
    id: "swordsman",
    label: "Warrior",
    image: "/characters/warrior.png",
    defaultHp: 2,
  },
];

export const DEFAULT_COUNTS = {
  left: { archer: 5, spearmen: 3, konjanik: 2, swordsman: 4 },
  right: { archer: 4, spearmen: 4, konjanik: 2, swordsman: 4 },
};

export const DEFAULT_THRESHOLDS = {
  archerFront: 3,
  archerSupport: 2,
  swordsmanBase: 3,
  swordsmanVsSpearmen: 4,
  spearmenBase: 3,
  spearmenVsKonjanik: 4,
  konjanikBase: 4,
};

/** Hard cap so pathological configs cannot infinite-loop the UI. */
export const MAX_BATTLE_ROUNDS = 2000;
