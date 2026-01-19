"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ActionResult } from "./profile";
import { analyzeGitHubRepo } from "./github";
import { analyzeProject } from "@/lib/ai-analyzer";

/**
 * Process a "Magic Link" - automatically creates a Project with detected tech stack
 * Portfolio-centric: creates project with techStack only
 */
export async function processMagicLink(url: string): Promise<ActionResult<{
  projectName: string;
  techStackCount: number;
}>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const userId = session.user.id;
    let projectTitle = "";
    let projectDescription = "";
    let techStack: string[] = [];

    // 1. Determine Type (GitHub vs Generic URL vs Text)
    const isUrl = url.toLowerCase().startsWith("http") || url.toLowerCase().startsWith("www") || url.includes(".com") || url.includes(".org") || url.includes(".io");

    if (isUrl && url.includes("github.com")) {
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
      
      // Extract tech stack from detected skills with high confidence
      techStack = analysis.data.detectedSkills
        .filter(s => s.confidence > 70)
        .map(s => s.name);

    } else if (isUrl) {
      // Generic URL
      const aiResult = await analyzeProject({
        title: new URL(url.startsWith("http") ? url : `https://${url}`).hostname,
        url: url,
        description: "External link import"
      });

      projectTitle = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
      techStack = aiResult.skills.map(s => s.name);

    } else {
      // PLAIN TEXT INPUT ("I built a login form with React")
      const aiResult = await analyzeProject({
        title: "Quick Entry",
        description: url // treating 'url' arg as text content here
      });

      projectTitle = aiResult.summary.length < 30 ? aiResult.summary : "Portfolio";
      techStack = aiResult.skills.map(s => s.name);
    }

    // 2. Find or Create Project
    
    // Check if project exists with same title (simple dedup)
    const existingProject = await db.project.findFirst({
      where: {
        profile: { userId },
        title: projectTitle
      }
    });

    if (existingProject) {
      // Optionally update techStack if new tech found
      if (techStack.length > 0) {
        const currentTech = existingProject.techStack || [];
        const mergedTech = [...new Set([...currentTech, ...techStack])];
        await db.project.update({
          where: { id: existingProject.id },
          data: { techStack: mergedTech }
        });
      }
    } else {
      // Create new project with techStack
      const profile = await db.profile.findUnique({ where: { userId } });
      if (!profile) return { success: false, error: "Profile not found" };

      await db.project.create({
        data: {
          profileId: profile.id,
          title: projectTitle,
          description: projectDescription,
          url: url,
          techStack,
        }
      });
    }

    return {
      success: true,
      data: {
        projectName: projectTitle,
        techStackCount: techStack.length
      }
    };

  } catch (error) {
    console.error("processMagicLink error:", error);
    return { success: false, error: "Failed to process link" };
  }
}
