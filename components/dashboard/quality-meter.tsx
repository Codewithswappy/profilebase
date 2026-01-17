"use client";

import { cn } from "@/lib/utils";

// ============================================
// EVIDENCE STRENGTH CONFIG
// ============================================

const TYPE_STRENGTH: Record<
  string,
  { level: number; label: string; color: string }
> = {
  LINK: { level: 100, label: "Strongest", color: "text-emerald-600" },
  METRIC: { level: 85, label: "Very Strong", color: "text-emerald-500" },
  CODE_SNIPPET: { level: 70, label: "Strong", color: "text-blue-600" },
  SCREENSHOT: { level: 55, label: "Good", color: "text-amber-600" },
  DESCRIPTION: { level: 30, label: "Weak", color: "text-orange-600" },
};

// ============================================
// QUALITY METER COMPONENT
// ============================================

interface QualityMeterProps {
  evidenceType: string | null;
  skillCount: number;
  hasUrl: boolean;
  hasContent: boolean;
  hasTitle: boolean;
  className?: string;
}

export function QualityMeter({
  evidenceType,
  skillCount,
  hasUrl,
  hasContent,
  hasTitle,
  className,
}: QualityMeterProps) {
  // Calculate quality score
  let score = 0;
  let factors: string[] = [];

  // Base type score (40% weight)
  if (evidenceType) {
    const typeInfo = TYPE_STRENGTH[evidenceType];
    if (typeInfo) {
      score += typeInfo.level * 0.4;
    }
  }

  // Title (15% weight)
  if (hasTitle) {
    score += 15;
    factors.push("Title provided");
  }

  // Content/URL (25% weight)
  if (hasUrl) {
    score += 25;
    factors.push("URL provided");
  } else if (hasContent) {
    score += 20;
    factors.push("Content provided");
  }

  // Skill count (20% weight)
  if (skillCount >= 3) {
    score += 20;
    factors.push("3+ skills linked");
  } else if (skillCount >= 2) {
    score += 15;
    factors.push("2 skills linked");
  } else if (skillCount >= 1) {
    score += 10;
    factors.push("1 skill linked");
  }

  score = Math.min(100, Math.round(score));

  // Determine level
  let level: "weak" | "medium" | "strong";
  let levelLabel: string;
  let levelColor: string;

  if (score >= 70) {
    level = "strong";
    levelLabel = "Strong Evidence";
    levelColor = "text-emerald-600";
  } else if (score >= 45) {
    level = "medium";
    levelLabel = "Medium Evidence";
    levelColor = "text-amber-600";
  } else {
    level = "weak";
    levelLabel = "Weak Evidence";
    levelColor = "text-orange-600";
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
          Evidence Strength
        </span>
        <span className={cn("text-sm font-bold", levelColor)}>
          {levelLabel}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            level === "strong" && "bg-emerald-500",
            level === "medium" && "bg-amber-500",
            level === "weak" && "bg-orange-500"
          )}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Score */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <span>Quality Score</span>
        <span className="font-mono font-semibold">{score}/100</span>
      </div>
    </div>
  );
}

// ============================================
// TYPE STRENGTH BADGE
// ============================================

interface TypeStrengthBadgeProps {
  type: string;
  className?: string;
}

export function TypeStrengthBadge({ type, className }: TypeStrengthBadgeProps) {
  const info = TYPE_STRENGTH[type];
  if (!info) return null;

  return (
    <span
      className={cn(
        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
        info.level >= 70 && "bg-emerald-50 text-emerald-700",
        info.level >= 45 && info.level < 70 && "bg-blue-50 text-blue-700",
        info.level < 45 && "bg-orange-50 text-orange-700",
        className
      )}
    >
      {info.label}
    </span>
  );
}

export default QualityMeter;
