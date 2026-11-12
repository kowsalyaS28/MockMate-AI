"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function InterviewPage() {
  const router = useRouter();

  const [jobRole, setJobRole] = useState("Software Developer");
  const [interviewType, setInterviewType] = useState("Technical Interview");
  const [difficulty, setDifficulty] = useState("Beginner");

  const startInterview = () => {
    // Save the selected preferences
    const preferences = {
      jobRole: jobRole,
      interviewType: interviewType,
      difficulty: difficulty,
    };

    localStorage.setItem(
      "interviewPreferences",
      JSON.stringify(preferences)
    );

    // Navigate to the question page
    router.push("/interview/question");
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center">
          Start Your Mock Interview
        </h1>

        <p className="text-gray-400 text-center mt-3">
          Choose your interview preferences
        </p>

        <div className="mt-10 bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <label className="block mb-2 font-semibold">
            Job Role
          </label>

          <select
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 mb-6"
          >
            <option>Software Developer</option>
            <option>Java Developer</option>
            <option>Python Developer</option>
            <option>Data Analyst</option>
            <option>Web Developer</option>
          </select>

          <label className="block mb-2 font-semibold">
            Interview Type
          </label>

          <select
            value={interviewType}
            onChange={(e) => setInterviewType(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 mb-6"
          >
            <option>Technical Interview</option>
            <option>HR Interview</option>
            <option>Mixed Interview</option>
          </select>

          <label className="block mb-2 font-semibold">
            Difficulty
          </label>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 mb-8"
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>

          <button
            onClick={startInterview}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold"
          >
            Begin Interview
          </button>
        </div>
      </div>
    </main>
  );
}