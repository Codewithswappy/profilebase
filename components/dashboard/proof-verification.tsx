"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { detectPlatform, type DetectedPlatform } from "@/lib/platform-detection";
import {
  IconCheck,
  IconClock,
  IconShieldCheck,
  IconLink,
  IconBrandGithub,
  IconBrandVercel,
  IconBrandNpm,
  IconHash,
  IconTrendingUp,
  IconAlertTriangle,
} from "@tabler/icons-react";

// ============================================
// TYPES
// ============================================

interface ProofVerificationProps {
  url?: string;
  platform?: DetectedPlatform | null;
  createdAt?: Date;
  skillCount?: number;
  contentLength?: number;
  proofType?: "LINK" | "CODE_SNIPPET" | "SCREENSHOT" | "METRIC" | "DESCRIPTION";
  className?: string;
  compact?: boolean;
}

interface VerificationItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  status: "verified" | "pending" | "warning" | "bonus";
  bonus?: number;
}

// ============================================
// EVIDENCE TYPE SCORES
// ============================================

const EVIDENCE_TYPE_SCORES: Record<string, { score: number; label: string }> = {
  LINK: { score: 30, label: "Link Proof" },
  CODE_SNIPPET: { score: 15, label: "Code Proof" },
  SCREENSHOT: { score: 10, label: "Visual Proof" },
  METRIC: { score: 20, label: "Metric Proof" },
  DESCRIPTION: { score: 5, label: "Written Proof" },
};

// ============================================
// PROOF VERIFICATION COMPONENT
// ============================================

export function ProofVerification({
  url,
  platform: providedPlatform,
  createdAt,
  skillCount = 0,
  contentLength = 0,
  proofType = "DESCRIPTION",
  className,
  compact = false,
}: ProofVerificationProps) {
  // Detect platform if URL provided
  const platform = useMemo(() => {
    if (providedPlatform) return providedPlatform;
    if (url) return detectPlatform(url);
    return null;
  }, [providedPlatform, url]);

  // Calculate trust score
  const trustScore = useMemo(() => {
    let score = EVIDENCE_TYPE_SCORES[proofType]?.score || 5;
    
    // Platform bonus
    if (platform?.trustBonus) {
      score += platform.trustBonus;
    }
    
    // Multi-skill bonus
    if (skillCount > 1) {
      score += Math.min(skillCount * 3, 15);
    }
    
    // Content length bonus for code
    if (proofType === "CODE_SNIPPET" && contentLength > 0) {
      const lines = contentLength;
      if (lines >= 20) score += 10;
      else if (lines >= 10) score += 5;
    }
    
    return Math.min(score, 100);
  }, [platform, proofType, skillCount, contentLength]);

  // Build verification items
  const verificationItems = useMemo<VerificationItem[]>(() => {
    const items: VerificationItem[] = [];
    
    // Platform verification
    if (platform?.isVerifiable) {
      items.push({
        id: "platform",
        label: `${platform.label} Verified`,
        description: `Recognized ${platform.description.toLowerCase()}`,
        icon: <IconShieldCheck className="w-4 h-4" />,
        status: "verified",
        bonus: platform.trustBonus,
      });
    } else if (url) {
      items.push({
        id: "platform",
        label: "External Link",
        description: "Link to external resource",
        icon: <IconLink className="w-4 h-4" />,
        status: "pending",
        bonus: 5,
      });
    }
    
    // Proof type
    const typeInfo = EVIDENCE_TYPE_SCORES[proofType];
    if (typeInfo) {
      items.push({
        id: "type",
        label: typeInfo.label,
        description: `${proofType === "LINK" ? "Strongest" : proofType === "METRIC" ? "Very strong" : proofType === "CODE_SNIPPET" ? "Strong" : "Standard"} proof type`,
        icon: <IconCheck className="w-4 h-4" />,
        status: proofType === "LINK" || proofType === "METRIC" ? "verified" : "pending",
        bonus: typeInfo.score,
      });
    }
    
    // Timestamp
    items.push({
      id: "timestamp",
      label: "Timestamp Recorded",
      description: createdAt 
        ? `Created ${new Date(createdAt).toLocaleDateString()}`
        : "Will be recorded on save",
      icon: <IconClock className="w-4 h-4" />,
      status: createdAt ? "verified" : "pending",
    });
    
    // Multi-skill bonus
    if (skillCount > 1) {
      items.push({
        id: "skills",
        label: `${skillCount} Skills Linked`,
        description: "Proves multiple skills at once",
        icon: <IconTrendingUp className="w-4 h-4" />,
        status: "bonus",
        bonus: Math.min(skillCount * 3, 15),
      });
    }
    
    return items;
  }, [platform, url, createdAt, skillCount, proofType]);

  // Trust level
  const trustLevel = useMemo(() => {
    if (trustScore >= 50) return { label: "Strong", color: "text-emerald-600", bg: "bg-emerald-500" };
    if (trustScore >= 30) return { label: "Good", color: "text-blue-600", bg: "bg-blue-500" };
    if (trustScore >= 15) return { label: "Fair", color: "text-amber-600", bg: "bg-amber-500" };
    return { label: "Weak", color: "text-orange-600", bg: "bg-orange-500" };
  }, [trustScore]);

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        {/* Trust Score Badge */}
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", trustLevel.bg)} />
          <span className={cn("text-xs font-medium", trustLevel.color)}>
            {trustLevel.label} Proof
          </span>
        </div>
        
        {/* Platform Badge */}
        {platform?.isVerifiable && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
            platform.bgColor,
            platform.color
          )}>
            <IconShieldCheck className="w-3 h-3" />
            {platform.label}
          </div>
        )}
        
        {/* Trust Score */}
        <span className="text-xs text-neutral-500 font-mono">
          +{trustScore} trust
        </span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Verification Status
        </h4>
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", trustLevel.bg)} />
          <span className={cn("text-sm font-bold", trustLevel.color)}>
            {trustLevel.label}
          </span>
        </div>
      </div>

      {/* Trust Score Bar */}
      <div className="space-y-1">
        <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", trustLevel.bg)}
            style={{ width: `${Math.min(trustScore, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>Trust Score</span>
          <span className="font-mono font-semibold">{trustScore}/100</span>
        </div>
      </div>

      {/* Verification Items */}
      <div className="space-y-2">
        {verificationItems.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border",
              item.status === "verified" && "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800",
              item.status === "bonus" && "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
              item.status === "pending" && "bg-neutral-50 border-neutral-200 dark:bg-neutral-800/50 dark:border-neutral-700",
              item.status === "warning" && "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
            )}
          >
            <div
              className={cn(
                "p-1.5 rounded-md",
                item.status === "verified" && "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400",
                item.status === "bonus" && "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
                item.status === "pending" && "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400",
                item.status === "warning" && "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400"
              )}
            >
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {item.label}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                {item.description}
              </div>
            </div>
            {item.bonus && (
              <div className={cn(
                "text-xs font-bold",
                item.status === "verified" ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400"
              )}>
                +{item.bonus}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tips */}
      {trustScore < 30 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
          <IconAlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700 dark:text-amber-300">
            <strong>Tip:</strong> Add a URL to a GitHub repo, deployed app, or other verifiable source to increase your trust score.
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// PLATFORM BADGE (for inline use)
// ============================================

interface PlatformBadgeProps {
  platform: DetectedPlatform;
  showBonus?: boolean;
  className?: string;
}

export function PlatformBadge({ platform, showBonus = false, className }: PlatformBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
        platform.bgColor,
        platform.color,
        className
      )}
    >
      <IconShieldCheck className="w-3.5 h-3.5" />
      <span>{platform.label}</span>
      {showBonus && platform.trustBonus > 0 && (
        <span className="opacity-75">+{platform.trustBonus}</span>
      )}
    </div>
  );
}

// ============================================
// TRUST SCORE BADGE (for inline use)
// ============================================

interface TrustScoreBadgeProps {
  score: number;
  className?: string;
}

export function TrustScoreBadge({ score, className }: TrustScoreBadgeProps) {
  const level = useMemo(() => {
    if (score >= 50) return { label: "Strong", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" };
    if (score >= 30) return { label: "Good", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
    if (score >= 15) return { label: "Fair", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" };
    return { label: "Weak", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" };
  }, [score]);

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
      level.color,
      className
    )}>
      {level.label}
    </span>
  );
}

export default ProofVerification;
