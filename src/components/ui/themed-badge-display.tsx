"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAgeBand } from "@/lib/themes/age-band-provider";
import { cn } from "@/lib/utils/cn";

interface BadgeDisplayProps {
  name: string;
  description: string;
  iconUrl?: string | null;
  earned?: boolean;
  progress?: number; // 0-100
  showAnimation?: boolean;
}

const badgeContainerStyles = {
  primary: "rounded-3xl border-2 p-4 text-center min-w-[120px]",
  intermediate: "rounded-2xl border p-3 text-center min-w-[100px]",
  teen: "rounded-xl border p-3 text-center min-w-[90px]",
  adult: "rounded-lg border p-2 text-center min-w-[80px]",
};

const earnedAnimations = {
  primary: {
    initial: { scale: 0, rotate: -180 },
    animate: { scale: 1, rotate: 0, transition: { type: "spring" as const, stiffness: 200, damping: 12, duration: 0.8 } },
  },
  intermediate: {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { type: "spring" as const, stiffness: 300, duration: 0.5 } },
  },
  teen: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  },
  adult: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
  },
};

export function ThemedBadgeDisplay({
  name,
  description,
  iconUrl,
  earned = false,
  progress,
  showAnimation = false,
}: BadgeDisplayProps) {
  const { band } = useAgeBand();

  const iconSize = band === "primary" ? 80 : band === "intermediate" ? 64 : band === "teen" ? 56 : 48;

  return (
    <AnimatePresence>
      <motion.div
        {...(showAnimation ? earnedAnimations[band] : {})}
        className={cn(
          badgeContainerStyles[band],
          earned
            ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
            : "border-[var(--color-border)] bg-[var(--color-surface)] opacity-60 grayscale"
        )}
      >
        {/* Icon */}
        <div className="flex justify-center mb-2">
          {iconUrl ? (
            <img
              src={iconUrl}
              alt={name}
              width={iconSize}
              height={iconSize}
              className={cn(!earned && "opacity-40")}
            />
          ) : (
            <div
              className="rounded-full bg-[var(--color-primary-light)] flex items-center justify-center"
              style={{ width: iconSize, height: iconSize }}
            >
              <span className={cn("text-2xl", band === "primary" && "text-3xl")}>
                {earned ? "🏆" : "🔒"}
              </span>
            </div>
          )}
        </div>

        {/* Name */}
        <p className={cn(
          "font-bold text-[var(--color-text)]",
          band === "primary" ? "text-base" :
          band === "intermediate" ? "text-sm" : "text-xs"
        )}>
          {name}
        </p>

        {/* Description (primary and intermediate only) */}
        {(band === "primary" || band === "intermediate") && (
          <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-2">
            {description}
          </p>
        )}

        {/* Progress bar (if not yet earned) */}
        {!earned && progress !== undefined && progress > 0 && (
          <div className="mt-2">
            <div className="h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[var(--color-primary)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {progress}%
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
