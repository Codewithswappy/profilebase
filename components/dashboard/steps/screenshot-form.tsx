"use client";

import { cn } from "@/lib/utils";
import { IconPhoto } from "@tabler/icons-react";

interface ScreenshotFormProps {
  title: string;
  url: string;
  description: string;
  onTitleChange: (title: string) => void;
  onUrlChange: (url: string) => void;
  onDescriptionChange: (description: string) => void;
  className?: string;
}

export function ScreenshotForm({
  title,
  url,
  description,
  onTitleChange,
  onUrlChange,
  onDescriptionChange,
  className,
}: ScreenshotFormProps) {
  return (
    <div className={cn("space-y-5", className)}>
      <div>
        <h3 className="font-semibold text-stone-900 mb-1">
          Add Screenshot Evidence
        </h3>
        <p className="text-sm text-stone-500">
          Visual proof of your work, such as UI designs, dashboards, or results.
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
          placeholder="e.g., Dashboard UI Implementation"
          className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent text-sm"
          maxLength={150}
        />
      </div>

      {/* Image URL */}
      <div>
        <label className="block text-sm font-semibold text-stone-900 mb-2">
          Image URL <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://... (link to image)"
          className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent text-sm"
        />
        <p className="mt-1.5 text-xs text-stone-500">
          Use image hosting services like Imgur, Cloudinary, or your own server
        </p>
      </div>

      {/* Image Preview */}
      {url && (
        <div className="border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
          <div className="p-2 border-b border-stone-200 bg-white">
            <span className="text-xs font-medium text-stone-500">Preview</span>
          </div>
          <div className="p-4 flex items-center justify-center min-h-[200px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt="Screenshot preview"
              className="max-w-full max-h-64 rounded object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        </div>
      )}

      {/* Placeholder when no URL */}
      {!url && (
        <div className="border-2 border-dashed border-stone-200 rounded-lg p-8 text-center">
          <IconPhoto className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <p className="text-sm text-stone-500">
            Enter an image URL above to see a preview
          </p>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-stone-900 mb-2">
          Description <span className="text-stone-400">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Describe what this screenshot shows and what skills it demonstrates..."
          className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent text-sm resize-none"
          rows={3}
          maxLength={500}
        />
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Use clear, high-quality screenshots. Annotate
          important areas if needed. Show before/after comparisons when
          possible.
        </p>
      </div>
    </div>
  );
}

export default ScreenshotForm;
