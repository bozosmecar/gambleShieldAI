"use client";

import Link from "next/link";
import { useState } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function Profile() {
  const { user, profile, loading } = useUserProfile();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState({ type: "", text: "" });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMessage({ type: "", text: "" });

    if (newPassword.length < 6) {
      setPwMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setPwMessage({ type: "error", text: "Service unavailable." });
      return;
    }

    setPwLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPwMessage({ type: "error", text: error.message });
        return;
      }
      setPwMessage({ type: "success", text: "Password updated successfully." });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwMessage({ type: "error", text: err.message || "Something went wrong." });
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" style={{ paddingTop: "70px" }}>
        <div className="max-w-6xl mx-auto px-4 py-12">
          <p className="text-gray-600">Loading…</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" style={{ paddingTop: "70px" }}>
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-600 mb-4">You need to log in to see your profile.</p>
            <Link href="/login" className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
              Log in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" style={{ paddingTop: "70px" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">

        {/* Account info */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile</h1>
          <div className="space-y-4">
            <div>
              <span className="block text-sm font-medium text-gray-500 mb-1">Username</span>
              <p className="text-gray-900 font-medium">{profile?.username ?? "—"}</p>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-500 mb-1">Email</span>
              <p className="text-gray-900 font-medium">{profile?.email ?? user?.email ?? "—"}</p>
            </div>
          </div>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Change Password</h2>
          <p className="text-sm text-gray-500 mb-6">Choose a new password for your account.</p>

          {pwMessage.text && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                pwMessage.type === "error"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-green-50 text-green-800 border border-green-200"
              }`}
            >
              {pwMessage.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm new password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                placeholder="Repeat your new password"
              />
            </div>
            <button
              type="submit"
              disabled={pwLoading}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold rounded-lg transition duration-200"
            >
              {pwLoading ? "Updating…" : "Update Password"}
            </button>
          </form>
        </div>

      </div>
    </main>
  );
}
