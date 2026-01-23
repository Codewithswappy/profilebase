"use client";

import { useResumeStore } from "@/stores/resume-store";
import { RichTextEditor } from "@/components/editor/rich-text-editor";

export function SummaryForm() {
  const { content, updateSummary } = useResumeStore();

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h2 className="text-lg font-bold mb-1 text-neutral-900 dark:text-neutral-100">
          Professional Summary
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          A brief overview of your career and key achievements.
        </p>
      </div>

      <RichTextEditor
        value={content.summary || ""}
        onChange={updateSummary}
        placeholder="Passionate software engineer with 5+ years of experience..."
        className="min-h-[300px]"
      />
    </div>
  );
}
