"use client";

import { cn } from "@/lib/utils";
import { QualityMeter, TypeStrengthBadge } from "../quality-meter";
import {
  EvidenceHints,
  generateEvidenceHints,
  EvidenceHint,
} from "../evidence-hints";
import {
  IconFolderCode,
  IconTag,
  IconFileCheck,
  IconLink,
  IconCode,
  IconPhoto,
  IconFileText,
  IconChartLine,
} from "@tabler/icons-react";
import { useMemo } from "react";

// ============================================
// TYPES
// ============================================

interface ReviewStepProps {
  projectTitle: string;
  selectedSkills: Array<{ id: string; name: string }>;
  evidenceType: string;
  title: string;
  content: string;
  url: string;
  existingUrls?: string[];
  className?: string;
}

// ============================================
// HELPERS
// ============================================

function getTypeIcon(type: string) {
  switch (type) {
    case "LINK":
      return <IconLink className="w-4 h-4" />;
    case "CODE_SNIPPET":
      return <IconCode className="w-4 h-4" />;
    case "SCREENSHOT":
      return <IconPhoto className="w-4 h-4" />;
    case "METRIC":
      return <IconChartLine className="w-4 h-4" />;
    default:
      return <IconFileText className="w-4 h-4" />;
  }
}

function getTypeName(type: string): string {
  switch (type) {
    case "LINK":
      return "Link";
    case "CODE_SNIPPET":
      return "Code Snippet";
    case "SCREENSHOT":
      return "Screenshot";
    case "METRIC":
      return "Metric";
    case "DESCRIPTION":
      return "Description";
    default:
      return type;
  }
}

// ============================================
// REVIEW STEP COMPONENT
// ============================================

export function ReviewStep({
  projectTitle,
  selectedSkills,
  evidenceType,
  title,
  content,
  url,
  existingUrls = [],
  className,
}: ReviewStepProps) {
  // Generate hints
  const hints = useMemo(
    () =>
      generateEvidenceHints({
        type: evidenceType,
        skillCount: selectedSkills.length,
        hasUrl: !!url,
        hasContent: !!content,
        title,
        existingUrls,
        url,
      }),
    [evidenceType, selectedSkills.length, url, content, title, existingUrls]
  );

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="font-semibold text-stone-900 mb-1">
          Review Your Evidence
        </h3>
        <p className="text-sm text-stone-500">
          Check the details below before saving.
        </p>
      </div>

      {/* Quality Meter */}
      <div className="bg-white border border-stone-200 rounded-xl p-4">
        <QualityMeter
          evidenceType={evidenceType}
          skillCount={selectedSkills.length}
          hasUrl={!!url}
          hasContent={!!content}
          hasTitle={!!title}
        />
      </div>

      {/* Summary Card */}
      <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100">
        {/* Project */}
        <div className="p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <IconFolderCode className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-stone-500">Project</div>
            <div className="text-sm font-semibold text-stone-900 truncate">
              {projectTitle}
            </div>
          </div>
        </div>

        {/* Type */}
        <div className="p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
            {getTypeIcon(evidenceType)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-stone-500">
              Evidence Type
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-stone-900">
                {getTypeName(evidenceType)}
              </span>
              <TypeStrengthBadge type={evidenceType} />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
            <IconFileCheck className="w-4 h-4 text-stone-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-stone-500">Title</div>
            <div className="text-sm font-semibold text-stone-900 truncate">
              {title || <span className="text-stone-400">Not provided</span>}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <IconTag className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-stone-500 mb-2">
                Skills ({selectedSkills.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedSkills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-2 py-0.5 bg-stone-100 text-stone-700 text-xs font-medium rounded-full"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* URL if present */}
        {url && (
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <IconLink className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-stone-500">URL</div>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline truncate block"
                >
                  {url}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Content preview if present */}
        {content && (
          <div className="p-4">
            <div className="text-xs font-medium text-stone-500 mb-2">
              Content Preview
            </div>
            <div
              className={cn(
                "text-sm text-stone-700 rounded-lg p-3 max-h-32 overflow-y-auto",
                evidenceType === "CODE_SNIPPET"
                  ? "bg-stone-900 text-stone-100 font-mono text-xs"
                  : "bg-stone-50"
              )}
            >
              {content.slice(0, 500)}
              {content.length > 500 && "..."}
            </div>
          </div>
        )}
      </div>

      {/* Hints */}
      <EvidenceHints hints={hints} />
    </div>
  );
}

export default ReviewStep;
