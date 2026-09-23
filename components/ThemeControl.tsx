"use client";

import { useEffect, useState } from "react";
import { THEMES, applyTheme, readTheme, type Theme } from "@/lib/theme";

const LABEL: Record<Theme, string> = { day: "Day", night: "Night", auto: "Auto" };

/** The three-button day/night selector EFBs use. */
export default function ThemeControl() {
  const [theme, setTheme] = useState<Theme>("day");

  useEffect(() => setTheme(readTheme()), []);

  function pick(next: Theme) {
    setTheme(next);
    applyTheme(next);
  }

  return (
    <div
      role="radiogroup"
      aria-label="Display theme"
      className="grid grid-cols-3 gap-1 rounded-xl bg-line2 p-1"
    >
      {THEMES.map((t) => {
        const on = theme === t;
        return (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => pick(t)}
            className={`min-h-10 rounded-lg font-display text-[13px] font-bold tracking-wide transition-colors ${
              on ? "bg-card text-ink shadow-sm" : "text-mut"
            }`}
          >
            {LABEL[t]}
          </button>
        );
      })}
    </div>
  );
}
