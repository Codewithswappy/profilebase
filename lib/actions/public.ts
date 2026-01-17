"use server";

import { db } from "@/lib/db";
import { FullProfile, ActionResult } from "./profile";
import { Evidence, EvidenceSkill, Skill } from "@prisma/client";
import {
  calculateAllSkillCredibility,
  calculateProfileCredibility,
  SkillCredibilityResult,
  EvidenceForScoring,
  CredibilityTier,
} from "@/lib/credibility";
import { getUserVerifications, VerificationData } from "./verification";

// Extended evidence type with skills
export type EvidenceWithSkills = Evidence & {
  skills: (EvidenceSkill & { skill: Skill })[];
};

// Profile credibility summary
export type ProfileCredibility = {
  overallScore: number;
  tier: CredibilityTier;
  provenSkillsCount: number;
  totalSkillsCount: number;
};

// Skill with credibility score
export type SkillWithCredibility = Skill & {
  evidenceCount: number;
  credibility: SkillCredibilityResult;
};

// Extended public profile type
export type PublicProfileData = Omit<FullProfile, "evidence" | "skills"> & {
  email?: string | null;
  userName?: string | null;
  evidence: EvidenceWithSkills[];
  skills: SkillWithCredibility[];
  profileCredibility: ProfileCredibility;
  verifications: VerificationData[];
};

// ============================================
// GET PUBLIC PROFILE
// ============================================

export async function getPublicProfile(slug: string): Promise<ActionResult<PublicProfileData | null>> {
  try {
    // 1. Find profile by slug
    const profile = await db.profile.findUnique({
      where: { slug },
      include: {
        skills: {
          orderBy: { displayOrder: "asc" },
        },
        projects: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!profile) {
      // 404 behavior for non-existent profiles
      return { success: true, data: null };
    }

    // 2. Check profile settings
    const profileSettings = await db.profileSettings.findUnique({
      where: { userId: profile.userId },
    });

    if (!profileSettings || !profileSettings.isPublic) {
      // 404 behavior for private profiles (security requirement)
      return { success: true, data: null };
    }

    // 3. Get all evidence with skills
    const evidence = await db.evidence.findMany({
      where: {
        project: { profileId: profile.id },
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: { displayOrder: "asc" },
    });

    // 4. Compute counts & filter visible data
    
    // Get all skill IDs that have evidence
    const skillIdsWithEvidence = new Set<string>();
    evidence.forEach(e => {
      e.skills.forEach(es => {
        skillIdsWithEvidence.add(es.skillId);
      });
    });
    
    // Filter skills based on settings
    let visibleSkills = profile.skills;
    
    if (!profileSettings.showUnprovenSkills) {
      // Filter out skills that have no evidence
      visibleSkills = visibleSkills.filter(skill => 
        skillIdsWithEvidence.has(skill.id)
      );
    }
    
    // 5. Calculate credibility scores
    
    // Transform evidence for scoring
    const evidenceForScoring: EvidenceForScoring[] = evidence.map(e => ({
      id: e.id,
      type: e.type,
      url: e.url,
      content: e.content,
      createdAt: e.createdAt,
      skillIds: e.skills.map(es => es.skillId),
    }));
    
    // Calculate credibility for all skills
    const credibilityResults = calculateAllSkillCredibility(
      visibleSkills.map(s => ({ id: s.id, name: s.name })),
      evidenceForScoring
    );
    
    // Create a map for quick lookup
    const credibilityMap = new Map(
      credibilityResults.map(r => [r.skillId, r])
    );
    
    // Build skills with credibility
    const skillsWithCredibility: SkillWithCredibility[] = visibleSkills.map((skill) => {
      const credibility = credibilityMap.get(skill.id)!;
      return {
        ...skill,
        evidenceCount: credibility.evidenceCount,
        credibility,
      };
    });
    
    // Calculate overall profile credibility
    const profileCredibility = calculateProfileCredibility(credibilityResults);

    const projectsWithCounts = profile.projects.map((project) => ({
      ...project,
      evidenceCount: evidence.filter((e) => e.projectId === project.id).length,
    }));

    // Fetch user info (name, email based on settings)
    const user = await db.user.findUnique({
      where: { id: profile.userId },
      select: { email: true, name: true }
    });

    // Fetch verification status
    const verificationsResult = await getUserVerifications(profile.userId);
    const verifications = verificationsResult.success ? verificationsResult.data : [];

    const result: PublicProfileData = {
      profile,
      profileSettings,
      skills: skillsWithCredibility,
      projects: projectsWithCounts,
      evidence,
      userName: user?.name,
      email: profileSettings.showEmail ? user?.email : undefined,
      profileCredibility,
      verifications,
    };

    // 5. Return assembled public profile
    return {
      success: true,
      data: result,
    };

  } catch (error) {
    console.error("getPublicProfile error:", error);
    return { success: false, error: "Failed to load public profile" };
  }
}
