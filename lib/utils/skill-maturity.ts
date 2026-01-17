/**
 * Skill Maturity Algorithm v2
 * 
 * Multi-factor scoring system that calculates skill strength using:
 * - Time Factor (30%): Duration between first and latest evidence
 * - Volume Factor (35%): Evidence count with diminishing returns
 * - Quality Factor (25%): Weighted evidence type scores
 * - Recency Factor (10%): How fresh is the newest evidence
 */

// ============================================
// TYPES
// ============================================

export type EvidenceType = 
  | "LINK" 
  | "METRIC" 
  | "CODE_SNIPPET" 
  | "SCREENSHOT" 
  | "DESCRIPTION";

export type MaturityLevel = 
  | "Beginner" 
  | "Developing" 
  | "Intermediate" 
  | "Advanced" 
  | "Expert";

export type RecencyStatus = 
  | "Active" 
  | "Recent" 
  | "Moderate" 
  | "Stale" 
  | "Dormant";

export interface EvidenceInput {
  id: string;
  type: string;
  createdAt: Date;
  projectId: string;
}

export interface MaturityResult {
  maturityScore: number;
  level: MaturityLevel;
  confidence: number;
  recencyStatus: RecencyStatus;
  breakdown: {
    time: number;
    volume: number;
    quality: number;
    recency: number;
  };
}

// ============================================
// CONSTANTS
// ============================================

const WEIGHTS = {
  TIME: 0.30,
  VOLUME: 0.35,
  QUALITY: 0.25,
  RECENCY: 0.10,
} as const;

const EVIDENCE_TYPE_WEIGHTS: Record<string, number> = {
  LINK: 1.5,
  METRIC: 1.4,
  CODE_SNIPPET: 1.2,
  SCREENSHOT: 1.0,
  DESCRIPTION: 0.8,
};

// ============================================
// FACTOR CALCULATIONS
// ============================================

/**
 * Time Factor: Measures months between first and latest evidence
 * 0–3 months = 20, 3–6 = 40, 6–12 = 60, 12–24 = 80, 24+ = 100
 */
export function calculateTimeFactor(
  firstDate: Date | null,
  latestDate: Date | null
): number {
  if (!firstDate || !latestDate) return 0;

  const monthsDiff = 
    (latestDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

  if (monthsDiff >= 24) return 100;
  if (monthsDiff >= 12) return 80;
  if (monthsDiff >= 6) return 60;
  if (monthsDiff >= 3) return 40;
  return 20;
}

/**
 * Volume Factor: Diminishing returns on evidence count
 * 1 = 20, 2 = 40, 3 = 60, 4 = 80, 5+ = 100
 */
export function calculateVolumeFactor(evidenceCount: number): number {
  if (evidenceCount >= 5) return 100;
  if (evidenceCount === 4) return 80;
  if (evidenceCount === 3) return 60;
  if (evidenceCount === 2) return 40;
  if (evidenceCount === 1) return 20;
  return 0;
}

/**
 * Quality Factor: Weighted evidence type scoring
 * Computes normalized 0–100 score based on weighted evidence
 */
export function calculateQualityFactor(evidenceTypes: string[]): number {
  if (evidenceTypes.length === 0) return 0;

  const totalWeight = evidenceTypes.reduce((sum, type) => {
    return sum + (EVIDENCE_TYPE_WEIGHTS[type] || 0.8);
  }, 0);

  // Normalize: max theoretical weight per item is 1.5 (LINK)
  // For 5 items of LINK type, max = 7.5
  // Scale so 5 high-quality items = 100
  const maxExpectedWeight = 5 * 1.5;
  const normalizedScore = Math.min(100, (totalWeight / maxExpectedWeight) * 100);

  return Math.round(normalizedScore);
}

/**
 * Recency Factor: Evaluates freshness of newest evidence
 * ≤3 months = 100, 3–6 = 80, 6–12 = 60, 12–18 = 40, 18+ = 20
 */
export function calculateRecencyFactor(latestDate: Date | null): number {
  if (!latestDate) return 0;

  const now = new Date();
  const monthsAgo = 
    (now.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

  if (monthsAgo <= 3) return 100;
  if (monthsAgo <= 6) return 80;
  if (monthsAgo <= 12) return 60;
  if (monthsAgo <= 18) return 40;
  return 20;
}

/**
 * Confidence Score: Weighted evidence density
 * Formula: min(100, weightedEvidenceCount × 20)
 */
export function calculateConfidence(evidenceTypes: string[]): number {
  const weightedCount = evidenceTypes.reduce((sum, type) => {
    return sum + (EVIDENCE_TYPE_WEIGHTS[type] || 0.8);
  }, 0);

  return Math.min(100, Math.round(weightedCount * 20));
}

// ============================================
// LEVEL & STATUS MAPPERS
// ============================================

export function scoreToLevel(score: number): MaturityLevel {
  if (score >= 80) return "Expert";
  if (score >= 60) return "Advanced";
  if (score >= 40) return "Intermediate";
  if (score >= 20) return "Developing";
  return "Beginner";
}

export function recencyToStatus(recencyScore: number): RecencyStatus {
  if (recencyScore >= 100) return "Active";
  if (recencyScore >= 80) return "Recent";
  if (recencyScore >= 60) return "Moderate";
  if (recencyScore >= 40) return "Stale";
  return "Dormant";
}

// ============================================
// MAIN CALCULATION
// ============================================

export function calculateSkillMaturity(
  evidence: EvidenceInput[]
): MaturityResult {
  // Handle edge case: no evidence
  if (evidence.length === 0) {
    return {
      maturityScore: 0,
      level: "Beginner",
      confidence: 0,
      recencyStatus: "Dormant",
      breakdown: { time: 0, volume: 0, quality: 0, recency: 0 },
    };
  }

  // Sort by date
  const sorted = [...evidence].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const firstDate = new Date(sorted[0].createdAt);
  const latestDate = new Date(sorted[sorted.length - 1].createdAt);
  const evidenceTypes = evidence.map((e) => e.type);

  // Calculate individual factors
  const timeFactor = calculateTimeFactor(firstDate, latestDate);
  const volumeFactor = calculateVolumeFactor(evidence.length);
  const qualityFactor = calculateQualityFactor(evidenceTypes);
  const recencyFactor = calculateRecencyFactor(latestDate);

  // Weighted final score
  const maturityScore = Math.round(
    timeFactor * WEIGHTS.TIME +
    volumeFactor * WEIGHTS.VOLUME +
    qualityFactor * WEIGHTS.QUALITY +
    recencyFactor * WEIGHTS.RECENCY
  );

  const confidence = calculateConfidence(evidenceTypes);

  return {
    maturityScore,
    level: scoreToLevel(maturityScore),
    confidence,
    recencyStatus: recencyToStatus(recencyFactor),
    breakdown: {
      time: timeFactor,
      volume: volumeFactor,
      quality: qualityFactor,
      recency: recencyFactor,
    },
  };
}

// ============================================
// UTILITY: Get unique project count for a skill
// ============================================

export function getUniqueProjectCount(evidence: EvidenceInput[]): number {
  const projectIds = new Set(evidence.map((e) => e.projectId));
  return projectIds.size;
}

// ============================================
// UTILITY: Check if only description evidence exists
// ============================================

export function hasOnlyDescriptionEvidence(evidence: EvidenceInput[]): boolean {
  if (evidence.length === 0) return false;
  return evidence.every((e) => e.type === "DESCRIPTION");
}

// ============================================
// UTILITY: Check if evidence is stale (>12 months)
// ============================================

export function isEvidenceStale(evidence: EvidenceInput[]): boolean {
  if (evidence.length === 0) return true;

  const sorted = [...evidence].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const latestDate = new Date(sorted[0].createdAt);
  const now = new Date();
  const monthsAgo = 
    (now.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

  return monthsAgo > 12;
}
