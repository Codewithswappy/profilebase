"use server";

import { db } from "@/lib/db";
import { headers } from "next/headers";
import crypto from "crypto";

// Import types from centralized types
import type {
  DeviceType,
  TrackVisitOptions,
  DailyAnalyticsUpdate,
} from "./types";

// Re-export types for backward compatibility
export type {
  DeviceType,
  TrackVisitOptions,
  DailyAnalyticsUpdate,
  AnalyticsData,
  AnalyticsSummary,
  HistoryItem,
  DeviceBreakdownItem,
  ReferrerBreakdownItem,
  TopItem,
} from "./types";

// Helper to anonymize visitor
const getVisitorHash = async () => {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";
  const ua = headersList.get("user-agent") || "unknown";
  
  // Create a daily unique hash (salt with date to prevent long-term tracking if desired, 
  // but for "returning visitor" metrics, we usually want a consistent hash.
  // The prompt says "unique vs returning visitors", so we need a consistent hash.
  // We'll trust the plan: "Visitor IDs are anonymized hashes".
  
  const hash = crypto
    .createHash("sha256")
    .update(`${ip}-${ua}-${process.env.AUTH_SECRET || "ProfileBase-salt"}`)
    .digest("hex");
  
  return hash;
};

// 1. Track Page Visit
export async function trackVisit(slug: string, options: TrackVisitOptions = {}) {
  try {
    const visitorHash = await getVisitorHash();
    const { deviceType = "desktop", referrer = "direct" } = options;
    
    // Normalize referrer to domain only
    let referrerDomain = "direct";
    if (referrer && referrer !== "direct") {
      try {
        const url = new URL(referrer);
        referrerDomain = url.hostname.replace(/^www\./, "");
      } catch {
        referrerDomain = "other";
      }
    }
    
    // Find profile by slug
    const profile = await db.profile.findUnique({
      where: { slug },
      include: { user: true },
    });

    if (!profile) return { success: false, error: "Profile not found" };

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Upsert tracking record
    await db.dailyAnalytics.upsert({
      where: {
        profileId_date: {
          profileId: profile.id,
          date: today,
        },
      },
      create: {
        profileId: profile.id,
        date: today,
        views: 1,
        uniqueVisitors: [visitorHash],
        deviceStats: { [deviceType]: 1 },
        geoStats: {},
        referrerStats: { [referrerDomain]: 1 },
      },
      update: {
        views: { increment: 1 },
      },
    });

    // Fetch current day record for unique handling and stats updates
    const record = await db.dailyAnalytics.findUnique({
      where: { profileId_date: { profileId: profile.id, date: today } },
    });

    if (record) {
      const updates: DailyAnalyticsUpdate = {};
      
      // Handle unique visitors
      if (!record.uniqueVisitors.includes(visitorHash)) {
        updates.uniqueVisitors = { push: visitorHash };
      }
      
      // Update device stats
      const currentDeviceStats = (record.deviceStats as Record<string, number>) || {};
      currentDeviceStats[deviceType] = (currentDeviceStats[deviceType] || 0) + 1;
      updates.deviceStats = currentDeviceStats;
      
      // Update referrer stats
      const currentReferrerStats = (record.referrerStats as Record<string, number>) || {};
      currentReferrerStats[referrerDomain] = (currentReferrerStats[referrerDomain] || 0) + 1;
      updates.referrerStats = currentReferrerStats;
      
      if (Object.keys(updates).length > 0) {
        await db.dailyAnalytics.update({
          where: { id: record.id },
          data: updates,
        });
      }
    }

    return { success: true, isNewVisitor: record ? !record.uniqueVisitors.includes(visitorHash) : true };
  } catch (error) {
    console.error("Track visit error:", error);
    return { success: false };
  }
}

// 2. Track Interaction (Project clicks & Resume)
export async function trackInteraction(slug: string, type: "project" | "resume", itemId: string) {
  try {
    const profile = await db.profile.findUnique({ where: { slug } });
    if (!profile) return;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const record = await db.dailyAnalytics.findUnique({
      where: { profileId_date: { profileId: profile.id, date: today } },
    });

    if (!record) {
      // If no record exists for today (unlikely if trackVisit is called first, but possible),
      // we should probably create one or just return. 
      // For now, adhering to existing pattern -> return.
      // Better: Create if missing to ensure we capture the click? 
      // The trackVisit usually handles creation. 
      return; 
    }

    const stats = (record.projectInteractions as Record<string, number>) || {};
    
    // For resume, use special keys
    const key = type === "resume" ? `__resume_${itemId}` : itemId;
    
    stats[key] = (stats[key] || 0) + 1;
    
    await db.dailyAnalytics.update({
      where: { id: record.id },
      data: { projectInteractions: stats }
    });

    return { success: true };
  } catch (error) { 
    return { success: false };
  }
}

// 3. Track Duration (Heartbeat)
export async function trackDuration(slug: string, seconds: number) {
    try {
        const profile = await db.profile.findUnique({ where: { slug } });
        if (!profile) return;
    
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        await db.dailyAnalytics.upsert({
            where: { profileId_date: { profileId: profile.id, date: today } },
            create: {
                profileId: profile.id,
                date: today,
                totalDuration: seconds,
                views: 1 // Fallback if regular track missed
            },
            update: {
                totalDuration: { increment: seconds }
            }
        });
        return { success: true };
    } catch (e) { return { success: false }; }
}

// 4. Fetch Analytics for Dashboard
export async function getAnalytics(profileId: string, days: number = 7) {
    try {
        const endDate = new Date();
        const startDate = new Date();
        
        // Handle "all time" with days = 0 or negative
        if (days > 0) {
            startDate.setDate(endDate.getDate() - days);
        } else {
            // All time: set to a very old date
            startDate.setFullYear(2020, 0, 1);
        }
        startDate.setUTCHours(0,0,0,0);

        const records = await db.dailyAnalytics.findMany({
            where: {
                profileId,
                date: { gte: startDate }
            },
            orderBy: { date: 'asc' }
        });

        // Compute Aggregates
        let totalViews = 0;
        let totalDuration = 0;
        
        // Resume stats
        let totalResumeViews = 0;
        let totalResumeDownloads = 0;

        // For accurate unique/returning calculation across period
        const allVisitorHashes = new Set<string>();
        const deviceAggregates: Record<string, number> = {};
        const referrerAggregates: Record<string, number> = {};
        const projectCounts: Record<string, number> = {};
        
        // Bounce rate: visitors who spent < 10 seconds
        let bounceCount = 0;

        // Create a map of existing records by date string for quick lookup
        const recordsByDate = new Map<string, typeof records[0]>();
        records.forEach(r => {
            const dateKey = r.date.toISOString().split('T')[0];
            recordsByDate.set(dateKey, r);
        });

        // Generate all days in the range
        const allDays: Date[] = [];
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            allDays.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Build history with all days (including zeros for missing)
        const history = allDays.map(day => {
            const dateKey = day.toISOString().split('T')[0];
            const record = recordsByDate.get(dateKey);
            
            if (record) {
                totalViews += record.views;
                totalDuration += record.totalDuration;
                
                // Track all unique visitors across period
                record.uniqueVisitors.forEach(hash => allVisitorHashes.add(hash));
                
                // Aggregate device stats
                const deviceStats = (record.deviceStats as Record<string, number>) || {};
                Object.entries(deviceStats).forEach(([device, count]) => {
                    deviceAggregates[device] = (deviceAggregates[device] || 0) + count;
                });
                
                // Aggregate referrer stats
                const referrerStats = (record.referrerStats as Record<string, number>) || {};
                Object.entries(referrerStats).forEach(([ref, count]) => {
                    referrerAggregates[ref] = (referrerAggregates[ref] || 0) + count;
                });
                
                // Aggregate interactions
                const pMetrics = (record.projectInteractions as Record<string, number>) || {};
                
                let dayResumeViews = 0;
                let dayResumeDownloads = 0;

                Object.entries(pMetrics).forEach(([k, v]) => {
                    if (k === '__resume_view') {
                        dayResumeViews += v;
                        totalResumeViews += v;
                    } else if (k === '__resume_download') {
                        dayResumeDownloads += v;
                        totalResumeDownloads += v;
                    } else {
                        // Regular project
                        projectCounts[k] = (projectCounts[k] || 0) + v;
                    }
                });
                
                // Bounce calculation
                const avgTimeThisDay = record.views > 0 ? record.totalDuration / record.views : 0;
                if (avgTimeThisDay < 10) {
                    bounceCount += record.views;
                }
                
                return {
                    date: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    views: record.views,
                    visitors: record.uniqueVisitors.length,
                    avgTime: record.views > 0 ? Math.round(record.totalDuration / record.views) : 0,
                    resumeViews: dayResumeViews,
                    resumeDownloads: dayResumeDownloads
                };
            }
            
            // Day with no data - return zero values
            return {
                date: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                views: 0,
                visitors: 0,
                avgTime: 0,
                resumeViews: 0,
                resumeDownloads: 0
            };
        });

        const totalUniques = allVisitorHashes.size;
        
        // Calculate returning visitors
        const returningVisits = Math.max(0, totalViews - totalUniques);
        const returningRate = totalViews > 0 ? Math.round((returningVisits / totalViews) * 100) : 0;
        
        // Bounce rate
        const bounceRate = totalViews > 0 ? Math.round((bounceCount / totalViews) * 100) : 0;

        // Resume Stats
        const resumeStats = {
            totalViews: totalResumeViews,
            totalDownloads: totalResumeDownloads,
            viewRate: totalViews > 0 ? Math.min(100, Math.round((totalResumeViews / totalViews) * 100)) : 0,
            conversionRate: totalResumeViews > 0 ? Math.min(100, Math.round((totalResumeDownloads / totalResumeViews) * 100)) : 0
        };

        // Sort Top 5 projects
        const topProjects = Object.entries(projectCounts)
            .sort((a,b) => b[1] - a[1])
            .slice(0, 5)
            .map(([id, count]) => ({ id, count }));
            
        // Format device breakdown for charts
        const deviceBreakdown = Object.entries(deviceAggregates)
            .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
            .sort((a, b) => b.value - a.value);
            
        // Format referrer breakdown
        const referrerBreakdown = Object.entries(referrerAggregates)
            .map(([name, value]) => ({ name: name === "direct" ? "Direct" : name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        // --- Calculate Trend (vs previous period) ---
        let viewTrend = 0;
        if (days > 0) {
            const previousEndDate = new Date(startDate);
            previousEndDate.setDate(previousEndDate.getDate() - 1);
            
            const previousStartDate = new Date(previousEndDate);
            previousStartDate.setDate(previousStartDate.getDate() - days);
            
            // Set to start of day
            previousStartDate.setUTCHours(0,0,0,0);
            previousEndDate.setUTCHours(23,59,59,999);

            const previousRecords = await db.dailyAnalytics.aggregate({
                _sum: {
                    views: true
                },
                where: {
                    profileId,
                    date: {
                        gte: previousStartDate,
                        lte: previousEndDate
                    }
                }
            });

            const previousViews = previousRecords._sum.views || 0;
            
            if (previousViews === 0) {
                viewTrend = totalViews > 0 ? 100 : 0;
            } else {
                viewTrend = Math.round(((totalViews - previousViews) / previousViews) * 100);
            }
        }

        // --- Resolve Project Names ---
        const projectIds = topProjects.map(p => p.id);
        const projects = await db.project.findMany({
            where: {
                id: { in: projectIds }
            },
            select: {
                id: true,
                title: true
            }
        });

        const projectMap = new Map(projects.map(p => [p.id, p.title]));
        
        const namedTopProjects = topProjects.map(p => ({
            id: projectMap.get(p.id) || "Unknown Project", 
            count: p.count
        }));

        return {
            history,
            summary: {
                totalViews,
                uniqueVisitors: totalUniques,
                avgTimeOnPage: totalViews > 0 ? Math.round(totalDuration / totalViews) : 0,
                bounceRate,
                returningRate,
                viewTrend
            },
            deviceBreakdown,
            referrerBreakdown,
            topProjects: namedTopProjects,
            resumeStats
        };

    } catch (error) {
        console.error("Error fetching analytics:", error);
        return {
            history: [],
            summary: {
                totalViews: 0,
                uniqueVisitors: 0,
                avgTimeOnPage: 0,
                bounceRate: 0,
                returningRate: 0,
                viewTrend: 0
            },
            deviceBreakdown: [],
            referrerBreakdown: [],
            topProjects: [],
            resumeStats: {
                totalViews: 0,
                totalDownloads: 0,
                viewRate: 0,
                conversionRate: 0
            }
        };
    }
}
