"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useEffect } from "react";
import { Button, Card, Cite, Empty, Label, Pill, ScreenTitle } from "@/components/ui";
import { db } from "@/lib/db";
import { relative } from "@/lib/format";

export default function Messages() {
  const messages = useLiveQuery(
    async () => (await db.messages.toArray()).sort((a, b) => b.receivedAt - a.receivedAt),
    []
  );

  // Opening the tab marks bulletins read; acknowledgement stays an explicit act.
  // Guarded so the write cannot re-trigger the live query in a loop.
  const unread = (messages ?? []).filter((m) => !m.read).map((m) => m.id);
  const unreadKey = unread.join(",");
  useEffect(() => {
    if (unreadKey === "") return;
    db.messages.bulkUpdate(unreadKey.split(",").map((id) => ({ key: id, changes: { read: true } })));
  }, [unreadKey]);

  async function acknowledge(id: string) {
    await db.messages.update(id, { acknowledgedAt: Date.now() });
  }

  return (
    <div className="flex flex-col gap-3 rise">
      <ScreenTitle title="Messages" sub="Bulletins and support from HayesX" />

      {!messages || messages.length === 0 ? (
        <Empty>No messages.</Empty>
      ) : (
        messages.map((m) => (
          <Card
            key={m.id}
            className={
              m.severity === "safety" && !m.acknowledgedAt
                ? "border-warn-line border-l-[3px] border-l-warn"
                : ""
            }
          >
            <div className="flex items-center gap-2">
              <Pill
                tone={
                  m.severity === "safety" ? "warn" : m.severity === "service" ? "caut" : "accent"
                }
              >
                {m.kind === "revision" ? "Revision" : m.kind === "support" ? "Support" : "Safety bulletin"}
              </Pill>
              <span className="ml-auto font-mono text-[10px] text-faint">
                {relative(m.receivedAt)}
              </span>
            </div>

            <div className="mt-1.5 text-[15px] font-semibold leading-snug">
              {m.reference ? `${m.reference} · ` : ""}
              {m.title}
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-mut">{m.body}</p>

            {m.requiresAck ? (
              m.acknowledgedAt ? (
                <div className="mt-2 border-t border-line2 pt-2">
                  <Cite>Acknowledged {relative(m.acknowledgedAt)}</Cite>
                </div>
              ) : (
                <div className="mt-2.5">
                  <Button tone="warn" small onClick={() => acknowledge(m.id)}>
                    Acknowledge
                  </Button>
                </div>
              )
            ) : null}
          </Card>
        ))
      )}

      <Card>
        <Label>Support</Label>
        <div className="mt-1 text-[13.5px] leading-snug text-mut">
          Defects raised from the no-go flow are attached here automatically, with their photos,
          when the device next reaches a network.
        </div>
      </Card>
    </div>
  );
}
