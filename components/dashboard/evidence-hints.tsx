"use client";

import { cn } from "@/lib/utils";
import { IconAlertTriangle, IconBulb, IconCheck } from "@tabler/icons-react";

// ============================================
// TYPES
// ============================================

export type HintType = "warning" | "tip" | "success";

export interface EvidenceHint {
  type: HintType;
  message: string;
}

interface EvidenceHintsProps {
  hints: EvidenceHint[];
  className?: string;
}

// ============================================
// HINT ICON
// ============================================

function HintIcon({ type }: { type: HintType }) {
  switch (type) {
    case "warning":
      return <IconAlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
    case "tip":
      return <IconBulb className="w-4 h-4 text-blue-500 shrink-0" />;
    case "success":
      return <IconCheck className="w-4 h-4 text-emerald-500 shrink-0" />;
  }
}

const HINT_STYLES: Record<HintType, string> = {
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  tip: "bg-blue-50 border-blue-200 text-blue-800",
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
};

// ============================================
// EVIDENCE HINTS COMPONENT
// ============================================

export function EvidenceHints({ hints, className }: EvidenceHintsProps) {
  if (hints.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {hints.map((hint, index) => (
        <div
          key={index}
          className={cn(
            "flex items-start gap-2 px-3 py-2 rounded-lg border text-sm",
            HINT_STYLES[hint.type]
          )}
        >
          <HintIcon type={hint.type} />
          <span>{hint.message}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================
// HINT GENERATION HELPERS
// ============================================

export function generateEvidenceHints(data: {
  type: string | null;
  skillCount: number;
  hasUrl: boolean;
  hasContent: boolean;
  title: string;
  existingUrls?: string[];
  url?: string;
}): EvidenceHint[] {
  const hints: EvidenceHint[] = [];

  // Type-based hints
  if (data.type === "DESCRIPTION") {
    hints.push({
      type: "warning",
      message:
        "Description-only evidence has the lowest credibility. Consider adding a link or code snippet instead.",
    });
  }

  // Skill count hints
  if (data.skillCount === 0) {
    hints.push({
      type: "warning",
      message: "No skills selected. Evidence must prove at least one skill.",
    });
  } else if (data.skillCount === 1) {
    hints.push({
      type: "tip",
      message: "Consider linking this evidence to additional relevant skills.",
    });
  } else if (data.skillCount >= 3) {
    hints.push({
      type: "success",
      message: "Great! Multiple skills linked improves your credibility score.",
    });
  }

  // URL hints
  if (data.type === "LINK" && !data.hasUrl) {
    hints.push({
      type: "warning",
      message: "URL is required for link-type evidence.",
    });
  }

  // Duplicate URL detection
  if (data.url && data.existingUrls?.includes(data.url)) {
    hints.push({
      type: "warning",
      message: "This URL has already been used in another evidence item.",
    });
  }

  // Content hints for code
  if (data.type === "CODE_SNIPPET" && !data.hasContent) {
    hints.push({
      type: "warning",
      message: "Add your code snippet to complete this evidence.",
    });
  }

  // Strong evidence encouragement
  if (data.type && ["LINK", "METRIC"].includes(data.type) && data.hasUrl) {
    hints.push({
      type: "success",
      message:
        "This is a strong form of evidence that will boost your credibility.",
    });
  }

  return hints;
}

export default EvidenceHints;
