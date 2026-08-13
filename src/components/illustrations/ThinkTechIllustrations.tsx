import * as React from "react";

/* ─── Geometric Shapes ─── */

export function DotGrid({
  rows = 5,
  cols = 5,
  color = "#E5E7EB",
  dotSize = 3,
  gap = 10,
  className = "",
}: {
  rows?: number;
  cols?: number;
  color?: string;
  dotSize?: number;
  gap?: number;
  className?: string;
}) {
  const w = cols * gap;
  const h = rows * gap;
  const dots: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push(
        <circle
          key={`${r}-${c}`}
          cx={c * gap + gap / 2}
          cy={r * gap + gap / 2}
          r={dotSize / 2}
          fill={color}
        />
      );
    }
  }
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {dots}
    </svg>
  );
}

export function YellowCircle({
  size = 200,
  variant = "full",
  className = "",
}: {
  size?: number;
  variant?: "full" | "half" | "quarter";
  className?: string;
}) {
  const r = size / 2;
  if (variant === "half") {
    return (
      <svg
        width={size}
        height={r}
        viewBox={`0 0 ${size} ${r}`}
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <path
          d={`M 0 ${r} A ${r} ${r} 0 0 1 ${size} ${r}`}
          fill="#FCC400"
        />
      </svg>
    );
  }
  if (variant === "quarter") {
    return (
      <svg
        width={r}
        height={r}
        viewBox={`0 0 ${r} ${r}`}
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <path d={`M 0 ${r} A ${r} ${r} 0 0 1 ${r} 0 L ${r} ${r} Z`} fill="#FCC400" />
      </svg>
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx={r} cy={r} r={r} fill="#FCC400" />
    </svg>
  );
}

export function BlueCircle({
  size = 160,
  variant = "full",
  className = "",
}: {
  size?: number;
  variant?: "full" | "half" | "quarter";
  className?: string;
}) {
  const r = size / 2;
  if (variant === "half") {
    return (
      <svg
        width={size}
        height={r}
        viewBox={`0 0 ${size} ${r}`}
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <path d={`M 0 ${r} A ${r} ${r} 0 0 1 ${size} ${r}`} fill="#1769D1" />
      </svg>
    );
  }
  if (variant === "quarter") {
    return (
      <svg
        width={r}
        height={r}
        viewBox={`0 0 ${r} ${r}`}
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <path d={`M 0 ${r} A ${r} ${r} 0 0 1 ${r} 0 L ${r} ${r} Z`} fill="#1769D1" />
      </svg>
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx={r} cy={r} r={r} fill="#1769D1" />
    </svg>
  );
}

export function OrangeCircle({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const r = size / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx={r} cy={r} r={r} fill="#FF7417" />
    </svg>
  );
}

export function SpeechBubble({
  size = 48,
  color = "#22C55E",
  className = "",
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="4" y="4" width="40" height="30" rx="15" fill={color} />
      <path d="M14 34 L10 44 L22 34" fill={color} />
      {/* Three dots inside */}
      <circle cx="17" cy="19" r="2.5" fill="white" />
      <circle cx="24" cy="19" r="2.5" fill="white" />
      <circle cx="31" cy="19" r="2.5" fill="white" />
    </svg>
  );
}

export function QuestionMark({
  size = 56,
  color = "#EF4444",
  bgColor = "#FEE2E2",
  className = "",
}: {
  size?: number;
  color?: string;
  bgColor?: string;
  className?: string;
}) {
  const r = size / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx={r} cy={r} r={r} fill={bgColor} />
      <text
        x="50%"
        y="55%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill={color}
        fontSize={size * 0.5}
        fontWeight="bold"
        fontFamily="Inter, system-ui, sans-serif"
      >
        ?
      </text>
    </svg>
  );
}

/* ─── Composed Illustrations ─── */

/**
 * Simplified geometric person silhouette.
 * Used as a building block for composed illustrations.
 */
function PersonSilhouette({
  x = 0,
  y = 0,
  scale = 1,
  shirtColor = "#1769D1",
}: {
  x?: number;
  y?: number;
  scale?: number;
  shirtColor?: string;
}) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* Head */}
      <circle cx="30" cy="16" r="14" fill="#111111" stroke="#111111" strokeWidth="1.5" />
      {/* Body / shirt */}
      <path
        d="M10 42 C10 32 20 28 30 28 C40 28 50 32 50 42 L50 65 L10 65 Z"
        fill={shirtColor}
        stroke="#111111"
        strokeWidth="1.5"
      />
      {/* Arms */}
      <path d="M10 42 C2 44 0 55 4 60" stroke="#111111" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M50 42 C58 44 60 55 56 60" stroke="#111111" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>
  );
}

/**
 * Landing page hero illustration: two students communicating.
 * Uses yellow circle background, speech bubble, orange accent dot.
 * Illustration density: HIGH (landing page).
 */
export function HeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 360"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Large yellow circle background */}
      <circle cx="200" cy="180" r="160" fill="#FCC400" opacity="0.15" />
      <circle cx="280" cy="140" r="120" fill="#FCC400" />

      {/* Person 1 — student asking */}
      <PersonSilhouette x={80} y={140} scale={1.3} shirtColor="#1769D1" />

      {/* Person 2 — student with phone */}
      <PersonSilhouette x={220} y={150} scale={1.2} shirtColor="#111111" />

      {/* Speech bubble */}
      <SpeechBubbleShape cx={160} cy={120} />

      {/* Phone in hand of person 2 */}
      <rect x="258" y="210" width="14" height="24" rx="2" fill="#F5F6F7" stroke="#111111" strokeWidth="1.5" />

      {/* Orange accent dot */}
      <circle cx="340" cy="300" r="16" fill="#FF7417" />

      {/* Blue quarter-circle bottom-left */}
      <path d="M0 360 A80 80 0 0 1 80 280 L0 280 Z" fill="#1769D1" opacity="0.8" />

      {/* Dot grid top-right */}
      {Array.from({ length: 4 }).map((_, r) =>
        Array.from({ length: 4 }).map((_, c) => (
          <circle
            key={`dg-${r}-${c}`}
            cx={320 + c * 10}
            cy={30 + r * 10}
            r="1.5"
            fill="#E5E7EB"
          />
        ))
      )}
    </svg>
  );
}

function SpeechBubbleShape({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx - 24}, ${cy - 20})`}>
      <rect width="48" height="32" rx="16" fill="#22C55E" />
      <path d="M12 32 L8 42 L22 32" fill="#22C55E" />
      <circle cx="16" cy="16" r="2.5" fill="white" />
      <circle cx="24" cy="16" r="2.5" fill="white" />
      <circle cx="32" cy="16" r="2.5" fill="white" />
    </g>
  );
}

/**
 * Display page illustration: student holding phone with geometric background.
 * Positioned on the right side (~25-30%) of the display page.
 * Illustration density: MODERATE.
 */
export function DisplayIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 400"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Large yellow circle */}
      <circle cx="180" cy="160" r="140" fill="#FCC400" />

      {/* Person with phone */}
      <PersonSilhouette x={80} y={120} scale={1.5} shirtColor="#111111" />

      {/* Phone in hand */}
      <rect x="130" y="230" width="18" height="30" rx="3" fill="#F5F6F7" stroke="#111111" strokeWidth="1.5" />

      {/* Speech bubble */}
      <SpeechBubbleShape cx={190} cy={130} />

      {/* Orange dot */}
      <circle cx="260" cy="340" r="20" fill="#FF7417" />

      {/* Small dot grid */}
      {Array.from({ length: 3 }).map((_, r) =>
        Array.from({ length: 3 }).map((_, c) => (
          <circle
            key={`dd-${r}-${c}`}
            cx={20 + c * 10}
            cy={350 + r * 10}
            r="1.5"
            fill="#E5E7EB"
          />
        ))
      )}
    </svg>
  );
}

/**
 * Small decorative composition for the /ask page.
 * Uses minimal geometric shapes to stay unobtrusive on mobile.
 * Illustration density: SMALL.
 */
export function AskPageDecoration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Yellow half-circle */}
      <path d="M120 120 A60 60 0 0 0 120 0" fill="#FCC400" opacity="0.3" />

      {/* Small speech bubble */}
      <rect x="20" y="30" width="36" height="24" rx="12" fill="#1769D1" opacity="0.15" />
      <path d="M30 54 L26 62 L38 54" fill="#1769D1" opacity="0.15" />

      {/* Orange dot */}
      <circle cx="70" cy="90" r="8" fill="#FF7417" opacity="0.5" />

      {/* Dot grid */}
      {Array.from({ length: 3 }).map((_, r) =>
        Array.from({ length: 3 }).map((_, c) => (
          <circle
            key={`ad-${r}-${c}`}
            cx={15 + c * 8}
            cy={85 + r * 8}
            r="1.5"
            fill="#E5E7EB"
          />
        ))
      )}
    </svg>
  );
}

/**
 * Small phone illustration for QR section on display page.
 */
export function PhoneIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      width="40"
      height="72"
      viewBox="0 0 40 72"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="36" height="68" rx="6" fill="white" stroke="#111111" strokeWidth="2" />
      <rect x="6" y="10" width="28" height="44" rx="2" fill="#F5F6F7" />
      <circle cx="20" cy="62" r="3" fill="#E5E7EB" />
      {/* QR icon on screen */}
      <rect x="14" y="22" width="12" height="12" rx="1" fill="#E5E7EB" stroke="#687280" strokeWidth="0.5" />
    </svg>
  );
}
