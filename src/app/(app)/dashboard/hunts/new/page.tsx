"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LocationPicker from "@/components/maps/location-picker";
import { HUNT_PRESETS, type HuntPreset } from "@/lib/utils/hunt-presets";

const SUBJECTS = [
  { value: "science_nature", label: "Science & Nature" },
  { value: "math_real_world", label: "Math" },
  { value: "geography_maps", label: "Geography & Maps" },
  { value: "critical_thinking", label: "Critical Thinking" },
  { value: "reading_writing", label: "Reading & Writing" },
  { value: "history_community", label: "History & Community" },
];

const GRADE_BANDS = [
  { value: "K-2", label: "K-2 (Ages 5-7)" },
  { value: "3-5", label: "3-5 (Ages 8-10)" },
  { value: "6-8", label: "6-8 (Ages 11-13)" },
  { value: "9-12", label: "9-12 (Ages 14-18)" },
];

const LOCATION_TYPES = [
  { value: "any", label: "Any Location" },
  { value: "park", label: "Park" },
  { value: "trail", label: "Trail" },
  { value: "water", label: "Near Water" },
  { value: "urban", label: "Urban / Downtown" },
  { value: "campus", label: "School / Campus" },
  { value: "forest", label: "Forest" },
  { value: "historic", label: "Historic Site" },
  { value: "field", label: "Open Field" },
];

export default function NewHuntPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // AI builder state
  const [aiSubjects, setAiSubjects] = useState<string[]>(["science_nature"]);
  const [aiGradeBand, setAiGradeBand] = useState("3-5");
  const [aiLocationType, setAiLocationType] = useState("any");
  const [aiStops, setAiStops] = useState("5");
  const [aiDuration, setAiDuration] = useState("40");
  const [aiDifficulty, setAiDifficulty] = useState("ascending");
  const [aiTheme, setAiTheme] = useState("");
  // Hunt center point
  const [centerLat, setCenterLat] = useState<number | null>(null);
  const [centerLng, setCenterLng] = useState<number | null>(null);
  const [showCenterPicker, setShowCenterPicker] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<HuntPreset | null>(null);

  function applyPreset(preset: HuntPreset) {
    setSelectedPreset(preset);
    setMode("manual");
    setAiResult(null);
  }

  const [aiResult, setAiResult] = useState<{
    title: string;
    description: string;
    theme_narrative: string;
    stops: { task_id: string; primer_id: string; sort_order: number; suggested_clue: string; clue_hints: string[] }[];
  } | null>(null);

  async function handleManualSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/v1/hunts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        description: form.get("description"),
        target_audience: form.get("target_audience"),
        play_mode: form.get("play_mode"),
        identity_mode: form.get("identity_mode"),
        estimated_duration_min: form.get("duration") ? parseInt(form.get("duration") as string) : null,
        center_latitude: centerLat,
        center_longitude: centerLng,
        ...(selectedPreset ? {
          play_mode: selectedPreset.settings.play_mode,
          identity_mode: selectedPreset.settings.identity_mode,
          metadata: selectedPreset.settings.metadata,
        } : {}),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to create hunt");
      setLoading(false);
      return;
    }

    router.push(`/dashboard/hunts/${data.hunt.id}`);
  }

  async function handleAIGenerate() {
    setLoading(true);
    setError("");
    setAiResult(null);

    try {
      const res = await fetch("/api/v1/ai/recommend-hunt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject_domains: aiSubjects,
          grade_band: aiGradeBand,
          target_audience: aiGradeBand === "K-2" ? "kids" : aiGradeBand === "3-5" ? "kids" : aiGradeBand === "6-8" ? "teens" : "teens",
          location_type: aiLocationType,
          target_duration_min: parseInt(aiDuration),
          difficulty_progression: aiDifficulty,
          num_stops: parseInt(aiStops),
          theme: aiTheme || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI generation failed");

      setAiResult(data.recommendation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleAICreate() {
    if (!aiResult) return;
    setLoading(true);
    setError("");

    try {
      // 1. Create the hunt
      const audience = aiGradeBand === "K-2" || aiGradeBand === "3-5" ? "kids" : "teens";
      const huntRes = await fetch("/api/v1/hunts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: aiResult.title,
          description: aiResult.description,
          target_audience: audience,
          play_mode: "solo",
          identity_mode: "codename_assigned",
          estimated_duration_min: parseInt(aiDuration),
          theme: aiTheme || null,
          theme_narrative: aiResult.theme_narrative || null,
          difficulty_progression: aiDifficulty,
          subject_domains: aiSubjects,
        }),
      });

      const huntData = await huntRes.json();
      if (!huntRes.ok) throw new Error(huntData.error || "Failed to create hunt");

      const huntId = huntData.hunt.id;

      // 2. Create finds for each AI-recommended stop
      for (const stop of aiResult.stops) {
        // Create a placeholder location (creator will set real GPS later)
        const locRes = await fetch("/api/v1/locations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `Stop ${stop.sort_order + 1}`,
            latitude: 0,
            longitude: 0,
            radius_meters: 50,
            location_type: aiLocationType,
          }),
        });
        const locData = await locRes.json();
        const locationId = locData.location?.id;

        // Create the find linking task, primer, location, and clue
        await fetch(`/api/v1/hunts/${huntId}/finds`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location_id: locationId,
            task_id: stop.task_id,
            primer_id: stop.primer_id,
            clue_text: stop.suggested_clue,
            clue_hints: stop.clue_hints || [],
            sort_order: stop.sort_order,
            hot_cold_enabled: true,
          }),
        });
      }

      router.push(`/dashboard/hunts/${huntId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create hunt");
      setLoading(false);
    }
  }

  function toggleSubject(subject: string) {
    setAiSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-4">
      <h1 className="text-lg font-semibold text-gray-900 mb-4">Create New Hunt</h1>

      {/* Quick Start Presets */}
      <div className="mb-5">
        <p className="text-xs font-medium text-gray-500 mb-2">Quick Start — choose a preset</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {HUNT_PRESETS.map((preset) => (
            <button
              key={preset.key}
              onClick={() => applyPreset(preset)}
              className={`text-left rounded-lg border p-2.5 transition hover:shadow-sm ${
                selectedPreset?.key === preset.key
                  ? preset.color + " ring-2 ring-offset-1 ring-sky-400"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <span className="text-lg">{preset.icon}</span>
              <p className="text-xs font-medium text-gray-900 mt-0.5">{preset.name}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{preset.description}</p>
            </button>
          ))}
        </div>
        {selectedPreset && (
          <p className="text-xs text-sky-600 mt-2">
            Using <strong>{selectedPreset.name}</strong> preset. You can modify any settings below.
            <button onClick={() => setSelectedPreset(null)} className="ml-2 text-gray-400 hover:text-gray-600">Clear</button>
          </p>
        )}
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setMode("manual"); setAiResult(null); }}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            mode === "manual"
              ? "bg-sky-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Build Manually
        </button>
        <button
          onClick={() => setMode("ai")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            mode === "ai"
              ? "bg-violet-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Build with AI
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 mb-4">{error}</div>
      )}

      {/* ── MANUAL MODE ── */}
      {mode === "manual" && (
        <form onSubmit={handleManualSubmit} className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Hunt Title</label>
            <input id="title" name="title" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500" placeholder="e.g. BYU Campus Discovery Walk" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" name="description" rows={3} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500" placeholder="Describe what players will experience..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="target_audience" className="block text-sm font-medium text-gray-700">Audience</label>
              <select id="target_audience" name="target_audience" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option value="all">All</option>
                <option value="kids">Kids (7-12)</option>
                <option value="teens">Teens (13-17)</option>
                <option value="adults">Adults</option>
                <option value="family">Family</option>
              </select>
            </div>
            <div>
              <label htmlFor="play_mode" className="block text-sm font-medium text-gray-700">Play Mode</label>
              <select id="play_mode" name="play_mode" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option value="solo">Solo</option>
                <option value="team_self_select">Teams (self-select)</option>
                <option value="team_random">Teams (random)</option>
                <option value="team_assigned">Teams (assigned)</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="identity_mode" className="block text-sm font-medium text-gray-700">Leaderboard Identity</label>
            <select id="identity_mode" name="identity_mode" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="codename_assigned">Random Codenames (default, most private)</option>
              <option value="codename_chosen">Player-Chosen Names</option>
              <option value="real_name">Real Names</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Controls how players appear on leaderboards. Children&apos;s names are always protected.</p>
          </div>
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Estimated Duration (minutes)</label>
            <input id="duration" name="duration" type="number" min={5} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500" placeholder="30" />
          </div>
          <div>
            <button
              type="button"
              onClick={() => setShowCenterPicker(!showCenterPicker)}
              className="text-sm text-sky-600 hover:underline"
            >
              {showCenterPicker ? "Hide" : "Set"} hunt location on map
              {centerLat ? ` (${centerLat.toFixed(4)}, ${centerLng?.toFixed(4)})` : " (optional)"}
            </button>
            {showCenterPicker && (
              <div className="mt-2 rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-500 mb-2">Click the map or search for an address to set the hunt center point.</p>
                <LocationPicker
                  latitude={centerLat}
                  longitude={centerLng}
                  radiusMeters={5000}
                  onLocationChange={(lat, lng) => {
                    setCenterLat(lat);
                    setCenterLng(lng);
                  }}
                />
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary px-6 py-2 text-sm font-medium disabled:opacity-50">
              {loading ? "Creating..." : "Create Hunt"}
            </button>
            <button type="button" onClick={() => router.back()} className="rounded-md border border-gray-300 px-6 py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      )}

      {/* ── AI MODE ── */}
      {mode === "ai" && !aiResult && (
        <div className="space-y-5">
          <div className="rounded-lg bg-violet-50 border border-violet-200 p-4">
            <p className="text-sm text-violet-800">Tell us what kind of hunt you want and AI will compose it from the content library — picking the best primers, tasks, and clues for your needs.</p>
          </div>

          {/* Subject selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => toggleSubject(s.value)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    aiSubjects.includes(s.value)
                      ? "bg-violet-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grade band */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grade Band</label>
            <select value={aiGradeBand} onChange={(e) => setAiGradeBand(e.target.value)} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              {GRADE_BANDS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          {/* Location type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location Type</label>
            <select value={aiLocationType} onChange={(e) => setAiLocationType(e.target.value)} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              {LOCATION_TYPES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Stops</label>
              <input type="number" value={aiStops} onChange={(e) => setAiStops(e.target.value)} min={3} max={8} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Duration (min)</label>
              <input type="number" value={aiDuration} onChange={(e) => setAiDuration(e.target.value)} min={15} max={120} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>

          {/* Difficulty progression */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Progression</label>
            <select value={aiDifficulty} onChange={(e) => setAiDifficulty(e.target.value)} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="ascending">Easy to Hard</option>
              <option value="descending">Hard to Easy</option>
              <option value="mixed">Mixed</option>
              <option value="plateau">Consistent Difficulty</option>
            </select>
          </div>

          {/* Theme (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Theme <span className="text-gray-400 font-normal">(optional)</span></label>
            <input value={aiTheme} onChange={(e) => setAiTheme(e.target.value)} placeholder="e.g. nature detective, urban explorer, young scientist..." className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleAIGenerate} disabled={loading || aiSubjects.length === 0} className="rounded-md bg-violet-600 px-6 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50">
              {loading ? "Generating..." : "Generate Hunt"}
            </button>
            <button type="button" onClick={() => router.back()} className="rounded-md border border-gray-300 px-6 py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {/* ── AI RESULT PREVIEW ── */}
      {mode === "ai" && aiResult && (
        <div className="space-y-5">
          <div className="rounded-lg bg-violet-50 border border-violet-200 p-4">
            <h2 className="font-semibold text-violet-900">{aiResult.title}</h2>
            <p className="text-sm text-violet-800 mt-1">{aiResult.description}</p>
            {aiResult.theme_narrative && (
              <p className="text-xs text-violet-600 mt-2 italic">{aiResult.theme_narrative}</p>
            )}
          </div>

          <h3 className="text-sm font-semibold text-gray-900">{aiResult.stops.length} Stops</h3>

          <div className="space-y-3">
            {aiResult.stops.map((stop, i) => (
              <div key={i} className="flex gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-medium text-violet-700">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600">{stop.suggested_clue}</p>
                  {stop.clue_hints.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">{stop.clue_hints.length} clue hints included</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleAICreate} disabled={loading} className="rounded-md bg-violet-600 px-6 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50">
              {loading ? "Creating..." : "Create This Hunt"}
            </button>
            <button onClick={handleAIGenerate} disabled={loading} className="rounded-md border border-violet-300 px-6 py-2 text-sm text-violet-700 hover:bg-violet-50 disabled:opacity-50">
              Regenerate
            </button>
            <button onClick={() => setAiResult(null)} className="rounded-md border border-gray-300 px-6 py-2 text-sm text-gray-700 hover:bg-gray-50">
              Edit Settings
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
