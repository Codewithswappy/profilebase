"use client";

import { cn } from "@/lib/utils";
import {
  IconLink,
  IconChartLine,
  IconCode,
  IconPhoto,
  IconFileText,
  IconCheck,
} from "@tabler/icons-react";
import { TypeStrengthBadge } from "../quality-meter";

// ============================================
// TYPES
// ============================================

export type EvidenceType =
  | "LINK"
  | "METRIC"
  | "CODE_SNIPPET"
  | "SCREENSHOT"
  | "DESCRIPTION";

interface ChooseTypeProps {
  selectedType: EvidenceType | null;
  onSelect: (type: EvidenceType) => void;
  className?: string;
}

// ============================================
// TYPE CONFIGURATION
// ============================================

const EVIDENCE_TYPES: {
  id: EvidenceType;
  label: string;
  description: string;
  icon: typeof IconLink;
  example: string;
}[] = [
  {
    id: "LINK",
    label: "Link",
    description: "URL to live project, deployed app, or article",
    icon: IconLink,
    example: "https://myproject.com",
  },
  {
    id: "METRIC",
    label: "Metric",
    description: "Measurable result or achievement",
    icon: IconChartLine,
    example: "Reduced load time by 40%",
  },
  {
    id: "CODE_SNIPPET",
    label: "Code Snippet",
    description: "Actual code demonstrating your skills",
    icon: IconCode,
    example: "A function, component, or algorithm you wrote",
  },
  {
    id: "SCREENSHOT",
    label: "Screenshot",
    description: "Visual proof of your work",
    icon: IconPhoto,
    example: "Screenshot of UI, dashboard, or results",
  },
  {
    id: "DESCRIPTION",
    label: "Description",
    description: "Written explanation of your work",
    icon: IconFileText,
    example: "Detailed explanation of what you built",
  },
];

// ============================================
// CHOOSE TYPE COMPONENT
// ============================================

export function ChooseType({
  selectedType,
  onSelect,
  className,
}: ChooseTypeProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="font-semibold text-stone-900 mb-1">
          What type of evidence are you adding?
        </h3>
        <p className="text-sm text-stone-500">
          Different types have different credibility weights. Links and metrics
          are strongest.
        </p>
      </div>

      <div className="grid gap-3">
        {EVIDENCE_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;

          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onSelect(type.id)}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all",
                isSelected
                  ? "border-stone-900 bg-stone-50"
                  : "border-stone-200 hover:border-stone-300 bg-white"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                      isSelected ? "bg-stone-900" : "bg-stone-100"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5",
                        isSelected ? "text-white" : "text-stone-500"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-semibold text-stone-900">
                        {type.label}
                      </h4>
                      <TypeStrengthBadge type={type.id} />
                    </div>
                    <p className="text-sm text-stone-600 mb-1">
                      {type.description}
                    </p>
                    <p className="text-xs text-stone-400 italic">
                      e.g., {type.example}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <IconCheck className="w-5 h-5 text-stone-900 shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ChooseType;
