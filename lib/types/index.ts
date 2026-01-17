// Centralized type exports
// Import types from this file for clean, consistent imports

// Common types
export type { ActionResult } from "./common.types";

// Domain types
export type { FullProfile, PublicProfile } from "./profile.types";

export type {
  AnalyticsSummary,
  HistoryItem,
  DeviceBreakdownItem,
  ReferrerBreakdownItem,
  TopItem,
  AnalyticsData,
  TooltipPayloadItem,
  CustomTooltipProps,
  DeviceType,
  TrackVisitOptions,
  DailyAnalyticsUpdate,
} from "./analytics.types";

export type {
  AISkillSuggestion,
  AIEvidenceSuggestion,
  AIAnalysisResult,
  CodeAnalysisResult,
  AIStatusResult,
} from "./ai.types";

export type {
  GitHubRepo,
  DetectedSkill,
  SuggestedEvidence,
  GitHubAnalysis,
} from "./github.types";
