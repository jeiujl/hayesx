"use client";

import Link from "next/link";
import { Card, Cite, Label, ScreenTitle } from "@/components/ui";
import { PROCEDURES, RESPONSE_PRIORITY } from "@/lib/emergency";

export default function Emergency() {
  return (
    <div className="flex flex-col gap-3.5 rise">
      <ScreenTitle
        title="Emergency procedures"
        sub={
          <>
            <Cite>FM Chapter 3</Cite> · works offline
          </>
        }
      />

      <Card className="border-caut-line bg-caut-bg">
        <Label>Response priority · FM 3.2</Label>
        <ol className="mt-2 flex list-decimal flex-col gap-1 pl-5 text-[13.5px] font-semibold">
          {RESPONSE_PRIORITY.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        {PROCEDURES.map((p) => (
          <Link
            key={p.section}
            href={`/manuals/emergency/${p.section}`}
            className="block rounded-lg border border-warn-line border-l-[3px] border-l-warn bg-card px-3 py-2.5"
          >
            <div className="font-mono text-[10px] font-semibold tracking-wide text-warn">
              {p.section}
            </div>
            <div className="mt-0.5 text-[12.5px] font-semibold leading-tight">{p.title}</div>
          </Link>
        ))}
      </div>

      <div className="px-2 text-center">
        <Cite>Ground reference only. Do not operate a device in flight. — FM 4.1</Cite>
      </div>
    </div>
  );
}
