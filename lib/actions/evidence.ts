"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  CreateEvidenceInput,
  UpdateEvidenceInput,
  DeleteEvidenceInput,
  CreateEvidenceSchema,
  UpdateEvidenceSchema,
  DeleteEvidenceSchema,
} from "@/lib/validations";
import { ActionResult } from "./profile";
import { Evidence, EvidenceSkill, Skill } from "@prisma/client";

// Extended type for evidence with skills
export type EvidenceWithSkills = Evidence & {
  skills: (EvidenceSkill & { skill: Skill })[];
};

// ============================================
// CREATE EVIDENCE
// ============================================

export async function createEvidence(input: CreateEvidenceInput): Promise<ActionResult<Evidence>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const userId = session.user.id;
    const validated = CreateEvidenceSchema.safeParse(input);

    if (!validated.success) {
      console.error("Validation error:", JSON.stringify(validated.error, null, 2));
      const errorMsg = validated.error.issues?.[0]?.message || JSON.stringify(validated.error);
      return { success: false, error: `Validation: ${errorMsg}` };
    }

    const { skillIds, projectId, title, type, content, url } = validated.data;

    // Verify ownership of Project
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { profile: true },
    });

    if (!project || project.profile.userId !== userId) {
      return { success: false, error: "Project not found or access denied" };
    }

    // Verify ownership of all Skills
    const skills = await db.skill.findMany({
      where: {
        id: { in: skillIds },
        profileId: project.profileId,
      },
    });

    if (skills.length !== skillIds.length) {
      return { success: false, error: "One or more skills not found or access denied" };
    }

    // Create evidence first
    const evidence = await db.evidence.create({
      data: {
        projectId,
        title,
        type: type ?? "LINK",
        content,
        url,
      },
    });

    // Create skill connections
    await db.$transaction(
      skillIds.map(skillId =>
        db.evidenceSkill.create({
          data: {
            evidenceId: evidence.id,
            skillId,
          },
        })
      )
    );

    return { success: true, data: evidence };
  } catch (error) {
    console.error("createEvidence error:", error);
    return { 
      success: false, 
      error: `Failed to create evidence: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

// ============================================
// UPDATE EVIDENCE
// ============================================

export async function updateEvidence(input: UpdateEvidenceInput): Promise<ActionResult<Evidence>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const userId = session.user.id;
    const validated = UpdateEvidenceSchema.safeParse(input);

    if (!validated.success) {
      return { success: false, error: (validated.error as any).errors[0].message };
    }

    const { evidenceId, title, type, content, url, skillIds } = validated.data;

    // Verify ownership via Project -> Profile -> User relation
    const evidence = await db.evidence.findUnique({
      where: { id: evidenceId },
      include: {
        project: {
          include: { profile: true },
        },
      },
    });

    if (!evidence || evidence.project.profile.userId !== userId) {
      return { success: false, error: "Evidence not found or access denied" };
    }

    // Update evidence
    const updatedEvidence = await db.evidence.update({
      where: { id: evidenceId },
      data: {
        ...(title !== undefined && { title }),
        ...(type !== undefined && { type }),
        ...(content !== undefined && { content }),
        ...(url !== undefined && { url }),
      },
    });

    // If skillIds provided, update the skill connections
    if (skillIds !== undefined) {
      // Delete existing connections
      await db.evidenceSkill.deleteMany({
        where: { evidenceId },
      });

      // Create new connections
      if (skillIds.length > 0) {
        await db.$transaction(
          skillIds.map(skillId =>
            db.evidenceSkill.create({
              data: {
                evidenceId,
                skillId,
              },
            })
          )
        );
      }
    }

    return { success: true, data: updatedEvidence };
  } catch (error) {
    console.error("updateEvidence error:", error);
    return { success: false, error: "Failed to update evidence" };
  }
}

// ============================================
// DELETE EVIDENCE
// ============================================

export async function deleteEvidence(input: DeleteEvidenceInput): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const userId = session.user.id;
    const validated = DeleteEvidenceSchema.safeParse(input);

    if (!validated.success) {
      return { success: false, error: (validated.error as any).errors[0].message };
    }

    const { evidenceId } = validated.data;

    // Verify ownership via Project
    const evidence = await db.evidence.findUnique({
      where: { id: evidenceId },
      include: {
        project: {
          include: { profile: true },
        },
      },
    });

    if (!evidence || evidence.project.profile.userId !== userId) {
      return { success: false, error: "Evidence not found or access denied" };
    }

    await db.evidence.delete({
      where: { id: evidenceId },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("deleteEvidence error:", error);
    return { success: false, error: "Failed to delete evidence" };
  }
}
