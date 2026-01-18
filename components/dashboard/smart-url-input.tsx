"use client";

import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  detectPlatform,
  isValidUrl,
  formatUrlForDisplay,
  suggestTitleFromUrl,
  detectInputType,
  type DetectedPlatform,
} from "@/lib/platform-detection";
import {
  IconLink,
  IconBrandGithub,
  IconBrandNpm,
  IconBrandVercel,
  IconBrandYoutube,
  IconBrandLinkedin,
  IconBrandFigma,
  IconBrandMedium,
  IconCheck,
  IconAlertCircle,
  IconLoader2,
  IconX,
  IconSparkles,
  IconCode,
  IconChartBar,
  IconPhoto,
  IconFileText,
} from "@tabler/icons-react";

// ============================================
// TYPES
// ============================================

interface SmartUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  onPlatformDetected?: (platform: DetectedPlatform | null) => void;
  onTitleSuggested?: (title: string) => void;
  onTypeDetected?: (type: "url" | "code" | "metric" | "text") => void;
  placeholder?: string;
  existingUrls?: string[];
  className?: string;
  autoFocus?: boolean;
}

// ============================================
// PLATFORM ICON MAPPING
// ============================================

const PlatformIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  github: IconBrandGithub,
  npm: IconBrandNpm,
  vercel: IconBrandVercel,
  youtube: IconBrandYoutube,
  linkedin: IconBrandLinkedin,
  figma: IconBrandFigma,
  medium: IconBrandMedium,
  website: IconLink,
};

// ============================================
// SMART URL INPUT COMPONENT
// ============================================

export function SmartUrlInput({
  value,
  onChange,
  onPlatformDetected,
  onTitleSuggested,
  onTypeDetected,
  placeholder = "Paste a URL, code snippet, or describe what you did...",
  existingUrls = [],
  className,
  autoFocus,
}: SmartUrlInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [platform, setPlatform] = useState<DetectedPlatform | null>(null);
  const [inputType, setInputType] = useState<"url" | "code" | "metric" | "text">("text");
  const [isDuplicate, setIsDuplicate] = useState(false);

  // Detect platform and type when value changes
  useEffect(() => {
    const detected = detectPlatform(value);
    const type = detectInputType(value);
    
    setPlatform(detected);
    setInputType(type);
    
    // Check for duplicates
    if (detected && existingUrls.includes(value)) {
      setIsDuplicate(true);
    } else {
      setIsDuplicate(false);
    }
    
    // Callbacks
    onPlatformDetected?.(detected);
    onTypeDetected?.(type);
    
    // Suggest title for URLs
    if (detected) {
      const suggestedTitle = suggestTitleFromUrl(value);
      if (suggestedTitle) {
        onTitleSuggested?.(suggestedTitle);
      }
    }
  }, [value, existingUrls, onPlatformDetected, onTitleSuggested, onTypeDetected]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange("");
  }, [onChange]);

  // Get icon for current input type
  const getInputTypeIcon = () => {
    if (platform) {
      const Icon = PlatformIcon[platform.platform] || IconLink;
      return <Icon className="w-4 h-4" />;
    }
    
    switch (inputType) {
      case "code":
        return <IconCode className="w-4 h-4" />;
      case "metric":
        return <IconChartBar className="w-4 h-4" />;
      default:
        return <IconFileText className="w-4 h-4" />;
    }
  };

  // Get status message
  const getStatusMessage = () => {
    if (isDuplicate) {
      return {
        type: "warning" as const,
        message: "This URL is already used in another proof",
        icon: <IconAlertCircle className="w-4 h-4" />,
      };
    }
    
    if (platform?.isVerifiable) {
      return {
        type: "success" as const,
        message: `${platform.label} detected! +${platform.trustBonus} trust bonus`,
        icon: <IconCheck className="w-4 h-4" />,
      };
    }
    
    if (value && inputType === "code") {
      return {
        type: "info" as const,
        message: "Code snippet detected",
        icon: <IconCode className="w-4 h-4" />,
      };
    }
    
    if (value && inputType === "metric") {
      return {
        type: "info" as const,
        message: "Metric detected",
        icon: <IconChartBar className="w-4 h-4" />,
      };
    }
    
    return null;
  };

  const status = getStatusMessage();

  return (
    <div className={cn("space-y-2", className)}>
      {/* Input Container */}
      <div
        className={cn(
          "relative rounded-lg border-2 transition-all duration-200",
          isFocused
            ? "border-neutral-900 dark:border-neutral-100 ring-2 ring-neutral-900/10 dark:ring-neutral-100/10"
            : "border-neutral-200 dark:border-neutral-700",
          isDuplicate && "border-amber-400 dark:border-amber-500"
        )}
      >
        {/* Platform Badge */}
        {platform && value && (
          <div
            className={cn(
              "absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
              platform.bgColor,
              platform.color
            )}
          >
            {getInputTypeIcon()}
            <span>{platform.label}</span>
          </div>
        )}

        {/* Textarea */}
        <textarea
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={value.split("\n").length > 3 ? Math.min(value.split("\n").length, 8) : 3}
          className={cn(
            "w-full resize-none bg-transparent px-4 py-3 text-sm outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
            platform && value && "pt-12"
          )}
        />

        {/* Clear Button */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-3 right-3 p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <IconX className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Status Message */}
      {status && (
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium",
            status.type === "success" && "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
            status.type === "warning" && "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
            status.type === "info" && "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
          )}
        >
          {status.icon}
          <span>{status.message}</span>
        </div>
      )}

      {/* Quick Type Selector */}
      {!value && (
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span>Quick add:</span>
          <button
            type="button"
            onClick={() => onChange("https://")}
            className="px-2 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
          >
            <IconLink className="w-3 h-3 inline mr-1" />
            URL
          </button>
          <button
            type="button"
            onClick={() => onChange("// Paste your code here\n")}
            className="px-2 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
          >
            <IconCode className="w-3 h-3 inline mr-1" />
            Code
          </button>
          <button
            type="button"
            onClick={() => onChange("Improved ")}
            className="px-2 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
          >
            <IconChartBar className="w-3 h-3 inline mr-1" />
            Metric
          </button>
        </div>
      )}
    </div>
  );
}

export default SmartUrlInput;
