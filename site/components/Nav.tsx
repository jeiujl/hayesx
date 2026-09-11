"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NAV } from "@/content/copy";

function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 34 22" className={className} aria-hidden="true" fill="none">
      <path d="M2 4v14M2 11h12M14 4v14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M21 4l11 14M32 4L21 18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export default function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid || open ? "border-b border-line bg-void/88 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-bone" aria-label="HayesX home">
          <Mark className="h-[18px] w-[28px] text-sky" />
          <span className="font-display text-[17px] font-extrabold tracking-[0.02em]">HayesX</span>
        </Link>

        <nav className="ml-auto hidden items-center gap-7 lg:flex" aria-label="Primary">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="py-3 text-[13.5px] font-medium text-dust transition-colors hover:text-bone"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/#reserve"
          className="ml-auto hidden rounded-full bg-bone px-5 py-2.5 font-display text-[13px] font-bold tracking-wide text-void transition-opacity hover:opacity-85 lg:ml-0 lg:block"
        >
          Reserve
        </Link>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="ml-auto grid h-10 w-10 place-items-center rounded-lg border border-line text-bone lg:hidden"
        >
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            {open ? <path d="M5 5l10 10M15 5L5 15" /> : <path d="M3 6h14M3 13h14" />}
          </svg>
        </button>
      </div>

      {open ? (
        <nav
          className="border-t border-line bg-void px-5 pb-7 pt-3 lg:hidden"
          aria-label="Primary, mobile"
        >
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block border-b border-line py-4 font-display text-lg font-semibold text-bone"
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/#reserve"
            onClick={() => setOpen(false)}
            className="mt-6 block rounded-full bg-bone py-3.5 text-center font-display font-bold text-void"
          >
            Reserve an allocation
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
