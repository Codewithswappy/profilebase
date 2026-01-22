// ============================================
// AI-POWERED SKILL & EVIDENCE ANALYZER
// ============================================
// Uses Google Gemini or Groq to analyze projects,
// code, and READMEs to suggest skills and evidence.
// Groq is used as fallback for regions where Gemini
// isn't available (like India).
// ============================================

import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

// Import types from centralized types
import type {
  AISkillSuggestion,
  AIEvidenceSuggestion,
  AIAnalysisResult,
  CodeAnalysisResult,
} from "./types";

// Re-export types for backward compatibility
export type {
  AISkillSuggestion,
  AIEvidenceSuggestion,
  AIAnalysisResult,
  CodeAnalysisResult,
} from "./types";

// Initialize AI providers (lazy - only when keys are available)
const getGemini = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const getGroq = () => {
  if (!process.env.GROQ_API_KEY) return null;
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

// Determine which provider to use
function getProvider(): "gemini" | "groq" | null {
  if (process.env.GROQ_API_KEY) return "groq"; // Prefer Groq (works globally)
  if (process.env.GEMINI_API_KEY) return "gemini";
  return null;
}

// ============================================
// PROMPTS
// ============================================

const SKILL_CATEGORIES = `
- LANGUAGE: Programming languages (JavaScript, Python, TypeScript, etc.)
- FRAMEWORK: Web/mobile frameworks (React, Next.js, Django, Flutter, etc.)
- TOOL: Development tools, libraries, services (Docker, Prisma, Tailwind, AWS, etc.)
- DATABASE: Databases and data stores (PostgreSQL, MongoDB, Redis, etc.)
- CONCEPT: Architecture & methodologies (REST API, Microservices, CI/CD, etc.)
- OTHER: Soft skills or other technical abilities
`;

const PROJECT_ANALYSIS_PROMPT = `You are an expert developer portfolio analyzer. Analyze the following project information and suggest skills that the developer has demonstrated, along with evidence items that would effectively prove these skills.

PROJECT INFORMATION:
{{PROJECT_INFO}}

TASK:
1. Identify all technical skills demonstrated in this project
2. Suggest specific evidence items that would prove these skills
3. Categorize skills appropriately
4. Provide confidence scores based on how clearly the skill is demonstrated

SKILL CATEGORIES:
${SKILL_CATEGORIES}

Respond in JSON format:
{
  "skills": [
    {
      "name": "Skill Name",
      "category": "FRAMEWORK",
      "confidence": 85,
      "reason": "Brief explanation of why this skill is detected"
    }
  ],
  "evidence": [
    {
      "title": "Evidence Title",
      "type": "LINK|CODE_SNIPPET|DESCRIPTION|METRIC",
      "content": "Optional content or description",
      "suggestedSkills": ["Skill1", "Skill2"],
      "reason": "Why this evidence is valuable"
    }
  ],
  "summary": "Brief summary of the project and developer capabilities",
  "projectType": "Type of project (e.g., 'Full-stack Web App', 'CLI Tool', 'Mobile App')",
  "complexity": "beginner|intermediate|advanced|expert"
}

Be specific and technical. Focus on skills that are clearly demonstrated, not assumed.`;

const CODE_ANALYSIS_PROMPT = `You are an expert code reviewer. Analyze the following code snippet and identify:
1. The programming language
2. Frameworks and libraries being used
3. Design patterns and best practices demonstrated
4. Skills the developer has shown
5. Quality observations (good practices, areas for improvement)

CODE SNIPPET:
\`\`\`
{{CODE}}
\`\`\`

SKILL CATEGORIES:
${SKILL_CATEGORIES}

Respond in JSON format:
{
  "language": "Programming language",
  "frameworks": ["Framework1", "Library2"],
  "patterns": ["Pattern1", "Pattern2"],
  "skills": [
    {
      "name": "Skill Name",
      "category": "LANGUAGE|FRAMEWORK|TOOL|DATABASE|CONCEPT|OTHER",
      "confidence": 85,
      "reason": "Brief explanation"
    }
  ],
  "qualityNotes": ["Positive observation 1", "Suggestion for improvement"]
}

Be specific and technical. Only identify skills that are clearly demonstrated in the code.`;

const README_ANALYSIS_PROMPT = `You are an expert at analyzing project documentation. Analyze this README file and extract:
1. What skills the developer demonstrates
2. What evidence could be generated from this information
3. Key features and technical highlights

README CONTENT:
{{README}}

SKILL CATEGORIES:
${SKILL_CATEGORIES}

Respond in JSON format:
{
  "skills": [
    {
      "name": "Skill Name",
      "category": "FRAMEWORK",
      "confidence": 80,
      "reason": "Mentioned in tech stack section"
    }
  ],
  "evidence": [
    {
      "title": "Evidence Title",
      "type": "DESCRIPTION|METRIC|LINK",
      "content": "Content extracted from README",
      "suggestedSkills": ["Skill1"],
      "reason": "This proves the skill because..."
    }
  ],
  "summary": "Brief project summary",
  "projectType": "Type of project",
  "complexity": "beginner|intermediate|advanced|expert"
}

Focus on extracting concrete, verifiable skills and evidence.`;

const QUICK_SUGGEST_PROMPT = `Based on this brief project description, suggest relevant skills the developer likely has:

DESCRIPTION: {{DESCRIPTION}}

Respond with a JSON array of skills:
[
  {
    "name": "React",
    "category": "FRAMEWORK",
    "confidence": 75,
    "reason": "Web app development mentioned"
  }
]

Be concise. Only suggest 3-8 most relevant skills.`;

// ============================================
// HELPER FUNCTIONS
// ============================================

function cleanJsonResponse(text: string): string {
  // Remove markdown code blocks if present
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

async function callAI(prompt: string): Promise<string> {
  const provider = getProvider();
  
  if (!provider) {
    throw new Error("No AI provider configured. Add GROQ_API_KEY or GEMINI_API_KEY to .env");
  }
  
  if (provider === "groq") {
    return callGroq(prompt);
  } else {
    return callAI(prompt);
  }
}

async function callGroq(prompt: string): Promise<string> {
  const groq = getGroq();
  if (!groq) {
    throw new Error("Groq not configured");
  }
  
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert developer portfolio analyzer. Always respond with valid JSON only, no additional text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile", // Fast and capable
      temperature: 0.5,
      max_tokens: 2000,
    });
    
    return completion.choices[0]?.message?.content || "";
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Groq API error:", message);
    throw new Error(`Groq API error: ${message}`);
  }
}

async function callGemini(prompt: string): Promise<string> {
  const genAI = getGemini();
  if (!genAI) {
    throw new Error("Gemini not configured");
  }
  
  // Try multiple model names in case one isn't available
  const modelNames = [
    "gemini-1.5-flash",
    "gemini-pro", 
    "gemini-1.0-pro",
  ];
  
  let lastError: Error | null = null;
  
  for (const modelName of modelNames) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Gemini model ${modelName} failed:`, message);
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }
  
  throw new Error(`Gemini API error: ${lastError?.message || "All models failed"}`);
}

// ============================================
// ANALYSIS FUNCTIONS
// ============================================

/**
 * Analyze a full project with all available information
 */
export async function analyzeProject(
  projectInfo: {
    title: string;
    description?: string;
    url?: string;
    readme?: string;
    technologies?: string[];
    features?: string[];
  }
): Promise<AIAnalysisResult> {
  // Build project info string
  const infoLines: string[] = [
    `Title: ${projectInfo.title}`,
  ];
  
  if (projectInfo.description) {
    infoLines.push(`Description: ${projectInfo.description}`);
  }
  if (projectInfo.url) {
    infoLines.push(`URL: ${projectInfo.url}`);
  }
  if (projectInfo.technologies?.length) {
    infoLines.push(`Technologies: ${projectInfo.technologies.join(", ")}`);
  }
  if (projectInfo.features?.length) {
    infoLines.push(`Key Features:\n${projectInfo.features.map(f => `- ${f}`).join("\n")}`);
  }
  if (projectInfo.readme) {
    // Truncate README if too long
    const truncatedReadme = projectInfo.readme.slice(0, 3000);
    infoLines.push(`README (excerpt):\n${truncatedReadme}`);
  }
  
  const prompt = PROJECT_ANALYSIS_PROMPT.replace("{{PROJECT_INFO}}", infoLines.join("\n\n"));
  
  const response = await callAI(prompt);
  const cleaned = cleanJsonResponse(response);
  
  try {
    return JSON.parse(cleaned) as AIAnalysisResult;
  } catch {
    console.error("Failed to parse AI response:", cleaned);
    // Return empty result on parse failure
    return {
      skills: [],
      evidence: [],
      summary: "Unable to analyze project",
      projectType: "Unknown",
      complexity: "intermediate",
    };
  }
}

/**
 * Analyze a code snippet for skills and patterns
 */
export async function analyzeCode(code: string): Promise<CodeAnalysisResult> {
  if (!code || code.trim().length < 20) {
    return {
      language: "Unknown",
      frameworks: [],
      patterns: [],
      skills: [],
      qualityNotes: ["Code snippet too short for analysis"],
    };
  }
  
  // Truncate if too long
  const truncatedCode = code.slice(0, 5000);
  const prompt = CODE_ANALYSIS_PROMPT.replace("{{CODE}}", truncatedCode);
  
  const response = await callAI(prompt);
  const cleaned = cleanJsonResponse(response);
  
  try {
    return JSON.parse(cleaned) as CodeAnalysisResult;
  } catch {
    console.error("Failed to parse code analysis:", cleaned);
    return {
      language: "Unknown",
      frameworks: [],
      patterns: [],
      skills: [],
      qualityNotes: ["Unable to analyze code"],
    };
  }
}

/**
 * Analyze a README file for skills and evidence
 */
export async function analyzeReadme(readme: string): Promise<AIAnalysisResult> {
  if (!readme || readme.trim().length < 50) {
    return {
      skills: [],
      evidence: [],
      summary: "README too short for analysis",
      projectType: "Unknown",
      complexity: "intermediate",
    };
  }
  
  // Truncate if too long
  const truncatedReadme = readme.slice(0, 8000);
  const prompt = README_ANALYSIS_PROMPT.replace("{{README}}", truncatedReadme);
  
  const response = await callAI(prompt);
  const cleaned = cleanJsonResponse(response);
  
  try {
    return JSON.parse(cleaned) as AIAnalysisResult;
  } catch {
    console.error("Failed to parse README analysis:", cleaned);
    return {
      skills: [],
      evidence: [],
      summary: "Unable to analyze README",
      projectType: "Unknown",
      complexity: "intermediate",
    };
  }
}

/**
 * Quick skill suggestions from a brief description
 */
export async function quickSuggestSkills(
  description: string
): Promise<AISkillSuggestion[]> {
  if (!description || description.trim().length < 10) {
    return [];
  }
  
  const prompt = QUICK_SUGGEST_PROMPT.replace("{{DESCRIPTION}}", description);
  
  const response = await callAI(prompt);
  const cleaned = cleanJsonResponse(response);
  
  try {
    return JSON.parse(cleaned) as AISkillSuggestion[];
  } catch {
    console.error("Failed to parse quick suggestions:", cleaned);
    return [];
  }
}

/**
 * Enhance existing skills with AI-suggested related skills
 */
export async function suggestRelatedSkills(
  existingSkills: string[],
  projectContext?: string
): Promise<AISkillSuggestion[]> {
  const prompt = `Given a developer who has these skills: ${existingSkills.join(", ")}
${projectContext ? `\nProject context: ${projectContext}` : ""}

Suggest 3-5 RELATED skills they likely also have or should learn next.
Only suggest skills that commonly go together with these skills.

Respond in JSON array format:
[
  {
    "name": "Related Skill",
    "category": "TOOL",
    "confidence": 70,
    "reason": "Commonly used alongside X skill"
  }
]`;
  
  const response = await callAI(prompt);
  const cleaned = cleanJsonResponse(response);
  
  try {
    return JSON.parse(cleaned) as AISkillSuggestion[];
  } catch {
    return [];
  }
}

/**
 * Generate evidence suggestions based on skills
 */
export async function generateEvidenceSuggestions(
  skills: string[],
  projectTitle: string,
  projectDescription?: string
): Promise<AIEvidenceSuggestion[]> {
  const prompt = `For a project called "${projectTitle}"${projectDescription ? ` (${projectDescription})` : ""} 
that demonstrates these skills: ${skills.join(", ")}

Suggest 3-5 specific evidence items that would effectively prove these skills to recruiters.
Think about what would be most impressive and verifiable.

Evidence types:
- LINK: URLs to deployed apps, repos, demos
- CODE_SNIPPET: Key code that demonstrates skill
- DESCRIPTION: Technical writeups
- METRIC: Quantifiable achievements

Respond in JSON array format:
[
  {
    "title": "Evidence Title",
    "type": "LINK",
    "content": "What this evidence should contain",
    "suggestedSkills": ["Skill1", "Skill2"],
    "reason": "Why this proves the skills"
  }
]`;
  
  const response = await callAI(prompt);
  const cleaned = cleanJsonResponse(response);
  
  try {
    return JSON.parse(cleaned) as AIEvidenceSuggestion[];
  } catch {
    return [];
  }
}

// ... existing code ...

const RESUME_EVALUATION_PROMPT = `You are a strict, senior-level Technical Recruiter and ATS algorithm. Your job is to critically evaluate a developer's profile/resume.

CANDIDATE PROFILE:
{{PROFILE_JSON}}

CRITICAL RULES:
1. **FAKE CONTENT DETECTION**: If you detect "Lorem Ipsum", placeholder text (e.g., "Company Name", "Position Title"), or obviously fake/nonsense data, YOU MUST ASSIGN A SCORE OF 0. Set status to "Invalid Content" and feedback to "Replace placeholder text with real content."
2. **STRICT SCORING**: Start at 0. Award points ONLY for:
   - Quantifiable Impact (e.g., "Improved performance by 20%").
   - Strong Action Verbs (e.g., "Architected", "Deployed").
   - Concrete Technical Skills (matched to projects/experience).
   - Professional Grammar/Tone.
3. **PENALTIES**: 
   - -20 points for spelling/grammar errors.
   - -30 points for vague descriptions (e.g., "Worked on a project").
   - -50 points for lack of any contact info or summary.

TASK:
1. Calculate a realistic, strict ATS Score (0-100). Do NOT be generous. An average resume should get ~40-50. Top 1% gets 90+.
2. Provide harsh but actionable feedback.
3. Identify missing critical keywords based on the technologies listed in projects.
4. Suggest a professional summary improvement only if the content is real; otherwise, ask them to write one.

Respond in JSON format:
{
  "score": 45,
  "status": "Needs Work",
  "summarySuggestion": "Experienced Full Stack Engineer with...",
  "missingKeywords": ["Docker", "CI/CD", "AWS"],
  "feedback": [
    "Measurable outcomes are missing. Add numbers (e.g., 30% reduction in load time).",
    "Summary is too genetic. Mention specific industries or core strengths."
  ]
}`;

// ... existing code ...

/**
 * Evaluate Resume/Profile for ATS Score
 */
export async function evaluateResume(
  profileData: any
): Promise<{
  score: number;
  status: string;
  feedback: string[];
  summarySuggestion?: string;
  missingKeywords?: string[];
}> {
  const prompt = RESUME_EVALUATION_PROMPT.replace(
    "{{PROFILE_JSON}}", 
    JSON.stringify(profileData, null, 2)
  );

  const response = await callAI(prompt);
  const cleaned = cleanJsonResponse(response);

  try {
    return JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse ATS evaluation:", cleaned);
    return {
      score: 0,
      status: "Error",
      feedback: ["Failed to analyze resume. Please try again."],
    };
  }
}

export function isAIEnabled(): boolean {
  return !!process.env.GROQ_API_KEY || !!process.env.GEMINI_API_KEY;
}

export function getAIProvider(): string {
  if (process.env.GROQ_API_KEY) return "Groq";
  if (process.env.GEMINI_API_KEY) return "Gemini";
  return "None";
}

