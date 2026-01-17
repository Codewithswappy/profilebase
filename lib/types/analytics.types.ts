// Analytics-related types

/**
 * Summary metrics for analytics dashboard
 */
export interface AnalyticsSummary {
  totalViews: number;
  totalUniques: number;
  avgDuration: number;
  returningRate: number;
  bounceRate: number;
}

/**
 * Single day's history item for charts
 */
export interface HistoryItem {
  date: string;
  views: number;
  visitors: number;
  avgTime: number;
}

/**
 * Device breakdown for pie charts
 */
export interface DeviceBreakdownItem {
  name: string;
  value: number;
  [key: string]: string | number;
}

/**
 * Referrer breakdown for bar charts
 */
export interface ReferrerBreakdownItem {
  name: string;
  value: number;
  [key: string]: string | number;
}

/**
 * Top items (skills/projects) for ranking lists
 */
export interface TopItem {
  id: string;
  count: number;
}

/**
 * Complete analytics data returned from getAnalytics
 */
export interface AnalyticsData {
  summary: AnalyticsSummary;
  history: HistoryItem[];
  topSkills: TopItem[];
  topProjects: TopItem[];
  deviceBreakdown: DeviceBreakdownItem[];
  referrerBreakdown: ReferrerBreakdownItem[];
}

/**
 * Tooltip payload item for recharts
 */
export interface TooltipPayloadItem {
  color: string;
  name: string;
  value: number;
}

/**
 * Custom tooltip props for recharts
 */
export interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

/**
 * Device type for tracking
 */
export type DeviceType = "desktop" | "mobile" | "tablet";

/**
 * Options for tracking a visit
 */
export type TrackVisitOptions = {
  deviceType?: DeviceType;
  referrer?: string;
};

/**
 * Prisma update operations for daily analytics
 */
export type DailyAnalyticsUpdate = {
  uniqueVisitors?: { push: string };
  deviceStats?: Record<string, number>;
  referrerStats?: Record<string, number>;
};
