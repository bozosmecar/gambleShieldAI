"use client";

import Image from "next/image";
import Link from "next/link";

export default function Profile() {
  return (
    <>
      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-md z-[100]"
        style={{ height: "70px" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/">
              <h1
                className="font-bold text-green-600 cursor-pointer"
                style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)" }}
              >
                GambleShield
              </h1>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6 sm:gap-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)" }}
            >
              Home
            </Link>
            <Link
              href="/profile"
              className="text-green-600 font-bold transition-colors border-b-2 border-green-600"
              style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)" }}
            >
              Profile
            </Link>
            <Link
              href="/stream"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)" }}
            >
              Stream
            </Link>
            <Link
              href="/register"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)" }}
            >
              Register
            </Link>
            <Link
              href="/login"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)" }}
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main
        className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
        style={{ paddingTop: "70px" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Picture */}
              <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-5xl font-bold">
                U
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1
                  className="font-bold text-gray-800 mb-2"
                  style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
                >
                  User Profile
                </h1>
                <p
                  className="text-gray-600 mb-4"
                  style={{ fontSize: "clamp(1rem, 1.5vw, 1.25rem)" }}
                >
                  Manage your account and preferences
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Verified
                  </span>
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    Member since 2024
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
                Edit Profile
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-gray-600 text-sm font-medium mb-2">
                Total Sessions
              </h3>
              <p className="text-3xl font-bold text-gray-800">24</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-gray-600 text-sm font-medium mb-2">
                Safety Score
              </h3>
              <p className="text-3xl font-bold text-green-600">92%</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-gray-600 text-sm font-medium mb-2">
                Streak Days
              </h3>
              <p className="text-3xl font-bold text-blue-600">15</p>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2
              className="font-bold text-gray-800 mb-6"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
            >
              Account Settings
            </h2>

            <div className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="user@example.com"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Username
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="username"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Bio
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-32"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
