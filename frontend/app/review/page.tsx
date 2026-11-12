"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_URL = "http://localhost:8080";

interface Interview {
  id: number;
  job_role: string;
  interview_type: string;
  difficulty: string;
  score: number;
  created_at: string;
}

interface InterviewAnswer {
  question: string;
  answer: string;
  score: number;
  feedback: string;
}

interface ReviewResponse {
  interview: Interview;
  answers: InterviewAnswer[];
}

function ReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const interviewId = searchParams.get("interview_id");

  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadReview() {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
          router.replace("/login");
          return;
        }

        JSON.parse(userData);

        if (!interviewId || !/^\d+$/.test(interviewId)) {
          throw new Error(
            "A valid interview ID is missing. Open a review from your interview history."
          );
        }

        const response = await fetch(
          `${API_URL}/api/interviews/review?interview_id=${encodeURIComponent(
            interviewId
          )}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          const message = await response.text();

          throw new Error(
            message || `Unable to load review. Status: ${response.status}`
          );
        }

        const data: ReviewResponse = await response.json();

        if (!data.interview || !Array.isArray(data.answers)) {
          throw new Error("The server returned an invalid review response.");
        }

        if (!cancelled) {
          setReview(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading the review."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    setLoading(true);
    setError("");
    setReview(null);

    loadReview();

    return () => {
      cancelled = true;
    };
  }, [interviewId, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4" />
          <p className="text-lg text-blue-400">
            Loading your interview review...
          </p>
        </div>
      </main>
    );
  }

  if (error || !review) {
    return (
      <main className="min-h-screen bg-gray-950 text-white px-6 py-16">
        <div className="max-w-xl mx-auto text-center bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <div className="text-5xl mb-4">⚠️</div>

          <h1 className="text-3xl font-bold mb-4">
            Unable to Load Review
          </h1>

          <p className="text-red-400 mb-8 whitespace-pre-wrap">
            {error || "No review data is available."}
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => router.push("/history")}
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold"
            >
              Interview History
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 rounded-lg border border-gray-700 hover:bg-gray-800 font-semibold"
            >
              Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  const { interview, answers } = review;

  const averageAnswerScore =
    answers.length > 0
      ? Math.round(
          answers.reduce(
            (total, answer) => total + Number(answer.score || 0),
            0
          ) / answers.length
        )
      : 0;

  const performance =
    interview.score >= 85
      ? {
          label: "Excellent Performance",
          color: "text-green-400",
          message: "Excellent work! Continue practising to maintain your performance.",
        }
      : interview.score >= 70
      ? {
          label: "Good Performance",
          color: "text-blue-400",
          message: "Good progress! Review the feedback below to improve further.",
        }
      : interview.score >= 50
      ? {
          label: "Keep Improving",
          color: "text-yellow-400",
          message: "You are making progress. Focus on the topics where you lost marks.",
        }
      : {
          label: "More Practice Needed",
          color: "text-red-400",
          message: "Practise fundamental concepts and try another interview.",
        };

  const strongAnswers = answers.filter(
    (answer) => Number(answer.score) >= 80
  ).length;

  const improvementAnswers = answers.filter(
    (answer) => Number(answer.score) < 60
  ).length;

  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 sm:px-6 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <p className="text-blue-400 font-bold tracking-wide">
            MOCKMATE AI
          </p>

          <h1 className="text-3xl sm:text-4xl font-bold mt-3">
            Interview Review
          </h1>

          <p className="text-gray-400 mt-3">
            Understand your performance, review your answers, and identify
            areas for improvement.
          </p>

          <button
            onClick={() => router.push("/history")}
            className="mt-5 text-blue-400 hover:text-blue-300"
          >
            ← Back to Interview History
          </button>
        </header>

        {/* Overall Result */}
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <p className="text-gray-400 text-sm">OVERALL PERFORMANCE</p>

              <h2 className={`text-2xl font-bold mt-2 ${performance.color}`}>
                {performance.label}
              </h2>

              <p className="text-gray-400 mt-3 max-w-xl">
                {performance.message}
              </p>
            </div>

            <div className="w-32 h-32 rounded-full border-8 border-blue-500 flex flex-col items-center justify-center shrink-0">
              <span className="text-3xl font-bold">
                {interview.score}%
              </span>

              <span className="text-xs text-gray-400">Overall Score</span>
            </div>
          </div>
        </section>

        {/* Interview Details */}
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Interview Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-gray-400 text-sm">Job Role</p>
              <p className="font-semibold mt-2">
                {interview.job_role || "Not specified"}
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Interview Type</p>
              <p className="font-semibold mt-2">
                {interview.interview_type || "Not specified"}
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Difficulty</p>
              <p className="font-semibold mt-2">
                {interview.difficulty || "Not specified"}
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Interview ID</p>
              <p className="font-semibold mt-2">#{interview.id}</p>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Questions Reviewed</p>
            <p className="text-3xl font-bold mt-3">{answers.length}</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Average Answer Score</p>
            <p className="text-3xl font-bold text-blue-400 mt-3">
              {averageAnswerScore}%
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Strong Answers</p>
            <p className="text-3xl font-bold text-green-400 mt-3">
              {strongAnswers}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Answers scoring 80% or higher
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Needs Improvement</p>
            <p className="text-3xl font-bold text-yellow-400 mt-3">
              {improvementAnswers}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Answers scoring below 60%
            </p>
          </div>
        </section>

        {/* Answer Review */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              Question-by-Question Feedback
            </h2>

            <p className="text-gray-400 mt-2">
              Review the score and AI feedback for each submitted answer.
            </p>
          </div>

          {answers.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-gray-400">
              No saved answers were found for this interview.
            </div>
          ) : (
            <div className="space-y-6">
              {answers.map((answer, index) => {
                const score = Number(answer.score || 0);

                const scoreColor =
                  score >= 80
                    ? "text-green-400 bg-green-950"
                    : score >= 60
                    ? "text-blue-400 bg-blue-950"
                    : score >= 40
                    ? "text-yellow-400 bg-yellow-950"
                    : "text-red-400 bg-red-950";

                return (
                  <article
                    key={`${interview.id}-${index}`}
                    className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-7"
                  >
                    {/* Question heading */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                      <div className="flex-1">
                        <p className="text-blue-400 text-sm font-semibold mb-2">
                          QUESTION {index + 1}
                        </p>

                        <h3 className="text-lg sm:text-xl font-bold leading-7">
                          {answer.question}
                        </h3>
                      </div>

                      <div
                        className={`rounded-xl px-4 py-3 text-center shrink-0 ${scoreColor}`}
                      >
                        <p className="text-2xl font-bold">{score}%</p>
                        <p className="text-xs">Answer Score</p>
                      </div>
                    </div>

                    {/* Score progress */}
                    <div className="mb-6">
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, Math.max(0, score))}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Candidate answer */}
                    <div className="bg-gray-950 border border-gray-800 rounded-xl p-5 mb-5">
                      <h4 className="text-sm font-bold text-gray-400 mb-3">
                        YOUR ANSWER
                      </h4>

                      <p className="text-gray-200 whitespace-pre-wrap leading-7">
                        {answer.answer?.trim()
                          ? answer.answer
                          : "No answer was provided."}
                      </p>
                    </div>

                    {/* AI feedback */}
                    <div className="border border-green-900/60 bg-green-950/20 rounded-xl p-5">
                      <h4 className="text-sm font-bold text-green-400 mb-3">
                        AI FEEDBACK
                      </h4>

                      <p className="text-gray-300 whitespace-pre-wrap leading-7">
                        {answer.feedback?.trim()
                          ? answer.feedback
                          : "No AI feedback was saved for this answer."}
                      </p>
                    </div>

                    {/* Improvement guidance */}
                    {score < 80 && (
                      <div className="mt-5 border border-yellow-900/50 bg-yellow-950/20 rounded-xl p-5">
                        <h4 className="text-sm font-bold text-yellow-400 mb-2">
                          SUGGESTED NEXT STEP
                        </h4>

                        <p className="text-gray-300 leading-7">
                          {score < 60
                            ? "Revise the fundamentals related to this question, prepare a structured answer, and practise explaining it in your own words."
                            : "Your answer shows progress. Add more technical details, a practical example, and a clear explanation to strengthen it."}
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Navigation */}
        <section className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center mt-12">
          <button
            onClick={() => router.push("/interview")}
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold transition"
          >
            Start New Interview
          </button>

          <button
            onClick={() => router.push("/history")}
            className="px-6 py-3 rounded-lg border border-gray-700 hover:bg-gray-800 font-semibold transition"
          >
            Interview History
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 rounded-lg border border-gray-700 hover:bg-gray-800 font-semibold transition"
          >
            Go to Dashboard
          </button>
        </section>

        <footer className="text-center text-gray-600 text-sm mt-12">
          MockMate AI · Your personal AI interview coach
        </footer>
      </div>
    </main>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
          <p className="text-blue-400">Loading interview review...</p>
        </main>
      }
    >
      <ReviewContent />
    </Suspense>
  );
}