"use client";

/**
 * UI primitives in the grouped-table language of aviation EFBs (ForeFlight,
 * Garmin Pilot, LogTen): large titles, inset grouped lists with caps section
 * headers, right-aligned values, chevrons, segmented controls, and filled /
 * tinted / plain buttons. Every colour comes from a theme variable.
 */

import Link from "next/link";
import type { ReactNode } from "react";

/* ── Buttons ─────────────────────────────────────────────────────────── */

type Tone = "accent" | "go" | "warn" | "caut" | "quiet";

const FILLED: Record<Tone, string> = {
  accent: "bg-accent text-white",
  go: "bg-go text-white",
  warn: "bg-warn text-white",
  caut: "bg-caut text-white",
  quiet: "bg-card text-accent border border-line",
};

function buttonClass(tone: Tone, small?: boolean) {
  return `flex w-full items-center justify-center gap-2 rounded-xl font-semibold tracking-[-0.01em] transition-[opacity,transform] active:scale-[0.985] active:opacity-85 disabled:bg-line disabled:text-faint disabled:border-transparent disabled:cursor-not-allowed disabled:active:scale-100 ${
    small ? "min-h-11 text-[15px]" : "tap text-[17px]"
  } ${FILLED[tone]}`;
}

export function Button({
  tone = "accent",
  small,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; small?: boolean }) {
  return <button {...rest} className={`${buttonClass(tone, small)} ${className}`} />;
}

export function LinkButton({
  href,
  tone = "accent",
  small,
  children,
}: {
  href: string;
  tone?: Tone;
  small?: boolean;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass(tone, small)}>
      {children}
    </Link>
  );
}

/* ── Titles ──────────────────────────────────────────────────────────── */

/** iOS large title, the header every EFB screen opens with. */
export function ScreenTitle({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end gap-3 pt-1">
      <div className="min-w-0 flex-1">
        <h1 className="text-[32px] leading-[1.1] font-bold tracking-[-0.025em]">{title}</h1>
        {sub ? <div className="mt-1 text-[14px] text-mut">{sub}</div> : null}
      </div>
      {action ? <div className="flex-none pb-1">{action}</div> : null}
    </div>
  );
}

/* ── Grouped tables ──────────────────────────────────────────────────── */

/** A captioned group: caps label above, inset list, optional footnote below. */
export function Group({
  label,
  footer,
  children,
}: {
  label?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      {label ? <h2 className="group-label mb-1.5 px-4">{label}</h2> : null}
      <div className="overflow-hidden rounded-xl bg-card">{children}</div>
      {footer ? (
        <p className="mt-1.5 px-4 text-[12.5px] leading-snug text-faint">{footer}</p>
      ) : null}
    </section>
  );
}

/** Kept for existing screens: an ungrouped inset list. */
export function List({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden rounded-xl bg-card">{children}</div>;
}

function Chevron() {
  return (
    <svg
      viewBox="0 0 8 14"
      className="h-[13px] w-[7px] flex-none text-faint"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 1l6 6-6 6" />
    </svg>
  );
}

/**
 * A table row. Title left, value right, chevron when it navigates. Separators
 * are inset from the leading edge, as in a native grouped table.
 */
export function Row({
  href,
  onClick,
  title,
  sub,
  value,
  right,
  leading,
  chevron,
}: {
  href?: string;
  onClick?: () => void;
  title: ReactNode;
  sub?: ReactNode;
  value?: ReactNode;
  right?: ReactNode;
  leading?: ReactNode;
  chevron?: boolean;
}) {
  const navigates = chevron ?? !!(href || onClick);
  const inner = (
    <>
      {leading ? <div className="flex-none">{leading}</div> : null}
      <div className="flex min-w-0 flex-1 items-center gap-3 border-b border-line2 py-3 pr-4 group-last/row:border-b-0">
        <div className="min-w-0 flex-1">
          <div className="text-[16px] leading-snug">{title}</div>
          {sub ? <div className="mt-0.5 text-[13px] leading-snug text-mut">{sub}</div> : null}
        </div>
        {value !== undefined ? (
          <div className="flex-none text-right text-[16px] text-mut tabular-nums">{value}</div>
        ) : null}
        {right}
        {navigates ? <Chevron /> : null}
      </div>
    </>
  );
  const cls =
    "group/row flex w-full min-h-11 items-center gap-3 pl-4 text-left transition-colors active:bg-line2";
  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {inner}
      </button>
    );
  }
  return <div className={cls}>{inner}</div>;
}

/* ── Segmented control ───────────────────────────────────────────────── */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid gap-0.5 rounded-[10px] bg-line2 p-0.5"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`min-h-8 truncate rounded-[8px] px-1.5 text-[13px] font-semibold transition-colors ${
              on ? "bg-card text-ink shadow-[0_1px_3px_rgba(0,0,0,0.12)]" : "text-mut"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Cards, pills, text ──────────────────────────────────────────────── */

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={`rounded-xl bg-card p-4 ${className}`}>{children}</div>;
}

export function Pill({
  tone = "accent",
  children,
}: {
  tone?: "accent" | "go" | "warn" | "caut" | "neutral";
  children: ReactNode;
}) {
  const map = {
    accent: "bg-accent-bg text-accent",
    go: "bg-go-bg text-go",
    warn: "bg-warn-bg text-warn",
    caut: "bg-caut-bg text-caut",
    neutral: "bg-line2 text-mut",
  } as const;
  return (
    <span
      className={`inline-flex flex-none items-center gap-1 rounded-md px-2 py-[3px] text-[11px] font-bold uppercase tracking-[0.04em] ${map[tone]}`}
    >
      {children}
    </span>
  );
}

/** Status dot + word, for airworthiness and signing states. */
export function Status({
  tone,
  children,
}: {
  tone: "go" | "warn" | "caut" | "accent";
  children: ReactNode;
}) {
  const dot = { go: "bg-go", warn: "bg-warn", caut: "bg-caut", accent: "bg-accent" }[tone];
  const txt = { go: "text-go", warn: "text-warn", caut: "text-caut", accent: "text-accent" }[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[14px] font-semibold ${txt}`}>
      <i className={`h-2 w-2 rounded-full ${dot}`} />
      {children}
    </span>
  );
}

export function Cite({ children }: { children: ReactNode }) {
  return <span className="font-mono text-[11.5px] tracking-tight text-faint">{children}</span>;
}

export function Label({ children }: { children: ReactNode }) {
  return <span className="group-label">{children}</span>;
}

/* ── Form fields ─────────────────────────────────────────────────────── */

/** A labelled input sitting in its own inset row. */
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block rounded-xl bg-card px-4 py-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[12.5px] font-medium text-mut">{label}</span>
        {hint ? <span className="text-[11.5px] font-medium text-accent">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-transparent py-0.5 text-[17px] outline-none placeholder:text-faint read-only:text-mut ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full resize-y bg-transparent py-0.5 text-[17px] outline-none placeholder:text-faint read-only:text-mut ${props.className ?? ""}`}
    />
  );
}

/* ── Alerts ──────────────────────────────────────────────────────────── */

export function Alert({
  tone,
  title,
  cite,
  children,
}: {
  tone: "danger" | "caution" | "info";
  title?: string;
  cite?: string;
  children: ReactNode;
}) {
  const map = {
    danger: { box: "bg-warn-bg", bar: "bg-warn", head: "text-warn" },
    caution: { box: "bg-caut-bg", bar: "bg-caut", head: "text-caut" },
    info: { box: "bg-accent-bg", bar: "bg-accent", head: "text-accent" },
  }[tone];
  return (
    <div className={`relative overflow-hidden rounded-xl py-3.5 pr-4 pl-5 ${map.box}`}>
      <i className={`absolute inset-y-0 left-0 w-1 ${map.bar}`} aria-hidden="true" />
      {title ? (
        <h2 className={`text-[13px] font-bold uppercase tracking-[0.06em] ${map.head}`}>{title}</h2>
      ) : null}
      <div className={`${title ? "mt-1" : ""} text-ink`}>{children}</div>
      {cite ? <div className={`mt-1.5 font-mono text-[11.5px] ${map.head}`}>{cite}</div> : null}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl bg-card px-6 py-10 text-center text-[15px] leading-relaxed text-mut">
      {children}
    </div>
  );
}
