"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  getUniqueProjectCount,
  hasOnlyDescriptionEvidence,
  isEvidenceStale,
  EvidenceInput,
} from "@/lib/utils/skill-maturity";
import {
  IconAlertTriangle,
  IconBulb,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

// ============================================
// TYPES
// ============================================

export type InsightType = "warning" | "suggestion" | "positive";

export interface SkillInsight {
  type: InsightType;
  title: string;
  description: string;
  priority: number; // 1 = highest
}

interface SkillInsightsProps {
  skillName: string;
  evidence: EvidenceInput[];
  className?: string;
  compact?: boolean;
}

// ============================================
// INSIGHT ANALYSIS
// ============================================

function analyzeSkill(
  skillName: string,
  evidence: EvidenceInput[]
): SkillInsight[] {
  const insights: SkillInsight[] = [];

  // Edge case: No evidence at all
  if (evidence.length === 0) {
    insights.push({
      type: "warning",
      title: "No Evidence",
      description: `Add proof of your ${skillName} work to build credibility.`,
      priority: 1,
    });
    return insights;
  }

  // Check for only description evidence
  if (hasOnlyDescriptionEvidence(evidence)) {
    insights.push({
      type: "warning",
      title: "Weak Evidence Type",
      description: `Only text descriptions exist. Add code snippets, screenshots, or links for stronger proof.`,
      priority: 2,
    });
  }

  // Check for stale evidence (>12 months)
  if (isEvidenceStale(evidence)) {
    insights.push({
      type: "warning",
      title: "Stale Evidence",
      description: `No recent proof in the last 12 months. Add fresh work to show continued expertise.`,
      priority: 3,
    });
  }

  // Check project diversity
  const projectCount = getUniqueProjectCount(evidence);
  if (projectCount < 2) {
    insights.push({
      type: "suggestion",
      title: "Limited Project Coverage",
      description: `${skillName} appears in only ${projectCount} project. Show usage across multiple projects.`,
      priority: 4,
    });
  }

  // Check for lack of deployed links
  const hasLinks = evidence.some((e) => e.type === "LINK");
  if (!hasLinks && evidence.length >= 2) {
    insights.push({
      type: "suggestion",
      title: "No Deployed Links",
      description: `Add a live URL to demonstrate working ${skillName} implementations.`,
      priority: 5,
    });
  }

  // Check for lack of metrics
  const hasMetrics = evidence.some((e) => e.type === "METRIC");
  if (!hasMetrics && evidence.length >= 3) {
    insights.push({
      type: "suggestion",
      title: "Missing Metrics",
      description: `Add quantitative results to show measurable ${skillName} impact.`,
      priority: 6,
    });
  }

  // Positive feedback if things look good
  if (insights.length === 0) {
    const hasHighQuality =
      evidence.some((e) => e.type === "LINK") &&
      evidence.some((e) => e.type === "CODE_SNIPPET");

    if (hasHighQuality && projectCount >= 2 && evidence.length >= 3) {
      insights.push({
        type: "positive",
        title: "Strong Profile",
        description: `Well-documented ${skillName} expertise with diverse evidence.`,
        priority: 10,
      });
    }
  }

  // Sort by priority
  return insights.sort((a, b) => a.priority - b.priority);
}

// ============================================
// INSIGHT ICONS
// ============================================

function InsightIcon({ type }: { type: InsightType }) {
  switch (type) {
    case "warning":
      return <IconAlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
    case "suggestion":
      return <IconBulb className="w-3.5 h-3.5 text-blue-500" />;
    case "positive":
      return <IconCheck className="w-3.5 h-3.5 text-emerald-500" />;
    default:
      return null;
  }
}

const INSIGHT_STYLES: Record<InsightType, string> = {
  warning: "border-amber-200 bg-amber-50/50",
  suggestion: "border-blue-200 bg-blue-50/50",
  positive: "border-emerald-200 bg-emerald-50/50",
};

// ============================================
// COMPONENT
// ============================================

export function SkillInsights({
  skillName,
  evidence,
  className,
  compact = false,
}: SkillInsightsProps) {
  const insights = useMemo(
    () => analyzeSkill(skillName, evidence),
    [skillName, evidence]
  );

  if (insights.length === 0) return null;

  // In compact mode, show only first insight
  const displayInsights = compact ? insights.slice(0, 1) : insights;

  return (
    <div className={cn("space-y-2", className)}>
      {!compact && (
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
          Insights
        </h4>
      )}

      <div className={cn("space-y-1.5", compact && "space-y-1")}>
        {displayInsights.map((insight, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-2 rounded-md border p-2",
              INSIGHT_STYLES[insight.type],
              compact && "p-1.5"
            )}
          >
            <InsightIcon type={insight.type} />
            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  "font-semibold text-stone-700",
                  compact ? "text-[10px]" : "text-xs"
                )}
              >
                {insight.title}
              </div>
              {!compact && (
                <div className="text-[10px] text-stone-500 leading-relaxed">
                  {insight.description}
                </div>
              )}
            </div>
          </div>
        ))}

        {compact && insights.length > 1 && (
          <div className="text-[9px] text-stone-400 pl-5">
            +{insights.length - 1} more suggestion
            {insights.length > 2 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// QUICK INSIGHT BADGE (for header)
// ============================================

interface QuickInsightBadgeProps {
  evidence: EvidenceInput[];
  className?: string;
}

export function QuickInsightBadge({
  evidence,
  className,
}: QuickInsightBadgeProps) {
  const hasIssues = useMemo(() => {
    if (evidence.length === 0) return true;
    if (hasOnlyDescriptionEvidence(evidence)) return true;
    if (isEvidenceStale(evidence)) return true;
    return false;
  }, [evidence]);

  if (!hasIssues) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] bg-amber-50 text-amber-600 border border-amber-100",
        className
      )}
      title="This skill has improvement suggestions"
    >
      <IconAlertTriangle className="w-2.5 h-2.5" />
    </span>
  );
}

export default SkillInsights;
