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
    .update(`${ip}-${ua}-${process.env.AUTH_SECRET || "skilldock-salt"}`)
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

// 2. Track Interaction (Project clicks)
export async function trackInteraction(slug: string, type: "project", itemId: string) {
  try {
    const profile = await db.profile.findUnique({ where: { slug } });
    if (!profile) return;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const record = await db.dailyAnalytics.findUnique({
      where: { profileId_date: { profileId: profile.id, date: today } },
    });

    if (!record) return;

    const stats = (record.projectInteractions as Record<string, number>) || {};
    stats[itemId] = (stats[itemId] || 0) + 1;
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
    // Similar upsert logic...
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
        
        // For accurate unique/returning calculation across period
        const allVisitorHashes = new Set<string>();
        const deviceAggregates: Record<string, number> = {};
        const referrerAggregates: Record<string, number> = {};
        const projectCounts: Record<string, number> = {};
        
        // Bounce rate: visitors who spent < 10 seconds
        let bounceCount = 0;

        const history = records.map(r => {
            totalViews += r.views;
            totalDuration += r.totalDuration;
            
            // Track all unique visitors across period
            r.uniqueVisitors.forEach(hash => allVisitorHashes.add(hash));
            
            // Aggregate device stats
            const deviceStats = (r.deviceStats as Record<string, number>) || {};
            Object.entries(deviceStats).forEach(([device, count]) => {
                deviceAggregates[device] = (deviceAggregates[device] || 0) + count;
            });
            
            // Aggregate referrer stats
            const referrerStats = (r.referrerStats as Record<string, number>) || {};
            Object.entries(referrerStats).forEach(([ref, count]) => {
                referrerAggregates[ref] = (referrerAggregates[ref] || 0) + count;
            });
            
            // Aggregate project interactions
            const pMetrics = (r.projectInteractions as Record<string, number>) || {};
            Object.entries(pMetrics).forEach(([k, v]) => {
                projectCounts[k] = (projectCounts[k] || 0) + v;
            });
            
            // Bounce calculation: avg time < 10s indicates likely bounces
            const avgTimeThisDay = r.views > 0 ? r.totalDuration / r.views : 0;
            if (avgTimeThisDay < 10) {
                bounceCount += r.views;
            }
            
            return {
                date: r.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                views: r.views,
                visitors: r.uniqueVisitors.length,
                avgTime: r.views > 0 ? Math.round(r.totalDuration / r.views) : 0
            };
        });

        const totalUniques = allVisitorHashes.size;
        
        // Calculate returning visitors (total views - unique visitors = repeat visits)
        const returningVisits = Math.max(0, totalViews - totalUniques);
        const returningRate = totalViews > 0 ? Math.round((returningVisits / totalViews) * 100) : 0;
        
        // Bounce rate
        const bounceRate = totalViews > 0 ? Math.round((bounceCount / totalViews) * 100) : 0;

        // Sort Top 5 projects
        const topProjects = Object.entries(projectCounts)
            .sort((a,b) => b[1] - a[1])
            .slice(0, 5)
            .map(([id, count]) => ({ id, count }));
            
        // Format device breakdown for charts
        const deviceBreakdown = Object.entries(deviceAggregates)
            .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
            .sort((a, b) => b.value - a.value);
            
        // Format referrer breakdown for charts (top 5)
        const referrerBreakdown = Object.entries(referrerAggregates)
            .map(([name, value]) => ({ name: name === "direct" ? "Direct" : name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        return {
            summary: {
                totalViews,
                totalUniques,
                avgDuration: totalViews > 0 ? Math.round(totalDuration / totalViews) : 0,
                returningRate,
                bounceRate,
            },
            history,

            topProjects,
            deviceBreakdown,
            referrerBreakdown,
        };

    } catch (error) {
        console.error("Get analytics error:", error);
        return null;
    }
}
