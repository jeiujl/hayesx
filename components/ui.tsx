"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type Tone = "sky" | "go" | "warn" | "caut" | "quiet";

const TONE: Record<Tone, string> = {
  sky: "bg-sky text-white",
  go: "bg-go text-white",
  warn: "bg-warn text-white",
  caut: "bg-caut text-white",
  quiet: "bg-card text-ink border border-line",
};

export function Button({
  tone = "sky",
  small,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; small?: boolean }) {
  return (
    <button
      {...rest}
      className={`flex w-full items-center justify-center gap-2 rounded-xl font-display font-bold tracking-wide disabled:bg-line disabled:text-faint disabled:cursor-not-allowed ${
        small ? "min-h-11 text-sm" : "tap text-base"
      } ${TONE[tone]} ${className}`}
    />
  );
}

export function LinkButton({
  href,
  tone = "sky",
  small,
  children,
}: {
  href: string;
  tone?: Tone;
  small?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex w-full items-center justify-center gap-2 rounded-xl font-display font-bold tracking-wide ${
        small ? "min-h-11 text-sm" : "tap text-base"
      } ${TONE[tone]}`}
    >
      {children}
    </Link>
  );
}

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`rounded-xl border border-line bg-card p-3.5 ${className}`}>
      {children}
    </div>
  );
}

export function Pill({
  tone = "sky",
  children,
}: {
  tone?: "sky" | "go" | "warn" | "caut" | "neutral";
  children: ReactNode;
}) {
  const map = {
    sky: "bg-sky-bg text-sky",
    go: "bg-go-bg text-go",
    warn: "bg-warn-bg text-warn",
    caut: "bg-caut-bg text-caut",
    neutral: "bg-line2 text-mut",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10.5px] font-bold uppercase tracking-widest ${map[tone]}`}
    >
      {children}
    </span>
  );
}

export function Cite({ children }: { children: ReactNode }) {
  return <span className="font-mono text-[10.5px] tracking-wide text-faint">{children}</span>;
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">
      {children}
    </span>
  );
}

export function ScreenTitle({ title, sub }: { title: string; sub?: ReactNode }) {
  return (
    <div>
      <h1 className="font-display text-xl font-bold tracking-tight">{title}</h1>
      {sub ? <div className="mt-0.5 text-[12.5px] text-mut">{sub}</div> : null}
    </div>
  );
}

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
    <label className="block rounded-xl border border-line bg-card px-3 py-2">
      <div className="flex items-baseline justify-between gap-2">
        <Label>{label}</Label>
        {hint ? (
          <span className="font-mono text-[10px] tracking-wide text-sky">{hint}</span>
        ) : null}
      </div>
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-transparent py-1 text-[15px] font-medium outline-none placeholder:font-normal placeholder:text-faint ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full resize-y bg-transparent py-1 text-[15px] font-medium outline-none placeholder:font-normal placeholder:text-faint ${props.className ?? ""}`}
    />
  );
}

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
    danger: "bg-warn-bg border-warn-line text-warn",
    caution: "bg-caut-bg border-caut-line text-caut",
    info: "bg-sky-bg border-sky-line text-sky",
  } as const;
  return (
    <div className={`rounded-xl border p-4 ${map[tone]}`}>
      {title ? (
        <h2 className="font-display text-sm font-extrabold uppercase tracking-[0.14em]">
          {title}
        </h2>
      ) : null}
      <div className="mt-2 text-ink">{children}</div>
      {cite ? <div className="mt-2 font-mono text-[10.5px] tracking-wide">{cite}</div> : null}
    </div>
  );
}

export function Row({
  href,
  onClick,
  title,
  sub,
  right,
}: {
  href?: string;
  onClick?: () => void;
  title: ReactNode;
  sub?: ReactNode;
  right?: ReactNode;
}) {
  const inner = (
    <>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-medium">{title}</div>
        {sub ? <div className="mt-0.5">{sub}</div> : null}
      </div>
      {right ?? <span className="text-faint">›</span>}
    </>
  );
  const cls =
    "flex w-full items-center gap-3 border-b border-line2 px-3.5 py-3 text-left last:border-b-0";
  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

export function List({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden rounded-xl border border-line bg-card">{children}</div>;
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-[13.5px] text-mut">
      {children}
    </div>
  );
}
