"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface ResumeAnalysis {
  ats_score: number;
  summary: string;
  strengths: string[];
  missing_skills: string[];
  matched_skills: string[];
  suggestions: string[];
  keyword_match: number;
}

export default function ResumeAnalyzerPage() {
  const router = useRouter();

  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    setError("");
    setSuccess("");
    setAnalysis(null);

    if (!file) {
      setResume(null);
      return;
    }

    const allowedExtensions = [".pdf", ".docx"];
    const extension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setResume(null);
      event.target.value = "";
      setError("Please upload a PDF or DOCX resume.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResume(null);
      event.target.value = "";
      setError("Resume size must not exceed 5 MB.");
      return;
    }

    setResume(file);
  };

  const handleAnalyze = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setAnalysis(null);

    if (!resume) {
      setError("Please select your resume first.");
      return;
    }

    if (jobDescription.trim().length < 20) {
      setError("Please enter a job description with at least 20 characters.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("job_description", jobDescription.trim());

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/resume/analyze",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Resume analysis failed. Please try again."
        );
      }

      setAnalysis(data);
      setSuccess("Your resume analysis is complete!");
    } catch (err) {
      console.error("Resume analysis error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the backend. Please check your server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-bold tracking-widest text-blue-400">
              MOCKMATE AI
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              AI Resume Analyzer 📄
            </h1>
            <p className="mt-2 text-gray-400">
              Analyze your resume against your target job description.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-gray-700 px-4 py-3 transition hover:bg-gray-800"
          >
            ← Dashboard
          </button>
        </header>

        <section className="rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-8">
          <h2 className="text-xl font-bold">Analyze Your Resume</h2>

          <p className="mt-2 text-sm leading-6 text-gray-400">
            Upload your resume and paste the job description. Gemini will
            compare your skills and provide personalized suggestions.
          </p>

          <form onSubmit={handleAnalyze} className="mt-7 space-y-6">
            <div>
              <label
                htmlFor="resume"
                className="mb-3 block font-semibold"
              >
                Upload Resume (PDF or DOCX)
              </label>

              <input
                id="resume"
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="block w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white"
              />

              <p className="mt-2 text-xs text-gray-500">
                Maximum file size: 5 MB.
              </p>

              {resume && (
                <div className="mt-3 rounded-lg bg-gray-800 p-3 text-sm text-green-300">
                  Selected: {resume.name}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="jobDescription"
                className="mb-3 block font-semibold"
              >
                Target Job Description
              </label>

              <textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(event) => {
                  setJobDescription(event.target.value);
                  setAnalysis(null);
                  setSuccess("");
                }}
                placeholder="Paste the job title, required skills, qualifications, and responsibilities here..."
                rows={8}
                maxLength={30000}
                className="w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none transition focus:border-blue-500"
                required
              />

              <p className="mt-2 text-right text-xs text-gray-500">
                {jobDescription.length}/30000 characters
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-800 bg-red-950/50 p-4 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="rounded-xl border border-green-800 bg-green-950/50 p-4 text-sm text-green-300"
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-6 py-4 font-bold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Analyzing Resume with AI..."
                : "Analyze My Resume ✨"}
            </button>
          </form>
        </section>

        {analysis && (
          <section className="mt-8 space-y-6">
            <h2 className="text-2xl font-bold">Your Analysis Results</h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <ScoreCard
                title="ATS Compatibility Estimate"
                score={analysis.ats_score}
                description="Estimated alignment with the job requirements."
              />

              <ScoreCard
                title="Keyword Match"
                score={analysis.keyword_match}
                description="Estimated overlap with relevant job keywords."
              />
            </div>

            <ResultCard title="Resume Summary" icon="📋">
              <p className="leading-7 text-gray-300">
                {analysis.summary}
              </p>
            </ResultCard>

            <div className="grid gap-6 md:grid-cols-2">
              <ResultCard title="Matched Skills" icon="✅">
                <TagList
                  items={analysis.matched_skills}
                  emptyMessage="No matched skills were identified."
                  color="green"
                />
              </ResultCard>

              <ResultCard title="Skills to Develop" icon="🎯">
                <TagList
                  items={analysis.missing_skills}
                  emptyMessage="No missing skills were identified."
                  color="yellow"
                />
              </ResultCard>
            </div>

            <ResultCard title="Your Strengths" icon="💪">
              <BulletList items={analysis.strengths} />
            </ResultCard>

            <ResultCard title="AI Improvement Suggestions" icon="🚀">
              <BulletList items={analysis.suggestions} />
            </ResultCard>

            <p className="text-xs leading-5 text-gray-500">
              These scores are AI-generated estimates, not guarantees of ATS
              acceptance or hiring success. Review the suggestions and ensure
              all information in your resume is accurate.
            </p>

            <button
              type="button"
              onClick={() => {
                setAnalysis(null);
                setSuccess("");
                setError("");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="rounded-xl border border-gray-700 px-5 py-3 font-semibold transition hover:bg-gray-800"
            >
              Analyze Another Resume
            </button>
          </section>
        )}
      </div>
    </main>
  );
}

function ScoreCard({
  title,
  score,
  description,
}: {
  title: string;
  score: number;
  description: string;
}) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
      <p className="text-sm text-gray-400">{title}</p>

      <div className="mt-4 flex items-end gap-2">
        <span className="text-5xl font-bold text-blue-400">
          {safeScore}
        </span>
        <span className="mb-1 text-xl text-gray-400">/100</span>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-800">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-700"
          style={{ width: `${safeScore}%` }}
        />
      </div>

      <p className="mt-4 text-sm leading-6 text-gray-400">
        {description}
      </p>
    </div>
  );
}

function ResultCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
      <h3 className="mb-4 text-lg font-bold">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

function TagList({
  items,
  emptyMessage,
  color,
}: {
  items: string[];
  emptyMessage: string;
  color: "green" | "yellow";
}) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-gray-500">{emptyMessage}</p>;
  }

  const colorClass =
    color === "green"
      ? "border-green-800 bg-green-950/40 text-green-300"
      : "border-yellow-800 bg-yellow-950/40 text-yellow-300";

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className={`rounded-full border px-3 py-2 text-sm ${colorClass}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-gray-500">No items available.</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li
          key={`${index}-${item}`}
          className="flex gap-3 text-sm leading-6 text-gray-300"
        >
          <span className="text-blue-400">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}