"use client";

import { cn } from "@/lib/utils";
import {
  IconBrandGithub,
  IconMail,
  IconWorld,
  IconRocket,
  IconCheck,
  IconShieldCheck,
  IconInfoCircle,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

// ============================================
// TYPES
// ============================================

export type VerificationType = "github" | "email" | "domain" | "deployment";

export interface Verification {
  type: VerificationType;
  verified: boolean;
  verifiedAt?: Date;
  details?: string;
}

export interface VerificationBadgesProps {
  verifications: Verification[];
  showUnverified?: boolean;
  size?: "sm" | "md" | "lg";
  layout?: "inline" | "grid";
}

export interface SingleVerificationBadgeProps {
  verification: Verification;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

// ============================================
// VERIFICATION CONFIG
// ============================================

const VERIFICATION_CONFIG: Record<
  VerificationType,
  {
    label: string;
    icon: typeof IconBrandGithub;
    description: string;
    verifiedColor: string;
    verifiedBg: string;
    credibilityBonus: number;
  }
> = {
  github: {
    label: "GitHub Verified",
    icon: IconBrandGithub,
    description: "Connected and authenticated via GitHub",
    verifiedColor: "text-gray-900",
    verifiedBg: "bg-gray-100 border-gray-300",
    credibilityBonus: 15,
  },
  email: {
    label: "Email Verified",
    icon: IconMail,
    description: "Email address has been confirmed",
    verifiedColor: "text-blue-700",
    verifiedBg: "bg-blue-50 border-blue-200",
    credibilityBonus: 10,
  },
  domain: {
    label: "Domain Verified",
    icon: IconWorld,
    description: "Owns or has access to a verified domain",
    verifiedColor: "text-green-700",
    verifiedBg: "bg-green-50 border-green-200",
    credibilityBonus: 20,
  },
  deployment: {
    label: "Deployment Verified",
    icon: IconRocket,
    description: "Has live deployed projects",
    verifiedColor: "text-purple-700",
    verifiedBg: "bg-purple-50 border-purple-200",
    credibilityBonus: 25,
  },
};

const VERIFICATION_ORDER: VerificationType[] = [
  "github",
  "email",
  "domain",
  "deployment",
];

// ============================================
// CREDIBILITY BONUS CALCULATION
// ============================================

export function calculateVerificationBonus(
  verifications: Verification[]
): number {
  return verifications
    .filter((v) => v.verified)
    .reduce(
      (total, v) => total + VERIFICATION_CONFIG[v.type].credibilityBonus,
      0
    );
}

export function getVerificationTier(verifications: Verification[]): {
  label: string;
  level: number;
  color: string;
} {
  const verifiedCount = verifications.filter((v) => v.verified).length;

  if (verifiedCount === 0) {
    return { label: "Unverified", level: 0, color: "text-gray-500" };
  } else if (verifiedCount === 1) {
    return { label: "Basic Trust", level: 1, color: "text-yellow-600" };
  } else if (verifiedCount === 2) {
    return { label: "Trusted", level: 2, color: "text-blue-600" };
  } else if (verifiedCount === 3) {
    return { label: "Highly Trusted", level: 3, color: "text-green-600" };
  } else {
    return { label: "Fully Verified", level: 4, color: "text-purple-600" };
  }
}

// ============================================
// SINGLE VERIFICATION BADGE
// ============================================

export function VerificationBadge({
  verification,
  size = "md",
  showTooltip = true,
}: SingleVerificationBadgeProps) {
  const [showDetails, setShowDetails] = useState(false);
  const config = VERIFICATION_CONFIG[verification.type];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  if (!verification.verified) {
    return (
      <div
        className={cn(
          "inline-flex items-center rounded-full border font-medium opacity-50",
          sizeClasses[size],
          "bg-muted/50 text-muted-foreground border-muted"
        )}
      >
        <Icon className={iconSizes[size]} />
        <span className="line-through">{config.label}</span>
      </div>
    );
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => showTooltip && setShowDetails(true)}
      onMouseLeave={() => showTooltip && setShowDetails(false)}
    >
      <div
        className={cn(
          "inline-flex items-center rounded-full border font-medium",
          sizeClasses[size],
          config.verifiedBg,
          config.verifiedColor
        )}
      >
        <Icon className={iconSizes[size]} />
        <span>{config.label}</span>
        <IconCheck className={cn(iconSizes[size], "ml-0.5")} />
      </div>

      {/* Tooltip */}
      {showTooltip && showDetails && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover border rounded-lg shadow-lg text-sm whitespace-nowrap">
          <div className="flex items-center gap-2 font-medium">
            <Icon className="w-4 h-4" />
            {config.label}
          </div>
          <p className="text-muted-foreground text-xs mt-1">
            {config.description}
          </p>
          <p className="text-xs text-green-600 mt-1">
            +{config.credibilityBonus}% credibility bonus
          </p>
          {verification.verifiedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Verified on{" "}
              {new Date(verification.verifiedAt).toLocaleDateString()}
            </p>
          )}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-popover border-r border-b" />
        </div>
      )}
    </div>
  );
}

// ============================================
// VERIFICATION BADGES LIST
// ============================================

export function VerificationBadges({
  verifications,
  showUnverified = false,
  size = "md",
  layout = "inline",
}: VerificationBadgesProps) {
  // Sort by verification order and filter
  const sorted = VERIFICATION_ORDER.map((type) =>
    verifications.find((v) => v.type === type)
  ).filter((v): v is Verification => v !== undefined);

  const visible = showUnverified ? sorted : sorted.filter((v) => v.verified);

  if (visible.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        layout === "inline"
          ? "flex flex-wrap gap-2"
          : "grid gap-2 grid-cols-2 sm:grid-cols-4"
      )}
    >
      {visible.map((verification) => (
        <VerificationBadge
          key={verification.type}
          verification={verification}
          size={size}
        />
      ))}
    </div>
  );
}

// ============================================
// VERIFICATION SUMMARY CARD
// ============================================

interface VerificationSummaryProps {
  verifications: Verification[];
}

export function VerificationSummary({
  verifications,
}: VerificationSummaryProps) {
  const verifiedCount = verifications.filter((v) => v.verified).length;
  if (verifiedCount === 0) return null;

  return (
    <div className="flex items-center justify-between py-2 px-1">
      <div className="flex items-center gap-2">
        <IconShieldCheck className="w-4 h-4 text-green-600" />
        <span className="text-sm font-medium">Trust & Verification</span>
      </div>

      <div className="flex items-center gap-3">
        {verifications.map((v) => {
          if (!v.verified) return null;
          const config = VERIFICATION_CONFIG[v.type];
          const Icon = config.icon;
          return (
            <div
              key={v.type}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
              title={config.label}
            >
              <Icon className={cn("w-3.5 h-3.5", config.verifiedColor)} />
              <span
                className={cn("hidden sm:inline-block", config.verifiedColor)}
              >
                {config.label.replace(" Verified", "")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// INLINE VERIFICATION INDICATORS (for headers)
// ============================================

interface InlineVerificationsProps {
  verifications: Verification[];
  maxShow?: number;
}

export function InlineVerifications({
  verifications,
  maxShow = 3,
}: InlineVerificationsProps) {
  const verified = verifications.filter((v) => v.verified);

  if (verified.length === 0) {
    return null;
  }

  const shown = verified.slice(0, maxShow);
  const remaining = verified.length - maxShow;

  return (
    <div className="flex items-center gap-1">
      {shown.map((v) => {
        const config = VERIFICATION_CONFIG[v.type];
        const Icon = config.icon;
        return (
          <div
            key={v.type}
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center border",
              config.verifiedBg
            )}
            title={config.label}
          >
            <Icon className={cn("w-3.5 h-3.5", config.verifiedColor)} />
          </div>
        );
      })}
      {remaining > 0 && (
        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-muted text-xs font-medium">
          +{remaining}
        </div>
      )}
    </div>
  );
}

export default VerificationBadges;
