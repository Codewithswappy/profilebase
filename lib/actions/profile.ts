"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  CreateProfileSchema,
  UpdateProfileSchema,
  UpdateProfileSettingsSchema,
  CreateProfileInput,
  UpdateProfileInput,
  UpdateProfileSettingsInput,
} from "@/lib/validations";
import { Profile, ProfileSettings } from "@prisma/client";

// Import from centralized types
import type { ActionResult, FullProfile } from "@/lib/types";

// Re-export for backward compatibility
export type { ActionResult, FullProfile } from "@/lib/types";

// ============================================
// GET MY PROFILE (Dashboard)
// ============================================

export async function getMyProfile(): Promise<ActionResult<FullProfile | null>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const userId = session.user.id;

    // Get profile with all related data
    const profile = await db.profile.findUnique({
      where: { userId },
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
      return { success: true, data: null };
    }

    // Get profile settings
    const profileSettings = await db.profileSettings.findUnique({
      where: { userId },
    });

    if (!profileSettings) {
      return { success: false, error: "Profile settings not found" };
    }

    // Get all evidence with skills
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

    // Compute evidence counts based on junction table
    const skillsWithCounts = profile.skills.map((skill) => ({
      ...skill,
      evidenceCount: evidence.filter(e => 
        e.skills.some(es => es.skillId === skill.id)
      ).length,
    }));

    const projectsWithCounts = profile.projects.map((project) => ({
      ...project,
      evidenceCount: evidence.filter((e) => e.projectId === project.id).length,
    }));

    return {
      success: true,
      data: {
        profile,
        profileSettings,
        skills: skillsWithCounts,
        projects: projectsWithCounts,
        evidence,
      },
    };
  } catch (error) {
    console.error("getMyProfile error:", error);
    return { success: false, error: "Failed to load profile" };
  }
}

// ============================================
// CREATE PROFILE
// ============================================

export async function createProfile(
  input: CreateProfileInput
): Promise<ActionResult<Profile>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const userId = session.user.id;

    // Check if profile already exists
    const existingProfile = await db.profile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      return { success: false, error: "Profile already exists" };
    }

    // Validate input
    const validated = CreateProfileSchema.safeParse(input);
    
    if (!validated.success) {
      return { success: false, error: (validated.error as any).errors[0].message };
    }

    const { slug, headline, summary } = validated.data;

    // Check if slug is taken
    const slugExists = await db.profile.findUnique({
      where: { slug },
    });

    if (slugExists) {
      return { success: false, error: "This profile URL is already in use" };
    }

    // Create profile and settings in a transaction
    const result = await db.$transaction(async (tx) => {
      const profile = await tx.profile.create({
        data: {
          userId,
          slug,
          headline,
          summary,
        },
      });

      await tx.profileSettings.create({
        data: {
          userId,
          isPublic: false,
          showEmail: false,
          showUnprovenSkills: false,
        },
      });

      return profile;
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("createProfile error:", error);
    return { success: false, error: "Failed to create profile" };
  }
}

// ============================================
// UPDATE PROFILE
// ============================================

export async function updateProfile(
  input: UpdateProfileInput
): Promise<ActionResult<Profile>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const userId = session.user.id;

    // Validate input
    const validated = UpdateProfileSchema.safeParse(input);
    
    if (!validated.success) {
      return { success: false, error: (validated.error as any).errors[0].message };
    }

    const { slug, headline, summary, image } = validated.data;

    // Get existing profile
    const existingProfile = await db.profile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      return { success: false, error: "Profile not found" };
    }

    // If slug is being changed, check if new slug is available
    if (slug && slug !== existingProfile.slug) {
      const slugExists = await db.profile.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return { success: false, error: "This profile URL is already in use" };
      }
    }

    // Update profile
    const profile = await db.profile.update({
      where: { userId },
      data: {
        ...(slug !== undefined && { slug }),
        ...(headline !== undefined && { headline }),
        ...(summary !== undefined && { summary }),
        ...(image !== undefined && { image: image || null }),
      },
    });

    return { success: true, data: profile };
  } catch (error) {
    console.error("updateProfile error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

// ============================================
// TOGGLE PROFILE VISIBILITY
// ============================================

export async function toggleProfileVisibility(
  isPublic: boolean
): Promise<ActionResult<ProfileSettings>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const userId = session.user.id;

    const settings = await db.profileSettings.update({
      where: { userId },
      data: { isPublic },
    });

    return { success: true, data: settings };
  } catch (error) {
    console.error("toggleProfileVisibility error:", error);
    return { success: false, error: "Failed to update visibility" };
  }
}

// ============================================
// UPDATE PROFILE SETTINGS
// ============================================

export async function updateProfileSettings(
  input: UpdateProfileSettingsInput
): Promise<ActionResult<ProfileSettings>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const userId = session.user.id;

    // Validate input
    const validated = UpdateProfileSettingsSchema.safeParse(input);
    
    if (!validated.success) {
      return { success: false, error: (validated.error as any).errors[0].message };
    }

    const { isPublic, showEmail, showUnprovenSkills } = validated.data;

    const settings = await db.profileSettings.update({
      where: { userId },
      data: {
        ...(isPublic !== undefined && { isPublic }),
        ...(showEmail !== undefined && { showEmail }),
        ...(showUnprovenSkills !== undefined && { showUnprovenSkills }),
      },
    });

    return { success: true, data: settings };
  } catch (error) {
    console.error("updateProfileSettings error:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

// ============================================
// DELETE PROFILE
// ============================================

export async function deleteProfile(): Promise<ActionResult> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const userId = session.user.id;

    // Delete profile and settings in a transaction
    // Profile cascade will delete skills, projects, evidence
    await db.$transaction(async (tx) => {
      await tx.profile.delete({
        where: { userId },
      });

      await tx.profileSettings.delete({
        where: { userId },
      });
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("deleteProfile error:", error);
    return { success: false, error: "Failed to delete profile" };
  }
}
