"use server";

import { db } from "@/lib/db";
import { ActionResult } from "./profile";
import { Project, Experience, SocialLink, Achievement, Certificate, Resume } from "@prisma/client";
import { getUserVerifications, VerificationData } from "./verification";

// Project data type (simplified without evidence)
export type ProjectData = Project;

// Profile completeness score
export type ProfileCompleteness = {
  overallScore: number;
  projectCount: number;
};

// Primary Resume data for public view
export type PrimaryResumeData = {
  id: string;
  title: string;
  templateId: string;
  data: any; // JSON resume content
} | null;

// Extended public profile type
export type PublicProfileData = {
  profile: {
    id: string;
    slug: string;
    headline: string | null;
    location: string | null;
    profession: string | null;
    summary: string | null;
    image: string | null;
    coverImage: string | null;
    ctaMessage: string | null;
    meetingUrl: string | null;
  };
  profileSettings: {
    isPublic: boolean;
    showEmail: boolean;
    showExperience: boolean;
    showProjects: boolean;
    showTechStack: boolean;
    showSummary: boolean;
    showAchievements: boolean;
    showCertificates?: boolean;
    showContact?: boolean;
    showGithubHeatmap?: boolean;
    primaryResumeId?: string | null;
  };
  projects: ProjectData[];
  experiences: Experience[];
  achievements: Achievement[];
  certificates: Certificate[];
  socialLinks: SocialLink[];
  userName?: string | null;
  email?: string | null;
  profileCompleteness: ProfileCompleteness;
  verifications: VerificationData[];
  primaryResume: PrimaryResumeData; // NEW: User's selected resume
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
        achievements: {
          orderBy: { displayOrder: "asc" },
        },
        certificates: {
          orderBy: { date: "desc" },
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

    // 6. Fetch primary resume if set
    let primaryResume: PrimaryResumeData = null;
    if (profileSettings.primaryResumeId) {
      const resume = await db.resume.findUnique({
        where: { id: profileSettings.primaryResumeId },
        select: {
          id: true,
          title: true,
          templateId: true,
          data: true,
        },
      });
      if (resume) {
        primaryResume = {
          id: resume.id,
          title: resume.title,
          templateId: resume.templateId,
          data: resume.data,
        };
      }
    }

    const result: PublicProfileData = {
      profile: {
        id: profile.id,
        slug: profile.slug,
        headline: profile.headline,
        location: profile.location,
        profession: (profile as any).profession || null,
        summary: profile.summary,
        image: profile.image,
        coverImage: profile.coverImage,
        ctaMessage: (profile as any).ctaMessage || null, 
        meetingUrl: (profile as any).meetingUrl || null,
      },
      profileSettings: {
        isPublic: profileSettings.isPublic,
        showEmail: profileSettings.showEmail,
        showExperience: profileSettings.showExperience,
        showProjects: profileSettings.showProjects,
        showTechStack: profileSettings.showTechStack,
        showSummary: profileSettings.showSummary,
        showAchievements: profileSettings.showAchievements,
        showCertificates: profileSettings.showCertificates,
        showContact: (profileSettings as any).showContact ?? true,
        showGithubHeatmap: (profileSettings as any).showGithubHeatmap ?? true,
        primaryResumeId: profileSettings.primaryResumeId,
      },
      projects: profile.projects,
      experiences: profile.experiences,
      achievements: profile.achievements as Achievement[],
      certificates: profile.certificates as Certificate[],
      socialLinks: profile.socialLinks,
      userName: user?.name,
      email: profileSettings.showEmail ? user?.email : undefined,
      profileCompleteness,
      verifications,
      primaryResume,
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
