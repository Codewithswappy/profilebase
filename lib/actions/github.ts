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
          
          // Sort skills by confidence
          analysis.detectedSkills.sort((a, b) => b.confidence - a.confidence);
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
  techStack: string[];
  thumbnail?: string;
  demoUrl?: string;
  status?: "planning" | "in_progress" | "complete" | "archived";
}

export async function importGitHubRepo(
  input: ImportRepoInput
): Promise<ActionResult<{ projectId: string }>> {
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
    
    // Create project with all fields (use null for optional fields, not undefined)
    const project = await db.project.create({
      data: {
        profileId: profile.id,
        title: repoData.name,
        description: repoData.description || null,
        url: repoData.html_url,
        repoUrl: repoData.html_url,
        demoUrl: input.demoUrl || repoData.homepage || null,
        thumbnail: input.thumbnail || null,
        techStack: (input.techStack && input.techStack.length > 0) ? input.techStack : (repoData.topics || []),
        status: input.status || "complete",
        startDate: repoData.created_at ? new Date(repoData.created_at) : null,
        displayOrder: projectCount,
      },
    });
    
    return {
      success: true,
      data: {
        projectId: project.id,
      },
    };
  } catch (error) {
    console.error("importGitHubRepo error:", error);
    const message = error instanceof Error ? error.message : "Failed to import repository";
    return { success: false, error: message };
  }
}
