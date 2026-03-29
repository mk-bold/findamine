"use client";

import { useState } from "react";

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

    default:
      // short_text, creative_writing, photo_observation, data_collection, etc.
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
            <span className="text-gray-400 font-mono text-xs w-5">{idx + 1}.</span>
            <span className="flex-1">{item}</span>
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => moveItem(idx, idx - 1)}
                disabled={idx === 0 || disabled}
                className="text-gray-400 hover:text-gray-700 disabled:opacity-20 text-xs leading-none"
                aria-label="Move up"
              >
                ▲
              </button>
              <button
                onClick={() => moveItem(idx, idx + 1)}
                disabled={idx === order.length - 1 || disabled}
                className="text-gray-400 hover:text-gray-700 disabled:opacity-20 text-xs leading-none"
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
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50 mb-3 resize-y"
        />
      ) : (
        <input
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Your answer..."
          disabled={disabled}
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
