"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // TODO: Add registration logic here
    console.log("Registration data:", formData);
    alert("Registration functionality coming soon!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
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
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
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
              className="text-green-600 font-bold transition-colors border-b-2 border-green-600"
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

      {/* Registration Form */}
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-center">
            {/* Left Image */}
            <div className="hidden lg:flex justify-end items-center">
              <div className="relative w-full max-w-sm">
                <Image
                  src="/register_login/upgrade.png"
                  alt="Upgrade"
                  width={400}
                  height={400}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>

            {/* Center Form */}
            <div className="w-full max-w-md mx-auto lg:mx-0">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h1 className="text-3xl font-bold text-center text-green-600 mb-2">
                  Create Account
                </h1>
                <p className="text-center text-gray-600 mb-8">
                  Join GambleShield for responsible gambling
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Username */}
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      placeholder="Enter your username"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      placeholder="Enter your email"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      placeholder="Create a password"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      placeholder="Confirm your password"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition duration-200 transform hover:scale-105"
                  >
                    Create Account
                  </button>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="text-green-600 font-semibold hover:text-green-700 transition"
                    >
                      Log In
                    </Link>
                  </p>
                </div>
              </div>

              {/* Responsible Gambling Note */}
              <div className="mt-8 text-center text-sm text-gray-600 px-4">
                <p className="mb-2">
                  By creating an account, you agree to our responsible gambling
                  practices.
                </p>
                <p>
                  GambleShield promotes safe and responsible gambling for all
                  users.
                </p>
              </div>
            </div>

            {/* Right Image */}
            <div className="hidden lg:flex justify-start items-center">
              <div className="relative w-full max-w-sm">
                <Image
                  src="/register_login/vote.png"
                  alt="Vote"
                  width={400}
                  height={400}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
