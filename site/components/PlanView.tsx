/**
 * HayesX-250 plan view, drawn to scale in millimetres.
 *
 * The viewBox is the aircraft's real maximum footprint: 3,170 mm across the
 * rotor tips by 2,655 mm long (FM 1.3). Rotor discs are the true 1,447 mm
 * diameter. Arms are shown in plan, so the upper and lower rotor sets of each
 * coaxial pair project onto one another.
 */

const R = 723.5; // rotor radius, mm
const AX = 604; // rotor centre offset along length
const AY = 861.5; // rotor centre offset across width

const HUBS: Array<{ x: number; y: number; k: string }> = [
  { x: -AX, y: -AY, k: "fl" },
  { x: AX, y: -AY, k: "fr" },
  { x: -AX, y: AY, k: "rl" },
  { x: AX, y: AY, k: "rr" },
];

function Rotor({ x, y, i }: { x: number; y: number; i: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* swept disc */}
      <circle r={R} fill="url(#disc)" stroke="#4a4540" strokeWidth="4" />
      <circle r={R} fill="none" stroke="var(--color-sky)" strokeWidth="3" opacity="0.34" />

      {/* lower rotor */}
      <g
        className="rotor rotor-b"
        style={{ animationDelay: `${i * -0.7}s` }}
        opacity="0.45"
      >
        <rect x={-R * 0.94} y={-34} width={R * 1.88} height={68} rx={34} fill="#8d857b" />
      </g>
      {/* upper rotor */}
      <g className="rotor" style={{ animationDelay: `${i * -1.1}s` }} opacity="0.8">
        <rect
          x={-R * 0.94}
          y={-34}
          width={R * 1.88}
          height={68}
          rx={34}
          fill="var(--color-bone)"
          transform="rotate(52)"
        />
      </g>
      {/* motor stack */}
      <circle r={96} fill="#2e2b28" stroke="#5a534c" strokeWidth="5" />
      <circle r={38} fill="var(--color-sky)" opacity="0.85" />
    </g>
  );
}

export default function PlanView({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="-1585 -1328 3170 2655"
      className={className}
      role="img"
      aria-label="Scale plan view of the HayesX-250: four arms, eight rotors, single central cockpit."
    >
      <defs>
        <radialGradient id="disc">
          <stop offset="52%" stopColor="#a8cce0" stopOpacity="0.045" />
          <stop offset="100%" stopColor="#a8cce0" stopOpacity="0.14" />
        </radialGradient>
        <linearGradient id="arm" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#575049" />
          <stop offset="100%" stopColor="#2e2b28" />
        </linearGradient>
      </defs>

      {/* arms */}
      {HUBS.map((h) => (
        <line
          key={h.k}
          x1={0}
          y1={0}
          x2={h.x}
          y2={h.y}
          stroke="url(#arm)"
          strokeWidth="132"
          strokeLinecap="round"
        />
      ))}

      {/* landing skids */}
      {[-560, 560].map((x) => (
        <rect
          key={x}
          x={x - 38}
          y={-760}
          width={76}
          height={1520}
          rx={38}
          fill="var(--color-surface)"
          stroke="var(--color-line-2)"
          strokeWidth="4"
        />
      ))}

      {/* fuselage and roll cage */}
      <rect
        x={-430}
        y={-680}
        width={860}
        height={1360}
        rx={200}
        fill="var(--color-deep)"
        stroke="#4a4540"
        strokeWidth="7"
      />
      <rect
        x={-330}
        y={-560}
        width={660}
        height={1120}
        rx={150}
        fill="none"
        stroke="var(--color-sky)"
        strokeWidth="5"
        opacity="0.4"
      />
      {/* seat */}
      <rect
        x={-210}
        y={-300}
        width={420}
        height={620}
        rx={110}
        fill="var(--color-raised)"
        stroke="var(--color-line-2)"
        strokeWidth="5"
      />
      {/* pilot shoulders / head, plan view */}
      <circle cy={-110} r={132} fill="var(--color-surface)" stroke="var(--color-line-2)" strokeWidth="5" />

      {HUBS.map((h, i) => (
        <Rotor key={h.k} x={h.x} y={h.y} i={i} />
      ))}
    </svg>
  );
}
