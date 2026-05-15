import { TROOPS, MAX_BATTLE_ROUNDS } from "./constants.js";
import { createMathRng } from "./rng.js";

/**
 * @param {string} id
 * @returns {import('./constants.js').TroopDef}
 */
export function troopById(id) {
  return TROOPS.find((t) => t.id === id) || TROOPS[0];
}

/**
 * @param {string[]} order
 * @param {() => number} rng
 */
export function buildQueueFromOrder(order, rng = createMathRng()) {
  return order.map((troopId, index) => {
    const troop = troopById(troopId);
    const salt = Math.floor(rng() * 0xffffff);
    return {
      uid: `${troop.id}-${index}-${salt}`,
      type: troop.id,
      hp: troop.defaultHp,
      hasCharged: false,
    };
  });
}

/**
 * @param {{ type: string }} attacker
 * @param {{ type: string }} target
 * @param {'front'|'support'} attackKind
 * @param {Record<string, number>} thresholds
 */
export function thresholdForAttack(attacker, target, attackKind, thresholds) {
  if (attacker.type === "archer") {
    return attackKind === "support"
      ? Number(thresholds.archerSupport)
      : Number(thresholds.archerFront);
  }
  if (attacker.type === "swordsman") {
    if (target.type === "spearmen") return Number(thresholds.swordsmanVsSpearmen);
    return Number(thresholds.swordsmanBase);
  }
  if (attacker.type === "spearmen") {
    if (target.type === "konjanik") return Number(thresholds.spearmenVsKonjanik);
    return Number(thresholds.spearmenBase);
  }
  return Number(thresholds.konjanikBase);
}

function rollD6(rng) {
  return 1 + Math.floor(rng() * 6);
}

function rollD4(rng) {
  return 1 + Math.floor(rng() * 4);
}

/**
 * Plan one round: rolls, hit counts, marks cavalry charged. Does not change HP or remove units.
 */
export function computeRoundResolution({
  leftQueue,
  rightQueue,
  thresholds,
  cavalryChargeEnabled,
  rng,
}) {
  const leftFront = leftQueue[0];
  const leftSupport = leftQueue[1];
  const rightFront = rightQueue[0];
  const rightSupport = rightQueue[1];

  const attacks = [];
  if (leftFront && rightFront) {
    attacks.push({
      side: "left",
      role: "front",
      attackerUid: leftFront.uid,
      attackerType: leftFront.type,
      targetUid: rightFront.uid,
      targetType: rightFront.type,
    });
    attacks.push({
      side: "right",
      role: "front",
      attackerUid: rightFront.uid,
      attackerType: rightFront.type,
      targetUid: leftFront.uid,
      targetType: leftFront.type,
    });
  }
  if (leftSupport && rightFront && leftSupport.type === "archer") {
    attacks.push({
      side: "left",
      role: "support",
      attackerUid: leftSupport.uid,
      attackerType: leftSupport.type,
      targetUid: rightFront.uid,
      targetType: rightFront.type,
    });
  }
  if (rightSupport && leftFront && rightSupport.type === "archer") {
    attacks.push({
      side: "right",
      role: "support",
      attackerUid: rightSupport.uid,
      attackerType: rightSupport.type,
      targetUid: leftFront.uid,
      targetType: leftFront.type,
    });
  }

  const attacksWithRolls = attacks
    .map((attack) => {
      const attackerSideQueue = attack.side === "left" ? leftQueue : rightQueue;
      const attackerUnit = attackerSideQueue.find((u) => u.uid === attack.attackerUid);
      const targetUnit = (attack.side === "left" ? rightQueue : leftQueue).find(
        (u) => u.uid === attack.targetUid,
      );
      if (!attackerUnit || !targetUnit) return null;

      const threshold = thresholdForAttack(attackerUnit, targetUnit, attack.role, thresholds);
      const isCavalryCharge =
        cavalryChargeEnabled && attackerUnit.type === "konjanik" && !attackerUnit.hasCharged;

      if (isCavalryCharge) {
        const adjustedThreshold = Math.max(2, Math.min(4, Math.ceil((threshold * 4) / 6)));
        const rolls = [rollD4(rng), rollD4(rng)];
        const hitCount = rolls.filter((r) => r <= adjustedThreshold).length;
        attackerUnit.hasCharged = true;
        return {
          ...attack,
          threshold,
          rolls,
          hitCount,
          charge: true,
          chargeThreshold: adjustedThreshold,
        };
      }

      const roll = rollD6(rng);
      const hitCount = roll <= threshold ? 1 : 0;
      return {
        ...attack,
        threshold,
        rolls: [roll],
        hitCount,
        charge: false,
      };
    })
    .filter(Boolean);

  const pendingDamage = {};
  attacksWithRolls.forEach((attack) => {
    if (!attack.hitCount) return;
    pendingDamage[attack.targetUid] = (pendingDamage[attack.targetUid] || 0) + attack.hitCount;
  });

  return {
    attacksWithRolls,
    pendingDamage,
    leftFrontUid: leftFront?.uid,
    rightFrontUid: rightFront?.uid,
  };
}

export function applyRoundDamage(leftQueue, rightQueue, pendingDamage) {
  leftQueue.forEach((unit) => {
    unit.hp -= pendingDamage[unit.uid] || 0;
  });
  rightQueue.forEach((unit) => {
    unit.hp -= pendingDamage[unit.uid] || 0;
  });

  const aliveLeft = leftQueue.filter((unit) => unit.hp > 0);
  const aliveRight = rightQueue.filter((unit) => unit.hp > 0);
  leftQueue.length = 0;
  rightQueue.length = 0;
  leftQueue.push(...aliveLeft);
  rightQueue.push(...aliveRight);
}

export function formatRoundLogLine(round, attacksWithRolls, leftAliveCount, rightAliveCount, labelFor) {
  const roundDetails = attacksWithRolls
    .map((a) => {
      const attacker = labelFor(a.attackerType);
      const target = labelFor(a.targetType);
      const rollPart = a.charge
        ? `charge 2d4 [${a.rolls.join(",")}], hit<=${a.chargeThreshold} (${a.hitCount} hit)`
        : `1d6 ${a.rolls[0]}, hit<=${a.threshold} (${a.hitCount ? "hit" : "miss"})`;
      return `${a.side.toUpperCase()} ${a.role}: ${attacker} -> ${target}, ${rollPart}`;
    })
    .join(" | ");

  return `R${round}: ${roundDetails} | Units alive L:${leftAliveCount} R:${rightAliveCount}`;
}

export function runBattleSummary({
  leftOrder,
  rightOrder,
  hpByType,
  thresholds,
  cavalryChargeEnabled,
  rng = createMathRng(),
  maxRounds = MAX_BATTLE_ROUNDS,
}) {
  const leftQueue = buildQueueFromOrder(leftOrder, rng);
  const rightQueue = buildQueueFromOrder(rightOrder, rng);

  leftQueue.forEach((unit) => {
    unit.hp = Math.max(1, Number(hpByType[unit.type]) || 1);
  });
  rightQueue.forEach((unit) => {
    unit.hp = Math.max(1, Number(hpByType[unit.type]) || 1);
  });

  let rounds = 0;
  let exhausted = false;

  while (leftQueue.length > 0 && rightQueue.length > 0 && rounds < maxRounds) {
    rounds += 1;
    const { pendingDamage } = computeRoundResolution({
      leftQueue,
      rightQueue,
      thresholds,
      cavalryChargeEnabled,
      rng,
    });
    applyRoundDamage(leftQueue, rightQueue, pendingDamage);
  }

  if (leftQueue.length > 0 && rightQueue.length > 0) {
    exhausted = true;
  }

  const winner =
    leftQueue.length > rightQueue.length
      ? "left"
      : rightQueue.length > leftQueue.length
        ? "right"
        : "draw";

  return {
    winner,
    rounds,
    leftAlive: leftQueue.length,
    rightAlive: rightQueue.length,
    exhausted,
  };
}

export { MAX_BATTLE_ROUNDS } from "./constants.js";
