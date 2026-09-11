import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import PlanView from "@/components/PlanView";
import Reveal from "@/components/Reveal";
import { AIRCRAFT, SPEC_GROUPS } from "@/content/aircraft";

export const metadata: Metadata = {
  title: "Tech Specifications",
  description:
    "Full technical specifications for the HayesX-250 ultralight eVTOL: dimensions, weights, performance, propulsion, operating limitations, structure and regulatory category.",
  alternates: { canonical: "/tech-specifications/" },
};

export default function TechSpecifications() {
  return (
    <>
      <Nav />
      <main id="main">
        <section className="relative overflow-hidden border-b border-line pt-28 pb-14 sm:pt-36">
          <div className="grid-paper pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
          <div className="relative mx-auto max-w-[1200px] px-5 sm:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.85fr]">
              <div>
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-sky/60" />
                  <span className="eyebrow">{AIRCRAFT.model}</span>
                </div>
                <h1 className="mt-6 font-display text-[clamp(2.4rem,6.5vw,4.5rem)] leading-[0.98] font-extrabold tracking-[-0.035em]">
                  Tech specifications
                </h1>
                <p className="mt-6 max-w-[56ch] text-[1.05rem] leading-relaxed text-dust">
                  {AIRCRAFT.category}. {AIRCRAFT.configuration}. Every figure below is
                  taken from {AIRCRAFT.document} Revision {AIRCRAFT.revision}, and carries
                  its section so it can be traced back to the controlling document.
                </p>
              </div>
              <PlanView className="w-full max-w-[460px] justify-self-center opacity-90" />
            </div>
          </div>
        </section>

        {/* Section index */}
        <nav
          aria-label="Specification sections"
          className="sticky top-16 z-40 border-b border-line bg-void/92 backdrop-blur-xl"
        >
          <div className="mx-auto flex max-w-[1200px] gap-6 overflow-x-auto px-5 py-1 sm:px-8">
            {SPEC_GROUPS.map((g) => (
              <a
                key={g.id}
                href={`#${g.id}`}
                className="inline-flex items-center py-2.5 font-mono text-[11px] whitespace-nowrap uppercase tracking-[0.13em] text-dust transition-colors hover:text-sky"
              >
                {g.title}
              </a>
            ))}
          </div>
        </nav>

        <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 sm:py-24">
          {SPEC_GROUPS.map((group, gi) => (
            <Reveal key={group.id}>
              <section
                id={group.id}
                className={`scroll-mt-32 ${gi > 0 ? "mt-16 border-t border-line pt-16 sm:mt-20 sm:pt-20" : ""}`}
              >
                <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                  <div className="lg:sticky lg:top-36 lg:self-start">
                    <div className="font-mono text-[11px] tracking-[0.14em] text-sky">
                      {String(gi + 1).padStart(2, "0")}
                    </div>
                    <h2 className="mt-3 font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight font-bold tracking-tight">
                      {group.title}
                    </h2>
                    {group.note ? (
                      <p className="mt-4 max-w-[40ch] text-[14.5px] leading-relaxed text-dust">
                        {group.note}
                      </p>
                    ) : null}
                  </div>

                  <dl>
                    {group.specs.map((s) => (
                      <div
                        key={s.label}
                        className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 border-b border-line py-4 sm:grid-cols-[1fr_auto_5rem]"
                      >
                        <dt className="text-[15px] leading-snug">{s.label}</dt>
                        <dd className="text-right font-mono text-[15px] font-medium whitespace-nowrap tabular-nums">
                          {s.value}
                          {s.alt ? (
                            <span className="mt-0.5 block font-sans text-[12px] font-normal text-faint">
                              {s.alt}
                            </span>
                          ) : null}
                        </dd>
                        <span className="col-start-2 row-start-2 text-right font-mono text-[10px] tracking-wide text-faint sm:col-start-3 sm:row-start-1">
                          {s.src}
                        </span>
                      </div>
                    ))}
                  </dl>
                </div>
              </section>
            </Reveal>
          ))}

          <Reveal>
            <div className="mt-20 rounded-2xl border border-line bg-deep p-8 sm:p-12">
              <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-bold tracking-tight">
                Reserve an allocation
              </h2>
              <p className="mt-3 max-w-[52ch] leading-relaxed text-dust">
                HayesX is now taking limited orders for 2026 holiday delivery.
              </p>
              <Link
                href="/#reserve"
                className="mt-7 inline-block rounded-full bg-bone px-8 py-4 font-display text-[15px] font-bold tracking-wide text-void transition-opacity hover:opacity-85"
              >
                Reserve an allocation
              </Link>
            </div>
          </Reveal>

          <p className="mt-10 font-mono text-[11px] leading-relaxed tracking-wide text-faint">
            Preliminary technical specifications, subject to change. Where a figure is
            given in both metric and imperial, the metric value is controlling.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
