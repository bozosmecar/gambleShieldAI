"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { TROOPS, DEFAULT_THRESHOLDS } from "@/lib/battle/constants";
import {
  troopById,
  computeRoundResolution,
  applyRoundDamage,
  formatRoundLogLine,
} from "@/lib/battle/engine";
import { createMathRng } from "@/lib/battle/rng";
import {
  subscribeFightChannel,
  FIGHT_EVENTS,
} from "@/lib/battle/streamFightChannel";

const DEFAULT_SESSION_DURATION_SEC = 120;

const DEFAULT_HP_BY_TYPE = TROOPS.reduce((acc, t) => {
  acc[t.id] = t.defaultHp;
  return acc;
}, {});

function makeUnitUid(side, troopId) {
  return `${side}-${troopId}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function diceImage(faceRaw, maxFace) {
  const cap = maxFace <= 4 ? 4 : 6;
  const safe = Math.max(1, Math.min(cap, Math.round(faceRaw) || 1));
  // Existing dice asset set is 1..6
  return `/1_Home page/dices/dice${Math.min(6, safe)}.png`;
}

export default function StreamFightVote() {
  const { user, isAdmin } = useUserProfile();

  const channelRef = useRef(null);
  const [channelReady, setChannelReady] = useState(false);

  const [session, setSession] = useState(null);
  // session shape:
  // { sessionId, leftLabel, rightLabel, endsAt, hostId, ended, winner }

  const [leftQueue, setLeftQueue] = useState([]);
  const [rightQueue, setRightQueue] = useState([]);
  const [log, setLog] = useState([]);
  const [lastStep, setLastStep] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  // Host-only authoritative state held in refs (kept in sync with state for rendering).
  const isHostRef = useRef(false);
  const sessionRef = useRef(null);
  const leftQueueRef = useRef([]);
  const rightQueueRef = useRef([]);
  const pendingAddsRef = useRef([]);
  const rngRef = useRef(createMathRng());
  const userIdRef = useRef(null);
  const roundCounterRef = useRef(0);
  const tickTimerRef = useRef(null);

  const ADD_DELAY_MS = 250;
  const ROUND_DELAY_MS = 650;
  const SAFETY_MAX_ROUNDS_PER_BURST = 500;

  // Admin start form fields
  const [formLeftLabel, setFormLeftLabel] = useState("Left");
  const [formRightLabel, setFormRightLabel] = useState("Right");
  const [formDuration, setFormDuration] = useState(DEFAULT_SESSION_DURATION_SEC);

  // ----------- helpers -----------
  useEffect(() => {
    userIdRef.current = user?.id ?? null;
  }, [user?.id]);

  const replaceQueues = useCallback((nextLeft, nextRight) => {
    leftQueueRef.current = nextLeft;
    rightQueueRef.current = nextRight;
    setLeftQueue(nextLeft);
    setRightQueue(nextRight);
  }, []);

  const appendLog = useCallback((line) => {
    setLog((prev) => [line, ...prev].slice(0, 80));
  }, []);

  // ----------- timer ticker -----------
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  // ----------- host: broadcast SESSION_END when terminal state is reached -----------
  // Terminal state = at least one side is empty AND no more adds can come in
  // (either the add timer has expired, or session was force-ended).
  const maybeBroadcastEnd = useCallback(() => {
    if (!isHostRef.current) return;
    const s = sessionRef.current;
    if (!s || s.ended) return;

    const leftAlive = leftQueueRef.current.length;
    const rightAlive = rightQueueRef.current.length;
    const addsClosed = Date.now() >= s.endsAt;
    const someoneWiped = leftAlive === 0 || rightAlive === 0;

    if (!addsClosed) return;
    if (!someoneWiped && pendingAddsRef.current.length > 0) return;
    if (!someoneWiped) return; // adds closed but battle still ongoing

    const winner =
      leftAlive > rightAlive ? "left" : rightAlive > leftAlive ? "right" : "draw";

    channelRef.current?.send(FIGHT_EVENTS.SESSION_END, {
      sessionId: s.sessionId,
      winner,
      leftAlive,
      rightAlive,
    });
  }, []);

  // Re-evaluate end condition on every timer tick (catches the case where the
  // add window expires while one side is already empty, or both are empty).
  useEffect(() => {
    maybeBroadcastEnd();
  }, [now, maybeBroadcastEnd]);

  // ----------- host: ticker state machine -----------
  // Each tick either:
  //   1. drains one pending troop add (broadcast queues, no attacks)
  //   2. or runs one combat round if both sides have units
  //   3. or idles (no schedule)
  // This way every troop add triggers the fight to continue running rounds
  // until one side is wiped clean (or session ends / cap is hit).
  const clearTick = useCallback(() => {
    if (tickTimerRef.current) {
      clearTimeout(tickTimerRef.current);
      tickTimerRef.current = null;
    }
  }, []);

  const tickOnce = useCallback(() => {
    tickTimerRef.current = null;
    if (!isHostRef.current) return;
    const s = sessionRef.current;
    if (!s || s.ended) return;

    // 1) Drain one pending add
    if (pendingAddsRef.current.length > 0) {
      const addEvent = pendingAddsRef.current.shift();
      const newUnit = {
        uid: makeUnitUid(addEvent.side, addEvent.troopId),
        type: addEvent.troopId,
        hp: Math.max(1, DEFAULT_HP_BY_TYPE[addEvent.troopId] ?? 1),
        hasCharged: false,
        addedByUserId: addEvent.userId ?? null,
      };
      if (addEvent.side === "left") leftQueueRef.current.push(newUnit);
      else rightQueueRef.current.push(newUnit);

      channelRef.current?.send(FIGHT_EVENTS.COMBAT_STEP, {
        sessionId: s.sessionId,
        addedSide: addEvent.side,
        addedTroopId: addEvent.troopId,
        addedByUserId: addEvent.userId ?? null,
        attacksWithRolls: [],
        leftQueue: leftQueueRef.current.map((u) => ({ ...u })),
        rightQueue: rightQueueRef.current.map((u) => ({ ...u })),
        ts: Date.now(),
      });

      tickTimerRef.current = setTimeout(tickOnce, ADD_DELAY_MS);
      return;
    }

    // 2) Run a combat round if both sides have units
    if (
      leftQueueRef.current.length > 0 &&
      rightQueueRef.current.length > 0 &&
      roundCounterRef.current < SAFETY_MAX_ROUNDS_PER_BURST
    ) {
      const result = computeRoundResolution({
        leftQueue: leftQueueRef.current,
        rightQueue: rightQueueRef.current,
        thresholds: DEFAULT_THRESHOLDS,
        cavalryChargeEnabled: true,
        rng: rngRef.current,
      });
      applyRoundDamage(
        leftQueueRef.current,
        rightQueueRef.current,
        result.pendingDamage,
      );

      channelRef.current?.send(FIGHT_EVENTS.COMBAT_STEP, {
        sessionId: s.sessionId,
        addedSide: null,
        addedTroopId: null,
        addedByUserId: null,
        attacksWithRolls: result.attacksWithRolls,
        leftQueue: leftQueueRef.current.map((u) => ({ ...u })),
        rightQueue: rightQueueRef.current.map((u) => ({ ...u })),
        ts: Date.now(),
      });

      const someoneWiped =
        leftQueueRef.current.length === 0 || rightQueueRef.current.length === 0;
      if (someoneWiped) {
        // Give viewers time to see the final hit, then check for session end.
        tickTimerRef.current = setTimeout(() => {
          tickTimerRef.current = null;
          maybeBroadcastEnd();
        }, ROUND_DELAY_MS);
        return;
      }

      tickTimerRef.current = setTimeout(tickOnce, ROUND_DELAY_MS);
      return;
    }

    // 3) Idle (one or both sides empty, no pending adds). Either:
    //    a) timer is still running: wait for next add
    //    b) timer expired and one side empty: broadcast SESSION_END
    maybeBroadcastEnd();
  }, [maybeBroadcastEnd]);

  const scheduleTickIfIdle = useCallback(() => {
    if (!isHostRef.current) return;
    if (tickTimerRef.current) return;
    tickTimerRef.current = setTimeout(tickOnce, 0);
  }, [tickOnce]);

  // ----------- handlers from channel (stable identity, read refs) -----------
  const handleSessionStart = useCallback(
    (payload) => {
      roundCounterRef.current = 0;
      const newSession = {
        sessionId: payload.sessionId,
        leftLabel: payload.leftLabel,
        rightLabel: payload.rightLabel,
        endsAt: payload.endsAt,
        hostId: payload.hostId,
        ended: false,
        winner: null,
      };
      sessionRef.current = newSession;
      setSession(newSession);
      replaceQueues([], []);
      setLog([]);
      setLastStep(null);
      pendingAddsRef.current = [];
      clearTick();
      const uid = userIdRef.current;
      isHostRef.current = !!(uid && uid === payload.hostId);
    },
    [replaceQueues, clearTick],
  );

  const handleSessionEnd = useCallback((payload) => {
    setSession((prev) => {
      if (!prev || prev.sessionId !== payload.sessionId) return prev;
      const ended = {
        ...prev,
        ended: true,
        winner: payload.winner,
        leftAlive: payload.leftAlive,
        rightAlive: payload.rightAlive,
      };
      sessionRef.current = ended;
      return ended;
    });
  }, []);

  const handleTroopAdd = useCallback(
    (payload) => {
      if (!isHostRef.current) return;
      const s = sessionRef.current;
      if (!s || s.ended) return;
      if (s.sessionId !== payload.sessionId) return;
      if (Date.now() > s.endsAt) return;
      pendingAddsRef.current.push(payload);
      scheduleTickIfIdle();
    },
    [scheduleTickIfIdle],
  );

  const handleCombatStep = useCallback(
    (payload) => {
      const s = sessionRef.current;
      if (!s || s.sessionId !== payload.sessionId) return;

      leftQueueRef.current = payload.leftQueue;
      rightQueueRef.current = payload.rightQueue;
      setLeftQueue(payload.leftQueue);
      setRightQueue(payload.rightQueue);

      setLastStep(payload);

      if (payload.attacksWithRolls?.length) {
        roundCounterRef.current += 1;
        const line = formatRoundLogLine(
          roundCounterRef.current,
          payload.attacksWithRolls,
          payload.leftQueue.length,
          payload.rightQueue.length,
          (id) => troopById(id).label,
        );
        appendLog(line);
      } else if (payload.addedTroopId) {
        const troopLabel = troopById(payload.addedTroopId).label;
        const sideLabel = payload.addedSide === "left" ? "LEFT" : "RIGHT";
        appendLog(`+ ${troopLabel} joins ${sideLabel} side`);
      }
    },
    [appendLog],
  );

  const handleStateRequest = useCallback((payload) => {
    if (!isHostRef.current) return;
    const s = sessionRef.current;
    if (!s) return;
    channelRef.current?.send(FIGHT_EVENTS.STATE_SNAPSHOT, {
      toUserId: payload.fromUserId,
      session: s,
      leftQueue: leftQueueRef.current,
      rightQueue: rightQueueRef.current,
    });
  }, []);

  const handleStateSnapshot = useCallback((payload) => {
    const uid = userIdRef.current;
    if (payload.toUserId && payload.toUserId !== uid) return;
    if (sessionRef.current) return; // already have state
    sessionRef.current = payload.session;
    setSession(payload.session);
    leftQueueRef.current = payload.leftQueue;
    rightQueueRef.current = payload.rightQueue;
    setLeftQueue(payload.leftQueue);
    setRightQueue(payload.rightQueue);
    isHostRef.current = !!(uid && uid === payload.session.hostId);
  }, []);

  // ----------- subscribe once -----------
  useEffect(() => {
    const ctrl = subscribeFightChannel(
      {
        [FIGHT_EVENTS.SESSION_START]: handleSessionStart,
        [FIGHT_EVENTS.SESSION_END]: handleSessionEnd,
        [FIGHT_EVENTS.TROOP_ADD]: handleTroopAdd,
        [FIGHT_EVENTS.COMBAT_STEP]: handleCombatStep,
        [FIGHT_EVENTS.STATE_REQUEST]: handleStateRequest,
        [FIGHT_EVENTS.STATE_SNAPSHOT]: handleStateSnapshot,
      },
      (status) => {
        if (status === "SUBSCRIBED") {
          setChannelReady(true);
          // Ask whoever may host for current state
          ctrl.send(FIGHT_EVENTS.STATE_REQUEST, {
            fromUserId: userIdRef.current,
          });
        }
      },
    );
    channelRef.current = ctrl;
    return () => {
      ctrl.unsubscribe();
      channelRef.current = null;
      setChannelReady(false);
      if (tickTimerRef.current) {
        clearTimeout(tickTimerRef.current);
        tickTimerRef.current = null;
      }
    };
    // Handlers are stable (useCallback with empty/stable deps + refs), so we
    // intentionally only run subscribe once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------- actions -----------
  const startSession = useCallback(() => {
    if (!isAdmin || !user?.id) return;
    const sessionId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    const durationSec = Math.max(15, Math.min(3600, Number(formDuration) || DEFAULT_SESSION_DURATION_SEC));
    const endsAt = Date.now() + durationSec * 1000;
    channelRef.current?.send(FIGHT_EVENTS.SESSION_START, {
      sessionId,
      leftLabel: formLeftLabel.trim() || "Left",
      rightLabel: formRightLabel.trim() || "Right",
      endsAt,
      hostId: user.id,
    });
  }, [formDuration, formLeftLabel, formRightLabel, isAdmin, user?.id]);

  const endSessionNow = useCallback(() => {
    if (!isHostRef.current) return;
    const s = sessionRef.current;
    if (!s || s.ended) return;
    const leftAlive = leftQueueRef.current.length;
    const rightAlive = rightQueueRef.current.length;
    const winner =
      leftAlive > rightAlive ? "left" : rightAlive > leftAlive ? "right" : "draw";
    channelRef.current?.send(FIGHT_EVENTS.SESSION_END, {
      sessionId: s.sessionId,
      winner,
      leftAlive,
      rightAlive,
    });
  }, []);

  const addTroop = useCallback(
    (side, troopId) => {
      if (!user?.id) return;
      const s = sessionRef.current;
      if (!s || s.ended) return;
      if (Date.now() > s.endsAt) return;
      channelRef.current?.send(FIGHT_EVENTS.TROOP_ADD, {
        sessionId: s.sessionId,
        side,
        troopId,
        userId: user.id,
        ts: Date.now(),
      });
    },
    [user?.id],
  );

  // ----------- derived -----------
  const secondsLeft = useMemo(() => {
    if (!session) return 0;
    return Math.max(0, Math.ceil((session.endsAt - now) / 1000));
  }, [session, now]);

  // Adds are only allowed while the timer is running.
  const addsOpen = !!session && !session.ended && secondsLeft > 0;
  // The session is "in progress" (banner visible, host still running combat)
  // until either timer expires AND one side is wiped, or admin force-ends.
  const sessionInProgress = !!session && !session.ended;
  // Phase after the timer hits zero but combat is still resolving.
  const finishingBattle = sessionInProgress && secondsLeft === 0;

  const leftMainAttack = lastStep?.attacksWithRolls?.find(
    (a) => a.side === "left" && a.role === "front",
  );
  const rightMainAttack = lastStep?.attacksWithRolls?.find(
    (a) => a.side === "right" && a.role === "front",
  );

  const leftDiceFace = leftMainAttack
    ? Math.max(1, Math.min(6, leftMainAttack.rolls?.[0] ?? 1))
    : 5;
  const rightDiceFace = rightMainAttack
    ? Math.max(1, Math.min(6, rightMainAttack.rolls?.[0] ?? 1))
    : 5;
  const leftDiceMax = leftMainAttack?.charge ? 4 : 6;
  const rightDiceMax = rightMainAttack?.charge ? 4 : 6;

  const leftCaption = leftMainAttack
    ? leftMainAttack.charge
      ? `2d4 [${leftMainAttack.rolls.join("+")}]`
      : `1d6 (${leftMainAttack.rolls[0]})`
    : "";
  const rightCaption = rightMainAttack
    ? rightMainAttack.charge
      ? `2d4 [${rightMainAttack.rolls.join("+")}]`
      : `1d6 (${rightMainAttack.rolls[0]})`
    : "";

  // ----------- render -----------
  return (
    <section className="w-full rounded-2xl border border-white/20 bg-black/40 p-4 sm:p-6 text-white">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Stream Fight Vote</h2>
          <p className="text-xs text-slate-400">
            Add soldiers in real time. Each new troop triggers a duel with the opposing frontline.
          </p>
        </div>
        <div className="text-xs text-slate-400">
          {channelReady ? "Live" : "Connecting…"}
          {user ? "" : " · Sign in to participate"}
        </div>
      </header>

      {isAdmin && !sessionInProgress && (
        <div className="mb-4 rounded-xl border border-orange-300/30 bg-orange-500/10 p-3">
          <h3 className="text-sm font-semibold text-orange-200 mb-2">Admin: start a new fight vote</h3>
          <div className="grid sm:grid-cols-3 gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-300">Left option</span>
              <input
                value={formLeftLabel}
                onChange={(e) => setFormLeftLabel(e.target.value)}
                className="rounded bg-slate-800 border border-slate-600 px-2 py-1 text-sm"
                placeholder="e.g. Powerup"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-300">Right option</span>
              <input
                value={formRightLabel}
                onChange={(e) => setFormRightLabel(e.target.value)}
                className="rounded bg-slate-800 border border-slate-600 px-2 py-1 text-sm"
                placeholder="e.g. Casumo"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-300">Duration (sec)</span>
              <input
                type="number"
                min={15}
                value={formDuration}
                onChange={(e) => setFormDuration(Number(e.target.value))}
                className="rounded bg-slate-800 border border-slate-600 px-2 py-1 text-sm"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={startSession}
            disabled={!channelReady}
            className="mt-3 rounded bg-orange-500 hover:bg-orange-400 disabled:opacity-50 px-4 py-2 text-sm font-bold"
          >
            Start Fight Vote
          </button>
          <p className="mt-2 text-[11px] text-slate-400">
            Hosting note: the admin who clicks Start runs the duels. If they leave, the session stops.
          </p>
        </div>
      )}

      {sessionInProgress && (
        <div className="mb-3 rounded-xl border border-orange-300/40 bg-orange-500/10 p-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-300">Vote question</p>
            <p className="font-bold">
              <span className="text-orange-300">{session.leftLabel}</span>{" "}
              <span className="text-slate-300">vs</span>{" "}
              <span className="text-orange-300">{session.rightLabel}</span>
            </p>
          </div>
          <div className="text-right">
            {finishingBattle ? (
              <>
                <p className="text-xs text-slate-300">Adds closed</p>
                <p className="text-base font-bold text-orange-300">
                  Finishing battle…
                </p>
              </>
            ) : (
              <>
                <p className="text-xs text-slate-300">Time left to add troops</p>
                <p className="text-2xl font-bold text-orange-300 tabular-nums">
                  {secondsLeft}s
                </p>
              </>
            )}
          </div>
          {isAdmin && isHostRef.current && (
            <button
              type="button"
              onClick={endSessionNow}
              className="rounded bg-slate-700 hover:bg-slate-600 px-3 py-1 text-xs font-semibold"
            >
              End now
            </button>
          )}
        </div>
      )}

      {session?.ended && (
        <div className="mb-3 rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-3">
          <p className="font-bold">
            {session.winner === "draw"
              ? "Draw — both sides tied."
              : `${session.winner === "left" ? session.leftLabel : session.rightLabel} wins!`}
          </p>
          <p className="text-xs text-slate-300">
            Alive at end — {session.leftLabel}: {session.leftAlive ?? leftQueue.length} ·{" "}
            {session.rightLabel}: {session.rightAlive ?? rightQueue.length}
          </p>
        </div>
      )}

      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
        <div className="rounded-xl border border-white/10 p-3 min-h-40">
          <p className="text-xs text-slate-400 mb-2">{session?.leftLabel || "Left"}</p>
          <div className="flex flex-row-reverse flex-wrap justify-end gap-2">
            {leftQueue.length === 0 && (
              <span className="text-xs text-slate-500">No units</span>
            )}
            {leftQueue.map((unit, index) => (
              <div
                key={unit.uid}
                className={`rounded-lg border px-1.5 py-1.5 ${
                  index <= 1
                    ? "border-orange-400 bg-orange-500/10"
                    : "border-white/15 bg-white/5"
                }`}
                title={`${troopById(unit.type).label} | HP ${unit.hp}`}
              >
                <Image
                  src={troopById(unit.type).image}
                  alt={troopById(unit.type).label}
                  width={56}
                  height={56}
                  className="h-12 w-12 md:h-14 md:w-14 object-contain"
                />
                <p className="text-[10px] text-center text-slate-300">HP {unit.hp}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-orange-300/40 bg-orange-500/10 p-3 flex flex-col items-center gap-2 min-w-[210px]">
          <div className="text-center text-xs font-semibold text-orange-300">BATTLE CENTER</div>
          <div className="flex items-center justify-center gap-2">
            <div className="rounded-lg border border-orange-300/60 bg-black/30 px-1.5 py-1.5">
              <Image
                src={leftQueue[0] ? troopById(leftQueue[0].type).image : TROOPS[0].image}
                alt="Current left fighter"
                width={56}
                height={56}
                className="h-12 w-12 object-contain"
              />
              <p className="text-[10px] text-center text-orange-200">
                {leftQueue[0]
                  ? `${troopById(leftQueue[0].type).label} HP ${leftQueue[0].hp}`
                  : "—"}
              </p>
            </div>
            <div className="text-[10px] font-bold text-orange-300">DUEL</div>
            <div className="rounded-lg border border-orange-300/60 bg-black/30 px-1.5 py-1.5">
              <Image
                src={rightQueue[0] ? troopById(rightQueue[0].type).image : TROOPS[1].image}
                alt="Current right fighter"
                width={56}
                height={56}
                className="h-12 w-12 object-contain -scale-x-100"
              />
              <p className="text-[10px] text-center text-orange-200">
                {rightQueue[0]
                  ? `${troopById(rightQueue[0].type).label} HP ${rightQueue[0].hp}`
                  : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-start justify-center gap-3">
            <div className="flex flex-col items-center gap-0.5">
              <Image
                src={diceImage(leftDiceFace, leftDiceMax)}
                alt="Left dice"
                width={64}
                height={64}
                className="h-12 w-12 object-contain"
              />
              {!!leftCaption && (
                <span className="text-[9px] text-orange-100/90 text-center leading-tight">
                  {leftCaption}
                </span>
              )}
            </div>
            <div className="text-xs font-bold text-orange-300 pt-2">VS</div>
            <div className="flex flex-col items-center gap-0.5">
              <Image
                src={diceImage(rightDiceFace, rightDiceMax)}
                alt="Right dice"
                width={64}
                height={64}
                className="h-12 w-12 object-contain"
              />
              {!!rightCaption && (
                <span className="text-[9px] text-orange-100/90 text-center leading-tight">
                  {rightCaption}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 p-3 min-h-40">
          <p className="text-xs text-slate-400 mb-2 text-right">{session?.rightLabel || "Right"}</p>
          <div className="flex flex-row flex-wrap justify-start gap-2">
            {rightQueue.length === 0 && (
              <span className="text-xs text-slate-500">No units</span>
            )}
            {rightQueue.map((unit, index) => (
              <div
                key={unit.uid}
                className={`rounded-lg border px-1.5 py-1.5 ${
                  index <= 1
                    ? "border-orange-400 bg-orange-500/10"
                    : "border-white/15 bg-white/5"
                }`}
                title={`${troopById(unit.type).label} | HP ${unit.hp}`}
              >
                <Image
                  src={troopById(unit.type).image}
                  alt={troopById(unit.type).label}
                  width={56}
                  height={56}
                  className="h-12 w-12 md:h-14 md:w-14 object-contain -scale-x-100"
                />
                <p className="text-[10px] text-center text-slate-300">HP {unit.hp}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {(["left", "right"]).map((side) => {
          const label = side === "left" ? session?.leftLabel || "Left" : session?.rightLabel || "Right";
          const disabled = !addsOpen || !user?.id;
          const reason = !user?.id
            ? "Sign in to add troops"
            : !sessionInProgress
              ? "No active fight"
              : finishingBattle
                ? "Adds closed — battle is finishing"
                : null;
          return (
            <div key={side} className="rounded-xl border border-white/10 p-3">
              <h4 className="text-sm font-semibold mb-2">
                Send troops to {label}
                {finishingBattle && (
                  <span className="ml-2 text-[10px] uppercase tracking-wide text-orange-300">
                    locked
                  </span>
                )}
              </h4>
              <div className="flex flex-wrap gap-2">
                {TROOPS.map((troop) => (
                  <button
                    key={`${side}-${troop.id}`}
                    type="button"
                    onClick={() => addTroop(side, troop.id)}
                    disabled={disabled}
                    title={reason || `Add ${troop.label}`}
                    className="group rounded-lg border border-white/15 bg-white/5 hover:border-orange-400 hover:bg-orange-500/10 disabled:opacity-40 disabled:cursor-not-allowed px-2 py-1.5 flex items-center gap-2"
                  >
                    <Image
                      src={troop.image}
                      alt={troop.label}
                      width={32}
                      height={32}
                      className={`h-8 w-8 object-contain ${side === "right" ? "-scale-x-100" : ""}`}
                    />
                    <span className="text-xs">+ {troop.label}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {log.length > 0 && (
        <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3">
          <p className="text-xs text-slate-400 mb-2">Battle log (latest first)</p>
          <div className="max-h-32 overflow-auto text-xs space-y-1">
            {log.map((line, index) => (
              <p key={`${index}-${line.slice(0, 12)}`} className="text-slate-200">
                {line}
              </p>
            ))}
          </div>
        </div>
      )}

      {!session && (
        <p className="mt-3 text-xs text-slate-400">
          No active fight vote yet. {isAdmin ? "Start one above." : "Wait for admin to start."}
        </p>
      )}
    </section>
  );
}
