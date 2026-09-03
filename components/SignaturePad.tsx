"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./ui";

/** Canvas signature capture. Exports a PNG data URL, copied by value onto records. */
export default function SignaturePad({
  value,
  onChange,
  caption = "Signature of pilot in command",
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  caption?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111519";
  }, []);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function down(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const p = pos(e);
    drawing.current = true;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    if (!dirty) setDirty(true);
  }

  function up() {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current;
    if (canvas && dirty) onChange(canvas.toDataURL("image/png"));
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDirty(false);
    onChange(null);
  }

  // A stored signature is shown as an image until the pilot chooses to redraw.
  if (value && !dirty) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-card px-3 pt-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt="Stored signature" className="h-[64px] w-full object-contain" />
        <div className="mt-1 flex items-center justify-between border-t border-line2 py-1.5">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.06em] text-faint">
            {caption}
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="font-mono text-[10px] uppercase tracking-wider text-sky"
          >
            Redraw
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-line bg-card px-3 pt-2">
      <canvas
        ref={canvasRef}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
        className="h-[64px] w-full touch-none"
        aria-label="Sign here"
      />
      <div className="mt-1 flex items-center justify-between border-t border-line2 py-1.5">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.06em] text-faint">
          {dirty ? caption : "Sign here"}
        </span>
        {dirty ? (
          <button
            type="button"
            onClick={clear}
            className="font-mono text-[10px] uppercase tracking-wider text-sky"
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function SignatureButton({
  onSign,
  disabled,
  label,
  tone = "go",
}: {
  onSign: (dataUrl: string) => void;
  disabled?: boolean;
  label: string;
  tone?: "go" | "sky";
}) {
  const [sig, setSig] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-3">
      <SignaturePad value={sig} onChange={setSig} />
      <Button tone={tone} disabled={disabled || !sig} onClick={() => sig && onSign(sig)}>
        {label}
      </Button>
    </div>
  );
}
