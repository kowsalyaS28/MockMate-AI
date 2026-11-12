"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  const response = await fetch("http://localhost:8080/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    alert(data);
    return;
  }

  alert("Login successful!");
localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify(data.user));
  router.push("/dashboard");
};

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <p className="text-blue-400 font-semibold">
            MockMate AI
          </p>

          <h1 className="text-4xl font-bold mt-2">
            Welcome Back
          </h1>

          <p className="text-gray-400 mt-3">
            Login to continue your interview preparation.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-8"
        >

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
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 mb-6 outline-none focus:border-blue-500"
          />

          {/* Password */}
          <label className="block font-semibold mb-2">
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 mb-6 outline-none focus:border-blue-500"
          />

          {/* Login */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold"
          >
            Login
          </button>

          <p className="text-center text-gray-400 mt-6 text-sm">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="text-blue-400 hover:text-blue-300"
            >
              Create Account
            </button>
          </p>

        </form>

      </div>

    </main>
  );
}