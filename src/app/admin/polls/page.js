"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPolls, createPoll } from "@/lib/polls";

export default function AdminPollsPage() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await getPolls();
      setPolls(data);
    }
    load();
  }, []);

  const addOption = () => setOptions((prev) => [...prev, ""]);
  const removeOption = (i) => setOptions((prev) => prev.filter((_, j) => j !== i));
  const setOption = (i, value) => setOptions((prev) => prev.map((v, j) => (j === i ? value : v)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    const trimmed = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim()) {
      setMessage({ type: "error", text: "Enter a question." });
      return;
    }
    if (trimmed.length < 2) {
      setMessage({ type: "error", text: "Add at least 2 options." });
      return;
    }
    const mins = parseInt(durationMinutes, 10);
    if (!mins || mins < 1) {
      setMessage({ type: "error", text: "Enter a valid duration (at least 1 minute)." });
      return;
    }
    setSaving(true);
    const result = await createPoll(question.trim(), trimmed, mins);
    setSaving(false);
    if (result) {
      const resolvesAt = new Date(Date.now() + mins * 60 * 1000).toISOString();
      setMessage({ type: "success", text: "Poll created." });
      setQuestion("");
      setOptions(["", ""]);
      setDurationMinutes("30");
      setPolls((prev) => [{ id: result.id, question: question.trim(), resolves_at: resolvesAt, created_at: new Date().toISOString() }, ...prev]);
    } else {
      setMessage({ type: "error", text: "Failed to create poll." });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: "90px" }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Polls</h1>
          <Link href="/admin/blog" className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">
            Admin Blog
          </Link>
        </div>

        {message.text && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Create new poll</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g. Who will win?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => setOption(i, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder={`Option ${i + 1}`}
                    />
                    <button type="button" onClick={() => removeOption(i)} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg" disabled={options.length <= 2}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addOption} className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium">
                + Add option
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                min={1}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g. 30"
              />
            </div>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
              {saving ? "Creating…" : "Create poll"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <h2 className="text-lg font-bold text-gray-900 p-4 border-b border-gray-200">All polls</h2>
          {polls.length === 0 ? (
            <p className="p-4 text-gray-500">No polls yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {polls.map((p) => (
                <li key={p.id} className="p-4">
                  <p className="font-medium text-gray-900">{p.question}</p>
                  <p className="text-sm text-gray-500">
                    Ends {new Date(p.resolves_at).toLocaleString()} · {new Date(p.resolves_at) > new Date() ? "Active" : "Ended"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
