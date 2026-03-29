"use client";

import { useState, useRef, useEffect } from "react";

interface ChallengeInputProps {
  challengeType: string;
  content: Record<string, unknown>;
  answer: string;
  onAnswerChange: (answer: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

/**
 * Renders the appropriate input UI based on challenge type.
 * Falls back to text input for unrecognized types.
 */
export default function ChallengeInput({
  challengeType,
  content,
  answer,
  onAnswerChange,
  onSubmit,
  disabled,
}: ChallengeInputProps) {
  switch (challengeType) {
    case "multiple_choice":
      return (
        <MultipleChoice
          content={content}
          answer={answer}
          onAnswerChange={onAnswerChange}
          onSubmit={onSubmit}
          disabled={disabled}
        />
      );

    case "numeric_entry":
      return (
        <NumericEntry
          content={content}
          answer={answer}
          onAnswerChange={onAnswerChange}
          onSubmit={onSubmit}
          disabled={disabled}
        />
      );

    case "sorting_ordering":
      return (
        <SortingOrdering
          content={content}
          answer={answer}
          onAnswerChange={onAnswerChange}
          onSubmit={onSubmit}
          disabled={disabled}
        />
      );

    case "photo_observation":
      return (
        <PhotoObservation
          content={content}
          answer={answer}
          onAnswerChange={onAnswerChange}
          onSubmit={onSubmit}
          disabled={disabled}
        />
      );

    case "sketch_draw":
      return (
        <SketchDraw
          content={content}
          answer={answer}
          onAnswerChange={onAnswerChange}
          onSubmit={onSubmit}
          disabled={disabled}
        />
      );

    case "audio_response":
      return (
        <AudioResponse
          content={content}
          answer={answer}
          onAnswerChange={onAnswerChange}
          onSubmit={onSubmit}
          disabled={disabled}
        />
      );

    default:
      // short_text, creative_writing, data_collection, team_debate
      return (
        <TextInput
          challengeType={challengeType}
          answer={answer}
          onAnswerChange={onAnswerChange}
          onSubmit={onSubmit}
          disabled={disabled}
        />
      );
  }
}

// ── Multiple Choice ──────────────────────────────────

function MultipleChoice({
  content,
  answer,
  onAnswerChange,
  onSubmit,
  disabled,
}: {
  content: Record<string, unknown>;
  answer: string;
  onAnswerChange: (a: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}) {
  const options = (content.options as string[]) || [];
  const question = (content.question as string) || (content.text as string) || "";

  return (
    <div>
      {question && (
        <p className="text-sm text-gray-700 mb-3">{question}</p>
      )}
      <div className="space-y-2 mb-4">
        {options.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx); // A, B, C, D
          const isSelected = answer === option;
          return (
            <button
              key={idx}
              onClick={() => onAnswerChange(option)}
              disabled={disabled}
              className={`w-full text-left rounded-lg border-2 px-4 py-3 text-sm transition-colors ${
                isSelected
                  ? "border-sky-500 bg-sky-50 text-sky-800 font-medium"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              } disabled:opacity-50`}
            >
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-bold mr-3">
                {letter}
              </span>
              {option}
            </button>
          );
        })}
      </div>
      <button
        onClick={onSubmit}
        disabled={!answer || disabled}
        className="w-full rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
      >
        Submit Answer
      </button>
    </div>
  );
}

// ── Numeric Entry ────────────────────────────────────

function NumericEntry({
  content,
  answer,
  onAnswerChange,
  onSubmit,
  disabled,
}: {
  content: Record<string, unknown>;
  answer: string;
  onAnswerChange: (a: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}) {
  const question = (content.question as string) || (content.text as string) || "";
  const unit = (content.unit as string) || "";
  const placeholder = (content.placeholder as string) || "Enter a number...";

  return (
    <div>
      {question && (
        <p className="text-sm text-gray-700 mb-3">{question}</p>
      )}
      <div className="flex gap-2 mb-4">
        <input
          type="number"
          inputMode="decimal"
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={question || "Enter your numeric answer"}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        />
        {unit && (
          <span className="flex items-center text-sm text-gray-500 px-2">{unit}</span>
        )}
      </div>
      <button
        onClick={onSubmit}
        disabled={!answer || disabled}
        className="w-full rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
      >
        Submit Answer
      </button>
    </div>
  );
}

// ── Sorting / Ordering ───────────────────────────────

function SortingOrdering({
  content,
  answer,
  onAnswerChange,
  onSubmit,
  disabled,
}: {
  content: Record<string, unknown>;
  answer: string;
  onAnswerChange: (a: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}) {
  const items = (content.items as string[]) || [];
  const question = (content.question as string) || (content.text as string) || "Put these in the correct order:";

  // Parse current order from answer (comma-separated) or initialize shuffled
  const [order, setOrder] = useState<string[]>(() => {
    if (answer) return answer.split(",");
    // Shuffle items for initial display
    return [...items].sort(() => Math.random() - 0.5);
  });

  const moveItem = (fromIdx: number, toIdx: number) => {
    if (disabled) return;
    const newOrder = [...order];
    const [moved] = newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, moved);
    setOrder(newOrder);
    onAnswerChange(newOrder.join(","));
  };

  return (
    <div>
      <p className="text-sm text-gray-700 mb-3">{question}</p>
      <div className="space-y-2 mb-4">
        {order.map((item, idx) => (
          <div
            key={item}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm"
          >
            <span className="text-gray-500 font-mono text-xs w-5">{idx + 1}.</span>
            <span className="flex-1">{item}</span>
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => moveItem(idx, idx - 1)}
                disabled={idx === 0 || disabled}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-20 text-xs leading-none"
                aria-label="Move up"
              >
                ▲
              </button>
              <button
                onClick={() => moveItem(idx, idx + 1)}
                disabled={idx === order.length - 1 || disabled}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-20 text-xs leading-none"
                aria-label="Move down"
              >
                ▼
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={onSubmit}
        disabled={!answer || disabled}
        className="w-full rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
      >
        Submit Order
      </button>
    </div>
  );
}

// ── Photo Observation ────────────────────────────────

function PhotoObservation({
  content,
  answer,
  onAnswerChange,
  onSubmit,
  disabled,
}: {
  content: Record<string, unknown>;
  answer: string;
  onAnswerChange: (a: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}) {
  const question = (content.question as string) || (content.text as string) || "Take a photo and describe what you observe.";
  const [preview, setPreview] = useState<string | null>(null);
  const [observation, setObservation] = useState(answer);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      // Combine photo reference + observation text as the answer
      onAnswerChange(`[photo:captured] ${observation}`);
    };
    reader.readAsDataURL(file);
  };

  const handleObservationChange = (text: string) => {
    setObservation(text);
    onAnswerChange(preview ? `[photo:captured] ${text}` : text);
  };

  return (
    <div>
      <p className="text-sm text-gray-700 mb-3">{question}</p>

      {/* Photo capture */}
      {preview ? (
        <div className="mb-3">
          <img src={preview} alt="Your observation" className="rounded-lg max-h-48 mx-auto mb-2" />
          <button
            onClick={() => { setPreview(null); onAnswerChange(observation); }}
            className="text-xs text-gray-500 hover:text-gray-600"
          >
            Retake photo
          </button>
        </div>
      ) : (
        <label className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 mb-3 cursor-pointer hover:border-sky-400 hover:bg-sky-50/50 transition-colors">
          <div className="text-center">
            <div className="text-2xl mb-1">📷</div>
            <p className="text-sm text-gray-500">Tap to take a photo</p>
          </div>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhoto}
            disabled={disabled}
          />
        </label>
      )}

      {/* Observation text */}
      <textarea
        value={observation}
        onChange={(e) => handleObservationChange(e.target.value)}
        placeholder="Describe what you observe..."
        rows={3}
        disabled={disabled}
        aria-label="Describe what you observe"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50 mb-3 resize-y"
      />

      <button
        onClick={onSubmit}
        disabled={!observation.trim() || disabled}
        className="w-full rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
      >
        Submit Observation
      </button>
    </div>
  );
}

// ── Sketch / Draw ────────────────────────────────────

function SketchDraw({
  content,
  answer,
  onAnswerChange,
  onSubmit,
  disabled,
}: {
  content: Record<string, unknown>;
  answer: string;
  onAnswerChange: (a: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}) {
  const question = (content.question as string) || (content.text as string) || "Draw your answer below.";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const getPos = (e: React.TouchEvent | React.MouseEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    const pos = getPos(e);
    if (!pos) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing || disabled) return;
    e.preventDefault();
    const pos = getPos(e);
    if (!pos) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1E293B";
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    // Save canvas as data URL
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      onAnswerChange(`[sketch:${dataUrl.length}chars]`);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Redraw white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onAnswerChange("");
  };

  // Initialize white background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  return (
    <div>
      <p className="text-sm text-gray-700 mb-3">{question}</p>

      <div className="rounded-lg border-2 border-gray-200 overflow-hidden mb-2">
        <canvas
          ref={canvasRef}
          width={400}
          height={280}
          className="w-full touch-none cursor-crosshair"
          style={{ maxHeight: "280px" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>

      <div className="flex justify-between items-center mb-3">
        <button
          onClick={clearCanvas}
          disabled={disabled}
          className="text-xs text-gray-500 hover:text-gray-600"
        >
          Clear drawing
        </button>
        <span className="text-xs text-gray-500">
          {hasDrawn ? "Drawing captured" : "Draw with your finger or mouse"}
        </span>
      </div>

      <button
        onClick={onSubmit}
        disabled={!hasDrawn || disabled}
        className="w-full rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
      >
        Submit Drawing
      </button>
    </div>
  );
}

// ── Audio Response ───────────────────────────────────

function AudioResponse({
  content,
  answer,
  onAnswerChange,
  onSubmit,
  disabled,
}: {
  content: Record<string, unknown>;
  answer: string;
  onAnswerChange: (a: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}) {
  const question = (content.question as string) || (content.text as string) || "Record your spoken answer.";
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [permissionError, setPermissionError] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onAnswerChange(`[audio:${Math.round(duration)}s]`);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setDuration(0);
      setAudioUrl(null);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch {
      setPermissionError(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setDuration(0);
    onAnswerChange("");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div>
      <p className="text-sm text-gray-700 mb-3">{question}</p>

      {permissionError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-3">
          <p className="text-sm text-red-700">
            Microphone access denied. Please enable microphone permissions in your browser settings.
          </p>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 mb-3 text-center">
        {recording ? (
          <div>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium text-red-700">Recording</span>
              <span className="text-sm text-gray-500 font-mono">{formatTime(duration)}</span>
            </div>
            <button
              onClick={stopRecording}
              className="rounded-full bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Stop Recording
            </button>
          </div>
        ) : audioUrl ? (
          <div>
            <audio src={audioUrl} controls className="mx-auto mb-3 w-full max-w-xs" />
            <p className="text-xs text-gray-500 mb-2">Duration: {formatTime(duration)}</p>
            <button
              onClick={resetRecording}
              className="text-xs text-gray-500 hover:text-gray-600"
            >
              Record again
            </button>
          </div>
        ) : (
          <div>
            <div className="text-3xl mb-2">🎙️</div>
            <button
              onClick={startRecording}
              disabled={disabled || permissionError}
              className="rounded-full bg-sky-600 px-6 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
            >
              Start Recording
            </button>
            <p className="text-xs text-gray-500 mt-2">Tap to record your spoken answer</p>
          </div>
        )}
      </div>

      <button
        onClick={onSubmit}
        disabled={!audioUrl || disabled}
        className="w-full rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
      >
        Submit Recording
      </button>
    </div>
  );
}

// ── Text Input (default fallback) ────────────────────

function TextInput({
  challengeType,
  answer,
  onAnswerChange,
  onSubmit,
  disabled,
}: {
  challengeType: string;
  answer: string;
  onAnswerChange: (a: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}) {
  const isLongForm = ["creative_writing", "data_collection", "team_debate"].includes(challengeType);

  return (
    <div>
      {isLongForm ? (
        <textarea
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Your answer..."
          disabled={disabled}
          rows={5}
          aria-label="Your answer"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50 mb-3 resize-y"
        />
      ) : (
        <input
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Your answer..."
          disabled={disabled}
          aria-label="Your answer"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50 mb-3"
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        />
      )}
      <button
        onClick={onSubmit}
        disabled={!answer || disabled}
        className="w-full rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
      >
        Submit
      </button>
    </div>
  );
}
