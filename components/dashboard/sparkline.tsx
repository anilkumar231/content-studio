"use client";

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  /** Fill area under curve */
  fill?: boolean;
  strokeWidth?: number;
}

export function Sparkline({
  data,
  color = "#4F6AFF",
  height = 40,
  width = 100,
  fill = true,
  strokeWidth = 1.5,
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pad = 2;

  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (v - min) / range) * (height - pad * 2);
    return { x, y };
  });

  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const fillPath =
    linePath +
    ` L ${pts[pts.length - 1].x.toFixed(1)} ${height} L ${pts[0].x.toFixed(1)} ${height} Z`;

  const gradId = `spark-${color.replace(/[^a-z0-9]/gi, "")}-${Math.random().toString(36).slice(2, 6)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {fill && (
        <path d={fillPath} fill={`url(#${gradId})`} />
      )}

      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Last point dot */}
      <circle
        cx={pts[pts.length - 1].x}
        cy={pts[pts.length - 1].y}
        r={2.5}
        fill={color}
      />
    </svg>
  );
}

/* ── Mini bar chart ──────────────────────────────────────────── */
interface MiniBarProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  gap?: number;
}

export function MiniBar({
  data,
  color = "#4F6AFF",
  height = 32,
  width = 80,
  gap = 2,
}: MiniBarProps) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data, 1);
  const barW = (width - gap * (data.length - 1)) / data.length;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {data.map((v, i) => {
        const barH = Math.max(2, (v / max) * height);
        const x = i * (barW + gap);
        const y = height - barH;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={barH}
            rx={barW / 3}
            fill={color}
            opacity={i === data.length - 1 ? 1 : 0.5}
            style={{
              transformOrigin: `${x + barW / 2}px ${height}px`,
              animation: `bar-grow 0.6s ease ${i * 0.05}s both`,
            }}
          />
        );
      })}
    </svg>
  );
}
