"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

interface Interview {
  id?: number;
  interview_id?: number;
  job_role: string;
  interview_type: string;
  difficulty: string;
  score: number;
  created_at: string;
}

interface ScoreTrend {
  interview_id: number;
  score: number;
  created_at: string;
}

interface TypePerformance {
  interview_type: string;
  interview_count: number;
  average_score: number;
}

interface DashboardData {
  total_interviews: number;
  average_score: number;
  best_score: number;
  recent_interviews: Interview[];
  score_trend: ScoreTrend[];
  type_performance: TypePerformance[];
  recommendations: string[];
}

const initialDashboard: DashboardData = {
  total_interviews: 0,
  average_score: 0,
  best_score: 0,
  recent_interviews: [],
  score_trend: [],
  type_performance: [],
  recommendations: [],
};

export default function DashboardPage() {
  const router = useRouter();

  const [userName, setUserName] = useState("");
  const [dashboard, setDashboard] =
    useState<DashboardData>(initialDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (!token || !userData) {
        router.replace("/login");
        return;
      }

      let user: { id?: string | number; name?: string };

      try {
        user = JSON.parse(userData);
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      setUserName(user.name || "");

      if (user.id == null || user.id === "") {
        setError("Your user ID is missing. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8080/api/dashboard?user_id=${encodeURIComponent(
            String(user.id)
          )}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Dashboard request failed: ${response.status}`
          );
        }

        const data = await response.json();

        setDashboard({
          total_interviews: Number(data.total_interviews ?? 0),
          average_score: Number(data.average_score ?? 0),
          best_score: Number(data.best_score ?? 0),
          recent_interviews: Array.isArray(data.recent_interviews)
            ? data.recent_interviews
            : [],
          score_trend: Array.isArray(data.score_trend)
            ? data.score_trend
            : [],
          type_performance: Array.isArray(data.type_performance)
            ? data.type_performance
            : [],
          recommendations: Array.isArray(data.recommendations)
            ? data.recommendations
            : [],
        });
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(
          "Unable to load analytics. Please check whether the Go backend is running on port 8080."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleViewReview = (interview: Interview) => {
    const interviewId = interview.interview_id ?? interview.id;

    if (interviewId == null) {
      alert("Interview ID is missing. Please check the backend API.");
      return;
    }

    router.push(
      `/review?interview_id=${encodeURIComponent(String(interviewId))}`
    );
  };

  const chartData = dashboard.score_trend.map((item, index) => ({
    name: `Interview ${index + 1}`,
    score: Number(item.score),
    date: item.created_at
      ? new Date(item.created_at).toLocaleDateString()
      : "",
  }));

  const typeChartData = dashboard.type_performance.map((item) => ({
    name: item.interview_type,
    average: Number(Number(item.average_score).toFixed(1)),
    count: item.interview_count,
  }));

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-bold tracking-widest text-blue-400">
              MOCKMATE AI
            </p>

            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Welcome, {userName}! 👋
            </h1>

            <p className="mt-2 text-gray-400">
              Track your interview preparation and performance.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/interview")}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-700"
            >
              + Start Interview
            </button>

            <button
              onClick={() => router.push("/resume")}
              className="rounded-xl border border-purple-600 px-5 py-3 font-semibold text-purple-300 transition hover:bg-purple-900/30"
            >
              📄 Resume Analyzer
            </button>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-red-700 px-5 py-3 font-semibold text-red-300 transition hover:bg-red-900/40"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-700 bg-red-950/50 p-4 text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-10 text-center text-gray-400">
            Loading your analytics dashboard...
          </div>
        ) : (
          <>
            {/* Statistics cards */}
            <section className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Total Interviews"
                value={String(dashboard.total_interviews)}
                subtitle="Interviews completed"
                icon="🎯"
              />

              <StatCard
                title="Average Score"
                value={`${dashboard.average_score.toFixed(1)}%`}
                subtitle="Across your interviews"
                icon="📊"
              />

              <StatCard
                title="Best Score"
                value={`${dashboard.best_score}%`}
                subtitle="Your highest score"
                icon="🏆"
              />
            </section>

            {/* Analytics charts */}
            <section className="mb-8 grid gap-6 lg:grid-cols-2">
              {/* Interview score trend */}
              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-6">
                <h2 className="text-xl font-bold">
                  Interview Score Trend
                </h2>

                <p className="mb-6 mt-1 text-sm text-gray-400">
                  Scores from your recent interviews
                </p>

                {chartData.length === 0 ? (
                  <EmptyChartMessage />
                ) : (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{
                          top: 10,
                          right: 15,
                          left: -15,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#374151"
                        />

                        <XAxis
                          dataKey="name"
                          stroke="#9CA3AF"
                          tick={{ fontSize: 11 }}
                        />

                        <YAxis
                          domain={[0, 100]}
                          stroke="#9CA3AF"
                          tick={{ fontSize: 12 }}
                        />

                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#111827",
                            border: "1px solid #374151",
                            borderRadius: "10px",
                            color: "#FFFFFF",
                          }}
                          formatter={(value) => [
                            `${value}%`,
                            "Score",
                          ]}
                          labelFormatter={(label, payload) => {
                            const date = payload?.[0]?.payload?.date;

                            return date ? `${label} · ${date}` : label;
                          }}
                        />

                        <Legend />

                        <Line
                          type="monotone"
                          dataKey="score"
                          name="Interview Score"
                          stroke="#60A5FA"
                          strokeWidth={3}
                          dot={{ r: 5, fill: "#60A5FA" }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Performance by interview type */}
              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-6">
                <h2 className="text-xl font-bold">
                  Performance by Interview Type
                </h2>

                <p className="mb-6 mt-1 text-sm text-gray-400">
                  Average score for each interview type
                </p>

                {typeChartData.length === 0 ? (
                  <EmptyChartMessage />
                ) : (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={typeChartData}
                        margin={{
                          top: 10,
                          right: 10,
                          left: -15,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#374151"
                        />

                        <XAxis
                          dataKey="name"
                          stroke="#9CA3AF"
                          tick={{ fontSize: 12 }}
                        />

                        <YAxis
                          domain={[0, 100]}
                          stroke="#9CA3AF"
                          tick={{ fontSize: 12 }}
                        />

                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#111827",
                            border: "1px solid #374151",
                            borderRadius: "10px",
                            color: "#FFFFFF",
                          }}
                          formatter={(value) => [
                            `${value}%`,
                            "Average Score",
                          ]}
                        />

                        <Bar
                          dataKey="average"
                          name="Average Score"
                          fill="#818CF8"
                          radius={[8, 8, 0, 0]}
                          maxBarSize={65}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </section>

            {/* Performance recommendations */}
            <section className="mb-8 rounded-2xl border border-blue-900 bg-gradient-to-br from-blue-950/70 to-gray-900 p-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                Performance Insights
              </p>

              <h2 className="mb-2 mt-2 text-2xl font-bold">
                Recommended Improvements 💡
              </h2>

              <p className="mb-5 text-sm text-gray-400">
                Suggestions based on your interview scores and progress.
              </p>

              {dashboard.recommendations.length === 0 ? (
                <p className="text-gray-300">
                  Complete an interview to receive performance suggestions.
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {dashboard.recommendations.map((item, index) => (
                    <div
                      key={`${index}-${item}`}
                      className="flex gap-3 rounded-xl border border-gray-800 bg-gray-900/80 p-4"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-900 text-blue-300">
                        {index + 1}
                      </span>

                      <p className="text-sm leading-6 text-gray-200">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Recent interviews */}
            <section className="mb-8 rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">
                  Recent Interviews
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  View your previous interview results and feedback.
                </p>
              </div>

              {dashboard.recent_interviews.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-700 p-8 text-center">
                  <p className="text-gray-300">No interviews yet.</p>

                  <button
                    onClick={() => router.push("/interview")}
                    className="mt-4 rounded-lg bg-blue-600 px-5 py-2 font-semibold hover:bg-blue-700"
                  >
                    Start Your First Interview
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboard.recent_interviews.map(
                    (interview, index) => (
                      <div
                        key={
                          interview.interview_id ??
                          interview.id ??
                          `${interview.created_at}-${index}`
                        }
                        className="flex flex-col gap-4 rounded-xl border border-gray-800 p-4 transition hover:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <h3 className="font-semibold">
                            {interview.job_role}
                          </h3>

                          <p className="mt-1 text-sm text-gray-400">
                            {interview.interview_type} Interview ·{" "}
                            {interview.difficulty}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {interview.created_at
                              ? new Date(
                                  interview.created_at
                                ).toLocaleDateString()
                              : "Date unavailable"}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`rounded-lg px-3 py-2 text-sm font-bold ${
                              interview.score >= 80
                                ? "bg-green-900/40 text-green-400"
                                : interview.score >= 60
                                  ? "bg-yellow-900/40 text-yellow-400"
                                  : "bg-red-900/40 text-red-400"
                            }`}
                          >
                            {interview.score}%
                          </span>

                          <button
                            onClick={() => handleViewReview(interview)}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold transition hover:bg-blue-700"
                          >
                            View Review
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </section>

            {/* Footer actions */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => router.push("/interview")}
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-700"
              >
                Start New Interview →
              </button>

              <button
                onClick={() => router.push("/resume")}
                className="rounded-xl border border-purple-600 px-6 py-3 font-semibold text-purple-300 transition hover:bg-purple-900/30"
              >
                📄 Analyze My Resume →
              </button>

              <button
                onClick={() => window.location.reload()}
                className="rounded-xl border border-gray-700 px-6 py-3 font-semibold transition hover:bg-gray-800"
              >
                Refresh Analytics ↻
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 transition hover:border-blue-800">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>

      <h2 className="mt-4 text-3xl font-bold">{value}</h2>

      <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

function EmptyChartMessage() {
  return (
    <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-gray-700 px-6 text-center">
      <div>
        <p className="font-semibold text-gray-300">
          No analytics data yet
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Complete an interview to see your results here.
        </p>
      </div>
    </div>
  );
}