"use client";

import { useRouter } from "next/navigation";

export default function Home() {

  const router = useRouter();
  
  const features = [
    {
      icon: "🤖",
      title: "AI Interviewer",
      description:
        "Practice with intelligent AI-generated questions tailored to your role, skills, and experience.",
      color: "from-violet-500 to-purple-600",
    },

    {
      icon: "⚡",
      title: "Instant Feedback",
      description:
        "Get immediate feedback on your answers, technical accuracy, communication, and problem-solving.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: "📈",
      title: "Personalized Growth",
      description:
        "Track your performance, discover weak areas, and improve with personalized recommendations.",
      color: "from-fuchsia-500 to-pink-500",
    },
  ];

  const steps = [
    {
      number: "01",
      icon: "🎯",
      title: "Choose Your Role",
      description: "Select your dream job and interview difficulty.",
    },
    {
      number: "02",
      icon: "🎙️",
      title: "Start Interview",
      description: "Experience a realistic AI-powered interview.",
    },
    {
      number: "03",
      icon: "💬",
      title: "Answer Questions",
      description: "Show your skills with thoughtful answers.",
    },
    {
      number: "04",
      icon: "🏆",
      title: "Get Feedback",
      description: "Review your scores and improve your skills.",
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#070816] text-white selection:bg-violet-500/40">
      {/* BACKGROUND EFFECTS */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-48 top-20 h-[500px] w-[500px] rounded-full bg-violet-700/20 blur-[150px]" />
        <div className="absolute right-[-180px] top-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[150px]" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-fuchsia-700/10 blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139,92,246,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.35) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage:
              "linear-gradient(to bottom, black, transparent 80%)",
          }}
        />
      </div>

      {/* NAVBAR */}
      <header className="relative z-20 border-b border-white/[0.08] bg-[#08091a]/70 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <button
            onClick={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
            className="group flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-300/30 bg-gradient-to-br from-violet-500 via-purple-600 to-blue-600 text-2xl shadow-lg shadow-violet-600/30 transition duration-300 group-hover:rotate-6 group-hover:scale-110">
              ✦
            </div>

            <div className="text-left">
              <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                MockMate
                <span className="text-violet-400"> AI</span>
              </h1>

              <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-slate-500">
                Your interview companion
              </p>
            </div>
          </button>

          <div className="flex items-center gap-3 sm:gap-5">
            <button
              onClick={() => router.push("/login")}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white sm:px-5"
            >
              Login
            </button>

            <button
              onClick={() => router.push("/interview")}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2.5 text-sm font-bold shadow-lg shadow-violet-600/25 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/40 sm:px-6"
            >
              <span className="relative z-10">Get Started ↗</span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-blue-500 to-fuchsia-500 transition-transform duration-500 group-hover:translate-x-0" />
            </button>
          </div>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-16 sm:px-8 sm:pt-24 lg:px-12 lg:pb-32 lg:pt-28">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          {/* LEFT CONTENT */}
          <div className="relative z-10">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/[0.09] px-4 py-2 text-sm text-violet-200 shadow-lg shadow-violet-950/30 backdrop-blur-xl">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              AI-Powered Interview Preparation
            </div>

            <h2 className="max-w-2xl text-5xl font-black leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              Practice
              <span className="block">Interviews.</span>

              <span className="mt-2 block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400 bg-clip-text pb-2 text-transparent">
                Improve Your
              </span>

              <span className="block">Skills. Get Hired.</span>
            </h2>

            <p className="mt-7 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
              Turn interview anxiety into confidence. Practice with your
              personal AI interviewer, receive instant feedback, and take
              the next step toward your dream career.
            </p>

            {/* HERO BUTTONS */}
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => router.push("/interview")}
                className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 px-7 py-4 font-bold shadow-xl shadow-violet-700/30 transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl hover:shadow-violet-500/30"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-blue-500 to-fuchsia-500 transition-transform duration-500 group-hover:translate-x-0" />

                <span className="relative">Start Mock Interview</span>

                <span className="relative transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>

              <button
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-7 py-4 font-semibold text-slate-200 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-violet-400/50 hover:bg-white/[0.08]"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-violet-400/50 text-xs text-violet-300">
                  ↓
                </span>
                Explore Features
              </button>
            </div>

            {/* TRUST INDICATORS */}
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                AI-powered practice
              </div>

              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Instant evaluation
              </div>

              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Track your progress
              </div>
            </div>
          </div>

          {/* RIGHT: 3D INTERVIEW PREVIEW */}
          <div className="relative mx-auto w-full max-w-[540px] [perspective:1400px]">
            <div className="absolute -inset-8 rounded-[50px] bg-gradient-to-br from-violet-600/25 via-blue-500/10 to-fuchsia-600/25 blur-3xl" />

            {/* INTERVIEW WINDOW */}
            <div className="animate-float relative rounded-[30px] border border-white/[0.14] bg-gradient-to-br from-white/[0.11] to-white/[0.025] p-3 shadow-2xl shadow-violet-950/60 backdrop-blur-2xl transition duration-500 hover:[transform:rotateY(-2deg)_rotateX(2deg)_translateY(-5px)] sm:p-4">
              {/* WINDOW HEADER */}
              <div className="flex items-center justify-between rounded-t-[22px] border-b border-white/[0.08] bg-[#0b0d20]/90 px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-400 shadow-sm shadow-rose-400/40" />
                  <span className="h-3 w-3 rounded-full bg-amber-300 shadow-sm shadow-amber-300/40" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/40" />
                </div>

                <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-slate-400">
                  <span className="text-emerald-400">●</span>
                  MockMate Interview
                </div>

                <span className="text-lg text-slate-500">⋯</span>
              </div>

              {/* INTERVIEW CONTENT */}
              <div className="rounded-b-[22px] bg-[#0b0d20]/90 p-5 sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                      LIVE INTERVIEW
                    </div>

                    <h3 className="mt-2 text-xl font-bold sm:text-2xl">
                      Software Developer
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Technical Round · Intermediate
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] px-3 py-2 text-xs font-semibold text-emerald-300">
                    ● Active
                  </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="mt-7">
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-slate-400">
                      Interview progress
                    </span>

                    <span className="font-semibold text-violet-300">
                      60%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
                    <div className="h-full w-[60%] rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-blue-500 shadow-lg shadow-violet-500/50" />
                  </div>

                  <div className="mt-2 text-xs text-slate-500">
                    Question 3 of 5
                  </div>
                </div>

                {/* AI QUESTION */}
                <div className="relative mt-7 overflow-hidden rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.13] to-blue-500/[0.05] p-5">
                  <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl" />

                  <div className="relative flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 text-lg shadow-lg shadow-violet-700/30">
                      ✦
                    </div>

                    <div>
                      <p className="text-sm font-bold text-violet-200">
                        AI Interviewer
                      </p>

                      <p className="text-xs text-slate-500">
                        Personalized question
                      </p>
                    </div>
                  </div>

                  <p className="relative mt-5 text-base font-medium leading-7 text-slate-200 sm:text-lg">
                    &quot;Can you explain the difference between
                    abstraction and encapsulation in object-oriented
                    programming?&quot;
                  </p>

                  <div className="relative mt-5 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
                      OOP
                    </span>

                    <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
                      Technical
                    </span>
                  </div>
                </div>

                {/* ANSWER AREA */}
                <div className="mt-5 rounded-2xl border border-white/[0.09] bg-white/[0.025] p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-300">
                      Your Answer
                    </span>

                    <span className="text-xs text-slate-500">
                      Text response
                    </span>
                  </div>

                  <div className="min-h-[68px] rounded-xl border border-white/[0.08] bg-[#080a19] p-4 text-sm leading-6 text-slate-500">
                    Type your answer here and let AI evaluate your
                    response...
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-500">
                      ✦ AI evaluation enabled
                    </span>

                    <div className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2.5 text-xs font-bold shadow-lg shadow-violet-700/20">
                      Submit Answer →
                    </div>
                  </div>
                </div>

                {/* BOTTOM STATUS */}
                <div className="mt-5 flex items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="text-emerald-400">●</span>
                    AI is ready to evaluate
                  </div>

                  <span className="text-xs text-slate-500">
                    Powered by AI ✦
                  </span>
                </div>
              </div>
            </div>

            {/* AI FEEDBACK CARD - PERFORMANCE BOX REMOVED */}
            <div className="animate-float absolute -bottom-7 -right-2 rounded-2xl border border-violet-400/20 bg-[#17152d]/95 p-4 shadow-2xl shadow-violet-950/50 backdrop-blur-2xl sm:-right-5 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 text-xl">
                  ✨
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    AI Feedback
                  </p>

                  <p className="mt-1 text-xs text-emerald-300">
                    Great explanation!
                  </p>
                </div>

                <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
                  ✓
                </div>
              </div>
            </div>

            {/* DECORATIVE ORBS */}
            <div className="absolute -right-3 top-10 h-5 w-5 rounded-full bg-blue-400 shadow-lg shadow-blue-400/60 sm:-right-8" />

            <div className="absolute -bottom-12 left-20 h-4 w-4 rounded-full bg-fuchsia-400 shadow-lg shadow-fuchsia-400/60" />
          </div>
        </div>

        {/* HERO METRICS */}
        <div className="mt-28 grid grid-cols-2 gap-4 border-t border-white/[0.08] pt-8 sm:grid-cols-4 sm:gap-8">
          {[
            {
              value: "AI-Powered",
              label: "Smart Interview Practice",
            },
            {
              value: "Real-Time",
              label: "Instant Answer Feedback",
            },
            {
              value: "Personalized",
              label: "Role-Based Questions",
            },
            {
              value: "Progress",
              label: "Performance Tracking",
            },
          ].map((item) => (
            <div
              key={item.value}
              className="py-3 text-center sm:text-left"
            >
              <p className="bg-gradient-to-r from-violet-300 to-blue-300 bg-clip-text text-lg font-extrabold text-transparent sm:text-xl">
                {item.value}
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section
        id="features"
        className="relative z-10 scroll-mt-20 border-t border-white/[0.06] bg-gradient-to-b from-[#0c0d20]/70 to-[#080816]/80 px-5 py-24 sm:px-8 lg:px-12 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/[0.08] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
              ✦ Powerful Features
            </div>

            <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-400 sm:text-lg">
              Your personal AI-powered career coach, designed to help
              you perform with confidence at every interview.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-3xl border border-white/[0.09] bg-gradient-to-br from-white/[0.07] to-white/[0.015] p-7 shadow-xl transition duration-500 hover:-translate-y-3 hover:border-violet-400/30 hover:shadow-2xl hover:shadow-violet-500/20"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className={`absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br ${feature.color} opacity-[0.08] blur-3xl transition duration-500 group-hover:opacity-25`}
                />

                <div
                  className={`relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br ${feature.color} text-3xl shadow-lg transition duration-500 group-hover:rotate-6 group-hover:scale-110`}
                >
                  {feature.icon}
                </div>

                <h3 className="relative mt-7 text-xl font-extrabold">
                  {feature.title}
                </h3>

                <p className="relative mt-4 text-sm leading-7 text-slate-400">
                  {feature.description}
                </p>

                <div className="relative mt-7 flex items-center gap-2 text-sm font-semibold text-violet-300 transition group-hover:gap-3">
                  Explore feature <span>→</span>
                </div>

                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-blue-500 transition-all duration-500 group-hover:w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 overflow-hidden px-5 py-24 sm:px-8 lg:px-12 lg:py-28">
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-700/[0.08] blur-[130px]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/[0.08] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
              🚀 Simple Process
            </div>

            <h2 className="text-3xl font-black sm:text-5xl">
              How It{" "}
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Works
              </span>
            </h2>

            <p className="mt-5 text-base text-slate-400 sm:text-lg">
              Four simple steps to become interview-ready.
            </p>
          </div>

          <div className="relative mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="absolute left-[12%] right-[12%] top-12 hidden h-px bg-gradient-to-r from-violet-500/0 via-violet-400/40 to-blue-500/0 lg:block" />

            {steps.map((step) => (
              <div
                key={step.number}
                className="group relative rounded-3xl border border-white/[0.08] bg-[#101125]/75 p-6 text-center backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:border-violet-400/30 hover:bg-[#151630]"
              >
                <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] border border-violet-400/20 bg-gradient-to-br from-violet-500/15 to-blue-500/10 text-4xl shadow-lg shadow-violet-950/30 transition duration-500 group-hover:rotate-3 group-hover:scale-110 group-hover:shadow-violet-500/20">
                  {step.icon}

                  <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-xl border border-violet-300/20 bg-gradient-to-br from-violet-600 to-blue-600 text-xs font-extrabold shadow-lg">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-7 text-lg font-bold">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="relative z-10 px-5 pb-24 pt-8 sm:px-8 lg:px-12 lg:pb-28">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-violet-400/20 bg-gradient-to-br from-[#19153b] via-[#17152f] to-[#101b3b] px-6 py-14 shadow-2xl shadow-violet-950/40 sm:px-12 sm:py-20 lg:px-20">
          <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-blue-500/20 blur-[100px]" />

          <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-[100px]" />

          <div className="pointer-events-none absolute right-16 top-10 hidden h-24 w-24 rounded-full border border-violet-300/10 lg:block" />

          <div className="pointer-events-none absolute right-24 top-16 hidden h-12 w-12 rounded-full border border-blue-300/20 lg:block" />

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-violet-200 backdrop-blur-xl">
              <span>✨</span>
              Your next opportunity starts here
            </div>

            <h2 className="text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Ready to Ace Your{" "}
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-blue-300 bg-clip-text text-transparent">
                Next Interview?
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-300/80 sm:text-lg">
              Stop worrying about interviews. Start practicing, build
              your confidence, and get ready to showcase your best self.
            </p>

            <button
              onClick={() => router.push("/interview")}
              className="group relative mt-9 inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 px-8 py-4 font-bold shadow-xl shadow-violet-700/30 transition duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-2xl hover:shadow-violet-500/30"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-blue-500 to-fuchsia-500 transition-transform duration-500 group-hover:translate-x-0" />

              <span className="relative">Start Practicing</span>

              <span className="relative transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>

            <p className="mt-5 text-xs text-slate-500">
              Practice smarter. Interview better. Grow faster.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/[0.08] bg-[#070816]/80 px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 text-lg shadow-lg shadow-violet-700/20">
              ✦
            </div>

            <div>
              <p className="font-bold">
                MockMate <span className="text-violet-400">AI</span>
              </p>

              <p className="text-xs text-slate-500">
                Your AI-powered interview companion
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500 sm:text-sm">
            © 2026 MockMate AI. All rights reserved.
          </p>

          <button
            onClick={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 transition hover:border-violet-400/30 hover:text-white"
          >
            Back to top ↑
          </button>
        </div>
      </footer>

      {/* ANIMATIONS */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        body {
          background: #070816;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes floatSlow {
          0%,
          100% {
            transform: translateY(0px) rotate(-2deg);
          }

          50% {
            transform: translateY(-12px) rotate(1deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: floatSlow 7s ease-in-out infinite;
        }

        ::selection {
          background: rgba(139, 92, 246, 0.45);
          color: white;
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}

