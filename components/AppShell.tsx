"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState, type ReactNode } from "react";
import { db, readSession } from "@/lib/db";
import { elapsed } from "@/lib/format";

/* Outline when idle, tinted fill when active — the way native tab bars read. */
const TABS: Array<{ href: string; label: string; icon: (on: boolean) => ReactNode }> = [
  {
    href: "/preflight",
    label: "Preflight",
    icon: (on) => (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2.5" fill={on ? "currentColor" : "none"} fillOpacity={0.14} />
        <path d="M9 4.5v-1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
        <path d="M8.5 13l2.5 2.5 4.5-5" />
      </>
    ),
  },
  {
    href: "/logbook",
    label: "Logbook",
    icon: (on) => (
      <>
        <path
          d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v14H7.5A2.5 2.5 0 0 0 5 19.5z"
          fill={on ? "currentColor" : "none"}
          fillOpacity={0.14}
        />
        <path d="M5 19.5A2.5 2.5 0 0 0 7.5 22H19v-5" />
        <path d="M9 7.5h6M9 11h4" />
      </>
    ),
  },
  {
    href: "/manuals",
    label: "Manuals",
    icon: (on) => (
      <>
        <path
          d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"
          fill={on ? "currentColor" : "none"}
          fillOpacity={0.14}
        />
        <path d="M14 3v5h5M9 13h6M9 17h4" />
      </>
    ),
  },
  {
    href: "/messages",
    label: "Messages",
    icon: (on) => (
      <path
        d="M20.5 11.5a8.5 8.5 0 0 1-12.3 7.6L3.5 20.5l1.4-4.4A8.5 8.5 0 1 1 20.5 11.5z"
        fill={on ? "currentColor" : "none"}
        fillOpacity={0.14}
      />
    ),
  },
  {
    href: "/account",
    label: "Account",
    icon: (on) => (
      <>
        <circle cx="12" cy="12" r="9" fill={on ? "currentColor" : "none"} fillOpacity={0.14} />
        <circle cx="12" cy="10" r="3" />
        <path d="M6.6 18.3a6.5 6.5 0 0 1 10.8 0" />
      </>
    ),
  },
];

/** Annunciator strip: the aircraft's state, always visible. */
function StatusStrip() {
  const aircraft = useLiveQuery(() => db.aircraft.toCollection().first(), []);
  const defect = useLiveQuery(
    async () =>
      aircraft?.groundedDefectId ? db.defects.get(aircraft.groundedDefectId) : undefined,
    [aircraft?.groundedDefectId]
  );
  const session = useLiveQuery(() => readSession(), []);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!session?.flightStartedAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [session?.flightStartedAt]);

  if (!aircraft) return null;

  const base =
    "flex items-center gap-2 px-4 py-2 text-[12px] font-bold tracking-[0.06em]";
  const serial = (
    <span className="ml-auto flex-none font-mono text-[11.5px] font-medium tracking-normal opacity-75">
      {aircraft.serialNumber}
    </span>
  );

  if (aircraft.status === "grounded") {
    return (
      <Link href="/preflight/grounded" className={`${base} bg-warn text-white`}>
        <i className="h-2 w-2 flex-none animate-pulse rounded-full bg-white" />
        <span className="truncate">GROUNDED — {defect?.itemText ?? "defect open"}</span>
        {serial}
      </Link>
    );
  }

  if (session?.flightStartedAt) {
    return (
      <div className={`${base} bg-accent text-white`}>
        <i className="h-2 w-2 flex-none animate-pulse rounded-full bg-white" />
        <span>
          FLIGHT OPEN — <span className="font-mono tabular-nums">{elapsed(now - session.flightStartedAt)}</span>
        </span>
        {serial}
      </div>
    );
  }

  return (
    <div className={`${base} border-b border-line bg-card text-go`}>
      <i className="h-2 w-2 flex-none rounded-full bg-go" />
      <span>AIRWORTHY</span>
      <span className="ml-auto flex-none font-mono text-[11.5px] font-medium tracking-normal text-mut">
        {aircraft.serialNumber}
      </span>
    </div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const profile = useLiveQuery(async () => (await db.profile.get("me")) ?? null, []);
  const aircraftCount = useLiveQuery(() => db.aircraft.count(), []);
  const unread = useLiveQuery(() => db.messages.filter((m) => !m.read).count(), []);

  // Onboarding gate: no profile or no airframe means nothing else can work.
  useEffect(() => {
    if (profile === undefined || aircraftCount === undefined) return; // still loading
    if (profile === null || aircraftCount === 0) router.replace("/onboarding");
  }, [profile, aircraftCount, router]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[560px] flex-col bg-bg">
      <div className="sticky top-0 z-30">
        <StatusStrip />
      </div>

      <main className="flex-1 overflow-x-hidden px-4 pt-3 pb-8">{children}</main>

      <nav
        aria-label="App sections"
        className="safe-bottom sticky bottom-0 z-30 grid grid-cols-5 border-t border-line bg-card/85 pt-1.5 pb-1.5 backdrop-blur-xl backdrop-saturate-150"
      >
        {TABS.map((t) => {
          const active = pathname === t.href || pathname.startsWith(t.href + "/");
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-12 flex-col items-center justify-center gap-0.5 transition-colors ${
                active ? "text-accent" : "text-faint"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[25px] w-[25px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {t.icon(active)}
              </svg>
              <span className="text-[10.5px] font-medium">{t.label}</span>
              {t.href === "/messages" && (unread ?? 0) > 0 ? (
                <i className="absolute top-0.5 left-[calc(50%+4px)] grid h-[17px] min-w-[17px] place-items-center rounded-full bg-warn px-1 text-[10.5px] font-bold text-white not-italic tabular-nums">
                  {unread}
                </i>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
