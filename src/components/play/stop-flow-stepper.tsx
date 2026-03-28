"use client";

const STEPS = [
  { key: "prime", label: "Prime", icon: "📖" },
  { key: "clue", label: "Clue", icon: "🔍" },
  { key: "navigate", label: "Navigate", icon: "🧭" },
  { key: "challenge", label: "Challenge", icon: "🧩" },
  { key: "capture", label: "Capture", icon: "📸" },
  { key: "feedback", label: "Results", icon: "⭐" },
];

interface StopFlowStepperProps {
  currentStep: string;
}

export default function StopFlowStepper({ currentStep }: StopFlowStepperProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-between gap-1 mb-6">
      {STEPS.map((step, i) => {
        const isActive = i === currentIndex;
        const isCompleted = i < currentIndex;

        return (
          <div key={step.key} className="flex flex-col items-center flex-1">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full text-lg transition-all ${
                isActive
                  ? "bg-emerald-100 ring-2 ring-emerald-500 scale-110"
                  : isCompleted
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {isCompleted ? "✓" : step.icon}
            </div>
            <span
              className={`text-xs mt-1 ${
                isActive ? "text-emerald-700 font-medium" : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
