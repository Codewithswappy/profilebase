"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  fetchUserRepos,
  fetchRepoDetails,
  analyzeRepository,
  GitHubRepo,
  GitHubAnalysis,
  DetectedSkill,
  SuggestedEvidence,
} from "@/lib/github";
import { ActionResult } from "./profile";

// ============================================
// TYPES
// ============================================

export interface GitHubConnectionStatus {
  isConnected: boolean;
  username?: string;
  avatarUrl?: string;
}

export interface RepoListItem {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  updatedAt: string;
  isPrivate: boolean;
  url: string;
  isImported: boolean;
}

// ============================================
// CHECK GITHUB CONNECTION
// ============================================

export async function checkGitHubConnection(): Promise<ActionResult<GitHubConnectionStatus>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }
    
    // Check if user has a GitHub account linked
    const account = await db.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "github",
      },
    });
    
    if (!account || !account.access_token) {
      return {
        success: true,
        data: { isConnected: false },
      };
    }
    
    // Try to get GitHub user info
    try {
      const { Octokit } = await import("@octokit/rest");
      const octokit = new Octokit({ auth: account.access_token });
      const { data: user } = await octokit.users.getAuthenticated();
      
      return {
        success: true,
        data: {
          isConnected: true,
          username: user.login,
          avatarUrl: user.avatar_url,
        },
      };
    } catch {
      // Token might be invalid
      return {
        success: true,
        data: { isConnected: false },
      };
    }
  } catch (error) {
    console.error("checkGitHubConnection error:", error);
    return { success: false, error: "Failed to check GitHub connection" };
  }
}

// ============================================
// GET GITHUB REPOSITORIES
// ============================================

export async function getGitHubRepos(): Promise<ActionResult<RepoListItem[]>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }
    
    // Get GitHub access token from account
    const account = await db.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "github",
      },
    });
    
    if (!account?.access_token) {
      return { success: false, error: "GitHub not connected. Please connect your GitHub account first." };
    }
    
    // Fetch repos from GitHub
    const repos = await fetchUserRepos(account.access_token, {
      perPage: 50,
      sort: "updated",
    });
    
    // Check which repos are already imported as projects
    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
      include: { projects: true },
    });
    
    const importedUrls = new Set(
      profile?.projects.map(p => p.url?.toLowerCase()).filter(Boolean) || []
    );
    
    const repoList: RepoListItem[] = repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.fullName,
      description: repo.description,
      language: repo.language,
      stars: repo.stars,
      updatedAt: repo.updatedAt,
      isPrivate: repo.isPrivate,
      url: repo.url,
      isImported: importedUrls.has(repo.url.toLowerCase()),
    }));
    
    return { success: true, data: repoList };
  } catch (error) {
    console.error("getGitHubRepos error:", error);
    return { success: false, error: "Failed to fetch GitHub repositories" };
  }
}

// ============================================
// ANALYZE REPOSITORY
// ============================================

export async function analyzeGitHubRepo(
  repoFullName: string,
  useAI: boolean = true
): Promise<ActionResult<GitHubAnalysis>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }
    
    const account = await db.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "github",
      },
    });
    
    if (!account?.access_token) {
      return { success: false, error: "GitHub not connected" };
    }
    
    const [owner, repo] = repoFullName.split("/");
    
    if (!owner || !repo) {
      return { success: false, error: "Invalid repository name" };
    }
    
    // Get base analysis from GitHub metadata
    const analysis = await analyzeRepository(account.access_token, owner, repo);
    
    // Enhance with AI if available and requested
    if (useAI && process.env.GEMINI_API_KEY) {
      try {
        const { analyzeProject, isAIEnabled } = await import("@/lib/ai-analyzer");
        
        if (isAIEnabled()) {
          const aiResult = await analyzeProject({
            title: analysis.repo.name,
            description: analysis.repo.description || undefined,
            url: analysis.repo.url,
            readme: analysis.repo.readme,
            technologies: analysis.detectedSkills.map(s => s.name),
          });
          
          // Merge AI-detected skills with GitHub-detected skills
          const existingSkillNames = new Set(
            analysis.detectedSkills.map(s => s.name.toLowerCase())
          );
          
          for (const aiSkill of aiResult.skills) {
            if (!existingSkillNames.has(aiSkill.name.toLowerCase())) {
              analysis.detectedSkills.push({
                name: aiSkill.name,
                category: aiSkill.category,
                confidence: Math.round(aiSkill.confidence * 0.9), // Slightly lower confidence for AI-only
                source: "readme", // Mark as from readme/AI analysis
              });
            } else {
              // Boost confidence if AI also detected it
              const existing = analysis.detectedSkills.find(
                s => s.name.toLowerCase() === aiSkill.name.toLowerCase()
              );
              if (existing) {
                existing.confidence = Math.min(100, existing.confidence + 10);
              }
            }
          }
          
          // Add AI-suggested evidence
          const existingEvidenceTitles = new Set(
            analysis.suggestedEvidence.map(e => e.title.toLowerCase())
          );
          
          for (const aiEvidence of aiResult.evidence) {
            if (!existingEvidenceTitles.has(aiEvidence.title.toLowerCase())) {
              analysis.suggestedEvidence.push({
                title: aiEvidence.title,
                type: aiEvidence.type as any,
                content: aiEvidence.content,
                skills: aiEvidence.suggestedSkills,
                confidence: 75, // AI suggestions get good confidence
              });
            }
          }
          
          // Update summary with AI insights
          if (aiResult.summary && aiResult.summary.length > analysis.summary.length) {
            analysis.summary = `${aiResult.summary} [AI-enhanced: ${aiResult.projectType}, ${aiResult.complexity} complexity]`;
          }
        }
      } catch (aiError) {
        console.warn("AI analysis failed, using GitHub-only analysis:", aiError);
        // Continue with GitHub-only analysis
      }
    }
    
    // Sort skills by confidence
    analysis.detectedSkills.sort((a, b) => b.confidence - a.confidence);
    
    return { success: true, data: analysis };
  } catch (error) {
    console.error("analyzeGitHubRepo error:", error);
    return { success: false, error: "Failed to analyze repository" };
  }
}

// ============================================
// IMPORT REPO AS PROJECT
// ============================================

export interface ImportRepoInput {
  repoFullName: string;
  selectedSkills: string[]; // Skill IDs to link
  selectedEvidence: SuggestedEvidence[];
}

export async function importGitHubRepo(
  input: ImportRepoInput
): Promise<ActionResult<{ projectId: string; evidenceCount: number }>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }
    
    const account = await db.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "github",
      },
    });
    
    if (!account?.access_token) {
      return { success: false, error: "GitHub not connected" };
    }
    
    // Get profile
    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });
    
    if (!profile) {
      return { success: false, error: "Profile not found. Create a profile first." };
    }
    
    // Fetch repo details
    const [owner, repoName] = input.repoFullName.split("/");
    const { Octokit } = await import("@octokit/rest");
    const octokit = new Octokit({ auth: account.access_token });
    const { data: repoData } = await octokit.repos.get({ owner, repo: repoName });
    
    // Get current project count for ordering
    const projectCount = await db.project.count({
      where: { profileId: profile.id },
    });
    
    // Create project
    const project = await db.project.create({
      data: {
        profileId: profile.id,
        title: repoData.name,
        description: repoData.description || undefined,
        url: repoData.html_url,
        startDate: repoData.created_at ? new Date(repoData.created_at) : undefined,
        displayOrder: projectCount,
      },
    });
    
    // Create evidence items
    let evidenceCount = 0;
    
    for (const evidenceItem of input.selectedEvidence) {
      // Find skill IDs for this evidence
      const skillIds = input.selectedSkills.filter(skillId => {
        // We'll match all selected skills with evidence for now
        return true;
      });
      
      // Create evidence
      const evidence = await db.evidence.create({
        data: {
          projectId: project.id,
          title: evidenceItem.title,
          type: evidenceItem.type,
          content: evidenceItem.content || undefined,
          url: evidenceItem.url || undefined,
          displayOrder: evidenceCount,
        },
      });
      
      // Create skill-evidence links
      for (const skillId of skillIds.slice(0, 5)) { // Max 5 skills per evidence
        await db.evidenceSkill.create({
          data: {
            evidenceId: evidence.id,
            skillId,
          },
        }).catch(() => {
          // Ignore duplicate or invalid skill links
        });
      }
      
      evidenceCount++;
    }
    
    return {
      success: true,
      data: {
        projectId: project.id,
        evidenceCount,
      },
    };
  } catch (error) {
    console.error("importGitHubRepo error:", error);
    return { success: false, error: "Failed to import repository" };
  }
}

// ============================================
// CREATE SKILLS FROM DETECTED
// ============================================

export async function createSkillsFromDetected(
  detectedSkills: Array<{ name: string; category: string }>
): Promise<ActionResult<string[]>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }
    
    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });
    
    if (!profile) {
      return { success: false, error: "Profile not found" };
    }
    
    // Get existing skills
    const existingSkills = await db.skill.findMany({
      where: { profileId: profile.id },
    });
    
    const existingNames = new Set(existingSkills.map(s => s.name.toLowerCase()));
    
    // Filter out already existing skills
    const newSkills = detectedSkills.filter(
      s => !existingNames.has(s.name.toLowerCase())
    );
    
    // Get current highest order
    const lastSkill = await db.skill.findFirst({
      where: { profileId: profile.id },
      orderBy: { displayOrder: "desc" },
    });
    
    let displayOrder = lastSkill ? lastSkill.displayOrder + 1 : 0;
    const createdIds: string[] = [];
    
    for (const skill of newSkills) {
      const created = await db.skill.create({
        data: {
          profileId: profile.id,
          name: skill.name,
          category: skill.category as any,
          displayOrder: displayOrder++,
        },
      });
      createdIds.push(created.id);
    }
    
    // Also return IDs of existing skills that match
    const existingMatches = existingSkills
      .filter(s => detectedSkills.some(d => d.name.toLowerCase() === s.name.toLowerCase()))
      .map(s => s.id);
    
    return {
      success: true,
      data: [...createdIds, ...existingMatches],
    };
  } catch (error) {
    console.error("createSkillsFromDetected error:", error);
    return { success: false, error: "Failed to create skills" };
  }
}
