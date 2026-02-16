"use client";

import Link from "next/link";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function Profile() {
  const { user, profile, loading } = useUserProfile();

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
      </div>
    </main>
  );
}
