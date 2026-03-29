"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
import { useAgeBand } from "@/lib/themes/age-band-provider";

const inputStyles = {
  primary: "rounded-2xl border-2 border-[var(--color-border)] bg-white px-4 py-3 text-lg placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] focus:outline-none min-h-[48px]",
  intermediate: "rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-base placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary-light)] focus:outline-none",
  teen: "rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary-light)] focus:outline-none",
  adult: "rounded-md border border-[var(--color-border)] bg-white px-3 py-1.5 text-sm placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary-light)] focus:outline-none",
};

const labelStyles = {
  primary: "block text-base font-bold text-[var(--color-text)] mb-2",
  intermediate: "block text-sm font-semibold text-[var(--color-text)] mb-1.5",
  teen: "block text-sm font-medium text-[var(--color-text)] mb-1",
  adult: "block text-xs font-medium text-[var(--color-text-secondary)] mb-1 uppercase tracking-wide",
};

interface ThemedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const ThemedInput = forwardRef<HTMLInputElement, ThemedInputProps>(
  ({ label, className, id, ...props }, ref) => {
    const { band } = useAgeBand();

    return (
      <div>
        {label && (
          <label htmlFor={id} className={labelStyles[band]}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(inputStyles[band], "w-full", className)}
          {...props}
        />
      </div>
    );
  }
);

ThemedInput.displayName = "ThemedInput";
export { ThemedInput };
