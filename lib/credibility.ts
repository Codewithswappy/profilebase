// ============================================
// SKILLPROOF CREDIBILITY SCORING SYSTEM
// ============================================
// Calculates dynamic credibility scores for skills
// based on evidence quality, recency, and diversity.
// ============================================

import { EvidenceType } from "@prisma/client";

// ============================================
// TYPES
// ============================================

export interface EvidenceForScoring {
  id: string;
  type: EvidenceType;
  url?: string | null;
  content?: string | null;
  createdAt: Date;
  skillIds: string[]; // Skills this evidence proves
}

export interface SkillCredibilityResult {
  skillId: string;
  skillName: string;
  credibilityScore: number; // 0-100
  evidenceCount: number;
  breakdown: CredibilityBreakdown;
  tier: CredibilityTier;
}

export interface CredibilityBreakdown {
  baseScore: number;
  typeBonus: number;
  recencyBonus: number;
  diversityBonus: number;
  verificationBonus: number;
  multiSkillBonus: number;
  totalRaw: number;
}

export type CredibilityTier = 
  | "unproven"      // 0
  | "claimed"       // 1-24
  | "emerging"      // 25-49
  | "credible"      // 50-74
  | "proven"        // 75-89
  | "expert";       // 90-100

// ============================================
// SCORING CONSTANTS
// ============================================

// Base scores by evidence type
export const EVIDENCE_TYPE_SCORES: Record<EvidenceType, number> = {
  LINK: 30,           // Deployed links are high value
  CODE_SNIPPET: 15,   // Code shows actual work
  SCREENSHOT: 10,     // Visual proof
  METRIC: 20,         // Quantifiable results
  DESCRIPTION: 5,     // Lowest - just text
};

// URL pattern detection for bonus points
const VERIFIED_LINK_PATTERNS = [
  { pattern: /github\.com/i, bonus: 25, label: "GitHub Repository" },
  { pattern: /vercel\.app/i, bonus: 15, label: "Vercel Deployment" },
  { pattern: /netlify\.app/i, bonus: 15, label: "Netlify Deployment" },
  { pattern: /herokuapp\.com/i, bonus: 12, label: "Heroku Deployment" },
  { pattern: /npmjs\.com/i, bonus: 20, label: "NPM Package" },
  { pattern: /pypi\.org/i, bonus: 20, label: "PyPI Package" },
  { pattern: /linkedin\.com/i, bonus: 10, label: "LinkedIn" },
  { pattern: /medium\.com/i, bonus: 8, label: "Medium Article" },
  { pattern: /dev\.to/i, bonus: 8, label: "Dev.to Article" },
  { pattern: /youtube\.com|youtu\.be/i, bonus: 12, label: "YouTube Demo" },
  { pattern: /figma\.com/i, bonus: 10, label: "Figma Design" },
  { pattern: /codepen\.io|codesandbox\.io/i, bonus: 12, label: "Live Demo" },
];

// Recency modifiers (based on evidence age)
const RECENCY_MODIFIERS = [
  { maxMonths: 3, multiplier: 1.15, label: "Very Recent" },    // +15%
  { maxMonths: 6, multiplier: 1.10, label: "Recent" },         // +10%
  { maxMonths: 12, multiplier: 1.00, label: "Current Year" },  // No change
  { maxMonths: 24, multiplier: 0.95, label: "Last 2 Years" },  // -5%
  { maxMonths: 36, multiplier: 0.90, label: "Older" },         // -10%
  { maxMonths: Infinity, multiplier: 0.85, label: "Legacy" },  // -15%
];

// Diversity bonus: reward different evidence types
const DIVERSITY_BONUS_PER_TYPE = 5; // +5 points per unique type
const MAX_DIVERSITY_BONUS = 20;     // Cap at 20 points

// Multi-skill evidence bonus
const MULTI_SKILL_BONUS = 3;        // +3 points if evidence proves multiple skills

// Maximum raw score before normalization
const MAX_EVIDENCE_CONTRIBUTION = 50; // Single evidence can contribute max 50 points
const DIMINISHING_FACTOR = 0.7;       // Each additional evidence worth 70% of previous

// ============================================
// SCORING FUNCTIONS
// ============================================

/**
 * Calculate the age of evidence in months
 */
function getEvidenceAgeMonths(createdAt: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - new Date(createdAt).getTime();
  return diffMs / (1000 * 60 * 60 * 24 * 30);
}

/**
 * Get recency multiplier for evidence
 */
function getRecencyMultiplier(createdAt: Date): { multiplier: number; label: string } {
  const ageMonths = getEvidenceAgeMonths(createdAt);
  
  for (const tier of RECENCY_MODIFIERS) {
    if (ageMonths <= tier.maxMonths) {
      return { multiplier: tier.multiplier, label: tier.label };
    }
  }
  
  return { multiplier: 0.85, label: "Legacy" };
}

/**
 * Check if URL matches verified patterns and get bonus
 */
function getVerificationBonus(url: string | null | undefined): number {
  if (!url) return 0;
  
  for (const { pattern, bonus } of VERIFIED_LINK_PATTERNS) {
    if (pattern.test(url)) {
      return bonus;
    }
  }
  
  // Any valid URL gets a small bonus
  try {
    new URL(url);
    return 5;
  } catch {
    return 0;
  }
}

/**
 * Calculate score for a single piece of evidence
 */
function calculateEvidenceScore(evidence: EvidenceForScoring): number {
  // Base score from type
  let score = EVIDENCE_TYPE_SCORES[evidence.type] || 5;
  
  // Verification bonus for URLs
  score += getVerificationBonus(evidence.url);
  
  // Recency multiplier
  const { multiplier } = getRecencyMultiplier(evidence.createdAt);
  score *= multiplier;
  
  // Multi-skill bonus
  if (evidence.skillIds.length > 1) {
    score += MULTI_SKILL_BONUS;
  }
  
  // Code snippet length bonus (longer = more substantial)
  if (evidence.type === "CODE_SNIPPET" && evidence.content) {
    const lines = evidence.content.split("\n").length;
    if (lines >= 20) score += 10;
    else if (lines >= 10) score += 5;
  }
  
  return Math.min(score, MAX_EVIDENCE_CONTRIBUTION);
}

/**
 * Calculate diversity bonus based on evidence type variety
 */
function calculateDiversityBonus(evidenceTypes: EvidenceType[]): number {
  const uniqueTypes = new Set(evidenceTypes);
  const bonus = (uniqueTypes.size - 1) * DIVERSITY_BONUS_PER_TYPE;
  return Math.min(bonus, MAX_DIVERSITY_BONUS);
}

/**
 * Apply diminishing returns for multiple evidence items
 */
function applyDiminishingReturns(scores: number[]): number {
  if (scores.length === 0) return 0;
  
  // Sort descending - best evidence first
  const sorted = [...scores].sort((a, b) => b - a);
  
  let total = 0;
  let factor = 1;
  
  for (const score of sorted) {
    total += score * factor;
    factor *= DIMINISHING_FACTOR;
  }
  
  return total;
}

/**
 * Normalize raw score to 0-100 scale
 */
function normalizeScore(rawScore: number): number {
  // Sigmoid-like curve that:
  // - Reaches 50% around 40 raw points
  // - Reaches 75% around 80 raw points
  // - Reaches 90% around 120 raw points
  // - Asymptotes to 100%
  
  const normalized = 100 * (1 - Math.exp(-rawScore / 60));
  return Math.round(Math.min(100, Math.max(0, normalized)));
}

/**
 * Get credibility tier from score
 */
export function getCredibilityTier(score: number): CredibilityTier {
  if (score === 0) return "unproven";
  if (score < 25) return "claimed";
  if (score < 50) return "emerging";
  if (score < 75) return "credible";
  if (score < 90) return "proven";
  return "expert";
}

/**
 * Get tier display info
 */
export function getTierInfo(tier: CredibilityTier): { 
  label: string; 
  color: string; 
  bgColor: string;
  description: string;
} {
  switch (tier) {
    case "unproven":
      return { 
        label: "Unproven", 
        color: "text-gray-500",
        bgColor: "bg-gray-100",
        description: "No evidence attached yet"
      };
    case "claimed":
      return { 
        label: "Claimed", 
        color: "text-gray-600",
        bgColor: "bg-gray-200",
        description: "Minimal evidence provided"
      };
    case "emerging":
      return { 
        label: "Emerging", 
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        description: "Some evidence, building credibility"
      };
    case "credible":
      return { 
        label: "Credible", 
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        description: "Good evidence, verified skill"
      };
    case "proven":
      return { 
        label: "Proven", 
        color: "text-green-600",
        bgColor: "bg-green-100",
        description: "Strong evidence with verification"
      };
    case "expert":
      return { 
        label: "Expert", 
        color: "text-purple-600",
        bgColor: "bg-purple-100",
        description: "Exceptional evidence, highly credible"
      };
  }
}

// ============================================
// MAIN CALCULATION FUNCTION
// ============================================

/**
 * Calculate credibility score for a skill based on its evidence
 */
export function calculateSkillCredibility(
  skillId: string,
  skillName: string,
  evidenceItems: EvidenceForScoring[]
): SkillCredibilityResult {
  // Filter evidence for this skill
  const relevantEvidence = evidenceItems.filter(e => 
    e.skillIds.includes(skillId)
  );
  
  if (relevantEvidence.length === 0) {
    return {
      skillId,
      skillName,
      credibilityScore: 0,
      evidenceCount: 0,
      breakdown: {
        baseScore: 0,
        typeBonus: 0,
        recencyBonus: 0,
        diversityBonus: 0,
        verificationBonus: 0,
        multiSkillBonus: 0,
        totalRaw: 0,
      },
      tier: "unproven",
    };
  }
  
  // Calculate individual evidence scores
  const scores = relevantEvidence.map(e => calculateEvidenceScore(e));
  
  // Apply diminishing returns
  const baseScore = applyDiminishingReturns(scores);
  
  // Calculate diversity bonus
  const evidenceTypes = relevantEvidence.map(e => e.type);
  const diversityBonus = calculateDiversityBonus(evidenceTypes);
  
  // Sum up verification bonuses
  const verificationBonus = relevantEvidence.reduce(
    (sum, e) => sum + getVerificationBonus(e.url),
    0
  ) / relevantEvidence.length; // Average verification bonus
  
  // Calculate type bonus average
  const typeBonus = relevantEvidence.reduce(
    (sum, e) => sum + EVIDENCE_TYPE_SCORES[e.type],
    0
  ) / relevantEvidence.length;
  
  // Calculate recency bonus average
  const recencyBonuses = relevantEvidence.map(e => {
    const { multiplier } = getRecencyMultiplier(e.createdAt);
    return (multiplier - 1) * 10; // Convert to bonus points
  });
  const recencyBonus = recencyBonuses.reduce((a, b) => a + b, 0) / recencyBonuses.length;
  
  // Multi-skill bonus count
  const multiSkillCount = relevantEvidence.filter(e => e.skillIds.length > 1).length;
  const multiSkillBonus = multiSkillCount * MULTI_SKILL_BONUS;
  
  // Total raw score
  const totalRaw = baseScore + diversityBonus;
  
  // Normalize to 0-100
  const credibilityScore = normalizeScore(totalRaw);
  
  return {
    skillId,
    skillName,
    credibilityScore,
    evidenceCount: relevantEvidence.length,
    breakdown: {
      baseScore: Math.round(baseScore),
      typeBonus: Math.round(typeBonus),
      recencyBonus: Math.round(recencyBonus),
      diversityBonus,
      verificationBonus: Math.round(verificationBonus),
      multiSkillBonus,
      totalRaw: Math.round(totalRaw),
    },
    tier: getCredibilityTier(credibilityScore),
  };
}

/**
 * Calculate credibility scores for all skills
 */
export function calculateAllSkillCredibility(
  skills: Array<{ id: string; name: string }>,
  evidenceItems: EvidenceForScoring[]
): SkillCredibilityResult[] {
  return skills.map(skill => 
    calculateSkillCredibility(skill.id, skill.name, evidenceItems)
  );
}

/**
 * Calculate overall profile credibility (average of all skills)
 */
export function calculateProfileCredibility(
  skillResults: SkillCredibilityResult[]
): {
  overallScore: number;
  tier: CredibilityTier;
  provenSkillsCount: number;
  totalSkillsCount: number;
} {
  if (skillResults.length === 0) {
    return {
      overallScore: 0,
      tier: "unproven",
      provenSkillsCount: 0,
      totalSkillsCount: 0,
    };
  }
  
  // Weight by evidence count - skills with more evidence matter more
  const weightedSum = skillResults.reduce((sum, r) => 
    sum + r.credibilityScore * Math.max(1, r.evidenceCount), 0
  );
  const totalWeight = skillResults.reduce((sum, r) => 
    sum + Math.max(1, r.evidenceCount), 0
  );
  
  const overallScore = Math.round(weightedSum / totalWeight);
  const provenSkillsCount = skillResults.filter(r => r.evidenceCount > 0).length;
  
  return {
    overallScore,
    tier: getCredibilityTier(overallScore),
    provenSkillsCount,
    totalSkillsCount: skillResults.length,
  };
}
