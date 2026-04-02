"use client";

import { useState } from "react";
import LocationPicker from "@/components/maps/location-picker";
import CurriculumBrowser from "./curriculum-browser";
import StandardsBrowser from "./standards-browser";
import AiPromptTemplates from "./ai-prompt-templates";
import AiModeIndicator, { detectMode, type AiMode } from "./ai-mode-indicator";

interface FindEditorProps {
  huntId: string;
  onSaved: () => void;
  onCancel: () => void;
  experimentCondition?: string; // "control" | "scaffolding" | "feedback" | "full"
}

const CHALLENGE_TYPES = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "numeric_entry", label: "Numeric Entry" },
  { value: "short_text", label: "Short Text" },
  { value: "creative_writing", label: "Creative Writing" },
  { value: "sorting_ordering", label: "Sorting / Ordering" },
  { value: "photo_observation", label: "Photo Observation" },
  { value: "data_collection", label: "Data Collection" },
  { value: "team_debate", label: "Team Debate" },
];

/**
 * Form to create a new find (stop) within a hunt.
 * Creates location + task + find in sequence via API calls.
 */
export default function FindEditor({ huntId, onSaved, onCancel, experimentCondition }: FindEditorProps) {
  // Experiment: scaffolding features only show for scaffolding/full conditions
  const showScaffolding = !experimentCondition || experimentCondition === "scaffolding" || experimentCondition === "full";
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryTaskId, setLibraryTaskId] = useState<string | null>(null);

  // Location fields
  const [locationName, setLocationName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radiusMeters, setRadiusMeters] = useState("50");

  // Clue
  const [clueText, setClueText] = useState("");

  // Task fields
  const [taskTitle, setTaskTitle] = useState("");
  const [challengeType, setChallengeType] = useState("multiple_choice");
  const [question, setQuestion] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");

  // Multiple choice options
  const [options, setOptions] = useState(["", "", "", ""]);

  // Sorting items
  const [sortingItems, setSortingItems] = useState(["", "", ""]);

  // Primer (optional)
  const [primerTitle, setPrimerTitle] = useState("");
  const [primerText, setPrimerText] = useState("");

  // AI generation
  const [generatingClue, setGeneratingClue] = useState(false);
  const [generatingModule, setGeneratingModule] = useState(false);
  const [lessonPlanInput, setLessonPlanInput] = useState("");
  const [showLessonPlan, setShowLessonPlan] = useState(false);
  const [showStandards, setShowStandards] = useState(false);
  const [showAiPrompts, setShowAiPrompts] = useState(false);
  const [currentAiMode, setCurrentAiMode] = useState<AiMode | null>(null);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError("GPS not available on this device");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
      },
      () => setError("Could not get your location. Check GPS permissions."),
      { enableHighAccuracy: true }
    );
  };

  const handleGenerateClue = async () => {
    setGeneratingClue(true);
    setError("");
    try {
      const res = await fetch("/api/v1/ai/generate-clue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primer_content: primerText ? { text: primerText } : null,
          task_content: question ? { question } : null,
          location_name: locationName || undefined,
          difficulty_tier: "medium",
        }),
      });
      const data = await res.json();
      if (data.clue_text) setClueText(data.clue_text);
    } catch {
      setError("Failed to generate clue");
    } finally {
      setGeneratingClue(false);
    }
  };

  const handleGenerateFromLessonPlan = async () => {
    if (!lessonPlanInput.trim()) return setError("Enter a lesson plan or topic");
    setGeneratingModule(true);
    setError("");
    try {
      const res = await fetch("/api/v1/ai/generate-module", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: lessonPlanInput.slice(0, 100),
          lesson_plan_text: lessonPlanInput,
          challenge_type: challengeType,
        }),
      });
      const data = await res.json();
      if (data.primer) {
        setPrimerTitle(data.primer.title || "");
        const pc = data.primer.content;
        setPrimerText(typeof pc === "object" ? (pc.text || JSON.stringify(pc)) : String(pc));
      }
      if (data.task) {
        setTaskTitle(data.task.title || "");
        const tc = data.task.content;
        if (tc?.question) setQuestion(tc.question);
        if (tc?.options && challengeType === "multiple_choice") {
          setOptions(tc.options);
          if (tc.correct_answer) setCorrectAnswer(tc.correct_answer);
        }
        if (tc?.items && challengeType === "sorting_ordering") {
          setSortingItems(tc.items);
        }
        if (tc?.correct_answer && !["multiple_choice", "sorting_ordering"].includes(challengeType)) {
          setCorrectAnswer(tc.correct_answer);
        }
      }
      setShowLessonPlan(false);
    } catch {
      setError("Failed to generate from lesson plan");
    } finally {
      setGeneratingModule(false);
    }
  };

  const handleSave = async () => {
    setError("");

    // Validate required fields
    if (!locationName.trim()) return setError("Location name is required");
    if (!latitude || !longitude) return setError("Coordinates are required");
    if (!taskTitle.trim()) return setError("Challenge title is required");
    if (!clueText.trim()) return setError("Clue text is required");

    if (challengeType === "multiple_choice") {
      const filledOptions = options.filter((o) => o.trim());
      if (filledOptions.length < 2) return setError("At least 2 answer options are required");
      if (!correctAnswer) return setError("Select the correct answer");
    }

    if (challengeType === "sorting_ordering") {
      const filledItems = sortingItems.filter((i) => i.trim());
      if (filledItems.length < 2) return setError("At least 2 items to sort are required");
    }

    setSaving(true);

    try {
      // 1. Create location
      const locRes = await fetch("/api/v1/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: locationName,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          radius_meters: parseInt(radiusMeters) || 50,
        }),
      });
      if (!locRes.ok) {
        const d = await locRes.json();
        throw new Error(d.error || "Failed to create location");
      }
      const locData = await locRes.json();
      const locationId = locData.location?.id;

      // 2. Get or create task
      let taskId = libraryTaskId; // Use library task if selected

      if (!taskId) {
      // Build task content based on challenge type
      const content: Record<string, unknown> = { question };

      if (challengeType === "multiple_choice") {
        content.options = options.filter((o) => o.trim());
        content.correct_answer = correctAnswer;
      } else if (challengeType === "numeric_entry") {
        content.correct_answer = correctAnswer;
      } else if (challengeType === "sorting_ordering") {
        content.items = sortingItems.filter((i) => i.trim());
        content.correct_order = sortingItems.filter((i) => i.trim()); // Creator enters in correct order
      } else {
        content.correct_answer = correctAnswer || null;
      }

      // 3. Create task
      const taskRes = await fetch("/api/v1/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle,
          challenge_type: challengeType,
          content,
        }),
      });
      if (!taskRes.ok) {
        const d = await taskRes.json();
        throw new Error(d.error || "Failed to create task");
      }
      const taskData = await taskRes.json();
      taskId = taskData.record?.id || taskData.task?.id;
      } // end if (!taskId)

      // 4. Optionally create primer
      let primerId = null;
      if (primerTitle.trim() && primerText.trim()) {
        const primerRes = await fetch("/api/v1/primers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: primerTitle,
            content: { text: primerText },
            content_type: "text",
          }),
        });
        if (primerRes.ok) {
          const primerData = await primerRes.json();
          primerId = primerData.record?.id || primerData.primer?.id;
        }
      }

      // 5. Create the find
      const findRes = await fetch(`/api/v1/hunts/${huntId}/finds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location_id: locationId,
          task_id: taskId,
          primer_id: primerId,
          clue_text: clueText,
          hot_cold_enabled: true,
        }),
      });
      if (!findRes.ok) {
        const d = await findRes.json();
        throw new Error(d.error || "Failed to create find");
      }

      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Add New Stop</h3>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      {/* ── Location ── */}
      <fieldset className="mb-5">
        <legend className="text-sm font-medium text-gray-700 mb-2">Location</legend>
        <div className="space-y-3">
          <input
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="Location name (e.g. Old Main Fountain)"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="Latitude"
              type="number"
              step="any"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <input
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="Longitude"
              type="number"
              step="any"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <input
              value={radiusMeters}
              onChange={(e) => setRadiusMeters(e.target.value)}
              placeholder="Radius (m)"
              type="number"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <LocationPicker
            latitude={latitude ? parseFloat(latitude) : null}
            longitude={longitude ? parseFloat(longitude) : null}
            radiusMeters={parseInt(radiusMeters) || 50}
            onLocationChange={(lat, lng) => {
              setLatitude(lat.toFixed(6));
              setLongitude(lng.toFixed(6));
            }}
          />
          <button
            type="button"
            onClick={handleUseMyLocation}
            className="text-sm text-sky-600 hover:underline"
          >
            Use my current location
          </button>
        </div>
      </fieldset>

      {/* ── Clue ── */}
      <fieldset className="mb-5">
        <legend className="text-sm font-medium text-gray-700 mb-2">Clue</legend>
        <textarea
          value={clueText}
          onChange={(e) => setClueText(e.target.value)}
          placeholder="Write a clue that leads players to this location..."
          rows={2}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <button
          type="button"
          onClick={handleGenerateClue}
          disabled={generatingClue}
          className="mt-2 text-xs text-violet-600 hover:underline disabled:opacity-50"
        >
          {generatingClue ? "Generating..." : "Generate clue with AI"}
        </button>
      </fieldset>

      {/* ── Curriculum Library Browser ── */}
      {showLibrary && (
        <div className="mb-5">
          <CurriculumBrowser
            onSelect={(task) => {
              setLibraryTaskId(task.id);
              setTaskTitle(task.title);
              setChallengeType(task.challenge_type);
              setQuestion((task.content?.question as string) || "");
              if (task.challenge_type === "multiple_choice" && Array.isArray(task.content?.options)) {
                setOptions(task.content.options as string[]);
                setCorrectAnswer((task.content.correct_answer as string) || "");
              }
              if (task.challenge_type === "sorting_ordering" && Array.isArray(task.content?.items)) {
                setSortingItems(task.content.items as string[]);
              }
              if (!["multiple_choice", "sorting_ordering"].includes(task.challenge_type)) {
                setCorrectAnswer((task.content?.correct_answer as string) || "");
              }
              setShowLibrary(false);
            }}
            onCancel={() => setShowLibrary(false)}
          />
        </div>
      )}

      {/* ── Challenge ── */}
      <fieldset className="mb-5">
        <legend className="text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
          <span>Challenge</span>
          <span className="flex gap-3">
            {!showLibrary && (
              <button
                type="button"
                onClick={() => setShowLibrary(true)}
                className="text-xs text-sky-600 hover:underline font-normal"
              >
                Browse Library
              </button>
            )}
            {showScaffolding ? (
              <button
                type="button"
                onClick={() => { setShowAiPrompts(!showAiPrompts); setShowLessonPlan(false); }}
                className="text-xs text-violet-600 hover:underline font-normal"
              >
                {showAiPrompts ? "Hide AI" : "AI-Assisted Creation"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowLessonPlan(!showLessonPlan)}
                className="text-xs text-violet-600 hover:underline font-normal"
              >
                {showLessonPlan ? "Hide" : "Generate with AI"}
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowStandards(!showStandards)}
              className="text-xs text-emerald-600 hover:underline font-normal"
            >
              {showStandards ? "Hide" : "Browse by Standard"}
            </button>
          </span>
        </legend>
        {showAiPrompts && (
          <div className="mb-3">
            <AiPromptTemplates
              topic={taskTitle || primerTitle || ""}
              onSelectPrompt={(prompt, mode) => {
                setCurrentAiMode(mode);
                setLessonPlanInput(prompt);
                setShowAiPrompts(false);
                setShowLessonPlan(true);
              }}
            />
          </div>
        )}

        {showLessonPlan && (
          <div className="rounded-lg bg-violet-50 border border-violet-200 p-4 mb-3">
            {showScaffolding && currentAiMode && (
              <div className="mb-2">
                <AiModeIndicator mode={currentAiMode} compact />
              </div>
            )}
            <textarea
              value={lessonPlanInput}
              onChange={(e) => {
                setLessonPlanInput(e.target.value.slice(0, 5000));
                if (showScaffolding) setCurrentAiMode(detectMode(e.target.value));
              }}
              maxLength={5000}
              placeholder="Describe what you want to teach, paste a lesson plan, or ask AI to help you improve your draft..."
              rows={4}
              className="block w-full rounded-md border border-violet-300 px-3 py-2 text-sm mb-2 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-violet-400">{lessonPlanInput.length}/5000</p>
              <button
                type="button"
                onClick={handleGenerateFromLessonPlan}
                disabled={generatingModule}
                className="rounded-md bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
              >
                {generatingModule ? "Generating..." : "Generate with AI"}
              </button>
            </div>
          </div>
        )}

        {showStandards && (
          <div className="mb-3">
            <StandardsBrowser
              onSelectTask={(task) => {
                setLibraryTaskId(task.id);
                setTaskTitle(task.title);
                setChallengeType(task.challenge_type);
                setShowStandards(false);
              }}
              onCancel={() => setShowStandards(false)}
            />
          </div>
        )}

        {libraryTaskId && (
          <div className="rounded-md bg-sky-50 border border-sky-200 px-3 py-2 mb-3 flex items-center justify-between">
            <span className="text-xs text-sky-700">Using library task: <strong>{taskTitle}</strong></span>
            <button
              type="button"
              onClick={() => { setLibraryTaskId(null); setTaskTitle(""); setQuestion(""); setChallengeType("multiple_choice"); }}
              className="text-xs text-sky-500 hover:text-sky-700"
            >
              Clear
            </button>
          </div>
        )}
        <div className="space-y-3">
          <input
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Challenge title"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />

          <select
            value={challengeType}
            onChange={(e) => setChallengeType(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {CHALLENGE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Question text"
            rows={2}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />

          {/* Multiple choice options */}
          {challengeType === "multiple_choice" && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Answer options (click the radio to mark the correct one):</p>
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct_option"
                    checked={correctAnswer === opt && opt !== ""}
                    onChange={() => setCorrectAnswer(opt)}
                    className="accent-sky-600"
                  />
                  <input
                    value={opt}
                    onChange={(e) => {
                      const next = [...options];
                      next[idx] = e.target.value;
                      setOptions(next);
                      if (correctAnswer === opt) setCorrectAnswer(e.target.value);
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => setOptions(options.filter((_, i) => i !== idx))}
                      className="text-gray-500 hover:text-red-500 text-xs"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {options.length < 6 && (
                <button
                  onClick={() => setOptions([...options, ""])}
                  className="text-xs text-sky-600 hover:underline"
                >
                  + Add option
                </button>
              )}
            </div>
          )}

          {/* Sorting items */}
          {challengeType === "sorting_ordering" && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Enter items in the correct order (they will be shuffled for players):</p>
              {sortingItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-5">{idx + 1}.</span>
                  <input
                    value={item}
                    onChange={(e) => {
                      const next = [...sortingItems];
                      next[idx] = e.target.value;
                      setSortingItems(next);
                    }}
                    placeholder={`Item ${idx + 1}`}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  {sortingItems.length > 2 && (
                    <button
                      onClick={() => setSortingItems(sortingItems.filter((_, i) => i !== idx))}
                      className="text-gray-500 hover:text-red-500 text-xs"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {sortingItems.length < 8 && (
                <button
                  onClick={() => setSortingItems([...sortingItems, ""])}
                  className="text-xs text-sky-600 hover:underline"
                >
                  + Add item
                </button>
              )}
            </div>
          )}

          {/* Correct answer for non-MC types */}
          {!["multiple_choice", "sorting_ordering"].includes(challengeType) && (
            <input
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="Correct answer (or leave blank for open-ended)"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          )}
        </div>
      </fieldset>

      {/* ── Primer (optional) ── */}
      <fieldset className="mb-5">
        <legend className="text-sm font-medium text-gray-700 mb-2">
          Primer <span className="text-gray-500 font-normal">(optional)</span>
        </legend>
        <div className="space-y-3">
          <input
            value={primerTitle}
            onChange={(e) => setPrimerTitle(e.target.value)}
            placeholder="Primer title (e.g. About Photosynthesis)"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <textarea
            value={primerText}
            onChange={(e) => setPrimerText(e.target.value)}
            placeholder="Educational content shown before the challenge..."
            rows={3}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </fieldset>

      {/* ── Actions ── */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-sky-600 px-5 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Stop"}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="rounded-md border border-gray-300 px-5 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
