"use client";

interface ActivityHeatmapProps {
  /** Array of ISO date strings that had activity */
  activeDates: string[];
  weeks?: number;
}

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const CELL = 12;
const GAP = 3;
const LABEL_W = 26;

function getColor(count: number) {
  if (count === 0) return "oklch(1 0 0 / 0.05)";
  if (count === 1) return "oklch(0.55 0.18 264 / 0.55)";
  if (count === 2) return "oklch(0.607 0.207 264.376 / 0.75)";
  return "oklch(0.65 0.22 264.376)";
}

function getStroke(count: number) {
  if (count === 0) return "oklch(1 0 0 / 0.07)";
  return "oklch(0.607 0.207 264.376 / 0.3)";
}

export function ActivityHeatmap({ activeDates, weeks = 14 }: ActivityHeatmapProps) {
  // Build date → count map
  const countMap: Record<string, number> = {};
  for (const d of activeDates) {
    const key = d.slice(0, 10);
    countMap[key] = (countMap[key] || 0) + 1;
  }

  // Build grid: weeks × 7 days, ending today
  const today = new Date();
  const startDay = new Date(today);
  startDay.setDate(today.getDate() - weeks * 7 + 1);
  // Align to Sunday
  startDay.setDate(startDay.getDate() - startDay.getDay());

  const cells: { date: Date; count: number }[][] = [];
  const cur = new Date(startDay);
  for (let w = 0; w < weeks; w++) {
    const week: { date: Date; count: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const key = cur.toISOString().slice(0, 10);
      week.push({ date: new Date(cur), count: countMap[key] || 0 });
      cur.setDate(cur.getDate() + 1);
    }
    cells.push(week);
  }

  // Month labels
  const monthLabels: { label: string; col: number }[] = [];
  for (let w = 0; w < weeks; w++) {
    const firstDay = cells[w][0].date;
    if (firstDay.getDate() <= 7) {
      monthLabels.push({
        label: firstDay.toLocaleString("default", { month: "short" }),
        col: w,
      });
    }
  }

  const svgW = LABEL_W + weeks * (CELL + GAP) - GAP;
  const svgH = 18 + 7 * (CELL + GAP) - GAP;
  const totalRuns = Object.values(countMap).reduce((a, b) => a + b, 0);
  const activeDays = Object.values(countMap).filter((v) => v > 0).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          <span className="text-foreground font-medium">{totalRuns}</span> pipeline runs across{" "}
          <span className="text-foreground font-medium">{activeDays}</span> days
        </span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          {[0, 1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-sm"
              style={{
                width: 10,
                height: 10,
                background: getColor(n),
                border: `1px solid ${getStroke(n)}`,
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full"
        style={{ maxHeight: 110 }}
      >
        {/* Day labels */}
        {DAY_LABELS.map((label, d) => (
          <text
            key={d}
            x={LABEL_W - 4}
            y={18 + d * (CELL + GAP) + CELL * 0.75}
            fontSize={8}
            fill="oklch(0.58 0.016 264)"
            textAnchor="end"
          >
            {label}
          </text>
        ))}

        {/* Month labels */}
        {monthLabels.map(({ label, col }) => (
          <text
            key={`${label}-${col}`}
            x={LABEL_W + col * (CELL + GAP)}
            y={10}
            fontSize={8}
            fill="oklch(0.58 0.016 264)"
          >
            {label}
          </text>
        ))}

        {/* Cells */}
        {cells.map((week, w) =>
          week.map((cell, d) => {
            const isFuture = cell.date > today;
            const count = isFuture ? 0 : cell.count;
            return (
              <rect
                key={`${w}-${d}`}
                x={LABEL_W + w * (CELL + GAP)}
                y={18 + d * (CELL + GAP)}
                width={CELL}
                height={CELL}
                rx={2.5}
                fill={isFuture ? "oklch(1 0 0 / 0.02)" : getColor(count)}
                stroke={getStroke(count)}
                strokeWidth={0.5}
                opacity={isFuture ? 0.3 : 1}
              >
                <title>
                  {cell.date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  — {count} run{count !== 1 ? "s" : ""}
                </title>
              </rect>
            );
          })
        )}
      </svg>
    </div>
  );
}
