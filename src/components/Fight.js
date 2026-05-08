"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

const TROOPS = [
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

const DEFAULT_COUNTS = {
  left: { archer: 5, spearmen: 3, konjanik: 2, swordsman: 4 },
  right: { archer: 4, spearmen: 4, konjanik: 2, swordsman: 4 },
};

const DEFAULT_THRESHOLDS = {
  archerFront: 3,
  archerSupport: 2,
  swordsmanBase: 3,
  swordsmanVsSpearmen: 4,
  spearmenBase: 3,
  spearmenVsKonjanik: 4,
  konjanikBase: 4,
};

function countsToOrder(sideCounts) {
  const order = [];
  TROOPS.forEach((troop) => {
    const total = Math.max(0, Math.floor(Number(sideCounts[troop.id]) || 0));
    for (let i = 0; i < total; i++) {
      order.push(troop.id);
    }
  });
  return order;
}

function buildQueueFromOrder(order) {
  let unitIndex = 0;
  return order.map((troopId) => {
    const troop = troopById(troopId);
    unitIndex += 1;
    return {
      uid: `${troop.id}-${unitIndex}-${Math.random().toString(36).slice(2, 8)}`,
      type: troop.id,
      hp: troop.defaultHp,
      hasCharged: false,
    };
  });
}

function rollSequence(maxFace = 6) {
  const diceFaces = [1, 2, 3, 4, 5, 6].slice(0, Math.max(2, Math.min(6, maxFace)));
  const picks = [];
  let last = -1;
  for (let i = 0; i < 12; i++) {
    let next;
    do {
      next = diceFaces[Math.floor(Math.random() * diceFaces.length)];
    } while (next === last);
    picks.push(next);
    last = next;
  }
  return picks;
}

function troopById(id) {
  return TROOPS.find((t) => t.id === id) || TROOPS[0];
}

function troopInitial(id) {
  return troopById(id).label.charAt(0).toUpperCase();
}

function orderFromCodeString(value) {
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

function simulateBattleInstant({
  leftOrder,
  rightOrder,
  hpByType,
  thresholds,
  cavalryChargeEnabled,
}) {
  const leftQueue = buildQueueFromOrder(leftOrder);
  const rightQueue = buildQueueFromOrder(rightOrder);

  leftQueue.forEach((unit) => {
    unit.hp = Math.max(1, Number(hpByType[unit.type]) || 1);
  });
  rightQueue.forEach((unit) => {
    unit.hp = Math.max(1, Number(hpByType[unit.type]) || 1);
  });

  let rounds = 0;
  while (leftQueue.length > 0 && rightQueue.length > 0 && rounds < 2000) {
    rounds += 1;
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

    const pendingDamage = {};
    attacks.forEach((attack) => {
      const attackerSideQueue = attack.side === "left" ? leftQueue : rightQueue;
      const attackerUnit = attackerSideQueue.find((u) => u.uid === attack.attackerUid);
      const targetUnit = (attack.side === "left" ? rightQueue : leftQueue).find(
        (u) => u.uid === attack.targetUid,
      );
      if (!attackerUnit || !targetUnit) return;

      const threshold = thresholdForAttack(attackerUnit, targetUnit, attack.role, thresholds);
      const isCavalryCharge =
        cavalryChargeEnabled && attackerUnit.type === "konjanik" && !attackerUnit.hasCharged;

      if (isCavalryCharge) {
        const adjustedThreshold = Math.max(2, Math.min(4, Math.ceil((threshold * 4) / 6)));
        const rolls = [1 + Math.floor(Math.random() * 4), 1 + Math.floor(Math.random() * 4)];
        const hitCount = rolls.filter((r) => r <= adjustedThreshold).length;
        if (hitCount > 0) {
          pendingDamage[attack.targetUid] = (pendingDamage[attack.targetUid] || 0) + hitCount;
        }
        attackerUnit.hasCharged = true;
        return;
      }

      const roll = 1 + Math.floor(Math.random() * 6);
      if (roll <= threshold) {
        pendingDamage[attack.targetUid] = (pendingDamage[attack.targetUid] || 0) + 1;
      }
    });

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
  };
}

function thresholdForAttack(attacker, target, attackKind, thresholds) {
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

export default function Fight() {
  const [leftDraftOrder, setLeftDraftOrder] = useState(countsToOrder(DEFAULT_COUNTS.left));
  const [rightDraftOrder, setRightDraftOrder] = useState(countsToOrder(DEFAULT_COUNTS.right));
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);
  const [hpByType, setHpByType] = useState(
    TROOPS.reduce((acc, troop) => {
      acc[troop.id] = troop.defaultHp;
      return acc;
    }, {}),
  );
  const [roundPauseMs, setRoundPauseMs] = useState(700);
  const [cavalryChargeEnabled, setCavalryChargeEnabled] = useState(true);

  const [rolling, setRolling] = useState(false);
  const [dicePop, setDicePop] = useState(false);
  const [leftDiceImage, setLeftDiceImage] = useState("/1_Home page/dices/dice5.png");
  const [rightDiceImage, setRightDiceImage] = useState("/1_Home page/dices/dice5.png");

  const [lastRound, setLastRound] = useState(null);
  const [log, setLog] = useState([]);
  const [result, setResult] = useState("");
  const [alive, setAlive] = useState({ left: 0, right: 0 });
  const [lineups, setLineups] = useState({ left: [], right: [] });
  const [leftQuickInput, setLeftQuickInput] = useState("AAAKKKWWAAWKAKAK");
  const [rightQuickInput, setRightQuickInput] = useState("AAAKKKWWSAKWAK");
  const [quickResult, setQuickResult] = useState("");

  const totalConfigured = useMemo(() => {
    const left = leftDraftOrder.length;
    const right = rightDraftOrder.length;
    return { left, right };
  }, [leftDraftOrder, rightDraftOrder]);

  const draftCounts = useMemo(() => {
    const base = { archer: 0, spearmen: 0, konjanik: 0, swordsman: 0 };
    leftDraftOrder.forEach((id) => {
      base[id] = (base[id] || 0) + 1;
    });
    const left = { ...base };
    const right = { archer: 0, spearmen: 0, konjanik: 0, swordsman: 0 };
    rightDraftOrder.forEach((id) => {
      right[id] = (right[id] || 0) + 1;
    });
    return { left, right };
  }, [leftDraftOrder, rightDraftOrder]);

  const applyRollAnimation = (setDiceImage, finalRoll, maxFace = 6) =>
    new Promise((resolve) => {
      const picks = rollSequence(maxFace);
      let index = 0;
      const showNext = () => {
        if (index >= picks.length) {
          setDiceImage(`/1_Home page/dices/dice${finalRoll}.png`);
          resolve();
          return;
        }
        setDiceImage(`/1_Home page/dices/dice${picks[index]}.png`);
        index += 1;
        const delay = index <= 9 ? 65 : 130;
        setTimeout(showNext, delay);
      };
      showNext();
    });

  const fight = async () => {
    if (rolling) return;

    const leftQueue = buildQueueFromOrder(leftDraftOrder);
    const rightQueue = buildQueueFromOrder(rightDraftOrder);
    leftQueue.forEach((unit) => {
      unit.hp = Math.max(1, Number(hpByType[unit.type]) || 1);
    });
    rightQueue.forEach((unit) => {
      unit.hp = Math.max(1, Number(hpByType[unit.type]) || 1);
    });

    if (!leftQueue.length || !rightQueue.length) {
      setResult("Both sides need at least 1 troop.");
      return;
    }

    setRolling(true);
    setResult("");
    setLastRound(null);
    setLog([]);
    setAlive({ left: leftQueue.length, right: rightQueue.length });
    setLineups({
      left: leftQueue.map((u) => ({ uid: u.uid, type: u.type, hp: u.hp })),
      right: rightQueue.map((u) => ({ uid: u.uid, type: u.type, hp: u.hp })),
    });

    let round = 1;
    const roundLines = [];

    while (leftQueue.length > 0 && rightQueue.length > 0) {
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

      const attacksWithRolls = attacks.map((attack) => {
        const attackerSideQueue = attack.side === "left" ? leftQueue : rightQueue;
        const attackerUnit = attackerSideQueue.find((u) => u.uid === attack.attackerUid);
        const targetUnit = (attack.side === "left" ? rightQueue : leftQueue).find(
          (u) => u.uid === attack.targetUid,
        );
        if (!attackerUnit || !targetUnit) return null;

        const threshold = thresholdForAttack(attackerUnit, targetUnit, attack.role, thresholds);
        const isCavalryCharge =
          cavalryChargeEnabled &&
          attackerUnit.type === "konjanik" &&
          !attackerUnit.hasCharged;

        let rolls = [];
        let hitCount = 0;
        if (isCavalryCharge) {
          const adjustedThreshold = Math.max(2, Math.min(4, Math.ceil((threshold * 4) / 6)));
          rolls = [
            1 + Math.floor(Math.random() * 4),
            1 + Math.floor(Math.random() * 4),
          ];
          hitCount = rolls.filter((r) => r <= adjustedThreshold).length;
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

        const roll = 1 + Math.floor(Math.random() * 6);
        rolls = [roll];
        hitCount = roll <= threshold ? 1 : 0;
        return {
          ...attack,
          threshold,
          rolls,
          hitCount,
          charge: false,
        };
      }).filter(Boolean);

      const leftMainAttack = attacksWithRolls.find((a) => a.side === "left" && a.role === "front");
      const rightMainAttack = attacksWithRolls.find((a) => a.side === "right" && a.role === "front");

      await Promise.all([
        applyRollAnimation(
          setLeftDiceImage,
          leftMainAttack ? Math.max(1, Math.min(6, leftMainAttack.rolls[0])) : 1,
          leftMainAttack?.charge ? 4 : 6,
        ),
        applyRollAnimation(
          setRightDiceImage,
          rightMainAttack ? Math.max(1, Math.min(6, rightMainAttack.rolls[0])) : 1,
          rightMainAttack?.charge ? 4 : 6,
        ),
      ]);

      const pendingDamage = {};
      attacksWithRolls.forEach((attack) => {
        if (!attack.hitCount) return;
        pendingDamage[attack.targetUid] = (pendingDamage[attack.targetUid] || 0) + attack.hitCount;
      });

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

      setDicePop(true);
      setTimeout(() => setDicePop(false), 200);

      const roundDetails = attacksWithRolls
        .map((a) => {
          const attacker = troopById(a.attackerType).label;
          const target = troopById(a.targetType).label;
          const rollPart = a.charge
            ? `charge 2d4 [${a.rolls.join(",")}], hit<=${a.chargeThreshold} (${a.hitCount} hit)`
            : `1d6 ${a.rolls[0]}, hit<=${a.threshold} (${a.hitCount ? "hit" : "miss"})`;
          return `${a.side.toUpperCase()} ${a.role}: ${attacker} -> ${target}, ${rollPart}`;
        })
        .join(" | ");

      const line = `R${round}: ${roundDetails} | HP now L:${leftQueue.length} R:${rightQueue.length}`;

      roundLines.unshift(line);
      setLog([...roundLines]);
      setLastRound({
        round,
        leftType: leftQueue[0]?.type || null,
        rightType: rightQueue[0]?.type || null,
        leftRoll: leftMainAttack?.rolls?.[0] || 1,
        rightRoll: rightMainAttack?.rolls?.[0] || 1,
        leftPower: pendingDamage[rightFront?.uid] || 0,
        rightPower: pendingDamage[leftFront?.uid] || 0,
        winner:
          leftQueue.length === rightQueue.length
            ? "tie"
            : leftQueue.length > rightQueue.length
              ? "left"
              : "right",
      });
      setAlive({ left: leftQueue.length, right: rightQueue.length });
      setLineups({
        left: leftQueue.map((u) => ({ uid: u.uid, type: u.type, hp: u.hp })),
        right: rightQueue.map((u) => ({ uid: u.uid, type: u.type, hp: u.hp })),
      });

      round += 1;
      await new Promise((resolve) => setTimeout(resolve, Math.max(150, Number(roundPauseMs) || 700)));
    }

    if (leftQueue.length > 0 && rightQueue.length === 0) {
      setResult(`Left side wins with ${leftQueue.length} troop(s) alive.`);
    } else if (rightQueue.length > 0 && leftQueue.length === 0) {
      setResult(`Right side wins with ${rightQueue.length} troop(s) alive.`);
    } else {
      setResult("Draw. Both sides got eliminated.");
    }

    setRolling(false);
  };

  return (
    <section className="w-full min-h-screen bg-slate-900 text-white py-8 px-4">
      <div className="mx-auto w-full max-w-[1500px] space-y-6">
        <div className="rounded-2xl border border-white/20 bg-black/35 p-6">
          <h2 className="text-lg font-semibold mb-3">Battlefield Line</h2>
          <p className="text-xs text-slate-400 mb-4">
            All units are shown from start. As front units die, the line collapses toward the middle.
          </p>

          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
            <div className="rounded-xl border border-white/10 p-4 min-h-44">
              <p className="text-xs text-slate-400 mb-2">Left side</p>
              <div className="flex flex-row-reverse flex-wrap justify-end gap-3">
                {lineups.left.length === 0 && <span className="text-xs text-slate-500">No units</span>}
                {lineups.left.map((unit, index) => (
                  <div
                    key={unit.uid}
                    className={`rounded-lg border px-2 py-2 ${index <= 1 ? "border-orange-400 bg-orange-500/10" : "border-white/15 bg-white/5"}`}
                    title={`${troopById(unit.type).label} | HP ${unit.hp}`}
                  >
                    <Image
                      src={troopById(unit.type).image}
                      alt={troopById(unit.type).label}
                      width={72}
                      height={72}
                      className="h-16 w-16 md:h-20 md:w-20 object-contain"
                    />
                    <p className="text-xs text-center text-slate-300">HP {unit.hp}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-orange-300/40 bg-orange-500/10 p-4 flex flex-col items-center justify-center gap-2">
              <div className="text-center text-sm font-semibold text-orange-300">BATTLE CENTER</div>
                <div className="flex items-center justify-center gap-3">
                  <div className="rounded-lg border border-orange-300/60 bg-black/30 px-2 py-2">
                    <Image
                      src={lineups.left[0] ? troopById(lineups.left[0].type).image : TROOPS[0].image}
                      alt="Current left fighter"
                      width={72}
                      height={72}
                      className="h-14 w-14 md:h-16 md:w-16 object-contain"
                    />
                    <p className="text-[10px] text-center text-orange-200">
                      {lineups.left[0] ? `${troopById(lineups.left[0].type).label} HP ${lineups.left[0].hp}` : "No fighter"}
                    </p>
                  </div>
                  <div className="text-center text-xs font-bold text-orange-300">DUEL</div>
                  <div className="rounded-lg border border-orange-300/60 bg-black/30 px-2 py-2">
                    <Image
                      src={lineups.right[0] ? troopById(lineups.right[0].type).image : TROOPS[1].image}
                      alt="Current right fighter"
                      width={72}
                      height={72}
                      className="h-14 w-14 md:h-16 md:w-16 object-contain -scale-x-100"
                    />
                    <p className="text-[10px] text-center text-orange-200">
                      {lineups.right[0] ? `${troopById(lineups.right[0].type).label} HP ${lineups.right[0].hp}` : "No fighter"}
                    </p>
                  </div>
                </div>
              <div className="flex items-center justify-center gap-5">
                <Image
                  src={leftDiceImage}
                  alt="Left dice"
                  width={110}
                  height={110}
                  className={`h-16 w-16 md:h-20 md:w-20 object-contain transition-transform ${dicePop ? "scale-125 duration-200" : "scale-100 duration-300"}`}
                />
                <div className="text-center text-base font-bold text-orange-300">VS</div>
                <Image
                  src={rightDiceImage}
                  alt="Right dice"
                  width={110}
                  height={110}
                  className={`h-16 w-16 md:h-20 md:w-20 object-contain transition-transform ${dicePop ? "scale-125 duration-200" : "scale-100 duration-300"}`}
                />
              </div>
            </div>

            <div className="rounded-xl border border-white/10 p-4 min-h-44">
              <p className="text-xs text-slate-400 mb-2 text-right">Right side</p>
              <div className="flex flex-row flex-wrap justify-start gap-3">
                {lineups.right.length === 0 && <span className="text-xs text-slate-500">No units</span>}
                {lineups.right.map((unit, indexFromFront) => (
                  <div
                    key={unit.uid}
                    className={`rounded-lg border px-2 py-2 ${indexFromFront <= 1 ? "border-orange-400 bg-orange-500/10" : "border-white/15 bg-white/5"}`}
                    title={`${troopById(unit.type).label} | HP ${unit.hp}`}
                  >
                    <Image
                      src={troopById(unit.type).image}
                      alt={troopById(unit.type).label}
                      width={72}
                      height={72}
                      className="h-16 w-16 md:h-20 md:w-20 object-contain -scale-x-100"
                    />
                    <p className="text-xs text-center text-slate-300">HP {unit.hp}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <div className="rounded-2xl border border-white/20 bg-black/35 p-4 space-y-4">
          <h1 className="text-2xl font-bold">Fight Test Arena</h1>
          <p className="text-sm text-slate-300">
            Rules: Frontline attacks frontline, support Archer from position 2 shoots frontline, then
            damage and collapse.
          </p>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Hit Thresholds (1d6)</h2>
            {[
              ["archerFront", "Archer frontline"],
              ["archerSupport", "Archer support (pos 2)"],
              ["swordsmanBase", "Warrior base"],
              ["swordsmanVsSpearmen", "Warrior vs Spearmen"],
              ["spearmenBase", "Spearmen base"],
              ["spearmenVsKonjanik", "Spearmen vs Konjanik"],
              ["konjanikBase", "Konjanik base"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between gap-3">
                <span className="text-sm">{label}</span>
                <input
                  type="number"
                  min={1}
                  max={6}
                  step="1"
                  value={thresholds[key]}
                  onChange={(e) =>
                    setThresholds((prev) => ({
                      ...prev,
                      [key]: Number(e.target.value),
                    }))
                  }
                  className="w-20 rounded bg-slate-800 border border-slate-600 px-2 py-1 text-sm"
                />
              </label>
            ))}
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">HP by Type</h2>
            {TROOPS.map((troop) => (
              <label key={troop.id} className="flex items-center gap-3">
                <span className="w-28 text-sm">{troop.label}</span>
                <input
                  type="number"
                  min={1}
                  step="1"
                  value={hpByType[troop.id]}
                  onChange={(e) =>
                    setHpByType((prev) => ({
                      ...prev,
                      [troop.id]: Number(e.target.value),
                    }))
                  }
                  className="w-24 rounded bg-slate-800 border border-slate-600 px-2 py-1 text-sm"
                />
              </label>
            ))}
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Battle Settings</h2>
            <label className="flex items-center justify-between gap-2">
              <span className="text-sm">Pause between rounds (ms)</span>
              <input
                type="number"
                min={100}
                value={roundPauseMs}
                onChange={(e) => setRoundPauseMs(Number(e.target.value))}
                className="w-24 rounded bg-slate-800 border border-slate-600 px-2 py-1 text-sm"
              />
            </label>
            <label className="flex items-center justify-between gap-2">
              <span className="text-sm">Enable cavalry charge (first attack 2d4)</span>
              <input
                type="checkbox"
                checked={cavalryChargeEnabled}
                onChange={(e) => setCavalryChargeEnabled(e.target.checked)}
                className="h-4 w-4"
              />
            </label>
          </div>

          <button
            onClick={fight}
            disabled={rolling}
            className="w-full rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2 font-bold"
          >
            {rolling ? "Fighting..." : "Fight"}
          </button>

          <button
            onClick={() => {
              setLeftDraftOrder(countsToOrder(DEFAULT_COUNTS.left));
              setRightDraftOrder(countsToOrder(DEFAULT_COUNTS.right));
              setHpByType(
                TROOPS.reduce((acc, troop) => {
                  acc[troop.id] = troop.defaultHp;
                  return acc;
                }, {}),
              );
              setThresholds(DEFAULT_THRESHOLDS);
              setRoundPauseMs(700);
              setCavalryChargeEnabled(true);
            }}
            className="w-full rounded-xl bg-slate-700 hover:bg-slate-600 px-4 py-2 font-semibold"
          >
            Reset Testing Values
          </button>
          </div>

          <div className="space-y-4">
          <div className="rounded-2xl border border-white/20 bg-black/35 p-4">
            <h2 className="text-lg font-semibold mb-3">Troops Per Side (Add With +)</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {["left", "right"].map((side) => (
                <div key={side} className="rounded-xl border border-white/10 p-3">
                  <h3 className="font-semibold capitalize mb-2">{side} side</h3>
                  {TROOPS.map((troop) => (
                    <div key={`${side}-${troop.id}`} className="flex items-center justify-between gap-3 mb-2">
                      <span className="text-sm">{troop.label}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (side === "left") setLeftDraftOrder((prev) => [...prev, troop.id]);
                            else setRightDraftOrder((prev) => [...prev, troop.id]);
                          }}
                          className="h-7 w-7 rounded bg-orange-500 hover:bg-orange-400 font-bold leading-none"
                          title={`Add ${troop.label}`}
                        >
                          +
                        </button>
                        <span className="text-xs w-10 text-right text-slate-300">
                          {side === "left" ? draftCounts.left[troop.id] : draftCounts.right[troop.id]}
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (side === "left") setLeftDraftOrder((prev) => prev.slice(0, -1));
                        else setRightDraftOrder((prev) => prev.slice(0, -1));
                      }}
                      className="rounded bg-slate-700 hover:bg-slate-600 px-2 py-1 text-xs"
                    >
                      Undo Last
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (side === "left") setLeftDraftOrder([]);
                        else setRightDraftOrder([]);
                      }}
                      className="rounded bg-slate-700 hover:bg-slate-600 px-2 py-1 text-xs"
                    >
                      Clear Side
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 p-3">
                <p className="text-xs text-slate-400 mb-2">Left add order (front is first)</p>
                <div className="flex flex-wrap gap-2">
                  {leftDraftOrder.length === 0 && <span className="text-xs text-slate-500">No units added</span>}
                  {leftDraftOrder.map((id, index) => (
                    <div
                      key={`left-order-${id}-${index}`}
                      className="h-7 min-w-7 px-2 rounded bg-slate-800 border border-slate-600 text-xs flex items-center justify-center"
                      title={`${index + 1}. ${troopById(id).label}`}
                    >
                      {troopInitial(id)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 p-3">
                <p className="text-xs text-slate-400 mb-2 text-right">
                  Right add order (front is first)
                </p>
                <div className="flex flex-wrap justify-end gap-2">
                  {rightDraftOrder.length === 0 && <span className="text-xs text-slate-500">No units added</span>}
                  {rightDraftOrder.map((id, index) => (
                    <div
                      key={`right-order-${id}-${index}`}
                      className="h-7 min-w-7 px-2 rounded bg-slate-800 border border-slate-600 text-xs flex items-center justify-center"
                      title={`${index + 1}. ${troopById(id).label}`}
                    >
                      {troopInitial(id)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              Configured totals: Left {totalConfigured.left} | Right {totalConfigured.right}
            </p>
            <p className="text-sm text-slate-300">Alive now: Left {alive.left} | Right {alive.right}</p>
            <p className="mt-2 text-xs text-slate-400">
              Fight order is exactly the order you add units with +.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-black/35 p-4">
            <h2 className="text-lg font-semibold mb-3">Current Duel</h2>
            {lastRound && (
              <p className="text-sm mt-3 text-slate-200">
                Round {lastRound.round}: Left dealt {lastRound.leftPower} dmg, Right dealt{" "}
                {lastRound.rightPower} dmg ({lastRound.winner === "tie" ? "Tie" : lastRound.winner === "left" ? "Left advantage" : "Right advantage"})
              </p>
            )}
            {!!result && <p className="mt-3 font-bold text-orange-300">{result}</p>}
          </div>

          <div className="rounded-2xl border border-white/20 bg-black/35 p-4">
            <h2 className="text-lg font-semibold mb-2">Battle Log</h2>
            <div className="max-h-80 overflow-auto rounded border border-white/10 bg-black/40 p-3 text-sm space-y-1">
              {log.length === 0 && <p className="text-slate-400">No rounds yet.</p>}
              {log.map((line, index) => (
                <p key={`${line}-${index}`} className="text-slate-200">
                  {line}
                </p>
              ))}
            </div>
          </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/20 bg-black/35 p-4">
          <h2 className="text-lg font-semibold mb-3">Instant Simulation</h2>
          <p className="text-xs text-slate-400 mb-3">
            Enter order strings with letters: A=Archer, S=Spearmen, K=Konjanik, W=Warrior.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-slate-300">Left order input</span>
              <input
                value={leftQuickInput}
                onChange={(e) => setLeftQuickInput(e.target.value.toUpperCase())}
                className="rounded bg-slate-800 border border-slate-600 px-3 py-2 text-sm"
                placeholder="AAAKKKWWAAWKAKAK"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-slate-300">Right order input</span>
              <input
                value={rightQuickInput}
                onChange={(e) => setRightQuickInput(e.target.value.toUpperCase())}
                className="rounded bg-slate-800 border border-slate-600 px-3 py-2 text-sm"
                placeholder="AAKWSKAKW"
              />
            </label>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const leftOrder = orderFromCodeString(leftQuickInput);
                const rightOrder = orderFromCodeString(rightQuickInput);
                if (!leftOrder.length || !rightOrder.length) {
                  setQuickResult("Both inputs need at least one valid unit letter.");
                  return;
                }
                const sim = simulateBattleInstant({
                  leftOrder,
                  rightOrder,
                  hpByType,
                  thresholds,
                  cavalryChargeEnabled,
                });
                const winnerLabel =
                  sim.winner === "left"
                    ? "Left side wins"
                    : sim.winner === "right"
                      ? "Right side wins"
                      : "Draw";
                setQuickResult(
                  `${winnerLabel} | Rounds: ${sim.rounds} | Alive L:${sim.leftAlive} R:${sim.rightAlive}`,
                );
              }}
              className="rounded bg-orange-500 hover:bg-orange-400 px-4 py-2 font-semibold"
            >
              Fight
            </button>
            <span className="text-xs text-slate-400">Instant calc, no animation</span>
          </div>

          {!!quickResult && <p className="mt-3 font-semibold text-orange-300">{quickResult}</p>}
        </div>
      </div>
    </section>
  );
}
