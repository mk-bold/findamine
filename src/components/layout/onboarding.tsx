"use client";

import { useState, useEffect } from "react";

const STEPS = [
  {
    title: "Welcome to findamine!",
    body: "Findamine is a GPS-powered scavenger hunt platform for learning and fun. Let's show you around.",
    icon: "👋",
  },
  {
    title: "Browse & Play Hunts",
    body: "Head to Browse Hunts to find adventures near you. Each hunt has multiple stops with clues, challenges, and rewards.",
    icon: "🔍",
  },
  {
    title: "Navigate with Hot/Cold",
    body: "Use GPS to navigate to each stop. The hot/cold meter guides you — red means you're close, blue means keep walking!",
    icon: "🧭",
  },
  {
    title: "Complete Challenges",
    body: "At each stop, answer a challenge question. Use hints if you get stuck — but they cost points!",
    icon: "🧩",
  },
  {
    title: "Earn Badges & Points",
    body: "Every challenge earns points. Complete hunts to unlock badges and climb the leaderboard.",
    icon: "🏆",
  },
];

export default function Onboarding() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Check if user has seen onboarding
    async function check() {
      const res = await fetch("/api/v1/onboarding");
      if (res.ok) {
        const data = await res.json();
        const completed = (data.milestones || []).some(
          (m: { milestone_type: string }) => m.milestone_type === "onboarding_complete"
        );
        if (!completed) setShow(true);
      }
    }
    check();
  }, []);

  const handleComplete = async () => {
    setShow(false);
    await fetch("/api/v1/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ milestone_type: "onboarding_complete" }),
    });
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  if (!show) return null;

  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        {/* Step indicator */}
        <div className="flex gap-1 mb-6 justify-center">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i <= step ? "w-6 bg-sky-500" : "w-3 bg-gray-200"
              }`}
            />
          ))}
        </div>

        <div className="text-center mb-6">
          <div className="text-4xl mb-3">{current.icon}</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">{current.title}</h2>
          <p className="text-sm text-gray-600">{current.body}</p>
        </div>

        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            {step === STEPS.length - 1 ? "Get Started!" : "Next"}
          </button>
        </div>

        <button
          onClick={handleComplete}
          className="block w-full mt-3 text-xs text-gray-400 hover:text-gray-600 text-center"
        >
          Skip tutorial
        </button>
      </div>
    </div>
  );
}
