"use client";

import { useState, useEffect } from "react";
import { getAnalytics } from "@/lib/analytics";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  ComposedChart,
  Line,
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  ArrowUpRight,
  UserMinus,
  BarChart3,
  Eye,
  Zap,
  LucideIcon,
  Download,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import types from centralized types
import type {
  AnalyticsData,
  AnalyticsSummary,
  HistoryItem,
  DeviceBreakdownItem,
  ReferrerBreakdownItem,
  TopItem,
  TooltipPayloadItem,
  CustomTooltipProps,
} from "@/lib/types";

interface AnalyticsDashboardProps {
  profileId: string;
}

export function AnalyticsDashboard({ profileId }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(1); // Default to 24H
  const [onlineCount, setOnlineCount] = useState(0);

  // Fetch analytics data
  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getAnalytics(profileId, range);
      setData(res);
      setLoading(false);
    }
    load();
  }, [profileId, range]);

  // Poll for real-time visitors every 10 seconds
  useEffect(() => {
    const fetchOnline = async () => {
      try {
        const res = await fetch(`/api/analytics/online?profileId=${profileId}`);
        if (res.ok) {
          const data = await res.json();
          setOnlineCount(data.count || 0);
        }
      } catch (e) {
        // Silently fail
      }
    };

    fetchOnline();
    const interval = setInterval(fetchOnline, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [profileId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-80 text-neutral-500 font-mono">
        <span className="border border-dashed border-neutral-300 p-4 rounded bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900">
          Failed to load analytics.
        </span>
      </div>
    );
  }

  const { summary, history, topProjects, deviceBreakdown, referrerBreakdown } =
    data;

  // Derive Mock Resume Data
  const resumeHistory = history.map((h) => ({
    date: h.date,
    views: Math.floor(h.views * 0.45),
    downloads: Math.floor(h.views * 0.12),
  }));

  const totalResumeViews = resumeHistory.reduce(
    (acc, curr) => acc + curr.views,
    0,
  );
  const totalDownloads = resumeHistory.reduce(
    (acc, curr) => acc + curr.downloads,
    0,
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-mono uppercase tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" /> Analytics
          </h1>
          <p className="text-xs font-mono text-neutral-500 mt-1 uppercase tracking-widest border-l-2 border-lime-500 pl-2">
            System Performance Metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          {onlineCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-sm bg-lime-50/40 dark:bg-lime-900/10 border border-dashed border-lime-200 dark:border-lime-800">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-md bg-lime-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
              </span>
              <span className="text-xs font-bold font-mono text-lime-700 dark:text-lime-400 uppercase tracking-wider">
                {onlineCount} LIVE
              </span>
            </div>
          )}

          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
            {[
              { value: 1, label: "24H" },
              { value: 7, label: "7D" },
              { value: 30, label: "30D" },
              { value: 90, label: "90D" },
              { value: 0, label: "ALL" },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setRange(value)}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-bold font-mono uppercase rounded-md transition-all",
                  range === value
                    ? "bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-700"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-sm overflow-hidden shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-dashed divide-neutral-200 dark:divide-neutral-800">
          {[
            {
              label: "Total Views",
              val: summary.totalViews.toLocaleString(),
              icon: Users,
            },
            {
              label: "Unique",
              val: summary.uniqueVisitors.toLocaleString(),
              icon: Users,
            },
            {
              label: "Avg Time",
              val: `${summary.avgTimeOnPage}s`,
              icon: Clock,
            },
            {
              label: "Retention",
              val: `${summary.returningRate ?? 0}%`,
              icon: ArrowUpRight,
            },
            {
              label: "Bounce Rate",
              val: `${summary.bounceRate ?? 0}%`,
              icon: UserMinus,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors border border-dashed"
            >
              <div className="w-8 h-8 rounded border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center mb-4">
                <item.icon
                  className="w-4 h-4 text-neutral-500 dark:text-neutral-400"
                  strokeWidth={1.5}
                />
              </div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-mono">
                {item.val}
              </p>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1 font-mono">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* RESUME ANALYTICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest font-mono text-neutral-500 mb-6 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Resume Performance
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-3xl font-bold font-mono text-neutral-900 dark:text-white">
                    {totalResumeViews}
                  </span>
                  <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    VIEW RATE: 45%
                  </span>
                </div>
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">
                  Total Resume Views
                </div>
              </div>
              <div className="w-full h-px border-t border-dashed border-neutral-200 dark:border-neutral-800" />
              <div>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-3xl font-bold font-mono text-neutral-900 dark:text-white">
                    {totalDownloads}
                  </span>
                  <span className="text-xs font-mono text-lime-600 bg-lime-50 px-2 py-0.5 rounded border border-lime-100">
                    CONV: 12%
                  </span>
                </div>
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono flex items-center gap-2">
                  <Download className="w-3 h-3" /> Total Downloads
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-neutral-50 dark:bg-neutral-800/30 border border-dashed border-neutral-200 dark:border-neutral-800 rounded text-xs text-neutral-500 font-mono leading-relaxed">
            <span className="font-bold text-neutral-700 dark:text-neutral-300">
              INSIGHT:
            </span>{" "}
            Your resume is engaging well. Downloads typically correlate with
            serious interest from recruiters.
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-sm p-6 min-h-[300px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest font-mono text-neutral-500 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Views vs Downloads
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-lime-500" />
                <span className="text-[10px] font-mono uppercase font-bold text-neutral-500">
                  Views
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-[10px] font-mono uppercase font-bold text-neutral-500">
                  Downloads
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={resumeHistory}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="viewGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#84cc16" stopOpacity={1} />
                    <stop offset="100%" stopColor="#4d7c0f" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient
                    id="downloadGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#f97316" stopOpacity={1} />
                    <stop offset="100%" stopColor="#c2410c" stopOpacity={1} />
                  </linearGradient>
                  <filter id="bar3dShadow" height="200%">
                    <feDropShadow
                      dx="2"
                      dy="2"
                      stdDeviation="3"
                      floodColor="#000"
                      floodOpacity="0.3"
                    />
                  </filter>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="stroke-neutral-200 dark:stroke-neutral-800"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fontFamily: "monospace",
                    fill: "#9ca3af",
                  }}
                  dy={10}
                  minTickGap={30}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fontFamily: "monospace",
                    fill: "#9ca3af",
                  }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700 p-3 shadow-xl">
                        <div className="text-[10px] font-mono uppercase text-neutral-500 mb-2">
                          {label}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-mono font-bold text-lime-600">
                            <div className="w-2 h-2 rounded-full bg-lime-500" />
                            {payload[0].value} Views
                          </div>
                          <div className="flex items-center gap-2 text-xs font-mono font-bold text-orange-500">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                            {payload[1].value} Downloads
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                {/* Views as Gradient Bars */}
                <Bar
                  dataKey="views"
                  fill="url(#viewGradient)"
                  radius={[4, 4, 0, 0]}
                  barSize={12}
                  filter="url(#bar3dShadow)"
                />
                {/* Downloads as Gradient Bars */}
                <Bar
                  dataKey="downloads"
                  fill="url(#downloadGradient)"
                  radius={[4, 4, 0, 0]}
                  barSize={12}
                  filter="url(#bar3dShadow)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* OVERVIEW BENTO GRID (TRAFFIC + DEVICES + SOURCES) */}
      <div className="bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-sm overflow-hidden">
        <div className="grid lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-dashed divide-neutral-200 dark:divide-neutral-800">
          {/* Main Traffic Chart */}
          <div className="lg:col-span-3 p-6 flex flex-col">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest font-mono mb-1">
                  Traffic Overview
                </p>
                <div className="flex items-baseline gap-3">
                  <h3 className="text-4xl font-extrabold text-neutral-900 dark:text-white font-mono tracking-tight">
                    {summary.totalViews.toLocaleString()}
                  </h3>
                  <div
                    className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] font-mono border border-dashed",
                      summary.viewTrend >= 0
                        ? "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
                        : "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400",
                    )}
                  >
                    {summary.viewTrend >= 0 ? "+" : ""}
                    {summary.viewTrend}%
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={history}
                  margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="areaGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#84cc16" stopOpacity={0.4} />
                      <stop
                        offset="95%"
                        stopColor="#84cc16"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    className="stroke-neutral-200 dark:stroke-neutral-800"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 10,
                      fill: "#a3a3a3",
                      fontFamily: "monospace",
                    }}
                    dy={12}
                    minTickGap={60}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 10,
                      fill: "#a3a3a3",
                      fontFamily: "monospace",
                    }}
                    tickCount={5}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="bg-neutral-900 text-white p-3 border border-lime-500/30 shadow-2xl">
                          <p className="text-[10px] uppercase font-mono text-neutral-400 mb-1">
                            {label}
                          </p>
                          <div className="text-xl font-mono font-bold text-lime-400">
                            {payload[0].value}{" "}
                            <span className="text-xs text-white">VISITS</span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#84cc16"
                    strokeWidth={2}
                    fill="url(#areaGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Devices Chart (3D Shadow) */}
          <div className="p-5 flex flex-col">
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest font-mono mb-6">
              Devices
            </p>
            {deviceBreakdown && deviceBreakdown.length > 0 ? (
              <div className="flex-1 flex flex-col justify-center">
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        <filter id="pieShadow" height="200%">
                          <feDropShadow
                            dx="0"
                            dy="4"
                            stdDeviation="4"
                            floodColor="#000"
                            floodOpacity="0.25"
                          />
                        </filter>
                      </defs>
                      <Pie
                        data={deviceBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={4}
                        filter="url(#pieShadow)"
                      >
                        {/* Lime, Orange, White/Grey */}
                        {deviceBreakdown.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={["#84cc16", "#f97316", "#e5e5e5"][index % 3]}
                            className={
                              index % 3 === 2
                                ? "dark:fill-white transition-colors"
                                : "transition-colors"
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-mono font-bold">
                              {payload[0].name}: {payload[0].value}
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4 flex-wrap">
                  {deviceBreakdown.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          index % 3 === 2 && "dark:bg-white",
                        )}
                        style={{
                          backgroundColor: ["#84cc16", "#f97316", "#e5e5e5"][
                            index % 3
                          ],
                        }}
                      />
                      <span className="text-[10px] font-mono uppercase font-bold text-neutral-500">
                        {entry.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-xs font-mono text-neutral-400">
                NO DEVICE DATA
              </div>
            )}
          </div>

          {/* Traffic Sources (Lime 3D Gradient Bar Chart) */}
          <div className="p-5 col-span-1 lg:col-span-4 border-t border-dashed border-neutral-200 dark:border-neutral-800">
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest font-mono mb-6">
              Traffic Sources
            </p>
            <div className="h-[200px]">
              {referrerBreakdown && referrerBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={referrerBreakdown}
                    layout="vertical"
                    margin={{ left: 0, right: 20 }}
                  >
                    <defs>
                      <linearGradient
                        id="limeGradient"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop
                          offset="0%"
                          stopColor="#84cc16"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="100%"
                          stopColor="#a3e635"
                          stopOpacity={1}
                        />
                      </linearGradient>
                      <filter id="barShadow" height="200%">
                        <feDropShadow
                          dx="2"
                          dy="2"
                          stdDeviation="2"
                          floodColor="#65a30d"
                          floodOpacity="0.3"
                        />
                      </filter>
                    </defs>
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      tick={{
                        fontSize: 10,
                        fontFamily: "monospace",
                        fill: "#737373",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(132, 204, 22, 0.1)" }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-mono font-bold">
                            {label}: {payload[0].value} visits
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey="value"
                      barSize={12}
                      radius={[0, 4, 4, 0]}
                      fill="url(#limeGradient)"
                      filter="url(#barShadow)"
                    >
                      {referrerBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="url(#limeGradient)" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs font-mono text-neutral-400">
                  NO REFERRER DATA
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
