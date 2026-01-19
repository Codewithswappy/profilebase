"use server";

import { db } from "@/lib/db";
import { ActionResult } from "./profile";
import { Project, Experience, SocialLink } from "@prisma/client";
import { getUserVerifications, VerificationData } from "./verification";

// Project data type (simplified without evidence)
export type ProjectData = Project;

// Profile completeness score
export type ProfileCompleteness = {
  overallScore: number;
  projectCount: number;
};

// Extended public profile type
export type PublicProfileData = {
  profile: {
    id: string;
    slug: string;
    headline: string | null;
    summary: string | null;
    image: string | null;
    coverImage: string | null;
  };
  profileSettings: {
    isPublic: boolean;
    showEmail: boolean;
  };
  projects: ProjectData[];
  experiences: Experience[];
  socialLinks: SocialLink[];
  userName?: string | null;
  email?: string | null;
  profileCompleteness: ProfileCompleteness;
  verifications: VerificationData[];
};

// ============================================
// CALCULATE PROFILE COMPLETENESS
// ============================================

function calculateProfileCompleteness(
  projects: Project[]
): ProfileCompleteness {
  let score = 0;
  
  // Base score for having projects
  score += Math.min(projects.length * 15, 45); // Max 45 points for 3+ projects
  
  // Points for project completeness
  projects.forEach((project) => {
    if (project.repoUrl) score += 5;
    if (project.demoUrl) score += 5;
    if (project.thumbnail) score += 3;
    if (project.techStack && project.techStack.length > 0) score += 5;
    if (project.highlights && project.highlights.length > 0) score += 5;
    if (project.role) score += 2;
    if (project.description) score += 5;
  });
  
  // Cap at 100
  score = Math.min(score, 100);
  
  return {
    overallScore: score,
    projectCount: projects.length,
  };
}

// ============================================
// GET PUBLIC PROFILE
// ============================================

export async function getPublicProfile(slug: string): Promise<ActionResult<PublicProfileData | null>> {
  try {
    // 1. Find profile by slug
    const profile = await db.profile.findUnique({
      where: { slug },
      include: {
        projects: {
          where: { isPublic: true },
          orderBy: { displayOrder: "asc" },
        },
        experiences: {
          orderBy: { startDate: "desc" },
        },
        socialLinks: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!profile) {
      return { success: true, data: null };
    }

    // 2. Check profile settings
    const profileSettings = await db.profileSettings.findUnique({
      where: { userId: profile.userId },
    });

    if (!profileSettings || !profileSettings.isPublic) {
      return { success: true, data: null };
    }

    // 3. Calculate profile completeness
    const profileCompleteness = calculateProfileCompleteness(profile.projects);

    // 4. Fetch user info
    const user = await db.user.findUnique({
      where: { id: profile.userId },
      select: { email: true, name: true },
    });

    // 5. Fetch verification status
    const verificationsResult = await getUserVerifications(profile.userId);
    const verifications = verificationsResult.success ? verificationsResult.data : [];

    const result: PublicProfileData = {
      profile: {
        id: profile.id,
        slug: profile.slug,
        headline: profile.headline,
        summary: profile.summary,
        image: profile.image,
        coverImage: profile.coverImage,
      },
      profileSettings: {
        isPublic: profileSettings.isPublic,
        showEmail: profileSettings.showEmail,
      },
      projects: profile.projects,
      experiences: profile.experiences,
      socialLinks: profile.socialLinks,
      userName: user?.name,
      email: profileSettings.showEmail ? user?.email : undefined,
      profileCompleteness,
      verifications,
    };

    return {
      success: true,
      data: result,
    };

  } catch (error) {
    console.error("getPublicProfile error:", error);
    return { success: false, error: "Failed to load public profile" };
  }
}
