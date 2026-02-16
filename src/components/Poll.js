"use client";

import { useEffect, useState } from "react";
import { getPollWithOptionsAndVotes, castVote } from "@/lib/polls";

/**
 * DB-driven poll: fetches by pollId, only logged-in users can vote, after vote shows counts per option.
 * @param {string} pollId - Poll UUID
 * @param {string | null} userId - Current user id (auth) or null if not logged in
 * @param {string} [className] - Optional wrapper class
 */
export default function Poll({ pollId, userId, className = "" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  const isActive = data?.poll && new Date(data.poll.resolves_at) > new Date();
  const hasVoted = !!data?.userVoteOptionId;
  const showCounts = hasVoted || !isActive;

  const load = async () => {
    if (!pollId) return;
    setLoading(true);
    const result = await getPollWithOptionsAndVotes(pollId, userId);
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [pollId, userId]);

  const handleVote = async (optionId) => {
    if (!userId || !pollId || voting || !isActive || hasVoted) return;
    setVoting(true);
    const ok = await castVote(pollId, optionId, userId);
    setVoting(false);
    if (ok) await load();
  };

  if (loading || !data) {
    return (
      <div className={`p-3 bg-white/5 rounded-lg border border-white/10 ${className}`}>
        <p className="text-gray-400 text-sm">Loading poll…</p>
      </div>
    );
  }

  const { poll, options, userVoteOptionId } = data;
  const totalVotes = options.reduce((s, o) => s + (o.vote_count || 0), 0);

  return (
    <div className={`p-3 bg-white/5 rounded-lg border border-white/10 ${className}`}>
      <p className="text-white text-sm font-medium mb-1">{poll.question}</p>
      <p className="text-xs text-gray-500 mb-2">
        {isActive
          ? `Ends ${new Date(poll.resolves_at).toLocaleString()}`
          : `Ended ${new Date(poll.resolves_at).toLocaleString()}`}
      </p>

      {!userId && isActive && (
        <p className="text-amber-400/90 text-xs mb-2">Log in to vote.</p>
      )}

      <div className="space-y-1.5">
        {options.map((opt) => {
          const isSelected = userVoteOptionId === opt.id;
          const count = opt.vote_count ?? 0;
          const pct = totalVotes > 0 ? Math.round((100 * count) / totalVotes) : 0;

          return (
            <div key={opt.id} className="relative">
              <button
                type="button"
                onClick={() => handleVote(opt.id)}
                disabled={!userId || !isActive || hasVoted || voting}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors border ${
                  isSelected
                    ? "bg-green-600/50 text-white border-green-400/50"
                    : "bg-white/10 text-white hover:bg-white/15 border-transparent disabled:opacity-70 disabled:cursor-not-allowed"
                }`}
              >
                <span>{opt.option_text}</span>
                {showCounts && (
                  <span className="ml-2 text-gray-400">
                    — {count} vote{count !== 1 ? "s" : ""}
                    {totalVotes > 0 && ` (${pct}%)`}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
