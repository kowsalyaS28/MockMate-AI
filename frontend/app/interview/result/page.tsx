"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface InterviewResult {
  score: number;
  jobRole: string;
  interviewType: string;
  difficulty: string;
  totalQuestions: number;
  answeredQuestions: number;
}

export default function ResultPage() {
  const router = useRouter();

  const [result, setResult] = useState<InterviewResult | null>(null);

  useEffect(() => {
    const savedResult = localStorage.getItem("latestInterviewResult");

    if (savedResult) {
      try {
        setResult(JSON.parse(savedResult));
      } catch {
        console.error("Unable to load interview results.");
      }
    }
  }, []);

  const score = result?.score ?? 0;

  const performance =
    score >= 80
      ? "Excellent Completion"
      : score >= 60
      ? "Good Progress"
      : score >= 40
      ? "Keep Practicing"
      : "More Practice Needed";

  const strengths =
    score >= 80
      ? [
          "You completed most or all of the interview questions.",
          "You maintained a consistent effort throughout the interview.",
          "You have a good starting point for further practice.",
        ]
      : [
          "You have started practicing interview questions.",
          "You are gaining experience with interview scenarios.",
          "Reviewing your answers can help improve your preparation.",
        ];

  const improvements =
    score >= 80
      ? [
          "Review your answers for technical accuracy.",
          "Practice explaining concepts with examples.",
          "Try more challenging questions for your target role.",
        ]
      : [
          "Try to answer every question before finishing.",
          "Review the fundamental concepts for your chosen role.",
          "Practice explaining answers clearly and confidently.",
        ];

  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-blue-400 font-semibold">
            MockMate AI
          </p>

          <h1 className="text-4xl font-bold mt-2">
            Interview Results
          </h1>

          <p className="text-gray-400 mt-3">
            Review your interview completion and next steps.
          </p>
        </div>

        {/* Interview Details */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">
            Interview Details
          </h2>

          <div className="grid md:grid-cols-3 gap-4 text-gray-300">
            <div>
              <p className="text-gray-400 text-sm">Job Role</p>
              <p className="font-semibold">
                {result?.jobRole ?? "Not available"}
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Interview Type</p>
              <p className="font-semibold">
                {result?.interviewType ?? "Not available"}
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Difficulty</p>
              <p className="font-semibold">
                {result?.difficulty ?? "Not available"}
              </p>
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center mb-8">
          <p className="text-gray-400">
            Interview Completion Score
          </p>

          <h2 className="text-6xl font-bold text-blue-500 mt-3">
            {result ? `${score}%` : "--"}
          </h2>

          <p className="text-green-400 mt-3">
            {result ? performance : "No result available"}
          </p>

          <p className="text-gray-400 mt-4">
            Questions answered: {result?.answeredQuestions ?? 0} /{" "}
            {result?.totalQuestions ?? 0}
          </p>
        </div>

        {/* Performance Information */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <p className="text-gray-400">
              Completion
            </p>

            <h3 className="text-3xl font-bold mt-2">
              {result?.totalQuestions
                ? Math.round(
                    (result.answeredQuestions /
                      result.totalQuestions) *
                      100
                  )
                : 0}
              %
            </h3>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <p className="text-gray-400">
              Questions Answered
            </p>

            <h3 className="text-3xl font-bold mt-2">
              {result?.answeredQuestions ?? 0}
            </h3>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <p className="text-gray-400">
              Questions Remaining
            </p>

            <h3 className="text-3xl font-bold mt-2">
              {Math.max(
                0,
                (result?.totalQuestions ?? 0) -
                  (result?.answeredQuestions ?? 0)
              )}
            </h3>
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">
            Interview Feedback
          </h2>

          <div className="mb-6">
            <h3 className="text-green-400 font-semibold mb-3">
              Positive Progress
            </h3>

            <ul className="text-gray-400 space-y-2">
              {strengths.map((item, index) => (
                <li key={index}>✓ {item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-yellow-400 font-semibold mb-3">
              Recommended Improvements
            </h3>

            <ul className="text-gray-400 space-y-2">
              {improvements.map((item, index) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Notice */}
        <p className="text-center text-gray-500 text-sm mb-8">
          This score currently measures interview completion, not the
          correctness or quality of your answers. AI-based answer
          evaluation will be added separately.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => router.push("/interview")}
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold"
          >
            Practice Again
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 rounded-lg border border-gray-700 hover:bg-gray-800 font-semibold"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}