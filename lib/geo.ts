"use client";

/**
 * Best-effort position fix for stamping a signed record.
 *
 * Never blocks. A pilot at a field with no fix, with location denied, or on a
 * browser that silently stalls on getCurrentPosition must still be able to
 * sign — so this always settles, and resolves null rather than throwing.
 */
export function locate(timeoutMs = 6000): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }
    let settled = false;
    const finish = (value: GeolocationPosition | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };
    const timer = setTimeout(() => finish(null), timeoutMs);
    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => finish(pos),
        () => finish(null),
        { timeout: timeoutMs, maximumAge: 60_000, enableHighAccuracy: true }
      );
    } catch {
      finish(null);
    }
  });
}
