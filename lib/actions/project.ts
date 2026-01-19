"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  CreateProjectInput,
  UpdateProjectInput,
  ReorderProjectsInput,
  DeleteProjectInput,
  CreateProjectSchema,
  UpdateProjectSchema,
  ReorderProjectsSchema,
  DeleteProjectSchema,
} from "@/lib/validations";
import { ActionResult } from "./profile";
import { Project } from "@prisma/client";

// ============================================
// CREATE PROJECT
// ============================================

export async function createProject(input: CreateProjectInput): Promise<ActionResult<Project>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const userId = session.user.id;
    const validated = CreateProjectSchema.safeParse(input);

    if (!validated.success) {
      return { success: false, error: (validated.error as any).errors[0].message };
    }

    const { 
      title, 
      description, 
      url, 
      repoUrl,
      demoUrl,
      thumbnail,
      techStack,
      role,
      highlights,
      startDate, 
      endDate,
      status,
      isFeatured,
      isPublic,
    } = validated.data;

    const profile = await db.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    // Get current highest order
    const lastProject = await db.project.findFirst({
      where: { profileId: profile.id },
      orderBy: { displayOrder: "desc" },
    });

    const displayOrder = lastProject ? lastProject.displayOrder + 1 : 0;

    const project = await db.project.create({
      data: {
        profileId: profile.id,
        title,
        description,
        url: url || null,
        repoUrl: repoUrl || null,
        demoUrl: demoUrl || null,
        thumbnail: thumbnail || null,
        techStack: techStack || [],
        role: role || null,
        highlights: highlights || [],
        startDate,
        endDate,
        status: status || "complete",
        isFeatured: isFeatured || false,
        isPublic: isPublic !== undefined ? isPublic : true,
        displayOrder,
      },
    });

    return { success: true, data: project };
  } catch (error) {
    console.error("createProject error:", error);
    return { success: false, error: "Failed to create project" };
  }
}

// ============================================
// UPDATE PROJECT
// ============================================

export async function updateProject(input: UpdateProjectInput): Promise<ActionResult<Project>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const userId = session.user.id;
    const validated = UpdateProjectSchema.safeParse(input);

    if (!validated.success) {
      return { success: false, error: (validated.error as any).errors[0].message };
    }

    const { 
      projectId, 
      title, 
      description, 
      url,
      repoUrl,
      demoUrl, 
      thumbnail,
      techStack,
      role,
      highlights,
      startDate, 
      endDate,
      isFeatured,
      isPublic,
    } = validated.data;

    // Verify ownership
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { profile: true },
    });

    if (!project || project.profile.userId !== userId) {
      return { success: false, error: "Project not found or access denied" };
    }

    const updatedProject = await db.project.update({
      where: { id: projectId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(url !== undefined && { url: url || null }),
        ...(repoUrl !== undefined && { repoUrl: repoUrl || null }),
        ...(demoUrl !== undefined && { demoUrl: demoUrl || null }),
        ...(thumbnail !== undefined && { thumbnail: thumbnail || null }),
        ...(techStack !== undefined && { techStack }),
        ...(role !== undefined && { role: role || null }),
        ...(highlights !== undefined && { highlights }),
        ...(startDate !== undefined && { startDate }),
        ...(endDate !== undefined && { endDate }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isPublic !== undefined && { isPublic }),
      },
    });

    return { success: true, data: updatedProject };
  } catch (error) {
    console.error("updateProject error:", error);
    return { success: false, error: "Failed to update project" };
  }
}

// ============================================
// REORDER PROJECTS
// ============================================

export async function reorderProjects(input: ReorderProjectsInput): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const userId = session.user.id;
    const validated = ReorderProjectsSchema.safeParse(input);

    if (!validated.success) {
      return { success: false, error: (validated.error as any).errors[0].message };
    }

    const { projectIds } = validated.data;

    const profile = await db.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    await db.$transaction(
      projectIds.map((id, index) =>
        db.project.update({
          where: { id, profileId: profile.id },
          data: { displayOrder: index },
        })
      )
    );

    return { success: true, data: undefined };
  } catch (error) {
    console.error("reorderProjects error:", error);
    return { success: false, error: "Failed to reorder projects" };
  }
}

// ============================================
// DELETE PROJECT
// ============================================

export async function deleteProject(input: DeleteProjectInput): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const userId = session.user.id;
    const validated = DeleteProjectSchema.safeParse(input);

    if (!validated.success) {
      return { success: false, error: (validated.error as any).errors[0].message };
    }

    const { projectId } = validated.data;

    // Verify ownership
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { profile: true },
    });

    if (!project || project.profile.userId !== userId) {
      return { success: false, error: "Project not found or access denied" };
    }

    await db.project.delete({
      where: { id: projectId },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("deleteProject error:", error);
    return { success: false, error: "Failed to delete project" };
  }
}

// ============================================
// TOGGLE PROJECT FEATURED STATUS
// ============================================

export async function toggleProjectFeatured(
  projectId: string,
  isFeatured: boolean
): Promise<ActionResult<Project>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const userId = session.user.id;

    // Verify ownership
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { profile: true },
    });

    if (!project || project.profile.userId !== userId) {
      return { success: false, error: "Project not found or access denied" };
    }

    const updatedProject = await db.project.update({
      where: { id: projectId },
      data: { isFeatured },
    });

    return { success: true, data: updatedProject };
  } catch (error) {
    console.error("toggleProjectFeatured error:", error);
    return { success: false, error: "Failed to update project" };
  }
}

// ============================================
// TOGGLE PROJECT PUBLIC STATUS
// ============================================

export async function toggleProjectPublic(
  projectId: string,
  isPublic: boolean
): Promise<ActionResult<Project>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const userId = session.user.id;

    // Verify ownership
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { profile: true },
    });

    if (!project || project.profile.userId !== userId) {
      return { success: false, error: "Project not found or access denied" };
    }

    const updatedProject = await db.project.update({
      where: { id: projectId },
      data: { isPublic },
    });

    return { success: true, data: updatedProject };
  } catch (error) {
    console.error("toggleProjectPublic error:", error);
    return { success: false, error: "Failed to update project visibility" };
  }
}
