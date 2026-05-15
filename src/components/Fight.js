"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  TROOPS,
  DEFAULT_COUNTS,
  DEFAULT_THRESHOLDS,
  MAX_BATTLE_ROUNDS,
} from "@/lib/battle/constants";
import { countsToOrder, orderFromCodeString } from "@/lib/battle/orderCodec";
import { createMathRng, createSeededRng } from "@/lib/battle/rng";
import {
  troopById,
  buildQueueFromOrder,
  computeRoundResolution,
  applyRoundDamage,
  formatRoundLogLine,
  runBattleSummary,
} from "@/lib/battle/engine";
import { rollSequence } from "@/lib/battle/diceAnimation";

function troopInitial(id) {
  return troopById(id).label.charAt(0).toUpperCase();
}

function seedFromString(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
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
  const [leftRollCaption, setLeftRollCaption] = useState("");
  const [rightRollCaption, setRightRollCaption] = useState("");

  const [lastRound, setLastRound] = useState(null);
  const [log, setLog] = useState([]);
  const [result, setResult] = useState("");
  const [alive, setAlive] = useState({ left: 0, right: 0 });
  const [lineups, setLineups] = useState({ left: [], right: [] });
  const [leftQuickInput, setLeftQuickInput] = useState("AAAKKKWWAAWKAKAK");
  const [rightQuickInput, setRightQuickInput] = useState("AAAKKKWWSAKWAK");
  const [instantSimSeed, setInstantSimSeed] = useState("");
  const [quickResult, setQuickResult] = useState("");

  const fightGenRef = useRef(0);
  const timeoutIdsRef = useRef([]);

  const clearFightTimeouts = useCallback(() => {
    timeoutIdsRef.current.forEach((id) => clearTimeout(id));
    timeoutIdsRef.current = [];
  }, []);

  const cancelFight = useCallback(() => {
    fightGenRef.current += 1;
    clearFightTimeouts();
    setRolling(false);
    setResult("Battle cancelled.");
  }, [clearFightTimeouts]);

  useEffect(() => {
    return () => {
      fightGenRef.current += 1;
      clearFightTimeouts();
    };
  }, [clearFightTimeouts]);

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

  const labelFor = useCallback((id) => troopById(id).label, []);

  const applyRollAnimation = useCallback((setDiceImage, finalRoll, maxFace, isCancelled) => {
    return new Promise((resolve) => {
      const picks = rollSequence(maxFace, Math.random);
      let index = 0;
      const showNext = () => {
        if (isCancelled()) {
          resolve();
          return;
        }
        if (index >= picks.length) {
          setDiceImage(`/1_Home page/dices/dice${finalRoll}.png`);
          resolve();
          return;
        }
        setDiceImage(`/1_Home page/dices/dice${picks[index]}.png`);
        index += 1;
        const delay = index <= 9 ? 65 : 130;
        const id = setTimeout(showNext, delay);
        timeoutIdsRef.current.push(id);
      };
      showNext();
    });
  }, []);

  const fight = async () => {
    if (rolling) return;

    const rngCombat = createMathRng();
    const leftQueue = buildQueueFromOrder(leftDraftOrder, rngCombat);
    const rightQueue = buildQueueFromOrder(rightDraftOrder, rngCombat);
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

    fightGenRef.current += 1;
    const gen = fightGenRef.current;
    const isCancelled = () => fightGenRef.current !== gen;

    clearFightTimeouts();
    setRolling(true);
    setResult("");
    setLastRound(null);
    setLog([]);
    setLeftRollCaption("");
    setRightRollCaption("");
    setAlive({ left: leftQueue.length, right: rightQueue.length });
    setLineups({
      left: leftQueue.map((u) => ({ uid: u.uid, type: u.type, hp: u.hp })),
      right: rightQueue.map((u) => ({ uid: u.uid, type: u.type, hp: u.hp })),
    });

    let round = 1;
    const roundLines = [];

    while (leftQueue.length > 0 && rightQueue.length > 0 && round <= MAX_BATTLE_ROUNDS) {
      if (isCancelled()) {
        clearFightTimeouts();
        return;
      }

      const leftFrontBefore = leftQueue[0];
      const rightFrontBefore = rightQueue[0];

      const { attacksWithRolls, pendingDamage } = computeRoundResolution({
        leftQueue,
        rightQueue,
        thresholds,
        cavalryChargeEnabled,
        rng: rngCombat,
      });

      const leftMainAttack = attacksWithRolls.find((a) => a.side === "left" && a.role === "front");
      const rightMainAttack = attacksWithRolls.find((a) => a.side === "right" && a.role === "front");

      const leftMaxFace = leftMainAttack?.charge ? 4 : 6;
      const rightMaxFace = rightMainAttack?.charge ? 4 : 6;
      const leftFinal = leftMainAttack
        ? Math.max(1, Math.min(leftMaxFace, leftMainAttack.rolls[0]))
        : 1;
      const rightFinal = rightMainAttack
        ? Math.max(1, Math.min(rightMaxFace, rightMainAttack.rolls[0]))
        : 1;

      await Promise.all([
        applyRollAnimation(setLeftDiceImage, leftFinal, leftMaxFace, isCancelled),
        applyRollAnimation(setRightDiceImage, rightFinal, rightMaxFace, isCancelled),
      ]);

      if (isCancelled()) {
        clearFightTimeouts();
        return;
      }

      setLeftRollCaption(
        leftMainAttack?.charge
          ? `2d4 [${leftMainAttack.rolls.join("+")}]`
          : leftMainAttack
            ? `1d6 (${leftMainAttack.rolls[0]})`
            : "",
      );
      setRightRollCaption(
        rightMainAttack?.charge
          ? `2d4 [${rightMainAttack.rolls.join("+")}]`
          : rightMainAttack
            ? `1d6 (${rightMainAttack.rolls[0]})`
            : "",
      );

      applyRoundDamage(leftQueue, rightQueue, pendingDamage);

      const popId = setTimeout(() => setDicePop(false), 200);
      timeoutIdsRef.current.push(popId);
      setDicePop(true);

      const line = formatRoundLogLine(
        round,
        attacksWithRolls,
        leftQueue.length,
        rightQueue.length,
        labelFor,
      );

      roundLines.unshift(line);
      setLog([...roundLines]);
      setLastRound({
        round,
        leftType: leftQueue[0]?.type || null,
        rightType: rightQueue[0]?.type || null,
        leftRoll: leftMainAttack?.rolls?.[0] || 1,
        rightRoll: rightMainAttack?.rolls?.[0] || 1,
        leftPower: pendingDamage[rightFrontBefore?.uid] || 0,
        rightPower: pendingDamage[leftFrontBefore?.uid] || 0,
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
      await new Promise((resolve) => {
        const id = setTimeout(
          resolve,
          Math.max(150, Number(roundPauseMs) || 700),
        );
        timeoutIdsRef.current.push(id);
      });
    }

    if (isCancelled()) {
      clearFightTimeouts();
      return;
    }

    if (round > MAX_BATTLE_ROUNDS && leftQueue.length > 0 && rightQueue.length > 0) {
      setResult(`Battle stopped after ${MAX_BATTLE_ROUNDS} rounds (safety cap).`);
    } else if (leftQueue.length > 0 && rightQueue.length === 0) {
      setResult(`Left side wins with ${leftQueue.length} troop(s) alive.`);
    } else if (rightQueue.length > 0 && leftQueue.length === 0) {
      setResult(`Right side wins with ${rightQueue.length} troop(s) alive.`);
    } else {
      setResult("Draw. Both sides got eliminated.");
    }

    clearFightTimeouts();
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
                    {lineups.left[0]
                      ? `${troopById(lineups.left[0].type).label} HP ${lineups.left[0].hp}`
                      : "No fighter"}
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
                    {lineups.right[0]
                      ? `${troopById(lineups.right[0].type).label} HP ${lineups.right[0].hp}`
                      : "No fighter"}
                  </p>
                </div>
              </div>
              <div className="flex items-start justify-center gap-6">
                <div className="flex flex-col items-center gap-1">
                  <Image
                    src={leftDiceImage}
                    alt="Left dice"
                    width={110}
                    height={110}
                    className={`h-16 w-16 md:h-20 md:w-20 object-contain transition-transform ${dicePop ? "scale-125 duration-200" : "scale-100 duration-300"}`}
                  />
                  {!!leftRollCaption && (
                    <span className="text-[10px] text-orange-100/90 max-w-[100px] text-center leading-tight">
                      {leftRollCaption}
                    </span>
                  )}
                </div>
                <div className="text-center text-base font-bold text-orange-300 pt-2">VS</div>
                <div className="flex flex-col items-center gap-1">
                  <Image
                    src={rightDiceImage}
                    alt="Right dice"
                    width={110}
                    height={110}
                    className={`h-16 w-16 md:h-20 md:w-20 object-contain transition-transform ${dicePop ? "scale-125 duration-200" : "scale-100 duration-300"}`}
                  />
                  {!!rightRollCaption && (
                    <span className="text-[10px] text-orange-100/90 max-w-[100px] text-center leading-tight">
                      {rightRollCaption}
                    </span>
                  )}
                </div>
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

            <div className="flex gap-2">
              <button
                type="button"
                onClick={fight}
                disabled={rolling}
                className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2 font-bold"
              >
                {rolling ? "Fighting..." : "Fight"}
              </button>
              <button
                type="button"
                onClick={cancelFight}
                disabled={!rolling}
                className="rounded-xl bg-slate-600 hover:bg-slate-500 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 font-semibold"
              >
                Cancel
              </button>
            </div>

            <button
              type="button"
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
                    {leftDraftOrder.length === 0 && (
                      <span className="text-xs text-slate-500">No units added</span>
                    )}
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
                  <p className="text-xs text-slate-400 mb-2 text-right">Right add order (front is first)</p>
                  <div className="flex flex-wrap justify-end gap-2">
                    {rightDraftOrder.length === 0 && (
                      <span className="text-xs text-slate-500">No units added</span>
                    )}
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
                  {lastRound.rightPower} dmg (
                  {lastRound.winner === "tie"
                    ? "Tie"
                    : lastRound.winner === "left"
                      ? "Left advantage"
                      : "Right advantage"}
                  )
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
            Enter order strings with letters: A=Archer, S=Spearmen, K=Konjanik, W=Warrior. Optional seed
            makes the outcome reproducible.
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
          <label className="mt-3 flex flex-col gap-2 max-w-md">
            <span className="text-sm text-slate-300">Optional RNG seed (any text)</span>
            <input
              value={instantSimSeed}
              onChange={(e) => setInstantSimSeed(e.target.value)}
              className="rounded bg-slate-800 border border-slate-600 px-3 py-2 text-sm"
              placeholder="e.g. balance-test-42"
            />
          </label>

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
                const seedStr = instantSimSeed.trim();
                const rng = seedStr ? createSeededRng(seedFromString(seedStr)) : createMathRng();
                const sim = runBattleSummary({
                  leftOrder,
                  rightOrder,
                  hpByType,
                  thresholds,
                  cavalryChargeEnabled,
                  rng,
                });
                const winnerLabel =
                  sim.winner === "left"
                    ? "Left side wins"
                    : sim.winner === "right"
                      ? "Right side wins"
                      : "Draw";
                const exhaustedNote = sim.exhausted ? " | Hit round cap" : "";
                const seedNote = seedStr ? ` | Seed: ${seedStr}` : "";
                setQuickResult(
                  `${winnerLabel} | Rounds: ${sim.rounds} | Alive L:${sim.leftAlive} R:${sim.rightAlive}${exhaustedNote}${seedNote}`,
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
