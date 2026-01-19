// ============================================
// GITHUB INTEGRATION
// ============================================
// Handles GitHub API integration for auto-importing
// repositories and detecting skills/evidence.
// ============================================

import { Octokit } from "@octokit/rest";

// Import types from centralized types
import type {
  GitHubRepo,
  DetectedSkill,
  SuggestedEvidence,
  GitHubAnalysis,
} from "./types";

// Re-export types for backward compatibility
export type {
  GitHubRepo,
  DetectedSkill,
  SuggestedEvidence,
  GitHubAnalysis,
} from "./types";

// ============================================
// TECH STACK DETECTION MAPPINGS
// ============================================

// Language to skill mappings
const LANGUAGE_SKILLS: Record<string, { name: string; category: DetectedSkill["category"] }> = {
  "TypeScript": { name: "TypeScript", category: "LANGUAGE" },
  "JavaScript": { name: "JavaScript", category: "LANGUAGE" },
  "Python": { name: "Python", category: "LANGUAGE" },
  "Java": { name: "Java", category: "LANGUAGE" },
  "Go": { name: "Go", category: "LANGUAGE" },
  "Rust": { name: "Rust", category: "LANGUAGE" },
  "C++": { name: "C++", category: "LANGUAGE" },
  "C#": { name: "C#", category: "LANGUAGE" },
  "Ruby": { name: "Ruby", category: "LANGUAGE" },
  "PHP": { name: "PHP", category: "LANGUAGE" },
  "Swift": { name: "Swift", category: "LANGUAGE" },
  "Kotlin": { name: "Kotlin", category: "LANGUAGE" },
  "Dart": { name: "Dart", category: "LANGUAGE" },
  "Shell": { name: "Bash", category: "TOOL" },
  "HTML": { name: "HTML", category: "LANGUAGE" },
  "CSS": { name: "CSS", category: "LANGUAGE" },
  "SCSS": { name: "Sass", category: "LANGUAGE" },
  "Solidity": { name: "Solidity", category: "LANGUAGE" },
};

// Topic to skill mappings
const TOPIC_SKILLS: Record<string, { name: string; category: DetectedSkill["category"] }> = {
  // Frameworks
  "react": { name: "React", category: "FRAMEWORK" },
  "reactjs": { name: "React", category: "FRAMEWORK" },
  "nextjs": { name: "Next.js", category: "FRAMEWORK" },
  "next": { name: "Next.js", category: "FRAMEWORK" },
  "vue": { name: "Vue.js", category: "FRAMEWORK" },
  "vuejs": { name: "Vue.js", category: "FRAMEWORK" },
  "angular": { name: "Angular", category: "FRAMEWORK" },
  "svelte": { name: "Svelte", category: "FRAMEWORK" },
  "express": { name: "Express.js", category: "FRAMEWORK" },
  "expressjs": { name: "Express.js", category: "FRAMEWORK" },
  "fastapi": { name: "FastAPI", category: "FRAMEWORK" },
  "django": { name: "Django", category: "FRAMEWORK" },
  "flask": { name: "Flask", category: "FRAMEWORK" },
  "rails": { name: "Ruby on Rails", category: "FRAMEWORK" },
  "spring": { name: "Spring", category: "FRAMEWORK" },
  "spring-boot": { name: "Spring Boot", category: "FRAMEWORK" },
  "laravel": { name: "Laravel", category: "FRAMEWORK" },
  "nestjs": { name: "NestJS", category: "FRAMEWORK" },
  "remix": { name: "Remix", category: "FRAMEWORK" },
  "astro": { name: "Astro", category: "FRAMEWORK" },
  "nuxt": { name: "Nuxt.js", category: "FRAMEWORK" },
  "gatsby": { name: "Gatsby", category: "FRAMEWORK" },
  "flutter": { name: "Flutter", category: "FRAMEWORK" },
  "react-native": { name: "React Native", category: "FRAMEWORK" },
  "electron": { name: "Electron", category: "FRAMEWORK" },
  "tauri": { name: "Tauri", category: "FRAMEWORK" },
  
  // Tools & Libraries
  "tailwindcss": { name: "Tailwind CSS", category: "TOOL" },
  "tailwind": { name: "Tailwind CSS", category: "TOOL" },
  "prisma": { name: "Prisma", category: "TOOL" },
  "graphql": { name: "GraphQL", category: "TOOL" },
  "apollo": { name: "Apollo", category: "TOOL" },
  "docker": { name: "Docker", category: "TOOL" },
  "kubernetes": { name: "Kubernetes", category: "TOOL" },
  "terraform": { name: "Terraform", category: "TOOL" },
  "aws": { name: "AWS", category: "TOOL" },
  "gcp": { name: "Google Cloud", category: "TOOL" },
  "azure": { name: "Azure", category: "TOOL" },
  "vercel": { name: "Vercel", category: "TOOL" },
  "netlify": { name: "Netlify", category: "TOOL" },
  "supabase": { name: "Supabase", category: "TOOL" },
  "firebase": { name: "Firebase", category: "TOOL" },
  "redux": { name: "Redux", category: "TOOL" },
  "zustand": { name: "Zustand", category: "TOOL" },
  "tanstack-query": { name: "TanStack Query", category: "TOOL" },
  "trpc": { name: "tRPC", category: "TOOL" },
  "zod": { name: "Zod", category: "TOOL" },
  "jest": { name: "Jest", category: "TOOL" },
  "vitest": { name: "Vitest", category: "TOOL" },
  "playwright": { name: "Playwright", category: "TOOL" },
  "cypress": { name: "Cypress", category: "TOOL" },
  "storybook": { name: "Storybook", category: "TOOL" },
  "webpack": { name: "Webpack", category: "TOOL" },
  "vite": { name: "Vite", category: "TOOL" },
  "esbuild": { name: "esbuild", category: "TOOL" },
  "turborepo": { name: "Turborepo", category: "TOOL" },
  "monorepo": { name: "Monorepo", category: "CONCEPT" },
  "pnpm": { name: "pnpm", category: "TOOL" },
  "bun": { name: "Bun", category: "TOOL" },
  
  // Databases
  "postgresql": { name: "PostgreSQL", category: "DATABASE" },
  "postgres": { name: "PostgreSQL", category: "DATABASE" },
  "mysql": { name: "MySQL", category: "DATABASE" },
  "mongodb": { name: "MongoDB", category: "DATABASE" },
  "redis": { name: "Redis", category: "DATABASE" },
  "sqlite": { name: "SQLite", category: "DATABASE" },
  "dynamodb": { name: "DynamoDB", category: "DATABASE" },
  "elasticsearch": { name: "Elasticsearch", category: "DATABASE" },
  
  // Concepts
  "serverless": { name: "Serverless", category: "CONCEPT" },
  "microservices": { name: "Microservices", category: "CONCEPT" },
  "api": { name: "API Design", category: "CONCEPT" },
  "rest-api": { name: "REST API", category: "CONCEPT" },
  "websocket": { name: "WebSockets", category: "CONCEPT" },
  "oauth": { name: "OAuth", category: "CONCEPT" },
  "authentication": { name: "Authentication", category: "CONCEPT" },
  "machine-learning": { name: "Machine Learning", category: "CONCEPT" },
  "ai": { name: "AI", category: "CONCEPT" },
  "blockchain": { name: "Blockchain", category: "CONCEPT" },
  "web3": { name: "Web3", category: "CONCEPT" },
  "devops": { name: "DevOps", category: "CONCEPT" },
  "ci-cd": { name: "CI/CD", category: "CONCEPT" },
};

// Package.json dependency detection
const PACKAGE_DEPS: Record<string, { name: string; category: DetectedSkill["category"] }> = {
  "react": { name: "React", category: "FRAMEWORK" },
  "react-dom": { name: "React", category: "FRAMEWORK" },
  "next": { name: "Next.js", category: "FRAMEWORK" },
  "vue": { name: "Vue.js", category: "FRAMEWORK" },
  "@angular/core": { name: "Angular", category: "FRAMEWORK" },
  "svelte": { name: "Svelte", category: "FRAMEWORK" },
  "express": { name: "Express.js", category: "FRAMEWORK" },
  "@nestjs/core": { name: "NestJS", category: "FRAMEWORK" },
  "tailwindcss": { name: "Tailwind CSS", category: "TOOL" },
  "@prisma/client": { name: "Prisma", category: "TOOL" },
  "prisma": { name: "Prisma", category: "TOOL" },
  "drizzle-orm": { name: "Drizzle ORM", category: "TOOL" },
  "typeorm": { name: "TypeORM", category: "TOOL" },
  "sequelize": { name: "Sequelize", category: "TOOL" },
  "mongoose": { name: "Mongoose", category: "TOOL" },
  "graphql": { name: "GraphQL", category: "TOOL" },
  "@apollo/client": { name: "Apollo Client", category: "TOOL" },
  "apollo-server": { name: "Apollo Server", category: "TOOL" },
  "@trpc/server": { name: "tRPC", category: "TOOL" },
  "@tanstack/react-query": { name: "TanStack Query", category: "TOOL" },
  "redux": { name: "Redux", category: "TOOL" },
  "@reduxjs/toolkit": { name: "Redux Toolkit", category: "TOOL" },
  "zustand": { name: "Zustand", category: "TOOL" },
  "jotai": { name: "Jotai", category: "TOOL" },
  "zod": { name: "Zod", category: "TOOL" },
  "yup": { name: "Yup", category: "TOOL" },
  "next-auth": { name: "NextAuth.js", category: "TOOL" },
  "@auth/core": { name: "Auth.js", category: "TOOL" },
  "passport": { name: "Passport.js", category: "TOOL" },
  "stripe": { name: "Stripe", category: "TOOL" },
  "socket.io": { name: "Socket.IO", category: "TOOL" },
  "jest": { name: "Jest", category: "TOOL" },
  "vitest": { name: "Vitest", category: "TOOL" },
  "@playwright/test": { name: "Playwright", category: "TOOL" },
  "cypress": { name: "Cypress", category: "TOOL" },
  "motion": { name: "Framer Motion", category: "TOOL" },
  "three": { name: "Three.js", category: "TOOL" },
  "react-three-fiber": { name: "React Three Fiber", category: "TOOL" },
  "d3": { name: "D3.js", category: "TOOL" },
  "chart.js": { name: "Chart.js", category: "TOOL" },
  "recharts": { name: "Recharts", category: "TOOL" },
  "uploadthing": { name: "UploadThing", category: "TOOL" },
  "resend": { name: "Resend", category: "TOOL" },
  "nodemailer": { name: "Nodemailer", category: "TOOL" },
  "openai": { name: "OpenAI API", category: "TOOL" },
  "@google/generative-ai": { name: "Gemini API", category: "TOOL" },
  "langchain": { name: "LangChain", category: "TOOL" },
};

// ============================================
// OCTOKIT CLIENT
// ============================================

export function createGitHubClient(accessToken: string): Octokit {
  return new Octokit({ auth: accessToken });
}

// ============================================
// REPO FETCHING
// ============================================

export async function fetchUserRepos(
  accessToken: string,
  options: { perPage?: number; sort?: "updated" | "created" | "pushed" | "full_name" } = {}
): Promise<GitHubRepo[]> {
  const octokit = createGitHubClient(accessToken);
  const { perPage = 30, sort = "updated" } = options;
  
  const { data: repos } = await octokit.repos.listForAuthenticatedUser({
    per_page: perPage,
    sort,
    direction: "desc",
    visibility: "all",
  });
  
  return repos.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    url: repo.html_url,
    homepage: repo.homepage,
    language: repo.language,
    languages: {},
    topics: repo.topics || [],
    stars: repo.stargazers_count || 0,
    forks: repo.forks_count || 0,
    isPrivate: repo.private,
    createdAt: repo.created_at || "",
    updatedAt: repo.updated_at || "",
    pushedAt: repo.pushed_at || "",
    defaultBranch: repo.default_branch,
    hasReadme: true, // Will be verified later
  }));
}

export async function fetchRepoDetails(
  accessToken: string,
  owner: string,
  repo: string
): Promise<GitHubRepo> {
  const octokit = createGitHubClient(accessToken);
  
  // Fetch repo info
  const { data: repoData } = await octokit.repos.get({ owner, repo });
  
  // Fetch languages
  const { data: languages } = await octokit.repos.listLanguages({ owner, repo });
  
  // Try to fetch README
  let readme: string | undefined;
  let hasReadme = false;
  try {
    const { data: readmeData } = await octokit.repos.getReadme({ 
      owner, 
      repo,
      mediaType: { format: "raw" },
    });
    readme = typeof readmeData === "string" ? readmeData : undefined;
    hasReadme = true;
  } catch {
    // No README
  }
  
  return {
    id: repoData.id,
    name: repoData.name,
    fullName: repoData.full_name,
    description: repoData.description,
    url: repoData.html_url,
    homepage: repoData.homepage,
    language: repoData.language,
    languages,
    topics: repoData.topics || [],
    stars: repoData.stargazers_count,
    forks: repoData.forks_count,
    isPrivate: repoData.private,
    createdAt: repoData.created_at,
    updatedAt: repoData.updated_at,
    pushedAt: repoData.pushed_at || "",
    defaultBranch: repoData.default_branch,
    hasReadme,
    readme,
  };
}

// ============================================
// PACKAGE.JSON DETECTION
// ============================================

export async function fetchPackageJson(
  accessToken: string,
  owner: string,
  repo: string
): Promise<Record<string, unknown> | null> {
  const octokit = createGitHubClient(accessToken);
  
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: "package.json",
    });
    
    if ("content" in data && data.content) {
      const content = Buffer.from(data.content, "base64").toString("utf-8");
      return JSON.parse(content);
    }
  } catch {
    // No package.json
  }
  
  return null;
}

// ============================================
// SKILL DETECTION
// ============================================

export function detectSkillsFromRepo(repo: GitHubRepo, packageJson?: Record<string, unknown> | null): DetectedSkill[] {
  const skills: Map<string, DetectedSkill> = new Map();
  
  // 1. Detect from primary language
  if (repo.language && LANGUAGE_SKILLS[repo.language]) {
    const skill = LANGUAGE_SKILLS[repo.language];
    skills.set(skill.name, {
      ...skill,
      confidence: 90,
      source: "language",
    });
  }
  
  // 2. Detect from all languages
  for (const lang of Object.keys(repo.languages)) {
    if (LANGUAGE_SKILLS[lang]) {
      const skill = LANGUAGE_SKILLS[lang];
      const bytes = repo.languages[lang];
      const totalBytes = Object.values(repo.languages).reduce((a, b) => a + b, 0);
      const percentage = (bytes / totalBytes) * 100;
      
      if (!skills.has(skill.name)) {
        skills.set(skill.name, {
          ...skill,
          confidence: Math.min(90, Math.round(percentage * 1.5)),
          source: "language",
        });
      }
    }
  }
  
  // 3. Detect from topics
  for (const topic of repo.topics) {
    const normalizedTopic = topic.toLowerCase();
    if (TOPIC_SKILLS[normalizedTopic]) {
      const skill = TOPIC_SKILLS[normalizedTopic];
      if (!skills.has(skill.name)) {
        skills.set(skill.name, {
          ...skill,
          confidence: 85,
          source: "topic",
        });
      } else {
        // Boost confidence if already detected
        const existing = skills.get(skill.name)!;
        existing.confidence = Math.min(100, existing.confidence + 10);
      }
    }
  }
  
  // 4. Detect from package.json dependencies
  if (packageJson) {
    const allDeps = {
      ...(packageJson.dependencies as Record<string, string> || {}),
      ...(packageJson.devDependencies as Record<string, string> || {}),
    };
    
    for (const dep of Object.keys(allDeps)) {
      if (PACKAGE_DEPS[dep]) {
        const skill = PACKAGE_DEPS[dep];
        if (!skills.has(skill.name)) {
          skills.set(skill.name, {
            ...skill,
            confidence: 95,
            source: "package",
          });
        } else {
          // Boost confidence
          const existing = skills.get(skill.name)!;
          existing.confidence = Math.min(100, existing.confidence + 5);
        }
      }
    }
    
    // Detect TypeScript from tsconfig
    if (allDeps.typescript) {
      if (!skills.has("TypeScript")) {
        skills.set("TypeScript", {
          name: "TypeScript",
          category: "LANGUAGE",
          confidence: 95,
          source: "package",
        });
      }
    }
  }
  
  // Sort by confidence
  return Array.from(skills.values()).sort((a, b) => b.confidence - a.confidence);
}

// ============================================
// EVIDENCE SUGGESTIONS
// ============================================

export function suggestEvidenceFromRepo(
  repo: GitHubRepo,
  detectedSkills: DetectedSkill[]
): SuggestedEvidence[] {
  const suggestions: SuggestedEvidence[] = [];
  const skillNames = detectedSkills.map(s => s.name);
  
  // 1. Always suggest the repository link
  suggestions.push({
    title: `${repo.name} - GitHub Repository`,
    type: "LINK",
    url: repo.url,
    skills: skillNames.slice(0, 5), // Top 5 skills
    confidence: 95,
  });
  
  // 2. If deployed, suggest the live site
  if (repo.homepage) {
    suggestions.push({
      title: `${repo.name} - Live Demo`,
      type: "LINK",
      url: repo.homepage,
      skills: skillNames.slice(0, 5),
      confidence: 100,
    });
  }
  
  // 3. Suggest project description
  if (repo.description) {
    suggestions.push({
      title: `${repo.name} - Project Overview`,
      type: "DESCRIPTION",
      content: repo.description,
      skills: skillNames.slice(0, 3),
      confidence: 80,
    });
  }
  
  // 4. Suggest stats as metrics
  if (repo.stars > 0 || repo.forks > 0) {
    const metrics: string[] = [];
    if (repo.stars > 0) metrics.push(`${repo.stars} stars`);
    if (repo.forks > 0) metrics.push(`${repo.forks} forks`);
    
    suggestions.push({
      title: `${repo.name} - Community Traction`,
      type: "METRIC",
      content: metrics.join(", "),
      skills: skillNames.slice(0, 3),
      confidence: repo.stars > 10 ? 90 : 70,
    });
  }
  
  // 5. Suggest README summary
  if (repo.readme) {
    const firstParagraph = repo.readme
      .split("\n\n")
      .find(p => p.length > 50 && !p.startsWith("#") && !p.startsWith("!["));
    
    if (firstParagraph) {
      suggestions.push({
        title: `${repo.name} - Technical Description`,
        type: "DESCRIPTION",
        content: firstParagraph.slice(0, 500),
        skills: skillNames.slice(0, 3),
        confidence: 85,
      });
    }
  }
  
  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

// ============================================
// FULL ANALYSIS
// ============================================

export async function analyzeRepository(
  accessToken: string,
  owner: string,
  repoName: string
): Promise<GitHubAnalysis> {
  // Fetch detailed repo info
  const repo = await fetchRepoDetails(accessToken, owner, repoName);
  
  // Fetch package.json if exists
  const packageJson = await fetchPackageJson(accessToken, owner, repoName);
  
  // Detect skills
  const detectedSkills = detectSkillsFromRepo(repo, packageJson);
  
  // Generate evidence suggestions
  const suggestedEvidence = suggestEvidenceFromRepo(repo, detectedSkills);
  
  // Generate summary
  const skillCount = detectedSkills.length;
  const topSkills = detectedSkills.slice(0, 3).map(s => s.name).join(", ");
  const summary = `Detected ${skillCount} skills from this ${repo.language || "multi-language"} project. Top technologies: ${topSkills || "N/A"}.`;
  
  return {
    repo,
    detectedSkills,
    suggestedEvidence,
    summary,
  };
}
