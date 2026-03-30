"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { type AgeBand, THEME_TOKENS, tokensToCssVars } from "./tokens";

interface AgeBandContextValue {
  band: AgeBand;
  setBand: (band: AgeBand) => void;
}

const AgeBandContext = createContext<AgeBandContextValue>({
  band: "intermediate",
  setBand: () => {},
});

export function useAgeBand() {
  return useContext(AgeBandContext);
}

export function AgeBandProvider({
  initialBand = "intermediate",
  children,
}: {
  initialBand?: AgeBand;
  children: React.ReactNode;
}) {
  const [band, setBand] = useState<AgeBand>(initialBand);

  useEffect(() => {
    // Set data attribute on html element
    document.documentElement.setAttribute("data-age-band", band);

    // Apply CSS custom properties
    const vars = tokensToCssVars(THEME_TOKENS[band]);
    for (const [key, value] of Object.entries(vars)) {
      document.documentElement.style.setProperty(key, value);
    }

    // Set font family only — do NOT set root font-size here.
    // Changing root font-size breaks all Tailwind rem-based utilities (spacing, sizing).
    // The --font-size-base CSS variable is available for components that need age-appropriate text.
    document.documentElement.style.fontFamily = THEME_TOKENS[band].fontFamily;
  }, [band]);

  return (
    <AgeBandContext.Provider value={{ band, setBand }}>
      {children}
    </AgeBandContext.Provider>
  );
}
