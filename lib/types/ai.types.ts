// AI-related types

/**
 * AI-suggested skill with confidence score
 */
export interface AISkillSuggestion {
  name: string;
  category: "LANGUAGE" | "FRAMEWORK" | "TOOL" | "DATABASE" | "CONCEPT" | "OTHER";
  confidence: number; // 0-100
  reason: string;
}

/**
 * AI-suggested evidence item
 */
export interface AIEvidenceSuggestion {
  title: string;
  type: "LINK" | "CODE_SNIPPET" | "DESCRIPTION" | "METRIC" | "SCREENSHOT";
  content?: string;
  suggestedSkills: string[];
  reason: string;
}

/**
 * Complete AI analysis result for a project
 */
export interface AIAnalysisResult {
  skills: AISkillSuggestion[];
  evidence: AIEvidenceSuggestion[];
  summary: string;
  projectType: string;
  complexity: "beginner" | "intermediate" | "advanced" | "expert";
}

/**
 * Code analysis result
 */
export interface CodeAnalysisResult {
  language: string;
  frameworks: string[];
  patterns: string[];
  skills: AISkillSuggestion[];
  qualityNotes: string[];
}

/**
 * AI status check result
 */
export interface AIStatusResult {
  enabled: boolean;
  message: string;
}
