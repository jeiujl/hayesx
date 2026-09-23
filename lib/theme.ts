"use client";

/**
 * Day / Night / Auto, the control every electronic flight bag ships.
 *
 * Stored in localStorage rather than IndexedDB so the no-flash script in the
 * document head can read it synchronously before first paint.
 */
export type Theme = "day" | "night" | "auto";

export const THEME_KEY = "hayesx.theme";
export const THEMES: Theme[] = ["day", "night", "auto"];

export function readTheme(): Theme {
  if (typeof localStorage === "undefined") return "day";
  const v = localStorage.getItem(THEME_KEY);
  return v === "night" || v === "auto" ? v : "day";
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* private mode — the choice just does not persist */
  }
}

/** Runs before paint so the app never flashes the wrong theme. */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_KEY
)});document.documentElement.dataset.theme=(t==="night"||t==="auto")?t:"day"}catch(e){document.documentElement.dataset.theme="day"}})()`;
