"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState, type ReactNode } from "react";
import { db, readSession } from "@/lib/db";
import { elapsed } from "@/lib/format";

const TABS = [
  { href: "/preflight", label: "Preflight", icon: <path d="M4 12.5 9 17.5 20 6.5" /> },
  {
    href: "/logbook",
    label: "Logbook",
    icon: (
      <>
        <path d="M4 5h16v14H4z" />
        <path d="M4 9h16M9 9v10" />
      </>
    ),
  },
  {
    href: "/manuals",
    label: "Manuals",
    icon: (
      <>
        <path d="M4 5.5A2 2 0 0 1 6 4h5v16H6a2 2 0 0 0-2 2z" />
        <path d="M20 5.5A2 2 0 0 0 18 4h-5v16h5a2 2 0 0 1 2 2z" />
      </>
    ),
  },
  { href: "/messages", label: "Messages", icon: <path d="M4 6h16v11H9l-5 4z" /> },
  {
    href: "/account",
    label: "Account",
    icon: (
      <>
        <circle cx="12" cy="8.5" r="3.5" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </>
    ),
  },
];

/** Global aircraft status banner — airworthy, flight open, or grounded. */
function Banner() {
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

  if (aircraft.status === "grounded") {
    return (
      <Link
        href="/preflight/grounded"
        className="flex items-center gap-2 border-b border-warn-line bg-warn-bg px-4 py-2 text-xs font-semibold text-warn"
      >
        <i className="h-2 w-2 flex-none rounded-full bg-current" />
        <span className="truncate">GROUNDED — {defect?.itemText ?? "defect open"}</span>
        <span className="ml-auto flex-none font-mono text-[11px] font-medium opacity-70">
          {aircraft.serialNumber}
        </span>
      </Link>
    );
  }

  if (session?.flightStartedAt) {
    return (
      <div className="flex items-center gap-2 border-b border-sky-line bg-sky-bg px-4 py-2 text-xs font-semibold text-sky">
        <i className="h-2 w-2 flex-none rounded-full bg-current" />
        <span>FLIGHT OPEN — {elapsed(now - session.flightStartedAt)}</span>
        <span className="ml-auto font-mono text-[11px] font-medium opacity-70">
          {aircraft.serialNumber}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 border-b border-go-line bg-go-bg px-4 py-2 text-xs font-semibold text-go">
      <i className="h-2 w-2 flex-none rounded-full bg-current" />
      <span>AIRWORTHY</span>
      <span className="ml-auto font-mono text-[11px] font-medium opacity-70">
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
  const unread = useLiveQuery(
    () => db.messages.filter((m) => !m.read).count(),
    []
  );

  // Onboarding gate: no profile or no airframe means nothing else can work.
  useEffect(() => {
    if (profile === undefined || aircraftCount === undefined) return; // still loading
    if (profile === null || aircraftCount === 0) router.replace("/onboarding");
  }, [profile, aircraftCount, router]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col bg-bg">
      <Banner />
      <main className="flex-1 overflow-x-hidden px-4 pt-4 pb-6">{children}</main>
      <nav
        aria-label="App sections"
        className="safe-bottom sticky bottom-0 grid grid-cols-5 border-t border-line bg-card pt-1.5 pb-2"
      >
        {TABS.map((t) => {
          const active = pathname === t.href || pathname.startsWith(t.href + "/");
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex flex-col items-center gap-0.5 py-1 ${
                active ? "text-sky" : "text-faint"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[21px] w-[21px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {t.icon}
              </svg>
              <span className="text-[9.5px] font-semibold">{t.label}</span>
              {t.href === "/messages" && (unread ?? 0) > 0 ? (
                <i className="absolute top-0 right-[calc(50%-17px)] grid h-[15px] min-w-[15px] place-items-center rounded-full bg-warn px-1 font-mono text-[9px] font-bold text-white not-italic">
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
