"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import StopFlowStepper from "@/components/play/stop-flow-stepper";
import HotColdMeter from "@/components/play/hot-cold-meter";

type StopStep = "prime" | "clue" | "navigate" | "challenge" | "capture" | "feedback";

interface Find {
  id: string;
  sort_order: number;
  clue_text: string | null;
  hot_cold_enabled: boolean;
  locations: { name: string; latitude: number; longitude: number; radius_meters: number } | null;
  tasks: { title: string; challenge_type: string; content: Record<string, unknown> } | null;
  primers: { title: string; content: Record<string, unknown> } | null;
}

interface HotCold {
  zone: string;
  color: string;
  label: string;
  emoji: string;
  distanceLabel: string;
}

export default function PlayPage() {
  const { huntId } = useParams();
  const router = useRouter();

  const [finds, setFinds] = useState<Find[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [step, setStep] = useState<StopStep>("prime");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<{ type: string; main: string; explanation: string; next_steps: string } | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [breakdown, setBreakdown] = useState<Record<string, number> | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  const [hotCold, setHotCold] = useState<HotCold | null>(null);
  const [arrived, setArrived] = useState(false);
  const [hintText, setHintText] = useState("");
  const [hintLevel, setHintLevel] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completedFinds, setCompletedFinds] = useState<Set<string>>(new Set());

  const currentFind = finds[currentIndex];

  // Initialize
  useEffect(() => {
    async function init() {
      const findsRes = await fetch(`/api/v1/hunts/${huntId}/finds`);
      const findsData = await findsRes.json();
      setFinds(findsData.finds || []);

      await fetch(`/api/v1/play/${huntId}/start`, { method: "POST" });

      const progressRes = await fetch(`/api/v1/play/${huntId}/progress`);
      const progressData = await progressRes.json();

      const completed = new Set<string>(
        (progressData.completions || [])
          .filter((c: { completed_at: string | null }) => c.completed_at)
          .map((c: { find_id: string }) => c.find_id)
      );
      setCompletedFinds(completed);

      // Jump to first incomplete
      const nextIdx = (findsData.finds || []).findIndex(
        (f: Find) => !completed.has(f.id)
      );
      if (nextIdx >= 0) setCurrentIndex(nextIdx);

      setLoading(false);
    }
    init();
  }, [huntId]);

  // Reset step state when changing finds
  useEffect(() => {
    if (!currentFind) return;
    if (completedFinds.has(currentFind.id)) {
      setStep("feedback");
    } else if (currentFind.primers) {
      setStep("prime");
    } else {
      setStep("clue");
    }
    setAnswer("");
    setFeedback(null);
    setScore(null);
    setBreakdown(null);
    setCanRetry(false);
    setHotCold(null);
    setArrived(false);
    setHintText("");
    setHintLevel(0);
  }, [currentIndex, currentFind, completedFinds]);

  // GPS watcher for navigate step
  useEffect(() => {
    if (step !== "navigate" || !currentFind) return;

    let watchId: number;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          const res = await fetch(`/api/v1/play/${huntId}/arrive`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              find_id: currentFind.id,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            }),
          });
          const data = await res.json();

          if (data.hot_cold) setHotCold(data.hot_cold);
          if (data.arrived) {
            setArrived(true);
            setStep("challenge");
          }
        },
        undefined,
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [step, currentFind, huntId]);

  const handlePrimeViewed = useCallback(async () => {
    if (!currentFind) return;
    await fetch(`/api/v1/play/${huntId}/prime-viewed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ find_id: currentFind.id }),
    });
    setStep("clue");
  }, [currentFind, huntId]);

  const handleClueRead = useCallback(() => {
    setStep("navigate");
  }, []);

  const handleSkipNav = useCallback(async () => {
    // For testing or when GPS unavailable: manually arrive
    if (!currentFind) return;
    await fetch(`/api/v1/play/${huntId}/arrive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ find_id: currentFind.id }),
    });
    setArrived(true);
    setStep("challenge");
  }, [currentFind, huntId]);

  const handleRequestHint = useCallback(async () => {
    if (!currentFind) return;
    const nextLevel = Math.min(4, hintLevel + 1);
    const res = await fetch(`/api/v1/play/${huntId}/hint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ find_id: currentFind.id, level: nextLevel }),
    });
    const data = await res.json();
    setHintText(data.hint);
    setHintLevel(nextLevel);
  }, [currentFind, huntId, hintLevel]);

  const handleSubmitAnswer = useCallback(async () => {
    if (!currentFind || !answer) return;
    const res = await fetch(`/api/v1/play/${huntId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ find_id: currentFind.id, answer }),
    });
    const data = await res.json();

    setFeedback(data.feedback);
    setScore(data.score);
    setBreakdown(data.breakdown);
    setCanRetry(data.can_retry);

    if (data.is_complete) {
      setCompletedFinds((prev) => new Set([...prev, currentFind.id]));
      setStep("capture");
    }
  }, [currentFind, huntId, answer]);

  const handleCaptureSkip = useCallback(() => {
    setStep("feedback");
  }, []);

  const handleNextFind = useCallback(() => {
    if (currentIndex < finds.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, finds.length]);

  const handleFinishHunt = useCallback(async () => {
    await fetch(`/api/v1/play/${huntId}/complete`, { method: "POST" });
    router.push("/dashboard");
  }, [huntId, router]);

  if (loading) {
    return <main className="mx-auto max-w-2xl px-4 py-12 text-center text-gray-500">Loading hunt...</main>;
  }

  if (finds.length === 0) {
    return <main className="mx-auto max-w-2xl px-4 py-12 text-center text-gray-500">This hunt has no stops.</main>;
  }

  const totalCompleted = completedFinds.size;
  const isLastFind = currentIndex === finds.length - 1;

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      {/* Progress */}
      <div className="flex justify-between text-sm text-gray-500 mb-1">
        <span>Stop {currentIndex + 1} of {finds.length}</span>
        <span>{totalCompleted}/{finds.length} completed</span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 mb-4">
        <div
          className="h-2 rounded-full bg-sky-500 transition-all"
          style={{ width: `${(totalCompleted / finds.length) * 100}%` }}
        />
      </div>

      <StopFlowStepper currentStep={step} />

      <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6 min-h-[300px]">
        {/* ── PRIME ── */}
        {step === "prime" && currentFind?.primers && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">📖 Before You Start</h2>
            <div className="rounded-lg bg-blue-50 p-4 mb-4">
              <h3 className="font-medium text-blue-800 mb-2">
                {(currentFind.primers as { title: string }).title}
              </h3>
              <p className="text-sm text-blue-700">
                {JSON.stringify((currentFind.primers as { content: Record<string, unknown> }).content.text || "Review this concept before continuing.")}
              </p>
            </div>
            <button onClick={handlePrimeViewed} className="w-full rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">
              I&apos;m Ready!
            </button>
          </div>
        )}

        {/* ── CLUE ── */}
        {step === "clue" && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">🔍 Your Clue</h2>
            <div className="rounded-lg bg-amber-50 p-4 mb-4">
              <p className="text-amber-900">
                {currentFind?.clue_text || "Head to the next location!"}
              </p>
            </div>
            {currentFind?.locations && (
              <p className="text-sm text-gray-500 mb-4">
                📍 Heading to: {(currentFind.locations as { name: string }).name}
              </p>
            )}
            <button onClick={handleClueRead} className="w-full rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">
              Start Navigating 🧭
            </button>
          </div>
        )}

        {/* ── NAVIGATE ── */}
        {step === "navigate" && (
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-900 mb-3">🧭 Navigate to Location</h2>
            <p className="text-sm text-gray-600 mb-6">
              Walk toward <strong>{currentFind?.locations ? (currentFind.locations as { name: string }).name : "the target"}</strong>
            </p>

            {hotCold ? (
              <div className="flex justify-center mb-6">
                <HotColdMeter
                  zone={hotCold.zone}
                  color={hotCold.color}
                  label={hotCold.label}
                  emoji={hotCold.emoji}
                  distance={hotCold.distanceLabel}
                />
              </div>
            ) : (
              <div className="mb-6">
                <div className="animate-pulse flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center text-2xl">
                    🧭
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-2">Waiting for GPS signal...</p>
              </div>
            )}

            <button
              onClick={handleSkipNav}
              className="text-sm text-gray-400 hover:text-gray-600 underline"
            >
              I&apos;m already here (skip navigation)
            </button>
          </div>
        )}

        {/* ── CHALLENGE ── */}
        {step === "challenge" && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">🧩 Challenge</h2>

            {currentFind?.tasks && (
              <div className="rounded-lg bg-sky-50 p-4 mb-4">
                <h3 className="font-medium text-sky-800">
                  {(currentFind.tasks as { title: string }).title}
                </h3>
              </div>
            )}

            {/* Hint section */}
            {hintText && (
              <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Hint (Level {hintLevel}):</strong> {hintText}
                </p>
              </div>
            )}

            {/* Feedback from previous attempt */}
            {feedback && canRetry && (
              <div className={`rounded-lg p-3 mb-4 ${
                feedback.type === "correct" ? "bg-green-50 text-green-800" :
                feedback.type === "partial" ? "bg-blue-50 text-blue-800" :
                "bg-orange-50 text-orange-800"
              }`}>
                <p className="text-sm font-medium">{feedback.main}</p>
                <p className="text-xs mt-1">{feedback.explanation}</p>
              </div>
            )}

            <div className="flex gap-2 mb-3">
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Your answer..."
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                onKeyDown={(e) => e.key === "Enter" && handleSubmitAnswer()}
              />
              <button
                onClick={handleSubmitAnswer}
                disabled={!answer}
                className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
              >
                Submit
              </button>
            </div>

            <button
              onClick={handleRequestHint}
              disabled={hintLevel >= 4}
              className="text-sm text-sky-600 hover:underline disabled:text-gray-400"
            >
              {hintLevel === 0 ? "Need a hint?" : hintLevel < 4 ? `Get more help (Level ${hintLevel + 1})` : "No more hints available"}
            </button>
          </div>
        )}

        {/* ── CAPTURE ── */}
        {step === "capture" && (
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-900 mb-3">📸 Geo-Selfie!</h2>
            <p className="text-sm text-gray-600 mb-6">
              Take a photo of yourself at this location to remember your adventure!
            </p>

            <label className="inline-block rounded-md bg-sky-600 px-6 py-3 text-sm font-medium text-white hover:bg-sky-700 cursor-pointer mb-4">
              Take Photo
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !currentFind) return;
                  const formData = new FormData();
                  formData.append("file", file);
                  formData.append("find_id", currentFind.id);
                  await fetch(`/api/v1/play/${huntId}/capture`, {
                    method: "POST",
                    body: formData,
                  });
                  setStep("feedback");
                }}
              />
            </label>

            <div>
              <button onClick={handleCaptureSkip} className="text-sm text-gray-400 hover:text-gray-600 underline">
                Skip photo
              </button>
            </div>
          </div>
        )}

        {/* ── FEEDBACK ── */}
        {step === "feedback" && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">⭐ Results</h2>

            {score !== null && (
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-sky-600">{score}</div>
                <p className="text-sm text-gray-500">points earned</p>
              </div>
            )}

            {feedback && (
              <div className={`rounded-lg p-4 mb-4 ${
                feedback.type === "correct" ? "bg-green-50" :
                feedback.type === "partial" ? "bg-blue-50" :
                "bg-orange-50"
              }`}>
                <p className="font-medium">{feedback.main}</p>
                <p className="text-sm mt-1 opacity-80">{feedback.explanation}</p>
                <p className="text-sm mt-2 italic">{feedback.next_steps}</p>
              </div>
            )}

            {breakdown && (
              <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
                <div className="rounded bg-gray-50 p-2">
                  <div className="font-bold text-gray-700">{breakdown.correctness}</div>
                  <div className="text-gray-400">Accuracy</div>
                </div>
                <div className="rounded bg-gray-50 p-2">
                  <div className="font-bold text-gray-700">{breakdown.masteryBonus}</div>
                  <div className="text-gray-400">Mastery</div>
                </div>
                <div className="rounded bg-gray-50 p-2">
                  <div className="font-bold text-gray-700">{breakdown.completion}</div>
                  <div className="text-gray-400">Completion</div>
                </div>
              </div>
            )}

            {completedFinds.has(currentFind?.id || "") && (
              <p className="text-sm text-green-600 font-medium mb-4 text-center">✅ Find completed!</p>
            )}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-30"
        >
          Previous
        </button>

        {step === "feedback" && (
          isLastFind ? (
            <button
              onClick={handleFinishHunt}
              className="rounded-md bg-sky-700 px-6 py-2 text-sm font-medium text-white hover:bg-sky-800"
            >
              🎉 Finish Hunt
            </button>
          ) : (
            <button
              onClick={handleNextFind}
              className="rounded-md bg-sky-600 px-6 py-2 text-sm font-medium text-white hover:bg-sky-700"
            >
              Next Stop →
            </button>
          )
        )}
      </div>
    </main>
  );
}
