"use client";

import { useEffect, useState } from "react";
import ReactConfetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { useAgeBand } from "@/lib/themes/age-band-provider";

interface CelebrationProps {
  show: boolean;
  message?: string;
  onComplete?: () => void;
  duration?: number;
}

const confettiColors = {
  primary: ["#F59E0B", "#EF4444", "#10B981", "#8B5CF6", "#EC4899", "#3B82F6"],
  intermediate: ["#0EA5E9", "#14B8A6", "#F59E0B", "#8B5CF6"],
  teen: ["#6366F1", "#EC4899", "#0F766E"],
  adult: ["#1E40AF", "#059669"],
};

export function Celebration({ show, message, onComplete, duration = 3000 }: CelebrationProps) {
  const { band } = useAgeBand();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (show) {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  // Adults get minimal celebration
  if (band === "adult") {
    return (
      <AnimatePresence>
        {show && message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 right-4 z-50 rounded-md bg-[var(--color-success)] px-4 py-2 text-white text-sm shadow-lg"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  const confettiCount = band === "primary" ? 300 : band === "intermediate" ? 150 : 50;
  const gravity = band === "primary" ? 0.15 : 0.25;

  return (
    <>
      {showConfetti && (
        <ReactConfetti
          width={dimensions.width}
          height={dimensions.height}
          numberOfPieces={confettiCount}
          gravity={gravity}
          colors={confettiColors[band]}
          recycle={false}
          style={{ position: "fixed", top: 0, left: 0, zIndex: 100 }}
        />
      )}
      <AnimatePresence>
        {show && message && (
          <motion.div
            initial={band === "primary"
              ? { scale: 0, rotate: -15 }
              : { opacity: 0, y: 30 }
            }
            animate={band === "primary"
              ? { scale: 1, rotate: 0, transition: { type: "spring" as const, stiffness: 200, damping: 10 } }
              : { opacity: 1, y: 0 }
            }
            exit={{ opacity: 0, scale: 0.8 }}
            className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none ${
              band === "primary" ? "p-8" : "p-4"
            }`}
          >
            <div className={`bg-white shadow-2xl text-center pointer-events-auto ${
              band === "primary"
                ? "rounded-3xl p-8 border-4 border-[var(--color-primary)]"
                : band === "intermediate"
                ? "rounded-2xl p-6 border-2 border-[var(--color-primary)]"
                : "rounded-xl p-4 border border-[var(--color-primary)]"
            }`}>
              {band === "primary" && (
                <div className="text-5xl mb-3">🎉</div>
              )}
              <p className={`font-bold text-[var(--color-text)] ${
                band === "primary" ? "text-2xl" :
                band === "intermediate" ? "text-xl" : "text-lg"
              }`}>
                {message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
