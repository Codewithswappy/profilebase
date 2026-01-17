"use client";

import {
  getTierInfo,
  CredibilityTier,
  SkillCredibilityResult,
} from "@/lib/credibility";
import { cn } from "@/lib/utils";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  Sparkles,
  Info,
} from "lucide-react";
import { useState } from "react";

interface CredibilityBadgeProps {
  score: number;
  tier: CredibilityTier;
  size?: "sm" | "md" | "lg";
  showScore?: boolean;
  showTooltip?: boolean;
}

interface CredibilityScoreRingProps {
  score: number;
  tier: CredibilityTier;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

interface SkillCredibilityCardProps {
  result: SkillCredibilityResult;
  showBreakdown?: boolean;
}

// ============================================
// CREDIBILITY BADGE
// ============================================

export function CredibilityBadge({
  score,
  tier,
  size = "md",
  showScore = true,
  showTooltip = false,
}: CredibilityBadgeProps) {
  const tierInfo = getTierInfo(tier);
  const [showDetails, setShowDetails] = useState(false);

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 gap-1",
    md: "text-sm px-2 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const getIcon = () => {
    switch (tier) {
      case "unproven":
        return <Shield className={cn(iconSizes[size], "opacity-50")} />;
      case "claimed":
        return <Shield className={iconSizes[size]} />;
      case "emerging":
        return <TrendingUp className={iconSizes[size]} />;
      case "credible":
      case "proven":
        return <ShieldCheck className={iconSizes[size]} />;
      case "expert":
        return <Sparkles className={iconSizes[size]} />;
    }
  };

  const bgColors: Record<CredibilityTier, string> = {
    unproven: "bg-gray-100 text-gray-500 border-gray-200",
    claimed: "bg-gray-200 text-gray-600 border-gray-300",
    emerging: "bg-yellow-50 text-yellow-700 border-yellow-200",
    credible: "bg-blue-50 text-blue-700 border-blue-200",
    proven: "bg-green-50 text-green-700 border-green-200",
    expert: "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => showTooltip && setShowDetails(true)}
      onMouseLeave={() => showTooltip && setShowDetails(false)}
    >
      <div
        className={cn(
          "inline-flex items-center rounded-full border font-medium",
          sizeClasses[size],
          bgColors[tier]
        )}
      >
        {getIcon()}
        {showScore ? <span>{score}%</span> : <span>{tierInfo.label}</span>}
      </div>

      {/* Tooltip */}
      {showTooltip && showDetails && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover border rounded-lg shadow-lg text-sm whitespace-nowrap">
          <p className="font-medium">{tierInfo.label}</p>
          <p className="text-muted-foreground text-xs">
            {tierInfo.description}
          </p>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-popover border-r border-b" />
        </div>
      )}
    </div>
  );
}

// ============================================
// CREDIBILITY SCORE RING (Circular Progress)
// ============================================

export function CredibilityScoreRing({
  score,
  tier,
  size = "md",
  showLabel = true,
}: CredibilityScoreRingProps) {
  const tierInfo = getTierInfo(tier);

  const sizeConfig = {
    sm: { outer: 48, inner: 40, stroke: 4, textSize: "text-xs" },
    md: { outer: 64, inner: 52, stroke: 6, textSize: "text-sm" },
    lg: { outer: 96, inner: 80, stroke: 8, textSize: "text-lg" },
  };

  const config = sizeConfig[size];
  const radius = (config.inner - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const strokeColors: Record<CredibilityTier, string> = {
    unproven: "#9ca3af",
    claimed: "#6b7280",
    emerging: "#eab308",
    credible: "#3b82f6",
    proven: "#22c55e",
    expert: "#a855f7",
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative"
        style={{ width: config.outer, height: config.outer }}
      >
        {/* Background circle */}
        <svg
          className="absolute inset-0"
          width={config.outer}
          height={config.outer}
          viewBox={`0 0 ${config.inner} ${config.inner}`}
        >
          <circle
            cx={config.inner / 2}
            cy={config.inner / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.stroke}
            className="text-muted/20"
          />
        </svg>

        {/* Progress circle */}
        <svg
          className="absolute inset-0 -rotate-90"
          width={config.outer}
          height={config.outer}
          viewBox={`0 0 ${config.inner} ${config.inner}`}
        >
          <circle
            cx={config.inner / 2}
            cy={config.inner / 2}
            r={radius}
            fill="none"
            stroke={strokeColors[tier]}
            strokeWidth={config.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold", config.textSize)}>{score}</span>
        </div>
      </div>

      {showLabel && (
        <span className={cn("font-medium", tierInfo.color, "text-xs")}>
          {tierInfo.label}
        </span>
      )}
    </div>
  );
}

// ============================================
// PROFILE CREDIBILITY SUMMARY
// ============================================

interface ProfileCredibilitySummaryProps {
  overallScore: number;
  tier: CredibilityTier;
  provenSkillsCount: number;
  totalSkillsCount: number;
}

export function ProfileCredibilitySummary({
  overallScore,
  tier,
  provenSkillsCount,
  totalSkillsCount,
}: ProfileCredibilitySummaryProps) {
  const tierInfo = getTierInfo(tier);

  return (
    <div className="flex items-center justify-between py-2 px-1 border-b border-border/50 mb-2">
      <div className="flex items-center gap-3">
        <CredibilityScoreRing
          score={overallScore}
          tier={tier}
          size="md"
          showLabel={false}
        />
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm">Profile Credibility</h3>
            <span
              className={cn(
                "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-muted",
                tierInfo.color.replace("text-", "text-")
              )}
            >
              {tierInfo.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {provenSkillsCount} of {totalSkillsCount} skills proven
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SKILL CREDIBILITY CARD (with breakdown)
// ============================================

export function SkillCredibilityCard({
  result,
  showBreakdown = false,
}: SkillCredibilityCardProps) {
  const [expanded, setExpanded] = useState(false);
  const tierInfo = getTierInfo(result.tier);

  return (
    <div className="p-3 rounded-lg border bg-card ">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium">{result.skillName}</span>
          <span className="text-xs text-muted-foreground">
            ({result.evidenceCount} evidence)
          </span>
        </div>
        <CredibilityBadge
          score={result.credibilityScore}
          tier={result.tier}
          size="sm"
          showTooltip
        />
      </div>

      {showBreakdown && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-primary hover:underline mt-2 flex items-center gap-1"
        >
          <Info className="w-3 h-3" />
          {expanded ? "Hide breakdown" : "Show breakdown"}
        </button>
      )}

      {expanded && (
        <div className="mt-3 pt-3 border-t text-xs space-y-1 text-muted-foreground">
          <div className="flex justify-between">
            <span>Base Evidence Score</span>
            <span>{result.breakdown.baseScore}</span>
          </div>
          <div className="flex justify-between">
            <span>Diversity Bonus</span>
            <span>+{result.breakdown.diversityBonus}</span>
          </div>
          <div className="flex justify-between">
            <span>Verification Bonus</span>
            <span>+{result.breakdown.verificationBonus}</span>
          </div>
          <div className="flex justify-between">
            <span>Multi-skill Bonus</span>
            <span>+{result.breakdown.multiSkillBonus}</span>
          </div>
          <div className="flex justify-between font-medium text-foreground pt-1 border-t">
            <span>Total Raw Score</span>
            <span>{result.breakdown.totalRaw}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MINI CREDIBILITY INDICATOR
// ============================================

interface MiniCredibilityProps {
  score: number;
  tier: CredibilityTier;
}

export function MiniCredibility({ score, tier }: MiniCredibilityProps) {
  const tierInfo = getTierInfo(tier);

  const dotColors: Record<CredibilityTier, string> = {
    unproven: "bg-gray-400",
    claimed: "bg-gray-500",
    emerging: "bg-yellow-500",
    credible: "bg-blue-500",
    proven: "bg-green-500",
    expert: "bg-purple-500",
  };

  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <div className={cn("w-2 h-2 rounded-full", dotColors[tier])} />
      <span>{score}%</span>
    </div>
  );
}
