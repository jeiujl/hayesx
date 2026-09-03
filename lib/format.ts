export function hhmm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

export function elapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

const DATE = new Intl.DateTimeFormat(undefined, { day: "2-digit", month: "short", year: "numeric" });
const TIME = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" });
const MONTH = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });

export const fmtDate = (t: number) => DATE.format(t);
export const fmtTime = (t: number) => TIME.format(t);
export const fmtDateTime = (t: number) => `${DATE.format(t)}, ${TIME.format(t)}`;
export const fmtMonth = (t: number) => MONTH.format(t);

export function relative(t: number): string {
  const diff = Date.now() - t;
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return fmtDate(t);
}

/** yyyy-mm-dd in local time, for <input type="date"> round-trips. */
export function toDateInput(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function toTimeInput(t: number): string {
  const d = new Date(t);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
export function fromDateTimeInput(date: string, time: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm).getTime();
}
