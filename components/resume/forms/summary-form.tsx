"use client";

import { useResumeStore } from "@/stores/resume-store";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { ResumeTips } from "../resume-tips";
import { IconInfoCircle } from "@tabler/icons-react";
import { useMemo } from "react";

export function SummaryForm() {
  const { content, updateSummary } = useResumeStore();

  // Calculate character count (excluding HTML tags)
  const charCount = useMemo(() => {
    return content.summary?.replace(/<[^>]*>/g, "").length || 0;
  }, [content.summary]);

  // Character count styling based on optimal range (150-300)
  const charCountColor =
    charCount === 0
      ? "text-neutral-400"
      : charCount < 100
        ? "text-amber-600 dark:text-amber-400"
        : charCount > 400
          ? "text-amber-600 dark:text-amber-400"
          : "text-emerald-600 dark:text-emerald-400";

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h2 className="text-lg font-bold mb-1 text-neutral-900 dark:text-neutral-100">
          Professional Summary
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          A concise overview highlighting your experience, key skills, and
          career achievements.
        </p>
      </div>

      {/* Tips */}
      <ResumeTips section="summary" />

      {/* Character Counter */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
          <IconInfoCircle className="w-3.5 h-3.5" />
          <span>Aim for 150-300 characters for optimal ATS parsing</span>
        </div>
        <span className={charCountColor}>
          {charCount} characters
          {charCount > 0 && charCount < 100 && " (too short)"}
          {charCount > 400 && " (consider shortening)"}
          {charCount >= 100 && charCount <= 400 && " ✓"}
        </span>
      </div>

      <RichTextEditor
        value={content.summary || ""}
        onChange={updateSummary}
        placeholder="Results-driven Software Engineer with 5+ years of experience building scalable web applications. Expert in React, Node.js, and cloud technologies with a proven track record of improving system performance by 40%. Passionate about clean code, mentoring teams, and delivering user-centric solutions."
        className="min-h-[200px]"
      />

      {/* Quick Tips */}
      <div className="text-[10px] text-neutral-500 dark:text-neutral-500 space-y-1 bg-neutral-50 dark:bg-neutral-800/50 rounded-md p-3">
        <p className="font-medium text-neutral-600 dark:text-neutral-400">
          💡 Quick Formula:
        </p>
        <p>
          [Years of experience] + [Job title/expertise] + [Key skills] +
          [Notable achievement with metric] + [What you're passionate about]
        </p>
      </div>
    </div>
  );
}
