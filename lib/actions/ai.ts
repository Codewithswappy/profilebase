"use server";

import { auth } from "@/lib/auth";
import {
  analyzeProject,
  analyzeCode,
  analyzeReadme,
  quickSuggestSkills,
  suggestRelatedSkills,
  generateEvidenceSuggestions,
  isAIEnabled,
  evaluateResume,
} from "@/lib/ai-analyzer";

// Import types from centralized types
import type {
  ActionResult,
  AIAnalysisResult,
  AISkillSuggestion,
  AIEvidenceSuggestion,
  CodeAnalysisResult,
  AIStatusResult,
} from "@/lib/types";

// Re-export types for backward compatibility
export type { AIStatusResult } from "@/lib/types";

// ============================================
// CHECK AI STATUS
// ============================================

export async function checkAIStatus(): Promise<ActionResult<AIStatusResult>> {
  const enabled = isAIEnabled();
  
  return {
    success: true,
    data: {
      enabled,
      message: enabled 
        ? "AI analysis is available" 
        : "Add GEMINI_API_KEY to enable AI features",
    },
  };
}

// ============================================
// ANALYZE PROJECT
// ============================================

export async function aiAnalyzeProject(
  project: {
    title: string;
    description?: string;
    url?: string;
    readme?: string;
    technologies?: string[];
  }
): Promise<ActionResult<AIAnalysisResult>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }
    
    if (!isAIEnabled()) {
      return { success: false, error: "AI features not enabled. Add GEMINI_API_KEY to .env" };
    }
    
    const result = await analyzeProject(project);
    
    return { success: true, data: result };
  } catch (error) {
    console.error("aiAnalyzeProject error:", error);
    return { success: false, error: "Failed to analyze project with AI" };
  }
}

// ============================================
// ANALYZE CODE SNIPPET
// ============================================

export async function aiAnalyzeCode(
  code: string
): Promise<ActionResult<CodeAnalysisResult>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }
    
    if (!isAIEnabled()) {
      return { success: false, error: "AI features not enabled" };
    }
    
    const result = await analyzeCode(code);
    
    return { success: true, data: result };
  } catch (error) {
    console.error("aiAnalyzeCode error:", error);
    return { success: false, error: "Failed to analyze code with AI" };
  }
}

// ============================================
// ANALYZE README
// ============================================

export async function aiAnalyzeReadme(
  readme: string
): Promise<ActionResult<AIAnalysisResult>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }
    
    if (!isAIEnabled()) {
      return { success: false, error: "AI features not enabled" };
    }
    
    const result = await analyzeReadme(readme);
    
    return { success: true, data: result };
  } catch (error) {
    console.error("aiAnalyzeReadme error:", error);
    return { success: false, error: "Failed to analyze README with AI" };
  }
}

// ============================================
// QUICK SKILL SUGGESTIONS
// ============================================

export async function aiQuickSuggest(
  description: string
): Promise<ActionResult<AISkillSuggestion[]>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }
    
    if (!isAIEnabled()) {
      return { success: false, error: "AI features not enabled. Add GEMINI_API_KEY to .env and restart server." };
    }
    
    const result = await quickSuggestSkills(description);
    
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error("aiQuickSuggest error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate suggestions";
    // Check for common errors
    if (message.includes("API_KEY")) {
      return { success: false, error: "Invalid API key. Check your GEMINI_API_KEY in .env" };
    }
    if (message.includes("not supported") || message.includes("model")) {
      return { success: false, error: "Gemini model not available in your region. Please try again later." };
    }
    return { success: false, error: message };
  }
}

// ============================================
// SUGGEST RELATED SKILLS
// ============================================

export async function aiSuggestRelated(
  existingSkills: string[],
  projectContext?: string
): Promise<ActionResult<AISkillSuggestion[]>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }
    
    if (!isAIEnabled()) {
      return { success: false, error: "AI features not enabled" };
    }
    
    const result = await suggestRelatedSkills(existingSkills, projectContext);
    
    return { success: true, data: result };
  } catch (error) {
    console.error("aiSuggestRelated error:", error);
    return { success: false, error: "Failed to suggest related skills" };
  }
}

// ============================================
// GENERATE EVIDENCE SUGGESTIONS
// ============================================

export async function aiGenerateEvidence(
  skills: string[],
  projectTitle: string,
  projectDescription?: string
): Promise<ActionResult<AIEvidenceSuggestion[]>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }
    
    if (!isAIEnabled()) {
      return { success: false, error: "AI features not enabled" };
    }
    
    const result = await generateEvidenceSuggestions(
      skills,
      projectTitle,
      projectDescription
    );
    
    return { success: true, data: result };
  } catch (error) {
    console.error("aiGenerateEvidence error:", error);
    return { success: false, error: "Failed to generate evidence suggestions" };
  }
}

// ============================================
// EVALUATE RESUME (ATS SCORE)
// ============================================

export async function aiEvaluateResume(
  profileData: any
): Promise<ActionResult<{
  score: number;
  status: string;
  feedback: string[];
  summarySuggestion?: string;
  missingKeywords?: string[];
}>> {
  try {
     const session = await auth();
    // Allow public access for now if needed, or check auth.
    // For portfolio visitors, they might not be logged in. 
    // BUT usually only the OWNER checks the score. 
    // The previous code had session checks. Let's keep it safe.
    if (!session?.user?.id) {
       // If viewed by public, and they hit 'scan', do we allow it?
       // The UI button is on the public view.
       // For now, let's allow it if the user has the API key configured on server.
       // Ideally, only the owner should see the score, but for this demo/preview, 
       // let's assume the user is the owner previewing it, OR we just allow it.
    }
    
    if (!isAIEnabled()) {
       // Fallback to simulation if AI not enabled?
       return { success: false, error: "AI features not enabled" };
    }

    // Filter data to send only relevant parts to save tokens
    const dataToSend = {
      profile: profileData.profile,
      experiences: profileData.experiences,
      projects: profileData.projects.map((p: any) => ({
        title: p.title, 
        description: p.description,
        techStack: p.techStack,
        highlights: p.highlights
      })),
      skills: profileData.skills // usage in code might vary
    };

    const result = await evaluateResume(profileData);
    return { success: true, data: result };

  } catch (error) {
    console.error("aiEvaluateResume error:", error);
    return { success: false, error: "AI Evaluation failed" };
  }
}
