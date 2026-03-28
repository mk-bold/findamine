"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface Find {
  id: string;
  sort_order: number;
  clue_text: string | null;
  locations: { name: string; latitude: number; longitude: number } | null;
  tasks: { title: string; challenge_type: string; content: Record<string, unknown> } | null;
}

interface Completion {
  find_id: string;
  completed_at: string | null;
  score: number;
}

export default function PlayPage() {
  const { huntId } = useParams();
  const router = useRouter();
  const [finds, setFinds] = useState<Find[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);

  useEffect(() => {
    async function init() {
      // Get hunt finds
      const findsRes = await fetch(`/api/v1/hunts/${huntId}/finds`);
      const findsData = await findsRes.json();
      setFinds(findsData.finds || []);

      // Start or resume session
      const sessionRes = await fetch(`/api/v1/play/${huntId}/start`, { method: "POST" });
      const sessionData = await sessionRes.json();
      setSessionStarted(true);

      // Get progress
      const progressRes = await fetch(`/api/v1/play/${huntId}/progress`);
      const progressData = await progressRes.json();
      setCompletions(progressData.completions || []);

      // Jump to first incomplete find
      const completedIds = new Set(
        (progressData.completions || [])
          .filter((c: Completion) => c.completed_at)
          .map((c: Completion) => c.find_id)
      );
      const nextIndex = (findsData.finds || []).findIndex(
        (f: Find) => !completedIds.has(f.id)
      );
      if (nextIndex >= 0) setCurrentIndex(nextIndex);

      setLoading(false);
    }
    init();
  }, [huntId]);

  const currentFind = finds[currentIndex];
  const isCompleted = completions.some(
    (c) => c.find_id === currentFind?.id && c.completed_at
  );
  const totalCompleted = completions.filter((c) => c.completed_at).length;

  async function handleArrive() {
    if (!currentFind) return;

    // Get user's GPS position
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        await fetch(`/api/v1/play/${huntId}/arrive`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            find_id: currentFind.id,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
        });
        setFeedback("Arrived! Now answer the challenge.");
      });
    } else {
      // Fallback: arrive without GPS
      await fetch(`/api/v1/play/${huntId}/arrive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ find_id: currentFind.id }),
      });
      setFeedback("Arrived! Now answer the challenge.");
    }
  }

  async function handleAnswer() {
    if (!currentFind || !answer) return;

    const res = await fetch(`/api/v1/play/${huntId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ find_id: currentFind.id, answer }),
    });
    const data = await res.json();

    setFeedback(data.feedback || `Score: ${data.score}`);
    setCompletions((prev) => [
      ...prev.filter((c) => c.find_id !== currentFind.id),
      { find_id: currentFind.id, completed_at: new Date().toISOString(), score: data.score },
    ]);
    setAnswer("");
  }

  async function handleComplete() {
    await fetch(`/api/v1/play/${huntId}/complete`, { method: "POST" });
    router.push("/dashboard");
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-gray-500">Loading hunt...</p>
      </main>
    );
  }

  if (finds.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-gray-500">This hunt has no stops yet.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Stop {currentIndex + 1} of {finds.length}</span>
          <span>{totalCompleted}/{finds.length} completed</span>
        </div>
        <div className="h-2 rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-emerald-500 transition-all"
            style={{ width: `${(totalCompleted / finds.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current find */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {currentFind?.locations
            ? (currentFind.locations as { name: string }).name
            : `Stop ${currentIndex + 1}`}
        </h2>

        {currentFind?.clue_text && (
          <p className="text-gray-600 mb-4">{currentFind.clue_text}</p>
        )}

        {currentFind?.tasks && (
          <div className="rounded-lg bg-emerald-50 p-4 mb-4">
            <h3 className="font-medium text-emerald-800 mb-1">
              {(currentFind.tasks as { title: string }).title}
            </h3>
            <p className="text-sm text-emerald-600">
              Type: {(currentFind.tasks as { challenge_type: string }).challenge_type.replace(/_/g, " ")}
            </p>
          </div>
        )}

        {feedback && (
          <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700 mb-4">
            {feedback}
          </div>
        )}

        {!isCompleted && (
          <div className="space-y-3">
            <button
              onClick={handleArrive}
              className="w-full rounded-md border border-emerald-300 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
            >
              I&apos;m Here (Check In)
            </button>

            <div className="flex gap-2">
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Your answer..."
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                onClick={handleAnswer}
                disabled={!answer}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {isCompleted && (
          <p className="text-sm text-green-600 font-medium">Completed!</p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-30"
        >
          Previous
        </button>

        {currentIndex < finds.length - 1 ? (
          <button
            onClick={() => { setCurrentIndex(currentIndex + 1); setFeedback(""); }}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Next Stop
          </button>
        ) : (
          <button
            onClick={handleComplete}
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
          >
            Finish Hunt
          </button>
        )}
      </div>
    </main>
  );
}
