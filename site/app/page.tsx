import Link from "next/link";
import FoldDiagram from "@/components/FoldDiagram";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import PlanView from "@/components/PlanView";
import Reserve from "@/components/Reserve";
import Reveal from "@/components/Reveal";
import { HEADLINE, SPEC_GROUPS } from "@/content/aircraft";
import { HERO, SECTIONS } from "@/content/copy";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-8 bg-sky/60" />
      <span className="eyebrow">{children}</span>
    </div>
  );
}

export default function Home() {
  const summary = SPEC_GROUPS.find((g) => g.id === "performance")!.specs.slice(0, 6);

  return (
    <>
      <Nav />
      <main id="main">
        {/* ── Hero ───────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-24">
          <div className="grid-paper pointer-events-none absolute inset-0 opacity-[0.5]" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(168,204,224,0.09),transparent)]" aria-hidden="true" />

          <div className="relative mx-auto max-w-[1200px] px-5 sm:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
              <Reveal>
                <Eyebrow>{HERO.eyebrow}</Eyebrow>
                <h1 className="mt-6 max-w-[12ch] font-display text-[clamp(2.7rem,6.4vw,5rem)] leading-[0.95] font-extrabold tracking-[-0.035em] text-balance">
                  {HERO.headline}
                </h1>
                <p className="mt-6 max-w-[48ch] text-[clamp(1.02rem,1.5vw,1.2rem)] leading-relaxed text-dust">
                  {HERO.lede}
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="#reserve"
                    className="rounded-full bg-bone px-8 py-4 text-center font-display text-[15px] font-bold tracking-wide text-void transition-opacity hover:opacity-85"
                  >
                    {HERO.cta}
                  </Link>
                  <Link
                    href="/tech-specifications"
                    className="rounded-full border border-line-2 px-8 py-4 text-center font-display text-[15px] font-bold tracking-wide text-bone transition-colors hover:border-sky hover:text-sky"
                  >
                    {HERO.secondary}
                  </Link>
                </div>
                <p className="mt-4 font-mono text-[11px] tracking-wide text-faint">{HERO.ctaSub}</p>
              </Reveal>

              <Reveal delay={120}>
                <PlanView className="mx-auto w-full max-w-[540px]" />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Headline figures ───────────────────────────────────────── */}
        <section className="border-y border-line bg-deep">
          <div className="mx-auto grid max-w-[1200px] grid-cols-2 divide-x divide-line px-5 sm:px-8 lg:grid-cols-4">
            {HEADLINE.map((h, i) => (
              <div
                key={h.label}
                className={`px-4 py-8 first:pl-0 last:pr-0 sm:py-10 ${i === 1 ? "lg:border-r" : ""} ${
                  i < 2 ? "border-b border-line lg:border-b-0" : ""
                }`}
              >
                <div className="font-display text-[clamp(2.2rem,5vw,3.4rem)] leading-none font-extrabold tracking-tight tabular-nums">
                  {h.value}
                  {h.unit ? <span className="ml-1 text-[0.42em] text-sky">{h.unit}</span> : null}
                </div>
                <div className="mt-2.5 text-[13px] leading-snug text-dust">{h.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── The aircraft ───────────────────────────────────────────── */}
        <section id="aircraft" className="scroll-mt-20 py-24 sm:py-32">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
              <Reveal>
                <Eyebrow>{SECTIONS.aircraft.eyebrow}</Eyebrow>
                <h2 className="mt-5 max-w-[14ch] font-display text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.02] font-bold tracking-[-0.03em] text-balance">
                  {SECTIONS.aircraft.heading}
                </h2>
              </Reveal>
              <Reveal delay={80} className="lg:pt-3">
                <p className="text-[clamp(1.05rem,1.6vw,1.25rem)] leading-relaxed text-bone">
                  {SECTIONS.aircraft.body}
                </p>
                <p className="mt-5 max-w-[62ch] leading-relaxed text-dust">
                  {SECTIONS.aircraft.body2}
                </p>

                <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-3">
                  {[
                    ["Configuration", "Quadrotor octocopter"],
                    ["Rotor diameter", "1,447 mm"],
                    ["Airframe", "Aeronautical aluminium"],
                    ["Arms", "Carbon fibre cantilever"],
                    ["Occupants", "1 pilot"],
                    ["Powertrain", "Electric, dual 108 V"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">{k}</dt>
                      <dd className="mt-1.5 font-display text-[15px] font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Part 103 ───────────────────────────────────────────────── */}
        <section id="part103" className="scroll-mt-20 border-y border-line bg-deep py-24 sm:py-32">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <Reveal>
              <Eyebrow>{SECTIONS.part103.eyebrow}</Eyebrow>
              <h2 className="mt-5 max-w-[16ch] font-display text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.02] font-bold tracking-[-0.03em] text-balance">
                {SECTIONS.part103.heading}
              </h2>
              <p className="mt-6 max-w-[64ch] text-[clamp(1.05rem,1.6vw,1.2rem)] leading-relaxed text-dust">
                {SECTIONS.part103.body} {SECTIONS.part103.body2}
              </p>
            </Reveal>

            <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
              {SECTIONS.part103.points.map((p, i) => (
                <Reveal key={p.title} delay={i * 90}>
                  <div className="h-full bg-deep p-7 sm:p-8">
                    <div className="font-mono text-[11px] tracking-[0.14em] text-sky">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="mt-4 font-display text-[19px] leading-snug font-bold tracking-tight">
                      {p.title}
                    </h3>
                    <p className="mt-3 text-[14.5px] leading-relaxed text-dust">{p.body}</p>
                    <p className="mt-5 font-mono text-[10.5px] tracking-wide text-faint">{p.src}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Transport ──────────────────────────────────────────────── */}
        <section id="transport" className="scroll-mt-20 py-24 sm:py-32">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
              <Reveal>
                <Eyebrow>{SECTIONS.transport.eyebrow}</Eyebrow>
                <h2 className="mt-5 max-w-[13ch] font-display text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.02] font-bold tracking-[-0.03em] text-balance">
                  {SECTIONS.transport.heading}
                </h2>
                <p className="mt-6 max-w-[52ch] text-[1.05rem] leading-relaxed text-bone">
                  {SECTIONS.transport.body}
                </p>
                <p className="mt-4 max-w-[52ch] leading-relaxed text-dust">
                  {SECTIONS.transport.body2}
                </p>
                <div className="mt-9 flex gap-10">
                  <div>
                    <div className="font-display text-4xl font-extrabold tracking-tight tabular-nums">
                      2,450<span className="ml-1 text-[0.4em] text-faint">mm</span>
                    </div>
                    <div className="mt-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">
                      Unfolded
                    </div>
                  </div>
                  <div className="h-14 w-px bg-line" aria-hidden="true" />
                  <div>
                    <div className="font-display text-4xl font-extrabold tracking-tight text-sky tabular-nums">
                      1,380<span className="ml-1 text-[0.4em] text-sky/70">mm</span>
                    </div>
                    <div className="mt-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">
                      Folded
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={100}>
                <div className="rounded-2xl border border-line bg-deep p-6 sm:p-9">
                  <FoldDiagram className="w-full" />
                  <p className="mt-5 border-t border-line pt-4 font-mono text-[10.5px] leading-relaxed tracking-wide text-faint">
                    Drawn to scale. Length and height are unchanged by folding: the arms
                    fold inward, not back.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Safety ─────────────────────────────────────────────────── */}
        <section id="safety" className="scroll-mt-20 border-y border-line bg-deep py-24 sm:py-32">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <Reveal>
              <Eyebrow>{SECTIONS.safety.eyebrow}</Eyebrow>
              <h2 className="mt-5 max-w-[16ch] font-display text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.02] font-bold tracking-[-0.03em] text-balance">
                {SECTIONS.safety.heading}
              </h2>
              <p className="mt-6 max-w-[58ch] leading-relaxed text-dust">{SECTIONS.safety.body}</p>
            </Reveal>

            <div className="mt-14 grid gap-x-12 gap-y-11 sm:grid-cols-2 lg:grid-cols-3">
              {SECTIONS.safety.items.map((s, i) => (
                <Reveal key={s.title} delay={(i % 3) * 80}>
                  <div className="h-full">
                    <div className="rule-fade h-px w-full" aria-hidden="true" />
                    <h3 className="mt-6 font-display text-[19px] leading-snug font-bold tracking-tight">
                      {s.title}
                    </h3>
                    <p className="mt-3 text-[14.5px] leading-relaxed text-dust">{s.body}</p>
                    <p className="mt-4 font-mono text-[10.5px] tracking-wide text-faint">{s.src}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Company ────────────────────────────────────────────────── */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <Reveal>
              <Eyebrow>{SECTIONS.company.eyebrow}</Eyebrow>
              <h2 className="mt-5 max-w-[14ch] font-display text-[clamp(2rem,4.8vw,3.8rem)] leading-[1.02] font-bold tracking-[-0.03em] text-balance">
                {SECTIONS.company.heading}
              </h2>
              <div className="mt-8 grid gap-8 md:grid-cols-2 md:gap-16">
                <p className="text-[clamp(1.05rem,1.7vw,1.3rem)] leading-relaxed text-bone">
                  {SECTIONS.company.body}
                </p>
                <p className="leading-relaxed text-dust">{SECTIONS.company.body2}</p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Spec summary ───────────────────────────────────────────── */}
        <section className="border-t border-line py-20 sm:py-24">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <Eyebrow>At a glance</Eyebrow>
                  <h2 className="mt-5 font-display text-[clamp(1.7rem,3.2vw,2.4rem)] font-bold tracking-tight">
                    Performance
                  </h2>
                </div>
                <Link
                  href="/tech-specifications"
                  className="inline-block py-2 font-display text-[14px] font-bold tracking-wide text-sky transition-opacity hover:opacity-75"
                >
                  All specifications →
                </Link>
              </div>

              <dl className="mt-10 grid gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
                {summary.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-baseline justify-between gap-6 border-b border-line py-4"
                  >
                    <dt className="text-[14.5px] text-dust">{s.label}</dt>
                    <dd className="font-mono text-[15px] font-medium whitespace-nowrap tabular-nums">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        {/* ── Reserve ────────────────────────────────────────────────── */}
        <section id="reserve" className="scroll-mt-20 border-t border-line bg-deep py-24 sm:py-32">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
              <Reveal>
                <Eyebrow>{SECTIONS.reserve.eyebrow}</Eyebrow>
                <h2 className="mt-5 max-w-[13ch] font-display text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.02] font-bold tracking-[-0.03em] text-balance">
                  {SECTIONS.reserve.heading}
                </h2>
                <p className="mt-6 max-w-[46ch] text-[1.05rem] leading-relaxed text-dust">
                  {SECTIONS.reserve.body} Tell us where you would fly and we will be in touch
                  about allocation.
                </p>
              </Reveal>
              <Reveal delay={90}>
                <Reserve />
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
