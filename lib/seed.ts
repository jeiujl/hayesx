"use client";

import { db, uid } from "./db";
import type { Message } from "./types";

/**
 * Seeds the bulletins a new pilot would already have waiting from HayesX.
 * Runs once, after onboarding.
 */
export async function seedMessages() {
  if ((await db.messages.count()) > 0) return;
  const day = 86_400_000;
  const now = Date.now();
  const messages: Message[] = [
    {
      id: uid(),
      kind: "bulletin",
      severity: "safety",
      title: "Propeller tie wire inspection",
      body: "Inspect the tie wire fixing on all eight rotors before the next flight. Any wire showing fraying, slack or a broken twist must be replaced before flight. Applies to S/N HX250-0001 through HX250-0089.",
      reference: "SB-2026-03",
      requiresAck: true,
      acknowledgedAt: null,
      receivedAt: now - 5 * day,
      read: false,
    },
    {
      id: uid(),
      kind: "revision",
      severity: "service",
      title: "Flight Manual Revision A issued",
      body: "Initial release of HayesX-250-FM-001. Review is required before flight under FM 4.2. Your acknowledgement is recorded against every preflight you sign.",
      reference: "HayesX-250-FM-001 Rev A",
      requiresAck: false,
      acknowledgedAt: null,
      receivedAt: now - 21 * day,
      read: false,
    },
  ];
  await db.messages.bulkPut(messages);
}
