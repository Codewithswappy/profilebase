"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/lib/types";
import { Resume } from "@prisma/client";

// Define the shape of the JSON data structure for type safety
export interface ResumeData {
  userName: string;
  email: string;
  profile: {
    headline: string;
    summary: string;
    location: string;
  };
  experiences: any[];
  projects: any[];
  education: any[];
  skillsString: string;
  socialLinks: any[];
}

export async function getResumes(): Promise<ActionResult<Resume[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const profile = await db.profile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, error: "Profile not found" };

    const resumes = await db.resume.findMany({
      where: { profileId: profile.id },
      orderBy: { updatedAt: 'desc' }
    });

    return { success: true, data: resumes };
  } catch (error) {
    console.error("getResumes error:", error);
    return { success: false, error: "Failed to fetch resumes" };
  }
}

export async function createResume(title: string, initialData: ResumeData): Promise<ActionResult<Resume>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const profile = await db.profile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return { success: false, error: "Profile not found" };

    const resume = await db.resume.create({
      data: {
        profileId: profile.id,
        title,
        data: initialData as any,
      }
    });

    revalidatePath("/dashboard/resume");
    return { success: true, data: resume };
  } catch (error: any) {
    console.error("createResume FULL ERROR:", error);
    // Return the actual error message to the client for debugging
    return { success: false, error: error?.message || "Failed to create resume" };
  }
}

export async function updateResume(
  id: string, 
  updates: { 
    title?: string;
    data?: ResumeData; 
    templateId?: string;
    fontFamily?: string;
    fontSize?: number;
    lineHeight?: number;
    margins?: number;
    primaryColor?: string;
  }
): Promise<ActionResult<Resume>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    // Verify ownership
    const resume = await db.resume.findUnique({ 
        where: { id },
        include: { profile: true } 
    });
    
    if (!resume || resume.profile.userId !== session.user.id) {
        return { success: false, error: "Resume not found or unauthorized" };
    }

    const updated = await db.resume.update({
      where: { id },
      data: {
         ...updates,
         data: updates.data ? (updates.data as any) : undefined
      }
    });

    revalidatePath("/resume-editor");
    return { success: true, data: updated };
  } catch (error) {
    console.error("updateResume error:", error);
    return { success: false, error: "Failed to update resume" };
  }
}

export async function deleteResume(id: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    // Verify ownership
    const resume = await db.resume.findUnique({ 
        where: { id },
        include: { profile: true } 
    });
    
    if (!resume || resume.profile.userId !== session.user.id) {
        return { success: false, error: "Unauthorized" };
    }

    await db.resume.delete({ where: { id } });
    revalidatePath("/dashboard/resume");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("deleteResume error:", error);
    return { success: false, error: "Failed to delete resume" };
  }
}

export async function getResume(id: string): Promise<ActionResult<Resume>> {
    try {
      const session = await auth();
      if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  
      const resume = await db.resume.findUnique({ 
          where: { id },
          include: { profile: true } 
      });
      
      if (!resume || resume.profile.userId !== session.user.id) {
          return { success: false, error: "Resume not found" };
      }
  
      return { success: true, data: resume };
    } catch (error) {
      console.error("getResume error:", error);
      return { success: false, error: "Failed to fetch resume" };
    }
}

/**
 * Set a resume as the primary resume for public profile
 */
export async function setPrimaryResume(resumeId: string | null): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    // If resumeId is provided, verify ownership
    if (resumeId) {
      const resume = await db.resume.findUnique({
        where: { id: resumeId },
        include: { profile: true },
      });

      if (!resume || resume.profile.userId !== session.user.id) {
        return { success: false, error: "Resume not found or unauthorized" };
      }
    }

    // Update or create profile settings with primary resume
    await db.profileSettings.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        primaryResumeId: resumeId,
        isPublic: false,
        showEmail: false,
        showExperience: true,
        showProjects: true,
        showTechStack: true,
        showSummary: true,
        showAchievements: true,
        showCertificates: true,
      },
      update: { primaryResumeId: resumeId },
    });

    revalidatePath("/dashboard/resume");
    return { success: true, data: undefined };
  } catch (error: any) {
    console.error("setPrimaryResume error:", error);
    return { success: false, error: error.message || "Failed to set primary resume" };
  }
}

/**
 * Get the current primary resume ID for the user
 */
export async function getPrimaryResumeId(): Promise<ActionResult<string | null>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const settings = await db.profileSettings.findUnique({
      where: { userId: session.user.id },
      select: { primaryResumeId: true },
    });

    return { success: true, data: settings?.primaryResumeId ?? null };
  } catch (error) {
    console.error("getPrimaryResumeId error:", error);
    return { success: false, error: "Failed to get primary resume" };
  }
}
