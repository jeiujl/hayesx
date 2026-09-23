"use client";

import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, Cite, Label, LinkButton, List, Pill, Row, ScreenTitle, TextInput } from "@/components/ui";
import { CHECKLIST } from "@/lib/checklist";
import { db } from "@/lib/db";
import { PROCEDURES } from "@/lib/emergency";
import { LIMIT_ROWS } from "@/lib/limits";
import { MANUALS } from "@/lib/manuals";

export default function Manuals() {
  const [q, setQ] = useState("");
  const pendingRevision = useLiveQuery(
    () => db.messages.filter((m) => m.kind === "revision" && !m.acknowledgedAt).first(),
    []
  );

  const term = q.trim().toLowerCase();
  const hits = useMemo(() => {
    if (term.length < 2) return [];
    const out: Array<{ doc: string; label: string; href: string }> = [];
    for (const p of PROCEDURES) {
      if (`${p.section} ${p.title} ${p.steps.join(" ")}`.toLowerCase().includes(term)) {
        out.push({
          doc: "Flight Manual",
          label: `${p.section} ${p.title}`,
          href: `/manuals/emergency/${p.section}`,
        });
      }
    }
    for (const m of MANUALS) {
      for (const c of m.chapters) {
        for (const s of c.sections) {
          if (s.toLowerCase().includes(term) || c.title.toLowerCase().includes(term)) {
            out.push({ doc: m.title, label: `Ch. ${c.number} · ${s}`, href: "#" });
          }
        }
      }
    }
    return out.slice(0, 12);
  }, [term]);

  return (
    <div className="flex flex-col gap-3.5 rise">
      <ScreenTitle title="Manuals" />

      <LinkButton href="/manuals/emergency" tone="warn">
        ⚠ Emergency Procedures
      </LinkButton>

      <label className="block rounded-xl border border-line bg-card px-3 py-2">
        <Label>Search both manuals</Label>
        <TextInput
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='e.g. "thermal runaway", "rotor"'
        />
      </label>

      {term.length >= 2 ? (
        hits.length > 0 ? (
          <List>
            {hits.map((h, i) => (
              <Row key={i} href={h.href} title={h.label} sub={<Cite>{h.doc}</Cite>} />
            ))}
          </List>
        ) : (
          <Card>
            <Cite>No matches.</Cite>
          </Card>
        )
      ) : null}

      {pendingRevision ? (
        <Link href="/messages">
          <Card className="border-caut-line bg-caut-bg">
            <Label>Revision notice</Label>
            <div className="mt-0.5 text-[13.5px] font-medium">{pendingRevision.title}</div>
            <Cite>Required by FM 4.2 before your next flight</Cite>
          </Card>
        </Link>
      ) : null}

      {MANUALS.map((m) => (
        <Card key={m.slug}>
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold">{m.title}</div>
              <Cite>
                {[m.documentNumber, m.revision ? `Rev ${m.revision}` : null, m.issueDate, m.languages]
                  .filter(Boolean)
                  .join(" · ")}{" "}
                · {m.chapters.length} chapters
              </Cite>
            </div>
            <Pill tone="go">Offline</Pill>
          </div>
          <div className="mt-3 flex flex-col gap-1.5 border-t border-line2 pt-2.5">
            {m.chapters.map((c) => (
              <div key={c.number} className="flex gap-2.5 text-[13px]">
                <span className="w-6 flex-none font-mono text-[11px] text-faint">{c.number}</span>
                <span className="min-w-0 flex-1">
                  <span className="font-medium">{c.title}</span>
                  {c.sections.length > 0 ? (
                    <span className="block text-[11.5px] leading-snug text-mut">
                      {c.sections.join(" · ")}
                    </span>
                  ) : null}
                </span>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <div className="pt-1">
        <Label>Operating limitations · Flight Manual Ch. 2</Label>
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full border-collapse text-[13.5px]">
          <tbody>
            {LIMIT_ROWS.map((r) => (
              <tr key={r.label} className="border-b border-line2 last:border-b-0">
                <td className="py-2 pr-2">{r.label}</td>
                <td className="py-2 text-right font-mono font-semibold whitespace-nowrap tabular-nums">
                  {r.value}
                </td>
                <td className="py-2 pl-3 text-right font-mono text-[10.5px] whitespace-nowrap text-faint">
                  {r.src}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Cite>
        Every limit above is read from the same file the checklist uses, so a manual revision
        changes them in one place. Checklist {CHECKLIST.documentNumber} rev {CHECKLIST.revision}.
      </Cite>
    </div>
  );
}
