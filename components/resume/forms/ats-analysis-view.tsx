"use client";

import { useResumeStore } from "@/stores/resume-store";
import { ATSScoreAnalyzer } from "../ats-score-analyzer";

export function ATSAnalysisView() {
  const { content } = useResumeStore();

  return (
    <div className="p-6 max-w-2xl mx-auto pb-32">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
          Unified ATS Analysis
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          A real-time comprehensive audit of your resume against modern ATS
          standards.
        </p>
      </div>
      <ATSScoreAnalyzer content={content} />
    </div>
  );
}
