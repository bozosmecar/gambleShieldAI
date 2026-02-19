"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    const supabase = getSupabaseClient();
    if (!supabase) {
      setMessage({ type: "error", text: "Service unavailable. Please try again later." });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
        setLoading(false);
        return;
      }

      setMessage({ type: "success", text: "Logged in. Redirecting…" });
      router.push("/");
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Login failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF3C4]" style={{ paddingTop: '70px' }}>
      {/* Login Form */}
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
                <h1 className="text-3xl font-bold text-center text-amber-700 mb-2">
                  Welcome Back
                </h1>
                <p className="text-center text-gray-600 mb-8">
                  Log in to your GambleShield account
                </p>

                {message.text && (
                  <div
                    className={`mb-4 p-3 rounded-lg text-sm ${
                      message.type === "error"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                      placeholder="Enter your password"
                    />
                  </div>

                  {/* Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="remember-me"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Remember me
                      </label>
                    </div>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-amber-700 hover:text-amber-600 font-medium transition"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-6 bg-amber-500 hover:bg-amber-600 disabled:opacity-70 text-white font-bold rounded-lg shadow-lg transition duration-200 transform hover:scale-105 disabled:transform-none"
                  >
                    {loading ? "Logging in…" : "Log In"}
                  </button>
                </form>

                {/* Register Link */}
                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    Don't have an account?{" "}
                    <Link
                      href="/register"
                      className="text-amber-700 font-semibold hover:text-amber-600 transition"
                    >
                      Sign Up
                    </Link>
                  </p>
                </div>
              </div>

              {/* Responsible Gambling Note */}
              <div className="mt-8 text-center text-sm text-gray-600 px-4">
                <p className="mb-2">
                  GambleShield promotes safe and responsible gambling.
                </p>
                <p>If you need help, please visit our support resources.</p>
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
