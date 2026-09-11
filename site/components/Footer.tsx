import Link from "next/link";
import { AIRCRAFT } from "@/content/aircraft";
import { NAV, SITE } from "@/content/copy";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-deep">
      <div className="mx-auto max-w-[1200px] px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="font-display text-xl font-extrabold tracking-tight">HayesX</div>
            <p className="mt-3 max-w-[38ch] text-[14px] leading-relaxed text-dust">
              Ultralight eVTOL aircraft for personal aviation. Founded by aviation experts
              and lifelong enthusiasts, built in the Mojave Desert near Las Vegas.
            </p>
            <p className="mt-4 font-mono text-[11px] leading-relaxed tracking-wide text-faint">
              {AIRCRAFT.manufacturer}
              <br />
              {AIRCRAFT.location}
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">Explore</h2>
            <ul className="mt-3 space-y-1">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="inline-block py-1.5 text-[14px] text-dust transition-colors hover:text-bone">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">Aircraft</h2>
            <dl className="mt-4 space-y-2.5 text-[14px]">
              <div className="flex justify-between gap-4">
                <dt className="text-dust">Model</dt>
                <dd className="font-mono tabular-nums">{AIRCRAFT.model}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-dust">Category</dt>
                <dd className="font-mono">Part 103</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-dust">Occupants</dt>
                <dd className="font-mono tabular-nums">1</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-dust">Delivery</dt>
                <dd className="font-mono tabular-nums">2026</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] leading-relaxed tracking-wide text-faint">
            © {new Date().getFullYear()} {AIRCRAFT.manufacturer} All rights reserved.
          </p>
          <p className="max-w-[62ch] font-mono text-[11px] leading-relaxed tracking-wide text-faint">
            Operated as an ultralight vehicle under FAA Part 103. Specifications are
            preliminary and subject to change. Figures from {AIRCRAFT.document} Rev {AIRCRAFT.revision}.
          </p>
        </div>
      </div>
      <div className="sr-only">{SITE.description}</div>
    </footer>
  );
}
