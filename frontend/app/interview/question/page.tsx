"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:8080";
const TOTAL_QUESTIONS = 5;

interface InterviewPreferences {
  jobRole: string;
  interviewType: string;
  difficulty: string;
}

interface UserData {
  id: number;
  name?: string;
  email?: string;
}

interface InterviewAnswer {
  question: string;
  answer: string;
  score: number;
  feedback: string;
}

interface AdaptiveQuestionResponse {
  question: string;
  difficulty: string;
  reason: string;
  previous_answer_score: number;
}

interface EvaluationResponse {
  score: number;
  feedback: string;
}

export default function QuestionPage() {
  const router = useRouter();

  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);

  const [jobRole, setJobRole] = useState("Software Developer");
  const [interviewType, setInterviewType] = useState("Technical Interview");
  const [difficulty, setDifficulty] = useState("Beginner");

  const [questionReason, setQuestionReason] = useState("");
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);

  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
 const [isInitialized, setIsInitialized] = useState(false);

  // Generate an adaptive question.
  const generateQuestion = useCallback(
    async (
      questionNumber: number,
      currentDifficulty: string,
      previousAnswer: InterviewAnswer | null,
      role: string,
      type: string
    ): Promise<boolean> => {
      setIsLoadingQuestion(true);
      setErrorMessage("");
      setEvaluation(null);
      setAnswer("");
      setQuestion("");
      setQuestionReason("");

      try {
        const response = await fetch(
          `${API_URL}/api/interviews/adaptive-question`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              job_role: role,
              interview_type: type,
              difficulty: currentDifficulty,
              previous_question: previousAnswer?.question || "",
              previous_answer: previousAnswer?.answer || "",
              previous_score: previousAnswer?.score ?? 0,
              question_number: questionNumber,
            }),
          }
        );

        if (!response.ok) {
          const message = await response.text();
          throw new Error(
            message || "Gemini could not generate the question."
          );
        }

        const data: AdaptiveQuestionResponse = await response.json();

        if (!data.question) {
          throw new Error("The AI returned an empty question.");
        }

        setQuestion(data.question);
        setQuestionReason(data.reason || "");
        setDifficulty(data.difficulty || currentDifficulty);

        return true;
      } catch (error) {
        console.error("Question generation failed:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to generate the interview question."
        );

        return false;
      } finally {
        setIsLoadingQuestion(false);
      }
    },
    []
  );

  // Load preferences and initialize the interview.
  useEffect(() => {
    const savedPreferences = localStorage.getItem("interviewPreferences");

    let preferences: InterviewPreferences = {
      jobRole: "Software Developer",
      interviewType: "Technical Interview",
      difficulty: "Beginner",
    };

    if (savedPreferences) {
      try {
        preferences = {
          ...preferences,
          ...JSON.parse(savedPreferences),
        };
      } catch (error) {
        console.error("Unable to load preferences:", error);
      }
    }

    const role = preferences.jobRole || "Software Developer";
    const type = preferences.interviewType || "Technical Interview";
    const level = preferences.difficulty || "Beginner";

    setJobRole(role);
    setInterviewType(type);
    setDifficulty(level);

    const initializeInterview = async () => {
      await generateQuestion(1, level, null, role, type);
      setIsInitialized(true);
    };

    void initializeInterview();
  }, [generateQuestion]);

  // Evaluate the answer immediately using Gemini.
  const submitAnswer = async () => {
    if (!answer.trim()) {
      setErrorMessage("Please enter your answer before submitting.");
      return;
    }

    if (isEvaluating || isSaving || !question) return;

    setIsEvaluating(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/interviews/evaluate-answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question,
            answer: answer.trim(),
          }),
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          message || "The AI could not evaluate your answer."
        );
      }

      const result: EvaluationResponse = await response.json();

      if (
        typeof result.score !== "number" ||
        !Number.isFinite(result.score)
      ) {
        throw new Error("The AI returned an invalid score.");
      }

      const boundedScore = Math.max(
        0,
        Math.min(100, Math.round(result.score))
      );

      const evaluatedAnswer: InterviewAnswer = {
        question,
        answer: answer.trim(),
        score: boundedScore,
        feedback: result.feedback || "No additional feedback was provided.",
      };

      setEvaluation({
        score: boundedScore,
        feedback: evaluatedAnswer.feedback,
      });

      setAnswers((previous) => {
        const updated = [...previous];
        updated[currentQuestion - 1] = evaluatedAnswer;
        return updated;
      });
    } catch (error) {
      console.error("Answer evaluation failed:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to evaluate your answer."
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  // Generate the next adaptive question.
  const nextQuestion = async () => {
    if (!evaluation || currentQuestion >= TOTAL_QUESTIONS) return;

    const previousAnswer = answers[currentQuestion - 1];

    if (!previousAnswer) {
      setErrorMessage("Your evaluated answer could not be found.");
      return;
    }

    const nextNumber = currentQuestion + 1;

    const success = await generateQuestion(
      nextNumber,
      difficulty,
      previousAnswer,
      jobRole,
      interviewType
    );

    if (success) {
      setCurrentQuestion(nextNumber);
    }
  };

  // Save the completed interview.
  const finishInterview = async () => {
    if (isSaving || !evaluation) return;

    const userData = localStorage.getItem("user");

    if (!userData) {
      alert("Please log in before finishing the interview.");
      router.push("/login");
      return;
    }

    let user: UserData;

    try {
      user = JSON.parse(userData);
    } catch {
      alert("Your login information is invalid. Please log in again.");
      router.push("/login");
      return;
    }

    if (!user.id) {
      alert("User ID is missing. Please log in again.");
      router.push("/login");
      return;
    }

    const finalAnswers = [...answers];

    finalAnswers[currentQuestion - 1] = {
      question,
      answer: answer.trim(),
      score: evaluation.score,
      feedback: evaluation.feedback,
    };

    const completedAnswers = finalAnswers.filter(
      (item) =>
        item &&
        item.question.trim() !== "" &&
        item.answer.trim() !== ""
    );

    if (completedAnswers.length === 0) {
      setErrorMessage("No completed answers were found.");
      return;
    }

    const averageScore = Math.round(
      completedAnswers.reduce(
        (total, item) => total + item.score,
        0
      ) / completedAnswers.length
    );

    setIsSaving(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${API_URL}/api/interviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          job_role: jobRole,
          interview_type: interviewType,
          difficulty,
          score: averageScore,
          answers: completedAnswers,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          message || "The backend could not save your interview."
        );
      }

      const data = await response.json();

      const finalScore =
        typeof data.score === "number" ? data.score : averageScore;

      localStorage.setItem(
        "latestInterviewResult",
        JSON.stringify({
          score: finalScore,
          jobRole,
          interviewType,
          difficulty,
          totalQuestions: TOTAL_QUESTIONS,
          answeredQuestions: completedAnswers.length,
          interviewId: data.interview_id,
        })
      );

      router.replace("/interview/result");
    } catch (error) {
      console.error("Error saving interview:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save the interview."
      );

      setIsSaving(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <main className="min-h-screen bg-gray-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-blue-400">MockMate AI</p>
            <h1 className="text-3xl font-bold">{interviewType}</h1>
            <p className="mt-2 text-gray-400">
              {jobRole} · {difficulty}
            </p>
          </div>

          <div className="text-right">
            <p className="text-gray-400">
              Question {currentQuestion} / {TOTAL_QUESTIONS}
            </p>

            <div className="mt-2 h-2 w-40 overflow-hidden rounded-full bg-gray-800">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{
                  width: `${(currentQuestion / TOTAL_QUESTIONS) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-full bg-blue-950 px-4 py-2 text-sm text-blue-300">
              AI Adaptive Interview
            </span>

            <span className="rounded-full bg-gray-800 px-4 py-2 text-sm text-gray-300">
              Difficulty: {difficulty}
            </span>
          </div>

          {isLoadingQuestion ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-blue-500" />

              <h2 className="text-xl font-semibold">
                Gemini is preparing your question...
              </h2>

              <p className="mt-3 text-gray-400">
                Please wait while your personalized question is generated.
              </p>
            </div>
          ) : errorMessage && !question ? (
            <div className="py-8 text-center">
              <p className="text-red-400">{errorMessage}</p>

              <button
                onClick={() =>
                  generateQuestion(
                    currentQuestion,
                    difficulty,
                    currentQuestion > 1
                      ? answers[currentQuestion - 2] || null
                      : null,
                    jobRole,
                    interviewType
                  )
                }
                className="mt-5 rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
              >
                Retry Generating Question
              </button>
            </div>
          ) : (
            <>
              <p className="mb-3 text-sm text-blue-400">
                Question {currentQuestion}
              </p>

              <h2 className="mb-6 text-2xl font-semibold leading-relaxed">
                {question}
              </h2>

              {questionReason && (
                <p className="mb-6 text-sm text-gray-400">
                  AI interviewer: {questionReason}
                </p>
              )}

              <textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="Type your answer here..."
                disabled={
                  evaluation !== null || isEvaluating || isSaving
                }
                className="h-48 w-full rounded-lg border border-gray-700 bg-gray-800 p-4 text-white outline-none focus:border-blue-500 disabled:opacity-70"
              />

              {evaluation && (
                <div className="mt-6 rounded-xl border border-gray-700 bg-gray-800 p-6">
                  <h3 className="text-xl font-bold">
                    AI Answer Evaluation
                  </h3>

                  <p
                    className={`mt-4 text-4xl font-bold ${getScoreColor(
                      evaluation.score
                    )}`}
                  >
                    {evaluation.score}/100
                  </p>

                  <div className="mt-5">
                    <h4 className="font-semibold text-blue-300">
                      Feedback
                    </h4>

                    <p className="mt-2 whitespace-pre-wrap leading-relaxed text-gray-300">
                      {evaluation.feedback}
                    </p>
                  </div>

                  <div className="mt-5 rounded-lg bg-gray-900 p-4">
                    <h4 className="font-semibold">Performance guide</h4>

                    <p className="mt-2 text-sm text-gray-400">
                      {evaluation.score >= 80
                        ? "Great work! Your next question may be more challenging."
                        : evaluation.score >= 50
                          ? "Good effort! Your next question will generally remain at a similar difficulty."
                          : "Keep practising! Your next question may focus on more fundamental concepts."}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-wrap justify-end gap-4">
                {!evaluation ? (
                  <button
                    onClick={submitAnswer}
                    disabled={
                      isEvaluating || isSaving || !answer.trim()
                    }
                    className="rounded-lg bg-blue-600 px-8 py-3 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isEvaluating
                      ? "Evaluating with AI..."
                      : "Submit Answer"}
                  </button>
                ) : currentQuestion < TOTAL_QUESTIONS ? (
                  <button
                    onClick={nextQuestion}
                    disabled={isLoadingQuestion || isSaving}
                    className="rounded-lg bg-green-600 px-8 py-3 font-semibold hover:bg-green-700 disabled:opacity-50"
                  >
                    {isLoadingQuestion
                      ? "Generating..."
                      : "Next Adaptive Question"}
                  </button>
                ) : (
                  <button
                    onClick={finishInterview}
                    disabled={isSaving || isLoadingQuestion}
                    className="rounded-lg bg-green-600 px-8 py-3 font-semibold hover:bg-green-700 disabled:opacity-50"
                  >
                    {isSaving ? "Saving Interview..." : "Finish Interview"}
                  </button>
                )}
              </div>

              {isEvaluating && (
                <p className="mt-4 text-center text-blue-400">
                  Gemini is evaluating your answer...
                </p>
              )}

              {isSaving && (
                <p className="mt-4 text-center text-blue-400">
                  Saving your interview and answers...
                </p>
              )}

              {errorMessage && (
                <div className="mt-5 rounded-lg border border-red-800 bg-red-950 p-4">
                  <p className="text-red-300">{errorMessage}</p>

                  {!evaluation && !isEvaluating && (
                    <button
                      onClick={submitAnswer}
                      disabled={!answer.trim()}
                      className="mt-3 rounded bg-red-800 px-4 py-2 text-sm hover:bg-red-700 disabled:opacity-50"
                    >
                      Retry Evaluation
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {answers.some(Boolean) && (
          <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <h3 className="text-lg font-bold">Your Progress</h3>

            <div className="mt-4 space-y-3">
              {answers.map((item, index) =>
                item ? (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-4 rounded-lg bg-gray-800 p-4"
                  >
                    <div>
                      <p className="font-medium">
                        Question {index + 1}
                      </p>

                      <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                        {item.question}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 font-bold ${getScoreColor(
                        item.score
                      )}`}
                    >
                      {item.score}/100
                    </span>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}