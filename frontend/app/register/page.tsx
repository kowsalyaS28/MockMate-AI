"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const message = await response.text();

      if (!response.ok) {
        alert("Registration failed: " + message);
        return;
      }

      alert("Account created successfully!");
      router.push("/login");
    } catch (error) {
      console.error("Registration error:", error);

      alert(
        "Unable to connect to the backend. Please check whether the Go backend is running on port 8080."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-blue-400 font-semibold">
            MockMate AI
          </p>

          <h1 className="text-4xl font-bold mt-2">
            Create Account
          </h1>

          <p className="text-gray-400 mt-3">
            Create your account and start practicing.
          </p>
        </div>

        {/* Registration Form */}
        <form
          onSubmit={handleRegister}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-8"
        >
          {/* Name */}
          <label className="block font-semibold mb-2">
            Full Name
          </label>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 mb-6 outline-none focus:border-blue-500"
          />

          {/* Email */}
          <label className="block font-semibold mb-2">
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 mb-6 outline-none focus:border-blue-500"
          />

          {/* Password */}
          <label className="block font-semibold mb-2">
            Password
          </label>

          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 mb-6 outline-none focus:border-blue-500"
          />

          {/* Confirm Password */}
          <label className="block font-semibold mb-2">
            Confirm Password
          </label>

          <input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 mb-6 outline-none focus:border-blue-500"
          />

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {/* Login Link */}
          <p className="text-center text-gray-400 mt-6 text-sm">
            Already have an account?{" "}

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-blue-400 hover:text-blue-300"
            >
              Login
            </button>
          </p>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          © 2026 MockMate AI. All rights reserved.
        </p>

      </div>
    </main>
  );
}