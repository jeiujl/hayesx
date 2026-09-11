/**
 * Folded vs unfolded width, drawn to scale in millimetres against the space
 * between the wheel wells of a full-size pickup bed. Width is the whole story:
 * 2,450 mm unfolded, 1,380 mm folded (FM 1.3).
 */
const WELL = 1500; // typical clearance between wheel wells, full-size bed

function Bar({
  y,
  width,
  label,
  value,
  tone,
}: {
  y: number;
  width: number;
  label: string;
  value: string;
  tone: "dust" | "sky";
}) {
  const color = tone === "sky" ? "var(--color-sky)" : "var(--color-faint)";
  return (
    <g>
      <rect
        x={-width / 2}
        y={y}
        width={width}
        height={190}
        rx={26}
        fill={tone === "sky" ? "rgba(168,204,224,0.1)" : "transparent"}
        stroke={color}
        strokeWidth="7"
        strokeDasharray={tone === "sky" ? undefined : "22 18"}
      />
      <text
        x={0}
        y={y + 78}
        textAnchor="middle"
        fill="var(--color-bone)"
        fontSize="76"
        fontFamily="var(--font-display)"
        fontWeight="600"
      >
        {label}
      </text>
      <text
        x={0}
        y={y + 152}
        textAnchor="middle"
        fill={color}
        fontSize="64"
        fontFamily="var(--font-mono)"
      >
        {value}
      </text>
    </g>
  );
}

export default function FoldDiagram({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="-1320 -40 2640 760"
      className={className}
      role="img"
      aria-label="Width comparison: unfolded 2,450 mm, folded 1,380 mm, against 1,500 mm between pickup wheel wells."
    >
      {/* wheel-well envelope */}
      <rect
        x={-WELL / 2}
        y={-20}
        width={WELL}
        height={720}
        rx={20}
        fill="rgba(240,236,230,0.028)"
        stroke="var(--color-line-2)"
        strokeWidth="5"
      />
      <text
        x={WELL / 2 + 34}
        y={40}
        fill="var(--color-faint)"
        fontSize="54"
        fontFamily="var(--font-mono)"
      >
        1,500 mm
      </text>
      <text
        x={WELL / 2 + 34}
        y={108}
        fill="var(--color-faint)"
        fontSize="48"
        fontFamily="var(--font-mono)"
      >
        between wheel wells
      </text>

      <Bar y={110} width={2450} label="Unfolded" value="2,450 mm" tone="dust" />
      <Bar y={420} width={1380} label="Folded" value="1,380 mm" tone="sky" />
    </svg>
  );
}
