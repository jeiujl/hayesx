"use client";

import { useState } from "react";
import { SECTIONS } from "@/content/copy";

type State = "idle" | "sending" | "done" | "error";

export default function Reserve() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    const form = new FormData(e.currentTarget);
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/reserve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          location: form.get("location"),
          message: form.get("message"),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setError("Network error. Please try again.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-sky/35 bg-sky/[0.06] p-8 text-center sm:p-12">
        <div className="eyebrow">Received</div>
        <h3 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Your place is recorded.
        </h3>
        <p className="mx-auto mt-3 max-w-[46ch] text-[15px] leading-relaxed text-dust">
          A member of the HayesX team will be in touch about allocation and delivery
          for the 2026 holiday window.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-xl border border-line bg-void px-4 py-3.5 text-[15px] text-bone outline-none transition-colors placeholder:text-faint focus:border-sky";

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <label className="sm:col-span-1">
        <span className="sr-only">Full name</span>
        <input name="name" required placeholder="Full name" autoComplete="name" className={field} />
      </label>
      <label className="sm:col-span-1">
        <span className="sr-only">Email address</span>
        <input
          name="email"
          type="email"
          required
          placeholder="Email address"
          autoComplete="email"
          className={field}
        />
      </label>
      <label className="sm:col-span-2">
        <span className="sr-only">Where you would fly</span>
        <input
          name="location"
          placeholder="Where you would fly (city, state)"
          autoComplete="address-level2"
          className={field}
        />
      </label>
      <label className="sm:col-span-2">
        <span className="sr-only">Anything we should know</span>
        <textarea
          name="message"
          rows={3}
          placeholder="Anything we should know — flying experience, timing, questions"
          className={`${field} resize-y`}
        />
      </label>

      {state === "error" ? (
        <p role="alert" className="sm:col-span-2 text-[14px] leading-relaxed text-ember">
          {error}
        </p>
      ) : null}

      <div className="sm:col-span-2 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={state === "sending"}
          className="w-full rounded-full bg-bone px-8 py-4 font-display text-[15px] font-bold tracking-wide text-void transition-opacity hover:opacity-85 disabled:opacity-50 sm:w-auto"
        >
          {state === "sending" ? "Sending…" : SECTIONS.reserve.cta}
        </button>
        <p className="font-mono text-[11px] leading-relaxed tracking-wide text-faint">
          Limited orders · 2026 holiday delivery
        </p>
      </div>
    </form>
  );
}
