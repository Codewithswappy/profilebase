"use client";

import { cn } from "@/lib/utils";
import { IconAlertTriangle } from "@tabler/icons-react";

interface DescriptionFormProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  className?: string;
}

export function DescriptionForm({
  title,
  content,
  onTitleChange,
  onContentChange,
  className,
}: DescriptionFormProps) {
  return (
    <div className={cn("space-y-5", className)}>
      <div>
        <h3 className="font-semibold text-stone-900 mb-1">
          Add Description Evidence
        </h3>
        <p className="text-sm text-stone-500">
          Written explanation of your work and contributions.
        </p>
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <IconAlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800 mb-1">
            Lower Credibility Type
          </p>
          <p className="text-sm text-amber-700">
            Description-only evidence has the lowest credibility score. Consider
            adding stronger types like links, code snippets, or metrics to boost
            your profile.
          </p>
        </div>
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
          placeholder="e.g., Backend Architecture Design"
          className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent text-sm"
          maxLength={150}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-stone-900 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Describe in detail what you built, your responsibilities, the challenges you solved, and the technologies you used. Be specific and include measurable outcomes where possible."
          className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent text-sm resize-none"
          rows={8}
          maxLength={5000}
        />
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-xs text-stone-500">
            Be specific and detailed about your contributions
          </p>
          <span className="text-xs text-stone-400 font-mono">
            {content.length.toLocaleString()} / 5,000
          </span>
        </div>
      </div>

      {/* Writing Tips */}
      <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-stone-700 mb-2">
          Writing Tips
        </p>
        <ul className="text-sm text-stone-600 space-y-1">
          <li>• Start with what you built or achieved</li>
          <li>• Include specific technologies used</li>
          <li>• Mention challenges you overcame</li>
          <li>• Add measurable outcomes when possible</li>
          <li>• Keep it concise but informative</li>
        </ul>
      </div>
    </div>
  );
}

export default DescriptionForm;
