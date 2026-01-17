"use client";

import { cn } from "@/lib/utils";
import { MaturityLevel, RecencyStatus } from "@/lib/utils/skill-maturity";

// ============================================
// MATURITY BADGE
// ============================================

interface MaturityBadgeProps {
  level: MaturityLevel;
  score: number;
  compact?: boolean;
  showScore?: boolean;
  className?: string;
}

const LEVEL_STYLES: Record<MaturityLevel, string> = {
  Expert: "text-purple-700 bg-purple-50 border-purple-100/60",
  Advanced: "text-emerald-700 bg-emerald-50 border-emerald-100/60",
  Intermediate: "text-blue-700 bg-blue-50 border-blue-100/60",
  Developing: "text-amber-700 bg-amber-50 border-amber-100/60",
  Beginner: "text-stone-600 bg-stone-50 border-stone-100/60",
};

export function MaturityBadge({
  level,
  score,
  compact = false,
  showScore = false,
  className,
}: MaturityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border font-semibold uppercase tracking-wider",
        compact
          ? "px-1.5 py-0.5 rounded text-[8px]"
          : "px-2 py-0.5 rounded-[4px] text-[9px]",
        LEVEL_STYLES[level],
        className
      )}
      title={`Maturity Score: ${score}/100`}
    >
      {level}
      {showScore && <span className="opacity-70 font-mono">({score})</span>}
    </span>
  );
}

// ============================================
// RECENCY INDICATOR
// ============================================

interface RecencyIndicatorProps {
  status: RecencyStatus;
  className?: string;
}

const RECENCY_STYLES: Record<RecencyStatus, { color: string; label: string }> =
  {
    Active: { color: "bg-green-500", label: "Active" },
    Recent: { color: "bg-emerald-400", label: "Recent" },
    Moderate: { color: "bg-amber-400", label: "Moderate" },
    Stale: { color: "bg-orange-400", label: "Stale" },
    Dormant: { color: "bg-stone-300", label: "Dormant" },
  };

export function RecencyIndicator({ status, className }: RecencyIndicatorProps) {
  const style = RECENCY_STYLES[status];

  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      title={`Activity: ${style.label}`}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", style.color)} />
      <span className="text-[9px] text-stone-500 uppercase tracking-wider font-medium">
        {style.label}
      </span>
    </span>
  );
}

// ============================================
// MILESTONE BADGE
// ============================================

interface MilestoneBadgeProps {
  type:
    | "FIRST_EVIDENCE"
    | "FIFTH_EVIDENCE"
    | "FIRST_DEPLOYED_LINK"
    | "MOST_RECENT";
  className?: string;
}

const MILESTONE_CONFIG: Record<
  string,
  { icon: string; label: string; color: string }
> = {
  FIRST_EVIDENCE: {
    icon: "🌱",
    label: "First",
    color: "text-green-600 bg-green-50 border-green-100",
  },
  FIFTH_EVIDENCE: {
    icon: "⭐",
    label: "5×",
    color: "text-amber-600 bg-amber-50 border-amber-100",
  },
  FIRST_DEPLOYED_LINK: {
    icon: "🚀",
    label: "Deploy",
    color: "text-blue-600 bg-blue-50 border-blue-100",
  },
  MOST_RECENT: {
    icon: "✨",
    label: "Latest",
    color: "text-purple-600 bg-purple-50 border-purple-100",
  },
};

export function MilestoneBadge({ type, className }: MilestoneBadgeProps) {
  const config = MILESTONE_CONFIG[type];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-semibold border",
        config.color,
        className
      )}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

export default MaturityBadge;
