"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface GithubHeatmapProps {
  className?: string;
  username: string;
}

interface Contribution {
  date: string;
  count: number;
  level: number;
}

const WEEKS = 53;
const DAYS = 7;

export const GithubHeatmap = ({ className, username }: GithubHeatmapProps) => {
  const [contributionData, setContributionData] = useState<{
    grid: (Contribution | null)[][];
    total: number;
    months: { label: string; x: number }[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState<{
    date: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const [lastPush, setLastPush] = useState<{
    count: number;
    timeAgo: string;
    repo: string;
  } | null>(null);

  useEffect(() => {
    if (!username) return;

    // 1. Fetch Heatmap Data (Once on mount)
    const fetchHeatmap = async () => {
      try {
        setLoading(true);
        const contribResponse = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
        );
        if (!contribResponse.ok)
          throw new Error("Failed to fetch contributions");

        const data = await contribResponse.json();
        const contributions: Contribution[] = data.contributions || [];

        if (contributions.length === 0) {
          setLoading(false);
          return;
        }

        const grid: (Contribution | null)[][] = Array.from(
          { length: WEEKS },
          () => Array(DAYS).fill(null),
        );

        const lastContribution = contributions[contributions.length - 1];
        const lastDate = new Date(lastContribution.date);
        const lastDayOfWeek = lastDate.getDay();

        let currentWeek = WEEKS - 1;
        let currentDay = lastDayOfWeek;

        for (let i = contributions.length - 1; i >= 0; i--) {
          if (currentWeek < 0) break;
          grid[currentWeek][currentDay] = contributions[i];
          currentDay--;
          if (currentDay < 0) {
            currentDay = 6;
            currentWeek--;
          }
        }

        const months: { label: string; x: number }[] = [];
        let currentMonth = -1;

        grid.forEach((week, weekIndex) => {
          const dayObj = week.find((d) => d !== null);
          if (dayObj) {
            const date = new Date(dayObj.date);
            const month = date.getMonth();
            if (month !== currentMonth) {
              if (weekIndex < WEEKS - 2) {
                months.push({
                  label: date.toLocaleString("default", { month: "short" }),
                  x: weekIndex * 14,
                });
              }
              currentMonth = month;
            }
          }
        });

        const filteredMonths = months.filter((m, i, arr) => {
          if (i === 0) return true;
          return m.x - arr[i - 1].x > 30;
        });

        setContributionData({
          grid,
          total: contributions.reduce((acc, curr) => acc + curr.count, 0),
          months: filteredMonths,
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching github data:", err);
        setLoading(false);
      }
    };

    fetchHeatmap();
  }, []);

  // 2. Poll for Latest Push (Live Updates)
  useEffect(() => {
    const fetchLatestPush = async () => {
      try {
        if (!username) return;

        // Add cache busting to ensure we get the absolute latest data
        const eventsResponse = await fetch(
          `https://api.github.com/users/${username}/events/public?t=${Date.now()}`,
          {
            cache: "no-store",
            headers: process.env.NEXT_PUBLIC_GITHUB_TOKEN
              ? {
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
                }
              : undefined,
          },
        );

        // Handle rate limiting gracefully
        if (eventsResponse.status === 403) {
          // Silently fail on rate limit - don't spam console
          return;
        }

        if (eventsResponse.ok) {
          const events = await eventsResponse.json();
          const pushEvent = events.find((e: any) => e.type === "PushEvent");
          if (pushEvent) {
            setLastPush({
              count: pushEvent.payload.size,
              repo: pushEvent.repo.name.split("/")[1] || "repo",
              timeAgo: formatTimeAgo(new Date(pushEvent.created_at)),
            });
          }
        }
      } catch (e) {
        // Silently fail - likely rate limit or network issue
        // Don't spam the console
      }
    };

    fetchLatestPush(); // Initial call

    // Poll every 5 minutes to stay within GitHub's unauthenticated rate limit (60 req/hr)
    const intervalId = setInterval(fetchLatestPush, 300000);

    // Store interval ID in a way we can clear it if needed (though locally scoped here is fine for unmount)
    // If we hit a 403 inside fetchLatestPush, we ideally want to stop polling.
    // However, for simplicity and stability, just reducing frequency to 5m is usually enough.
    // If strictly needed to stop on 403, we'd need to move `interval` to a ref or state.

    return () => clearInterval(intervalId);
  }, []);

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;

    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "just now";
  };

  if (loading || !contributionData) {
    return (
      <div
        className={cn(
          "h-[140px] w-full animate-pulse bg-neutral-100/50 dark:bg-neutral-900/50 rounded-xl",
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-end w-full max-w-4xl mx-auto py-6",
        className,
      )}
    >
      {/* Header Stat - Clean & Floating */}
      <div className="absolute top-0 left-0 flex flex-col items-start px-2">
        <span className="text-[9px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono mb-1">
          // Activity
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono tracking-tighter text-neutral-600 dark:text-neutral-400">
            {contributionData.total}
          </span>
          <span className="text-[10px] text-neutral-400 dark:text-neutral-600 font-medium lowercase">
            commits
          </span>
        </div>
      </div>

      {/* Unique "Circle-Grid" Heatmap */}
      <div className="w-full relative overflow-x-auto pb-2 pt-10 no-scrollbar">
        <div className="min-w-[760px] md:min-w-full px-2">
          <svg
            className="w-full h-auto overflow-visible"
            viewBox={`0 0 ${WEEKS * 14} 125`}
          >
            <defs>
              <filter
                id="glow-light"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Render Grid */}
            {contributionData.grid.map((week, weekIndex) => (
              <g key={weekIndex} transform={`translate(${weekIndex * 14}, 0)`}>
                {week.map((day, dayIndex) => {
                  if (!day) return null;
                  const level = day.level;

                  return (
                    <g
                      key={dayIndex}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredCell({
                          date: day.date,
                          count: day.count,
                          x: rect.x + rect.width / 2,
                          y: rect.y,
                        });
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <motion.rect
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                          delay: weekIndex * 0.003 + dayIndex * 0.005,
                        }}
                        x={5 - (level === 0 ? 1.5 : 3)} // Center manually based on size
                        y={30 + dayIndex * 14 - (level === 0 ? 1.5 : 3)}
                        width={level === 0 ? 3 : 6}
                        height={level === 0 ? 3 : 6}
                        transform={`rotate(45, 5, ${30 + dayIndex * 14})`} // Rotate around the center point
                        className={cn(
                          "transition-all duration-300 ease-out cursor-pointer",
                          // Level 0 (Empty) - Minimal Dots
                          level === 0 &&
                            "fill-neutral-200 dark:fill-neutral-800",

                          // Levels 1-4 (Activity) - Monochrome Scale with Glow on Peak
                          level === 1 &&
                            "fill-neutral-400 dark:fill-neutral-600",
                          level === 2 &&
                            "fill-neutral-600 dark:fill-neutral-400",
                          level === 3 &&
                            "fill-neutral-800 dark:fill-neutral-200",
                          level === 4 &&
                            "fill-black dark:fill-white filter dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]",
                        )}
                      />
                    </g>
                  );
                })}
              </g>
            ))}

            {/* Month Labels overlaying or below */}
            <g className="fill-neutral-400 dark:fill-neutral-600 text-[9px] font-mono uppercase tracking-wider">
              {contributionData.months.map((month, i) => (
                <text key={i} x={month.x} y="15">
                  {month.label}
                </text>
              ))}
            </g>
          </svg>
        </div>
      </div>

      {/* Last Push Activity Footer - Compact */}
      {lastPush && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex justify-end px-1 mb-1"
        >
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-neutral-400 dark:text-neutral-500 px-2 py-0.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-900 dark:bg-neutral-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-neutral-950 dark:bg-neutral-50"></span>
            </span>
            <span>
              Pushed{" "}
              <span className="text-neutral-600 dark:text-neutral-300 font-medium">
                {lastPush.count} {lastPush.count === 1 ? "commit" : "commits"}
              </span>{" "}
              to{" "}
              <span className="text-neutral-600 dark:text-neutral-300 font-medium truncate max-w-[80px] inline-block align-bottom">
                {lastPush.repo}
              </span>
            </span>
            <span className="text-neutral-300 dark:text-neutral-600">•</span>
            <span>{lastPush.timeAgo}</span>
          </div>
        </motion.div>
      )}

      {/* Custom Floating Tooltip - Compact Liquid Style */}
      {createPortal(
        <AnimatePresence>
          {hoveredCell && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { type: "spring", stiffness: 260, damping: 20 },
              }}
              exit={{ opacity: 0, y: 5, scale: 0.8 }}
              style={{
                position: "fixed",
                left: hoveredCell.x,
                top: hoveredCell.y - 40,
                transform: "translateX(-50%)",
              }}
              className="pointer-events-none z-[9999] px-2.5 py-1.5 bg-neutral-900 dark:bg-neutral-100 rounded-lg shadow-xl flex flex-col items-center justify-center whitespace-nowrap min-w-20"
            >
              {/* Content */}
              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <div className="text-[10px] font-bold text-neutral-100 dark:text-neutral-900 font-mono">
                  {hoveredCell.count}{" "}
                  {hoveredCell.count === 1 ? "ctrb" : "ctrbs"}
                </div>
                <div className="text-[9px] text-neutral-400 dark:text-neutral-500 font-mono uppercase">
                  {new Date(hoveredCell.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>

              {/* Liquid Arrow */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-neutral-900 dark:bg-neutral-100" />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
};
