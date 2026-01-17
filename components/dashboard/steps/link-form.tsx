"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  IconLink,
  IconExternalLink,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

interface LinkFormProps {
  title: string;
  url: string;
  onTitleChange: (title: string) => void;
  onUrlChange: (url: string) => void;
  className?: string;
}

export function LinkForm({
  title,
  url,
  onTitleChange,
  onUrlChange,
  className,
}: LinkFormProps) {
  const [urlStatus, setUrlStatus] = useState<
    "idle" | "checking" | "valid" | "invalid"
  >("idle");

  // Basic URL validation
  useEffect(() => {
    if (!url) {
      setUrlStatus("idle");
      return;
    }

    try {
      new URL(url);
      setUrlStatus("valid");
    } catch {
      setUrlStatus("invalid");
    }
  }, [url]);

  return (
    <div className={cn("space-y-5", className)}>
      <div>
        <h3 className="font-semibold text-stone-900 mb-1">Add Link Evidence</h3>
        <p className="text-sm text-stone-500">
          Links to live projects, deployed apps, or published work are the
          strongest form of proof.
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
          placeholder="e.g., Live Demo - E-commerce Dashboard"
          className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent text-sm"
          maxLength={150}
        />
        <p className="mt-1.5 text-xs text-stone-500">
          A descriptive title for this evidence
        </p>
      </div>

      {/* URL */}
      <div>
        <label className="block text-sm font-semibold text-stone-900 mb-2">
          URL <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="url"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://example.com"
            className={cn(
              "w-full px-3 py-2.5 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent text-sm",
              urlStatus === "valid" && "border-emerald-300",
              urlStatus === "invalid" && "border-red-300",
              urlStatus === "idle" && "border-stone-200"
            )}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {urlStatus === "valid" && (
              <IconCheck className="w-4 h-4 text-emerald-500" />
            )}
            {urlStatus === "invalid" && (
              <IconX className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>
        <p className="mt-1.5 text-xs text-stone-500">
          Link to your live project, repository, or published work
        </p>
      </div>

      {/* Preview link */}
      {urlStatus === "valid" && url && (
        <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-lg">
          <IconLink className="w-4 h-4 text-stone-500" />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline truncate flex-1"
          >
            {url}
          </a>
          <IconExternalLink className="w-4 h-4 text-stone-400" />
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Use permanent links. GitHub repos, Vercel
          deployments, and portfolio sites work great.
        </p>
      </div>
    </div>
  );
}

export default LinkForm;
