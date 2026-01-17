"use server";

import { db } from "@/lib/db";
import { ActionResult } from "./profile";

// ============================================
// VERIFICATION TYPES
// ============================================

export type VerificationType = "github" | "email" | "domain" | "deployment";

export interface VerificationData {
  type: VerificationType;
  verified: boolean;
  verifiedAt?: Date;
  details?: string;
}

// ============================================
// GET USER VERIFICATIONS
// ============================================

export async function getUserVerifications(
  userId: string
): Promise<ActionResult<VerificationData[]>> {
  try {
    // Get user data
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          },
        },
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Get profile for checking deployments
    const profile = await db.profile.findUnique({
      where: { userId },
      include: {
        projects: {
          select: {
            url: true,
          },
        },
      },
    });

    const verifications: VerificationData[] = [];

    // 1. Check GitHub verification (has GitHub OAuth account)
    const hasGitHub = user.accounts.some((a) => a.provider === "github");
    verifications.push({
      type: "github",
      verified: hasGitHub,
      verifiedAt: hasGitHub ? user.createdAt : undefined,
      details: hasGitHub ? "Connected via GitHub OAuth" : undefined,
    });

    // 2. Check Email verification
    const emailVerified = !!user.emailVerified;
    verifications.push({
      type: "email",
      verified: emailVerified,
      verifiedAt: user.emailVerified ?? undefined,
      details: emailVerified ? user.email : undefined,
    });

    // 3. Check Domain verification (has custom domain in any project URL)
    const hasCustomDomain = profile?.projects.some((p) => {
      if (!p.url) return false;
      try {
        const url = new URL(p.url);
        // Check if it's not a common hosting domain
        const commonHosts = [
          "github.io",
          "vercel.app",
          "netlify.app",
          "herokuapp.com",
          "railway.app",
          "render.com",
          "surge.sh",
          "glitch.me",
          "replit.dev",
        ];
        return !commonHosts.some((host) => url.hostname.endsWith(host));
      } catch {
        return false;
      }
    });
    verifications.push({
      type: "domain",
      verified: hasCustomDomain ?? false,
      details: hasCustomDomain ? "Custom domain verified" : undefined,
    });

    // 4. Check Deployment verification (has any live project URL)
    const liveDeploymentPatterns = [
      "vercel.app",
      "netlify.app",
      "herokuapp.com",
      "railway.app",
      "render.com",
      "github.io",
      "surge.sh",
      "glitch.me",
      "replit.dev",
      "fly.dev",
      "cloudflare",
      "pages.dev",
    ];
    
    const hasDeployment = profile?.projects.some((p) => {
      if (!p.url) return false;
      try {
        const url = new URL(p.url);
        // Check if it matches any deployment pattern or is a valid HTTP(S) URL
        return (
          liveDeploymentPatterns.some((pattern) =>
            url.hostname.includes(pattern)
          ) || url.protocol.startsWith("http")
        );
      } catch {
        return false;
      }
    });
    verifications.push({
      type: "deployment",
      verified: hasDeployment ?? false,
      details: hasDeployment ? "Has live deployed projects" : undefined,
    });

    return { success: true, data: verifications };
  } catch (error) {
    console.error("getUserVerifications error:", error);
    return { success: false, error: "Failed to get verifications" };
  }
}

// ============================================
// GET PUBLIC PROFILE VERIFICATIONS
// ============================================

export async function getPublicProfileVerifications(
  profileId: string
): Promise<ActionResult<VerificationData[]>> {
  try {
    const profile = await db.profile.findUnique({
      where: { id: profileId },
      select: { userId: true },
    });

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    return getUserVerifications(profile.userId);
  } catch (error) {
    console.error("getPublicProfileVerifications error:", error);
    return { success: false, error: "Failed to get verifications" };
  }
}

// ============================================
// CALCULATE VERIFICATION BONUS
// ============================================
// Note: This is a utility function, not a server action.
// The client-side equivalent is in verification-badges.tsx

const VERIFICATION_BONUSES: Record<VerificationType, number> = {
  github: 15,
  email: 10,
  domain: 20,
  deployment: 25,
};

// Internal utility - not exported as server actions must be async
function calculateVerificationCredibilityBonus(
  verifications: VerificationData[]
): number {
  return verifications
    .filter((v) => v.verified)
    .reduce((total, v) => total + VERIFICATION_BONUSES[v.type], 0);
}
