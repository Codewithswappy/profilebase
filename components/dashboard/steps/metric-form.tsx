"use client";

import { cn } from "@/lib/utils";
import { IconChartLine } from "@tabler/icons-react";

interface MetricFormProps {
  title: string;
  content: string;
  url: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onUrlChange: (url: string) => void;
  className?: string;
}

export function MetricForm({
  title,
  content,
  url,
  onTitleChange,
  onContentChange,
  onUrlChange,
  className,
}: MetricFormProps) {
  return (
    <div className={cn("space-y-5", className)}>
      <div>
        <h3 className="font-semibold text-stone-900 mb-1">
          Add Metric Evidence
        </h3>
        <p className="text-sm text-stone-500">
          Quantifiable results and achievements demonstrate real impact.
        </p>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-stone-900 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="e.g., Performance Optimization Results"
          className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent text-sm"
          maxLength={150}
        />
      </div>

      {/* Metric Value */}
      <div>
        <label className="block text-sm font-semibold text-stone-900 mb-2">
          Metric & Context <span className="text-red-500">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="e.g., Reduced page load time from 3.2s to 1.8s (44% improvement) by implementing lazy loading and code splitting."
          className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent text-sm resize-none"
          rows={4}
          maxLength={2000}
        />
        <p className="mt-1.5 text-xs text-stone-500">
          Include the metric value and context that explains its significance
        </p>
      </div>

      {/* Supporting URL */}
      <div>
        <label className="block text-sm font-semibold text-stone-900 mb-2">
          Supporting URL <span className="text-stone-400">(optional)</span>
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://... (link to report, dashboard, or proof)"
          className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent text-sm"
        />
        <p className="mt-1.5 text-xs text-stone-500">
          Optional link to a report, analytics dashboard, or other proof
        </p>
      </div>

      {/* Examples */}
      <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <IconChartLine className="w-4 h-4 text-stone-600" />
          <span className="text-sm font-semibold text-stone-700">
            Good Examples
          </span>
        </div>
        <ul className="text-sm text-stone-600 space-y-1.5">
          <li>• "Reduced API response time by 60%"</li>
          <li>• "Increased test coverage from 45% to 92%"</li>
          <li>• "Handled 10,000+ daily active users"</li>
          <li>• "Cut deployment time from 30min to 5min"</li>
        </ul>
      </div>
    </div>
  );
}

export default MetricForm;
