"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================

interface DataPoint {
  date: Date;
  cumulativeCount: number;
}

interface SkillGrowthGraphProps {
  evidence: Array<{ createdAt: Date }>;
  height?: number;
  className?: string;
  showLabels?: boolean;
}

// ============================================
// HELPERS
// ============================================

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "2-digit",
  }).format(date);
}

function buildCumulativeData(
  evidence: Array<{ createdAt: Date }>
): DataPoint[] {
  if (evidence.length === 0) return [];

  // Sort by date
  const sorted = [...evidence].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Build cumulative points
  return sorted.map((item, index) => ({
    date: new Date(item.createdAt),
    cumulativeCount: index + 1,
  }));
}

// ============================================
// SVG LINE GRAPH COMPONENT
// ============================================

export function SkillGrowthGraph({
  evidence,
  height = 60,
  className,
  showLabels = true,
}: SkillGrowthGraphProps) {
  const data = useMemo(() => buildCumulativeData(evidence), [evidence]);

  // Handle edge cases
  if (data.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-stone-400 text-xs",
          className
        )}
        style={{ height }}
      >
        No evidence yet
      </div>
    );
  }

  if (data.length === 1) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-stone-500 text-xs gap-2",
          className
        )}
        style={{ height }}
      >
        <span className="w-2 h-2 rounded-full bg-blue-500" />
        <span>Started {formatShortDate(data[0].date)}</span>
      </div>
    );
  }

  // Chart dimensions
  const width = 200;
  const padding = { top: 8, right: 8, bottom: 20, left: 24 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate scales
  const minDate = data[0].date.getTime();
  const maxDate = data[data.length - 1].date.getTime();
  const dateRange = maxDate - minDate || 1; // Avoid division by zero

  const maxCount = data[data.length - 1].cumulativeCount;

  // Generate path
  const points = data.map((point) => {
    const x =
      padding.left +
      ((point.date.getTime() - minDate) / dateRange) * chartWidth;
    const y =
      padding.top +
      chartHeight -
      (point.cumulativeCount / maxCount) * chartHeight;
    return { x, y, ...point };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Area fill path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height }}
        role="img"
        aria-label={`Growth graph showing ${data.length} evidence items`}
      >
        {/* Area fill */}
        <path d={areaD} fill="url(#growthGradient)" opacity={0.3} />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={2.5}
            fill="white"
            stroke="#3B82F6"
            strokeWidth={1.5}
          />
        ))}

        {/* Y-axis labels */}
        {showLabels && (
          <>
            <text
              x={padding.left - 4}
              y={padding.top + 4}
              textAnchor="end"
              className="fill-stone-400 text-[8px]"
            >
              {maxCount}
            </text>
            <text
              x={padding.left - 4}
              y={padding.top + chartHeight}
              textAnchor="end"
              className="fill-stone-400 text-[8px]"
            >
              0
            </text>
          </>
        )}

        {/* X-axis labels */}
        {showLabels && (
          <>
            <text
              x={padding.left}
              y={height - 4}
              textAnchor="start"
              className="fill-stone-400 text-[8px]"
            >
              {formatShortDate(data[0].date)}
            </text>
            <text
              x={width - padding.right}
              y={height - 4}
              textAnchor="end"
              className="fill-stone-400 text-[8px]"
            >
              {formatShortDate(data[data.length - 1].date)}
            </text>
          </>
        )}

        {/* Gradient definition */}
        <defs>
          <linearGradient id="growthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default SkillGrowthGraph;
