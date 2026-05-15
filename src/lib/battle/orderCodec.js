import { TROOPS } from "./constants.js";

export function countsToOrder(sideCounts) {
  const order = [];
  TROOPS.forEach((troop) => {
    const total = Math.max(0, Math.floor(Number(sideCounts[troop.id]) || 0));
    for (let i = 0; i < total; i++) {
      order.push(troop.id);
    }
  });
  return order;
}

export function orderFromCodeString(value) {
  const normalized = String(value || "")
    .toUpperCase()
    .replace(/[^ASKW]/g, "");
  const map = {
    A: "archer",
    S: "spearmen",
    K: "konjanik",
    W: "swordsman",
  };
  return normalized
    .split("")
    .map((char) => map[char])
    .filter(Boolean);
}
