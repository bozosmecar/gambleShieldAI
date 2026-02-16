import { getSupabaseClient } from "./supabaseClient";

const now = () => new Date().toISOString();

/**
 * @param {string} [status] - 'active' | 'resolved' (optional; if omitted, returns all)
 * @returns {Promise<Array<{ id: string, question: string, resolves_at: string, created_at: string }>>}
 */
export async function getPolls(status = null) {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  let q = supabase.from("polls").select("id, question, resolves_at, created_at").order("created_at", { ascending: false });
  if (status === "active") q = q.gt("resolves_at", now());
  if (status === "resolved") q = q.lte("resolves_at", now());

  const { data, error } = await q;
  if (error) {
    console.error("getPolls error:", error);
    return [];
  }
  return data || [];
}

/**
 * @param {string} pollId
 * @returns {Promise<{ poll: object, options: Array<{ id: string, option_text: string, sort_order: number, vote_count: number }>, userVoteOptionId: string | null } | null>}
 */
export async function getPollWithOptionsAndVotes(pollId, userId = null) {
  const supabase = getSupabaseClient();
  if (!supabase || !pollId) return null;

  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("id, question, resolves_at, created_at")
    .eq("id", pollId)
    .single();

  if (pollError || !poll) return null;

  const { data: options, error: optError } = await supabase
    .from("poll_options")
    .select("id, option_text, sort_order")
    .eq("poll_id", pollId)
    .order("sort_order", { ascending: true });

  if (optError) return null;

  const { data: votes } = await supabase
    .from("poll_votes")
    .select("option_id, user_id")
    .eq("poll_id", pollId);

  const voteCountByOption = {};
  (options || []).forEach((o) => (voteCountByOption[o.id] = 0));
  (votes || []).forEach((v) => {
    if (voteCountByOption[v.option_id] !== undefined) voteCountByOption[v.option_id]++;
  });

  const optionsWithCounts = (options || []).map((o) => ({
    ...o,
    vote_count: voteCountByOption[o.id] ?? 0,
  }));

  let userVoteOptionId = null;
  if (userId && votes) {
    const myVote = votes.find((v) => v.user_id === userId);
    if (myVote) userVoteOptionId = myVote.option_id;
  }

  return {
    poll,
    options: optionsWithCounts,
    userVoteOptionId,
  };
}

/**
 * Create a poll (admin only). Options are created in same transaction via separate inserts.
 * @param {string} question
 * @param {string[]} optionTexts
 * @param {number} durationMinutes - how long the poll stays open (minutes from now)
 * @returns {Promise<{ id: string } | null>}
 */
export async function createPoll(question, optionTexts, durationMinutes) {
  const supabase = getSupabaseClient();
  if (!supabase || !question?.trim() || !Array.isArray(optionTexts) || optionTexts.length < 2) return null;

  const resolvesAt = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();

  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .insert({ question: question.trim(), resolves_at: resolvesAt })
    .select("id")
    .single();

  if (pollError || !poll) {
    console.error("createPoll error:", pollError);
    return null;
  }

  const rows = optionTexts.filter((t) => t?.trim()).map((text, i) => ({ poll_id: poll.id, option_text: text.trim(), sort_order: i }));
  const { error: optError } = await supabase.from("poll_options").insert(rows);
  if (optError) {
    console.error("createPoll options error:", optError);
    return null;
  }
  return { id: poll.id };
}

/**
 * Cast a vote (logged-in user only). One vote per user per poll.
 * @param {string} pollId
 * @param {string} optionId
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
export async function castVote(pollId, optionId, userId) {
  const supabase = getSupabaseClient();
  if (!supabase || !pollId || !optionId || !userId) return false;

  const { error } = await supabase.from("poll_votes").upsert(
    { poll_id: pollId, option_id: optionId, user_id: userId },
    { onConflict: "poll_id,user_id" }
  );
  if (error) {
    console.error("castVote error:", error);
    return false;
  }
  return true;
}
