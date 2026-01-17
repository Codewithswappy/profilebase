"use client";

import { cn } from "@/lib/utils";

// ============================================
// CONFIDENCE METER
// ============================================

interface ConfidenceMeterProps {
  confidence: number; // 0-100
  compact?: boolean;
  showLabel?: boolean;
  className?: string;
}

function getConfidenceLevel(confidence: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (confidence >= 80) {
    return {
      label: "High",
      color: "bg-emerald-500",
      bgColor: "bg-emerald-100",
    };
  }
  if (confidence >= 60) {
    return { label: "Good", color: "bg-blue-500", bgColor: "bg-blue-100" };
  }
  if (confidence >= 40) {
    return { label: "Fair", color: "bg-amber-500", bgColor: "bg-amber-100" };
  }
  if (confidence >= 20) {
    return { label: "Low", color: "bg-orange-500", bgColor: "bg-orange-100" };
  }
  return { label: "Minimal", color: "bg-stone-400", bgColor: "bg-stone-100" };
}

export function ConfidenceMeter({
  confidence,
  compact = false,
  showLabel = true,
  className,
}: ConfidenceMeterProps) {
  const { label, color, bgColor } = getConfidenceLevel(confidence);

  return (
    <div
      className={cn(
        "flex items-center",
        compact ? "gap-1.5" : "gap-2",
        className
      )}
      title={`Confidence: ${confidence}% (${label})`}
    >
      {/* Progress bar */}
      <div
        className={cn(
          "relative overflow-hidden rounded-full",
          bgColor,
          compact ? "w-12 h-1" : "w-16 h-1.5"
        )}
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all",
            color
          )}
          style={{ width: `${confidence}%` }}
        />
      </div>

      {/* Label */}
      {showLabel && (
        <span
          className={cn(
            "font-medium text-stone-500 uppercase tracking-wider",
            compact ? "text-[8px]" : "text-[9px]"
          )}
        >
          {confidence}%
        </span>
      )}
    </div>
  );
}

// ============================================
// MINI CONFIDENCE DOT (for very compact views)
// ============================================

interface ConfidenceDotProps {
  confidence: number;
  className?: string;
}

export function ConfidenceDot({ confidence, className }: ConfidenceDotProps) {
  const { color, label } = getConfidenceLevel(confidence);

  return (
    <span
      className={cn("w-2 h-2 rounded-full", color, className)}
      title={`Confidence: ${confidence}% (${label})`}
    />
  );
}

export default ConfidenceMeter;
