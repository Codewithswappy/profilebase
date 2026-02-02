"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { UploadButton } from "@/lib/uploadthing";
import {
  IconPhoto,
  IconUpload,
  IconX,
  IconLoader2,
  IconCheck,
} from "@tabler/icons-react";

// ============================================
// TYPES
// ============================================

interface DropZoneProps {
  onUploadComplete: (url: string) => void;
  onUploadError?: (error: string) => void;
  currentImage?: string;
  onRemove?: () => void;
  className?: string;
  compact?: boolean;
}

// ============================================
// DROP ZONE COMPONENT
// ============================================

export function DropZone({
  onUploadComplete,
  onUploadError,
  currentImage,
  onRemove,
  className,
  compact = false,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the drop zone entirely
    if (dropRef.current && !dropRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // Note: Actual file handling is done by UploadThing
    // This is just for visual feedback
  }, []);

  // If there's an image, show preview with remove option
  if (currentImage) {
    return (
      <div
        className={cn(
          "relative rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800",
          className,
          compact ? "h-32" : "h-48", // Added height for Image fill to work
        )}
      >
        <Image
          src={currentImage}
          alt="Uploaded screenshot"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 400px"
        />
        {/* Overlay with remove button */}
        <div className="absolute inset-0 bg-neutral-900/0 hover:bg-neutral-900/60 transition-colors group flex items-center justify-center">
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-white/90 dark:bg-neutral-900/90 text-neutral-600 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400 shadow-lg"
            >
              <IconX className="w-4 h-4" />
            </button>
          )}
        </div>
        {/* Success badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded bg-emerald-500 text-white text-[10px] font-medium">
          <IconCheck className="w-3 h-3" />
          Uploaded
        </div>
      </div>
    );
  }

  return (
    <div
      ref={dropRef}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "relative rounded-lg border-2 border-dashed transition-all duration-200",
        isDragging
          ? "border-neutral-900 dark:border-neutral-100 bg-neutral-100 dark:bg-neutral-800/50"
          : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600",
        compact ? "p-4" : "p-6",
        className,
      )}
    >
      <div className="flex flex-col items-center justify-center text-center">
        {isUploading ? (
          <>
            <IconLoader2 className="w-6 h-6 animate-spin text-neutral-400 mb-2" />
            <p className="text-xs text-neutral-500">Uploading...</p>
          </>
        ) : isDragging ? (
          <>
            <IconUpload className="w-6 h-6 text-neutral-700 dark:text-neutral-300 mb-2" />
            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Drop to upload
            </p>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-2">
              <IconPhoto className="w-5 h-5 text-neutral-400" />
            </div>
            <p
              className={cn(
                "font-medium text-neutral-700 dark:text-neutral-300 mb-1",
                compact ? "text-xs" : "text-sm",
              )}
            >
              Drag & drop a screenshot
            </p>
            <p className="text-[10px] text-neutral-400 mb-3">
              or click to browse
            </p>
            <UploadButton
              endpoint="imageUploader"
              onUploadBegin={() => setIsUploading(true)}
              onClientUploadComplete={(res) => {
                setIsUploading(false);
                if (res?.[0]) {
                  onUploadComplete(res[0].url);
                }
              }}
              onUploadError={(error) => {
                setIsUploading(false);
                onUploadError?.(error.message);
              }}
              appearance={{
                button:
                  "text-xs px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 rounded-md font-medium transition-colors",
                allowedContent: "hidden",
              }}
              content={{
                button: "Select Image",
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default DropZone;
