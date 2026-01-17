"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ActionResult } from "./profile";
import { analyzeGitHubRepo, createSkillsFromDetected } from "./github";
import { analyzeProject } from "@/lib/ai-analyzer";
import { EvidenceType } from "@/lib/validations";

/**
 * Process a "Magic Link" - automatically creates Project, Evidence, and Skills
 */
export async function processMagicLink(url: string): Promise<ActionResult<{
  projectName: string;
  evidenceTitle: string;
  skillsCount: number;
}>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const userId = session.user.id;
    let projectTitle = "";
    let projectDescription = "";
    let evidenceTitle = "";
    let skillsToTag: string[] = [];
    let detectedSkills: { name: string; category: string }[] = [];

    // 1. Determine Type (GitHub vs Generic URL vs Text)
    const isUrl = url.toLowerCase().startsWith("http") || url.toLowerCase().startsWith("www") || url.includes(".com") || url.includes(".org") || url.includes(".io");

    if (isUrl && url.includes("github.com")) {
      // ... same GitHub logic ...
      const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        return { success: false, error: "Invalid GitHub URL format" };
      }
      const fullName = `${match[1]}/${match[2]}`;

      // Analyze Repo
      const analysis = await analyzeGitHubRepo(fullName);
      if (!analysis.success) {
        return { success: false, error: analysis.error || "Failed to analyze GitHub repo" };
      }

      projectTitle = analysis.data.repo.name;
      projectDescription = analysis.data.repo.description || "";
      evidenceTitle = `GitHub Repository: ${analysis.data.repo.name}`;
      
      detectedSkills = analysis.data.detectedSkills
        .filter(s => s.confidence > 70)
        .map(s => ({ name: s.name, category: s.category }));
        
      skillsToTag = detectedSkills.map(s => s.name);

    } else if (isUrl) {
      // Generic URL
      const aiResult = await analyzeProject({
        title: new URL(url.startsWith("http") ? url : `https://${url}`).hostname,
        url: url,
        description: "External link import"
      });

      projectTitle = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
      evidenceTitle = "External Link";
      skillsToTag = aiResult.skills.map(s => s.name);
      detectedSkills = aiResult.skills.map(s => ({ name: s.name, category: s.category }));

    } else {
      // PLAIN TEXT INPUT ("I built a login form with React")
      // Use AI to extract skills and intent
      const aiResult = await analyzeProject({
        title: "Quick Entry",
        description: url // treating 'url' arg as text content here
      });

      // Try to find a meaningful project title or default to "Portfolio"
      projectTitle = aiResult.summary.length < 30 ? aiResult.summary : "Portfolio";
      evidenceTitle = url.length > 50 ? url.substring(0, 47) + "..." : url;
      skillsToTag = aiResult.skills.map(s => s.name);
      detectedSkills = aiResult.skills.map(s => ({ name: s.name, category: s.category }));
    }

    // 2. Find or Create Project
    let projectId = "";
    
    // Check if project exists with same title (simple dedup)
    const existingProject = await db.project.findFirst({
      where: {
        profile: { userId },
        title: projectTitle
      }
    });

    if (existingProject) {
      projectId = existingProject.id;
    } else {
      // Create new project
      const profile = await db.profile.findUnique({ where: { userId } });
      if (!profile) return { success: false, error: "Profile not found" };

      const newProject = await db.project.create({
        data: {
          profileId: profile.id,
          title: projectTitle,
          description: projectDescription,
          url: url
        }
      });
      projectId = newProject.id;
    }

    // 3. Create Skills
    if (detectedSkills.length > 0) {
      await createSkillsFromDetected(detectedSkills);
    }

    // Get Skill IDs
    const profile = await db.profile.findUnique({
      where: { userId },
      include: { skills: true }
    });
    
    const skillIds = profile?.skills
      .filter(s => skillsToTag.includes(s.name))
      .map(s => s.id) || [];

    // 4. Create Evidence
    const evidence = await db.evidence.create({
      data: {
        projectId,
        title: evidenceTitle,
        type: "LINK",
        url: url,
      }
    });

    // 5. Link Skills to Evidence
    if (skillIds.length > 0) {
      await db.$transaction(
        skillIds.map(skillId =>
          db.evidenceSkill.create({
            data: {
              evidenceId: evidence.id,
              skillId
            }
          })
        )
      );
    }

    return {
      success: true,
      data: {
        projectName: projectTitle,
        evidenceTitle,
        skillsCount: skillIds.length
      }
    };

  } catch (error) {
    console.error("processMagicLink error:", error);
    return { success: false, error: "Failed to process link" };
  }
}
