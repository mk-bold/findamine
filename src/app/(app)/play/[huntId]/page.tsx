"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import StopFlowStepper from "@/components/play/stop-flow-stepper";
import HotColdMeter from "@/components/play/hot-cold-meter";
import ChallengeInput from "@/components/play/challenge-input";
import NavigateMap from "@/components/maps/navigate-map";
import { Celebration } from "@/components/ui/celebration";

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

// ── Helpers ──────────────────────────────────────────

type GpsStatus = "waiting" | "active" | "denied" | "unavailable" | "timeout";

async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res;
}

// ── Component ────────────────────────────────────────

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
  const [error, setError] = useState<string | null>(null);
  const [completedFinds, setCompletedFinds] = useState<Set<string>>(new Set());
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("waiting");
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");
  const [huntComplete, setHuntComplete] = useState(false);
  const [huntSummary, setHuntSummary] = useState<{
    totalScore: number;
    findsCompleted: number;
    totalFinds: number;
    startedAt: string;
    completedAt: string;
  } | null>(null);

  const submittingRef = useRef(false);
  const currentFind = finds[currentIndex];

  // ── Initialize ──────────────────────────────────────

  useEffect(() => {
    async function init() {
      try {
        const [findsRes, startRes] = await Promise.all([
          safeFetch(`/api/v1/hunts/${huntId}/finds`),
          safeFetch(`/api/v1/play/${huntId}/start`, { method: "POST" }),
        ]);

        const findsData = await findsRes.json();
        const startData = await startRes.json();
        setFinds(findsData.finds || []);

        // If player has a codename, we could show it — stored in startData.session.codename

        const progressRes = await safeFetch(`/api/v1/play/${huntId}/progress`);
        const progressData = await progressRes.json();

        const completed = new Set<string>(
          (progressData.completions || [])
            .filter((c: { completed_at: string | null }) => c.completed_at)
            .map((c: { find_id: string }) => c.find_id)
        );
        setCompletedFinds(completed);

        // Jump to first incomplete
        const allFinds = findsData.finds || [];
        const nextIdx = allFinds.findIndex((f: Find) => !completed.has(f.id));
        if (nextIdx >= 0) {
          setCurrentIndex(nextIdx);
        } else if (allFinds.length > 0 && completed.size === allFinds.length) {
          // All finds already completed
          setHuntComplete(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load hunt");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [huntId]);

  // ── Reset step state when changing finds ────────────

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
    setGpsStatus("waiting");
    setError(null);
  }, [currentIndex, currentFind, completedFinds]);

  // ── GPS watcher for navigate step ──────────────────

  useEffect(() => {
    if (step !== "navigate" || !currentFind) return;

    if (!navigator.geolocation) {
      setGpsStatus("unavailable");
      return;
    }

    let watchId: number;

    watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        setGpsStatus("active");
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        try {
          const res = await safeFetch(`/api/v1/play/${huntId}/arrive`, {
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
        } catch {
          // Network error during GPS ping — don't block navigation,
          // just keep trying on next position update
        }
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGpsStatus("denied");
            break;
          case err.POSITION_UNAVAILABLE:
            setGpsStatus("unavailable");
            break;
          case err.TIMEOUT:
            setGpsStatus("timeout");
            break;
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [step, currentFind, huntId]);

  // ── Handlers ───────────────────────────────────────

  const handlePrimeViewed = useCallback(async () => {
    if (!currentFind) return;
    try {
      await safeFetch(`/api/v1/play/${huntId}/prime-viewed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ find_id: currentFind.id }),
      });
      setStep("clue");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record primer view");
    }
  }, [currentFind, huntId]);

  const handleClueRead = useCallback(() => {
    setStep("navigate");
  }, []);

  const handleSkipNav = useCallback(async () => {
    if (!currentFind) return;
    try {
      await safeFetch(`/api/v1/play/${huntId}/arrive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ find_id: currentFind.id }),
      });
      setArrived(true);
      setStep("challenge");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record arrival");
    }
  }, [currentFind, huntId]);

  const handleRequestHint = useCallback(async () => {
    if (!currentFind) return;
    const nextLevel = Math.min(4, hintLevel + 1);
    try {
      const res = await safeFetch(`/api/v1/play/${huntId}/hint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ find_id: currentFind.id, level: nextLevel }),
      });
      const data = await res.json();
      setHintText(data.hint);
      setHintLevel(nextLevel);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get hint");
    }
  }, [currentFind, huntId, hintLevel]);

  const handleSubmitAnswer = useCallback(async () => {
    if (!currentFind || !answer || submittingRef.current) return;
    submittingRef.current = true;
    setError(null);

    try {
      const res = await safeFetch(`/api/v1/play/${huntId}/answer`, {
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
        setCelebrationMessage(
          data.feedback?.type === "correct"
            ? "Great job! You got it!"
            : "Nice effort! Moving on."
        );
        setShowCelebration(true);
        setStep("capture");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit answer");
    } finally {
      submittingRef.current = false;
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
    try {
      const res = await safeFetch(`/api/v1/play/${huntId}/complete`, { method: "POST" });
      const data = await res.json();

      // Build summary from progress data
      const progressRes = await safeFetch(`/api/v1/play/${huntId}/progress`);
      const progress = await progressRes.json();

      setHuntSummary({
        totalScore: progress.session?.total_score || 0,
        findsCompleted: completedFinds.size,
        totalFinds: finds.length,
        startedAt: progress.session?.started_at || "",
        completedAt: new Date().toISOString(),
      });
      setHuntComplete(true);
      setCelebrationMessage("Hunt Complete!");
      setShowCelebration(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete hunt");
    }
  }, [huntId, completedFinds.size, finds.length]);

  // ── Loading / Error states ─────────────────────────

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-2 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </main>
    );
  }

  if (finds.length === 0 && !huntComplete) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-center text-gray-500">
        This hunt has no stops yet.
      </main>
    );
  }

  // ── Hunt Complete Summary ──────────────────────────

  if (huntComplete) {
    const elapsed = huntSummary?.startedAt && huntSummary?.completedAt
      ? Math.round(
          (new Date(huntSummary.completedAt).getTime() -
            new Date(huntSummary.startedAt).getTime()) /
            60000
        )
      : null;

    return (
      <main className="mx-auto max-w-2xl px-4 py-6">
        <Celebration
          show={showCelebration}
          message={celebrationMessage}
          onComplete={() => setShowCelebration(false)}
        />

        <div className="card-themed p-8 text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hunt Complete!</h1>
          <p className="text-gray-500 mb-8">You finished all {finds.length} stops</p>

          {huntSummary && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="rounded-lg bg-sky-50 p-4">
                <div className="text-3xl font-bold text-themed-primary">{huntSummary.totalScore}</div>
                <div className="text-xs text-gray-500 mt-1">Total Points</div>
              </div>
              <div className="rounded-lg bg-green-50 p-4">
                <div className="text-3xl font-bold text-green-600">
                  {huntSummary.findsCompleted}/{huntSummary.totalFinds}
                </div>
                <div className="text-xs text-gray-500 mt-1">Stops Completed</div>
              </div>
              <div className="rounded-lg bg-purple-50 p-4">
                <div className="text-3xl font-bold text-purple-600">
                  {elapsed !== null ? `${elapsed}m` : "--"}
                </div>
                <div className="text-xs text-gray-500 mt-1">Time</div>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="btn-primary px-6 py-2 text-sm font-medium"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => router.push("/browse")}
              className="rounded-md border border-gray-300 px-6 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Find More Hunts
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── Active Play ────────────────────────────────────

  const totalCompleted = completedFinds.size;
  const isLastFind = currentIndex === finds.length - 1;

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <Celebration
        show={showCelebration}
        message={celebrationMessage}
        onComplete={() => setShowCelebration(false)}
      />

      {/* Error banner */}
      {error && (
        <div role="alert" className="rounded-md bg-red-50 border border-red-200 px-4 py-3 mb-4 flex justify-between items-center">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-sm ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Progress bar */}
      <div className="flex justify-between text-sm text-gray-500 mb-1">
        <span>Stop {currentIndex + 1} of {finds.length}</span>
        <span>{totalCompleted}/{finds.length} completed</span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 mb-4" role="progressbar" aria-valuenow={totalCompleted} aria-valuemin={0} aria-valuemax={finds.length} aria-label={`Hunt progress: ${totalCompleted} of ${finds.length} stops completed`}>
        <div
          className="h-2 rounded-full progress-fill"
          style={{ width: `${(totalCompleted / finds.length) * 100}%` }}
        />
      </div>

      <StopFlowStepper currentStep={step} />

      <div className="card-themed mb-6 min-h-[300px]" aria-live="polite">
        {/* ── PRIME ── */}
        {step === "prime" && currentFind?.primers && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Before You Start</h2>
            <div className="rounded-lg bg-blue-50 p-4 mb-4">
              <h3 className="font-medium text-blue-800 mb-2">
                {(currentFind.primers as { title: string }).title}
              </h3>
              <PrimerContent content={(currentFind.primers as { content: Record<string, unknown> }).content} />
            </div>
            <button onClick={handlePrimeViewed} className="w-full btn-primary px-4 py-2 text-sm font-medium">
              I&apos;m Ready!
            </button>
          </div>
        )}

        {/* ── CLUE ── */}
        {step === "clue" && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Your Clue</h2>
            <div className="rounded-lg bg-amber-50 p-4 mb-4">
              <p className="text-amber-900">
                {currentFind?.clue_text || "Head to the next location!"}
              </p>
            </div>
            {currentFind?.locations && (
              <p className="text-sm text-gray-500 mb-4">
                Heading to: {(currentFind.locations as { name: string }).name}
              </p>
            )}
            <button onClick={handleClueRead} className="w-full btn-primary px-4 py-2 text-sm font-medium">
              Start Navigating
            </button>
          </div>
        )}

        {/* ── NAVIGATE ── */}
        {step === "navigate" && (
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Navigate to Location</h2>
            <p className="text-sm text-gray-600 mb-6">
              Walk toward <strong>{currentFind?.locations ? (currentFind.locations as { name: string }).name : "the target"}</strong>
            </p>

            {/* GPS error states */}
            {gpsStatus === "denied" && (
              <div role="alert" className="rounded-lg bg-red-50 border border-red-200 p-4 mb-4">
                <p className="text-sm font-medium text-red-800 mb-1">Location Access Denied</p>
                <p className="text-xs text-red-600 mb-3">
                  Please enable location access in your browser settings to use GPS navigation.
                </p>
                <button
                  onClick={handleSkipNav}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Skip to Challenge
                </button>
              </div>
            )}

            {gpsStatus === "unavailable" && (
              <div role="alert" className="rounded-lg bg-orange-50 border border-orange-200 p-4 mb-4">
                <p className="text-sm font-medium text-orange-800 mb-1">GPS Not Available</p>
                <p className="text-xs text-orange-600 mb-3">
                  Your device doesn&apos;t have GPS or it&apos;s not working right now.
                </p>
                <button
                  onClick={handleSkipNav}
                  className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
                >
                  Skip to Challenge
                </button>
              </div>
            )}

            {gpsStatus === "timeout" && (
              <div role="alert" className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 mb-4">
                <p className="text-sm font-medium text-yellow-800 mb-1">GPS Signal Weak</p>
                <p className="text-xs text-yellow-600 mb-3">
                  Try moving to an open area for better signal, or skip navigation.
                </p>
                <button
                  onClick={() => setGpsStatus("waiting")}
                  className="rounded-md border border-yellow-400 px-3 py-1.5 text-xs text-yellow-700 hover:bg-yellow-100 mr-2"
                >
                  Try Again
                </button>
                <button
                  onClick={handleSkipNav}
                  className="rounded-md bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-700"
                >
                  Skip to Challenge
                </button>
              </div>
            )}

            {/* Active GPS / waiting states */}
            {(gpsStatus === "waiting" || gpsStatus === "active") && (
              <>
                {/* Map + Hot/Cold side by side */}
                {currentFind?.locations && (
                  <div className="mb-4">
                    <NavigateMap
                      targetLat={(currentFind.locations as { latitude: number }).latitude}
                      targetLng={(currentFind.locations as { longitude: number }).longitude}
                      radiusMeters={(currentFind.locations as { radius_meters: number }).radius_meters || 50}
                      userLat={userPos?.lat ?? null}
                      userLng={userPos?.lng ?? null}
                      zone={hotCold?.zone ?? null}
                    />
                  </div>
                )}

                {hotCold ? (
                  <div className="flex justify-center mb-4">
                    <HotColdMeter
                      zone={hotCold.zone}
                      color={hotCold.color}
                      label={hotCold.label}
                      emoji={hotCold.emoji}
                      distance={hotCold.distanceLabel}
                    />
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="animate-pulse flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center text-2xl">
                        <svg className="animate-spin h-8 w-8 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Acquiring GPS signal...</p>
                  </div>
                )}

                <button
                  onClick={handleSkipNav}
                  className="text-sm text-gray-500 hover:text-gray-600 underline"
                >
                  I&apos;m already here (skip navigation)
                </button>
              </>
            )}
          </div>
        )}

        {/* ── CHALLENGE ── */}
        {step === "challenge" && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Challenge</h2>

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
                  <strong>Hint (Level {hintLevel}):</strong> {hintText}
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

            {/* Challenge-type-specific input */}
            <div className="mb-3">
              <ChallengeInput
                challengeType={currentFind?.tasks?.challenge_type || "short_text"}
                content={currentFind?.tasks?.content || {}}
                answer={answer}
                onAnswerChange={setAnswer}
                onSubmit={handleSubmitAnswer}
                disabled={submittingRef.current}
              />
            </div>

            <button
              onClick={handleRequestHint}
              disabled={hintLevel >= 4}
              className="text-sm text-themed-primary hover:underline disabled:text-gray-500"
            >
              {hintLevel === 0 ? "Need a hint?" : hintLevel < 4 ? `Get more help (Level ${hintLevel + 1})` : "No more hints available"}
            </button>
          </div>
        )}

        {/* ── CAPTURE ── */}
        {step === "capture" && (
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Geo-Selfie!</h2>
            <p className="text-sm text-gray-600 mb-6">
              Take a photo of yourself at this location to remember your adventure!
            </p>

            <label className="inline-block btn-primary px-6 py-3 text-sm font-medium cursor-pointer mb-4">
              Take Photo
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !currentFind) return;
                  try {
                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("find_id", currentFind.id);
                    await safeFetch(`/api/v1/play/${huntId}/capture`, {
                      method: "POST",
                      body: formData,
                    });
                    setStep("feedback");
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Failed to upload photo");
                  }
                }}
              />
            </label>

            <div>
              <button onClick={handleCaptureSkip} className="text-sm text-gray-500 hover:text-gray-600 underline">
                Skip photo
              </button>
            </div>
          </div>
        )}

        {/* ── FEEDBACK ── */}
        {step === "feedback" && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Results</h2>

            {score !== null && (
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-themed-primary">{score}</div>
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
                  <div className="text-gray-500">Accuracy</div>
                </div>
                <div className="rounded bg-gray-50 p-2">
                  <div className="font-bold text-gray-700">{breakdown.masteryBonus}</div>
                  <div className="text-gray-500">Mastery</div>
                </div>
                <div className="rounded bg-gray-50 p-2">
                  <div className="font-bold text-gray-700">{breakdown.completion}</div>
                  <div className="text-gray-500">Completion</div>
                </div>
              </div>
            )}

            {/* Show "completed" for revisited finds that have no live score */}
            {score === null && completedFinds.has(currentFind?.id || "") && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">You already completed this stop.</p>
              </div>
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
              className="btn-primary px-6 py-2 text-sm font-medium"
            >
              Finish Hunt
            </button>
          ) : (
            <button
              onClick={handleNextFind}
              className="btn-primary px-6 py-2 text-sm font-medium"
            >
              Next Stop
            </button>
          )
        )}
      </div>
    </main>
  );
}

// ── Primer Content Renderer ──────────────────────────

function PrimerContent({ content }: { content: Record<string, unknown> }) {
  const text = (content.text as string) || "";
  const imageUrl = (content.image_url as string) || (content.imageUrl as string) || "";
  const videoUrl = (content.video_url as string) || (content.videoUrl as string) || "";
  const items = content.items as string[] | undefined;

  return (
    <div className="space-y-3">
      {text && <p className="text-sm text-blue-700">{text}</p>}

      {items && items.length > 0 && (
        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}

      {imageUrl && (
        <img
          src={imageUrl}
          alt="Primer illustration"
          className="rounded-lg max-h-48 mx-auto"
        />
      )}

      {videoUrl && (
        <div className="aspect-video rounded-lg overflow-hidden">
          <iframe
            src={videoUrl}
            title="Primer video"
            className="w-full h-full"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      )}

      {/* Fallback: if content has no recognized fields, show raw text */}
      {!text && !imageUrl && !videoUrl && !items && (
        <p className="text-sm text-blue-700">
          {typeof content === "string" ? content : "Review this concept before continuing."}
        </p>
      )}
    </div>
  );
}
