"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { useAgeBand } from "@/lib/themes/age-band-provider";

const cardStyles = {
  primary: "rounded-3xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-lg",
  intermediate: "rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-md",
  teen: "rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm",
  adult: "rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4",
};

const hoverAnimations = {
  primary: { scale: 1.02, y: -4, transition: { type: "spring" as const, stiffness: 300, damping: 20 } },
  intermediate: { y: -2, transition: { duration: 0.2 } },
  teen: { y: -1, transition: { duration: 0.15 } },
  adult: {},
};

interface ThemedCardProps {
  interactive?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function ThemedCard({ interactive = false, className, children, onClick }: ThemedCardProps) {
  const { band } = useAgeBand();

  if (interactive) {
    return (
      <motion.div
        whileHover={hoverAnimations[band]}
        onClick={onClick}
        className={cn(cardStyles[band], "cursor-pointer transition-shadow hover:shadow-lg", className)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cn(cardStyles[band], className)}>
      {children}
    </div>
  );
}
