// GitHub-related types

/**
 * GitHub repository data
 */
export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  languages: Record<string, number>;
  topics: string[];
  stars: number;
  forks: number;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  defaultBranch: string;
  hasReadme: boolean;
  readme?: string;
}

/**
 * Skill detected from GitHub repository analysis
 */
export interface DetectedSkill {
  name: string;
  category: "LANGUAGE" | "FRAMEWORK" | "TOOL" | "DATABASE" | "CONCEPT" | "OTHER";
  confidence: number; // 0-100
  source: "language" | "topic" | "package" | "readme" | "file";
}

/**
 * Evidence suggestion from repository
 */
export interface SuggestedEvidence {
  title: string;
  type: "LINK" | "CODE_SNIPPET" | "DESCRIPTION" | "METRIC";
  content?: string;
  url?: string;
  skills: string[];
  confidence: number;
}

/**
 * Complete GitHub repository analysis result
 */
export interface GitHubAnalysis {
  repo: GitHubRepo;
  detectedSkills: DetectedSkill[];
  suggestedEvidence: SuggestedEvidence[];
  summary: string;
}
