"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Interview {
  id?: number;
  interview_id?: number;
  job_role: string;
  interview_type: string;
  difficulty: string;
  score: number;
  created_at: string;
}

interface DashboardData {
  total_interviews: number;
  average_score: number;
  best_score: number;
  recent_interviews: Interview[];
}

export default function InterviewHistoryPage() {
  const router = useRouter();

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    const loadHistory = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (!token || !userData) {
        router.replace("/login");
        return;
      }

      let user;

      try {
        user = JSON.parse(userData);
      } catch {
        localStorage.removeItem("user");
        router.replace("/login");
        return;
      }

      if (!user.id) {
        setError("Your user ID is missing. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8080/api/dashboard?user_id=${encodeURIComponent(
            user.id
          )}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            `Unable to load interview history. Server status: ${response.status}`
          );
        }

        const data: DashboardData = await response.json();

        setInterviews(
          Array.isArray(data.recent_interviews)
            ? data.recent_interviews
            : []
        );
      } catch (err) {
        console.error("Interview history error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load interview history."
        );
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [router]);

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch = interview.job_role
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesType =
      typeFilter === "All" ||
      interview.interview_type.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesType;
  });

  const averageScore =
    interviews.length > 0
      ? interviews.reduce((total, interview) => total + interview.score, 0) /
        interviews.length
      : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <main className="min-h-screen bg-gray-950 px-5 py-10 text-white sm:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-blue-400">MockMate AI</p>

            <h1 className="mt-2 text-4xl font-bold">Interview History</h1>

            <p className="mt-2 text-gray-400">
              Review your previous interviews and track your progress.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-lg border border-gray-700 px-5 py-3 transition hover:bg-gray-800"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-gray-400">Interviews Loaded</p>
            <h2 className="mt-2 text-3xl font-bold">
              {loading ? "..." : interviews.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-gray-400">Average Score</p>
            <h2 className="mt-2 text-3xl font-bold text-blue-400">
              {loading ? "..." : `${averageScore.toFixed(0)}%`}
            </h2>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-gray-400">Completed Interviews</p>
            <h2 className="mt-2 text-3xl font-bold text-green-400">
              {loading ? "..." : interviews.length}
            </h2>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by job role..."
            className="flex-1 rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 outline-none focus:border-blue-500"
          />

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="All">All Interview Types</option>
            <option value="Technical">Technical</option>
            <option value="HR">HR</option>
            <option value="Mixed">Mixed</option>
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-10 text-center text-gray-400">
            Loading your interview history...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-700 bg-red-900/30 p-5 text-red-200">
            <p className="font-semibold">Unable to load interview history</p>
            <p className="mt-2">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-700 px-4 py-2 hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredInterviews.length === 0 && (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-10 text-center">
            <div className="mb-4 text-5xl">📋</div>

            <h2 className="text-xl font-bold">
              {interviews.length === 0
                ? "No interviews found"
                : "No matching interviews"}
            </h2>

            <p className="mt-2 text-gray-400">
              {interviews.length === 0
                ? "Complete an interview to see it in your history."
                : "Try changing your search or interview type filter."}
            </p>

            <button
              onClick={() => router.push("/interview")}
              className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700"
            >
              Start New Interview
            </button>
          </div>
        )}

        {/* Interview Table */}
        {!loading && !error && filteredInterviews.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-gray-800 bg-gray-900">
                  <tr className="text-sm text-gray-400">
                    <th className="px-5 py-4">Job Role</th>
                    <th className="px-5 py-4">Interview Type</th>
                    <th className="px-5 py-4">Difficulty</th>
                    <th className="px-5 py-4">Score</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredInterviews.map((interview, index) => {
                    const interviewId =
                      interview.interview_id ?? interview.id;

                    return (
                      <tr
                        key={
                          interviewId ??
                          `${interview.created_at}-${index}`
                        }
                        className="border-b border-gray-800 transition last:border-0 hover:bg-gray-800/50"
                      >
                        <td className="px-5 py-5 font-semibold">
                          {interview.job_role}
                        </td>

                        <td className="px-5 py-5">
                          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-sm text-blue-300">
                            {interview.interview_type}
                          </span>
                        </td>

                        <td className="px-5 py-5 text-gray-300">
                          {interview.difficulty}
                        </td>

                        <td
                          className={`px-5 py-5 font-bold ${getScoreColor(
                            interview.score
                          )}`}
                        >
                          {interview.score}%
                        </td>

                        <td className="whitespace-nowrap px-5 py-5 text-sm text-gray-400">
                          {interview.created_at
                            ? new Date(
                                interview.created_at
                              ).toLocaleDateString()
                            : "—"}
                        </td>

                        {/* View Review Button */}
                        <td className="whitespace-nowrap px-5 py-5">
                          {interviewId ? (
                            <Link
                              href={`/review?interview_id=${interviewId}`}
                              className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                              View Review
                            </Link>
                          ) : (
                            <span className="text-sm text-gray-500">
                              Review unavailable
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Start New Interview */}
        <div className="mt-8">
          <button
            onClick={() => router.push("/interview")}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-700"
          >
            + Start New Interview
          </button>
        </div>
      </div>
    </main>
  );
}