"use client";

import { useState } from "react";
import { Link } from "next-view-transitions";
import { FullProfile } from "@/lib/actions/profile";
import { AnalyticsData } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import {
  IconPlus,
  IconArrowUpRight,
  IconTrendingUp,
  IconTrendingDown,
  IconSparkles,
  IconFolderCode,
  IconEye,
  IconArrowUpRightCircle,
  IconPlusEqual,
  IconEyeBolt,
  IconEyeCode,
  IconShare2,
  IconShare,
  IconFolderBolt,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ProfileCompletionWidget } from "@/components/dashboard/profile-completion-widget";

interface DashboardOverviewProps {
  data: FullProfile;
  analytics?: AnalyticsData;
}

export function DashboardOverview({ data, analytics }: DashboardOverviewProps) {
  const { projects } = data;
  const { user } = data.profile;

  // Use analytics summary or defaults
  const totalViews = analytics?.summary.totalViews || 0;
  const viewTrend = analytics?.summary.viewTrend || 0;
  const chartData = analytics?.history || [];

  // Calculate Profile Score (Synced with Widget logic)
  const calculateProfileScore = () => {
    const steps = [
      !!data.profile.headline,
      !!data.profile.summary,
      projects.length > 0,
      data.experiences.length > 0,
      data.achievements.length > 0,
      data.certificates.length > 0,
      data.socialLinks.length >= 3,
    ];
    const completed = steps.filter(Boolean).length;
    return Math.round((completed / steps.length) * 100);
  };

  const profileScore = calculateProfileScore();

  // Aggregate skills/tech stack ONLY from Projects as per user request
  // Also normalize to deduplicate better (e.g. Next.js vs NextJS is hard to solve automatically without a map,
  // but we can at least do case-insensitive deduplication).
  const allSkills = Array.from(
    new Set(
      projects.flatMap((p) => p.techStack || []).map((skill) => skill.trim()), // simple cleanup
    ),
  )
    .filter(
      (skill, index, self) =>
        // specific deduplication for Next.js/NextJS
        index ===
        self.findIndex(
          (t) =>
            t.toLowerCase().replace(/[^a-z0-9]/g, "") ===
            skill.toLowerCase().replace(/[^a-z0-9]/g, ""),
        ),
    )
    .slice(0, 15);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dashed border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
            OVERVIEW
          </h1>
          <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest">
            {user.name?.split(" ")[0]}'s WORKSPACE
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/projects">
            <Button
              size="sm"
              className="bg-neutral-900 p-4 text-white dark:bg-neutral-50 dark:text-black hover:opacity-90 transition-opacity rounded-sm text-xs"
            >
              <IconPlus className="w-4 h-4" />
              NEW PROJECT
            </Button>
          </Link>
          <Link href={`/${data.profile.slug}`} target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="border-dashed p-4 border-neutral-300 dark:border-neutral-700 rounded-sm text-xs"
            >
              <IconEyeCode className="w-4 h-4" />
              VIEW PROFILE
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats & Chart (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-sm border border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20 group hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  Total Views
                </p>
                <IconEye className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="flex items-end gap-2">
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-mono tracking-tighter">
                  {totalViews.toLocaleString()}
                </h3>
                <div
                  className={cn(
                    "flex items-center text-[10px] font-medium mb-1",
                    viewTrend >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400",
                  )}
                >
                  {viewTrend >= 0 ? (
                    <IconTrendingUp className="w-3 h-3 mr-0.5" />
                  ) : (
                    <IconTrendingDown className="w-3 h-3 mr-0.5" />
                  )}
                  {viewTrend}%
                </div>
              </div>
            </div>

            <div className="p-4 rounded-sm border border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20 group hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  Projects
                </p>
                <IconFolderCode className="w-4 h-4 text-neutral-400" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-mono tracking-tighter">
                {projects.length}
              </h3>
            </div>

            <div className="p-4 rounded-sm border border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20 group hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  Profile Score
                </p>
                <IconSparkles className="w-4 h-4 text-neutral-400" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-mono tracking-tighter">
                {profileScore}%
              </h3>
            </div>
          </div>

          {/* Analytics Chart */}
          <div className="rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-0 overflow-hidden relative">
            <div className="p-5 border-b border-dashed border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 font-mono uppercase tracking-wider">
                  Engagement
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
                    Live Updates
                  </p>
                </div>
              </div>
              {/* Custom SVG Dash Line Decoration */}
              <svg width="100" height="6" className="opacity-30">
                <path
                  d="M0 3 h100"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="2 4"
                />
              </svg>
            </div>

            <div className="h-[280px] w-full pt-6 pr-6">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="neutralFade"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#737373" // Neutral-500
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="100%"
                          stopColor="#737373"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="2 4"
                      vertical={true}
                      horizontal={true}
                      stroke="#e5e5e5"
                      className="dark:stroke-neutral-800"
                      strokeOpacity={0.5}
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 9,
                        fill: "#a3a3a3",
                        fontFamily: "monospace",
                      }}
                      minTickGap={10}
                      padding={{ left: 0, right: 0 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 9,
                        fill: "#a3a3a3",
                        fontFamily: "monospace",
                      }}
                      tickCount={5}
                      dx={-10}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        borderRadius: "0px",
                        border: "1px dashed var(--border)",
                        fontSize: "11px",
                        boxShadow: "none",
                        fontFamily: "monospace",
                      }}
                      itemStyle={{ color: "var(--foreground)" }}
                      cursor={{
                        stroke: "#a3a3a3",
                        strokeWidth: 1,
                        strokeDasharray: "4 4",
                      }}
                    />
                    <Area
                      type="monotone" // or "step" for more techy look? using monotone for smoothness
                      dataKey="views"
                      stroke="#84cc16" // Lime-500 (matching analytics)
                      strokeWidth={2}
                      strokeDasharray="0" // Solid line
                      fill="url(#neutralFade)"
                      activeDot={{ r: 4, fill: "#84cc16", strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-neutral-400">
                  <p className="text-xs font-mono">NO DATA AVAILABLE</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions (New Section) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "New Project",
                href: "/dashboard/projects",
                icon: IconPlus,
              },
              {
                label: "Edit Profile",
                href: "/dashboard/profile",
                icon: IconEye,
              },
              {
                label: "Add Experience",
                href: "/dashboard/profile",
                icon: IconFolderBolt,
              },
              {
                label: "Share Profile",
                href: `/${data.profile.slug}`,
                icon: IconShare,
                external: true,
              },
            ].map((action, i) => (
              <Link
                key={i}
                href={action.href}
                target={action.external ? "_blank" : undefined}
              >
                <div className="p-2 rounded-sm border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/20 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors flex items-center gap-2 justify-center group">
                  <action.icon className="w-4 h-4 text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors" />
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors">
                    {action.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Activity / Projects */}
        <div className="space-y-6">
          {/* Profile Completion Widget (Replaces Pro Tip) */}
          <ProfileCompletionWidget data={data} />

          {/* Top Skills / Tech Stack (New) */}
          <div className="rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-dashed border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm font-mono uppercase tracking-wider">
                Tech Stack
              </h3>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2.5">
                {allSkills.length > 0 ? (
                  allSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-md bg-neutral-100/50 dark:bg-neutral-800/50 text-[10px] font-mono text-neutral-600 dark:text-neutral-400 border border-dashed border-neutral-300 dark:border-neutral-700 select-none hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-[10px] text-neutral-400 italic">
                    Add technologies to your projects to populate this stack.
                  </p>
                )}
              </div>
            </div>
            {/* Decorative dotted line at bottom */}
            <div className="h-px w-full bg-linear-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent border-t border-dashed border-neutral-300 dark:border-neutral-700 opacity-50 block" />
          </div>

          {/* Recent Projects */}
          <div className="rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-dashed border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-xs font-mono uppercase tracking-wider">
                Recent Projects
              </h3>
              <Link href="/dashboard/projects">
                <IconArrowUpRight className="w-3.5 h-3.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors" />
              </Link>
            </div>
            <div>
              {projects.length === 0 ? (
                <div className="p-8 text-center text-neutral-400 text-xs font-mono">
                  NO PROJECTS YET
                </div>
              ) : (
                <div className="divide-y divide-dashed divide-neutral-100 dark:divide-neutral-800">
                  {projects.slice(0, 4).map((project) => (
                    <Link
                      key={project.id}
                      href="/dashboard/projects"
                      className="flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-sm bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors">
                        <IconFolderCode className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                          {project.title}
                        </p>
                        <p className="text-[10px] text-neutral-400 truncate mt-0.5 font-mono">
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {/* Decorative dotted line at bottom */}
            <div className="h-px w-full bg-linear-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent border-t border-dashed border-neutral-300 dark:border-neutral-700 opacity-50 block" />
          </div>
        </div>
      </div>
    </div>
  );
}
