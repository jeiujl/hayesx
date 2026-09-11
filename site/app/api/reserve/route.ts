import { NextResponse } from "next/server";

/**
 * Reservation enquiries.
 *
 * Set RESERVE_WEBHOOK_URL in the Vercel project to the endpoint that should
 * receive them — a form provider, a CRM inbound hook, or an internal service.
 * Until it is set the route reports that reservations are not connected rather
 * than silently accepting and discarding an enquiry.
 */

interface Body {
  name?: unknown;
  email?: unknown;
  location?: unknown;
  message?: unknown;
}

const str = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const name = str(body.name, 120);
  const email = str(body.email, 200);
  const location = str(body.location, 160);
  const message = str(body.message, 2000);

  if (!name) return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const endpoint = process.env.RESERVE_WEBHOOK_URL;
  if (!endpoint) {
    return NextResponse.json(
      {
        error:
          "Reservations are not connected yet. Please contact HayesX directly and we will hold your place.",
      },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        source: "hayesx.net/#reserve",
        receivedAt: new Date().toISOString(),
        name,
        email,
        location,
        message,
      }),
    });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
  } catch {
    return NextResponse.json(
      { error: "We could not record that just now. Please try again shortly." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
