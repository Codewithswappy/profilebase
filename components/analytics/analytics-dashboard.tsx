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

// Chart colors
const CHART_COLORS = {
  primary: "#6366f1",
  secondary: "#22c55e",
  tertiary: "#f59e0b",
  pink: "#ec4899",
  cyan: "#06b6d4",
};

const DEVICE_COLORS: Record<string, { color: string; icon: LucideIcon }> = {
  Desktop: { color: "#6366f1", icon: Monitor },
  Mobile: { color: "#22c55e", icon: Smartphone },
  Tablet: { color: "#f59e0b", icon: Tablet },
};

const REFERRER_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#06b6d4"];

// Minimal tooltip
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg p-3">
      <p className="text-xs font-medium text-neutral-500 mb-1.5">{label}</p>
      {payload.map((entry: TooltipPayloadItem, i: number) => (
        <div key={i} className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-neutral-600 dark:text-neutral-400">
            {entry.name}:
          </span>
          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

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

    fetchOnline(); // Initial fetch
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
      <div className="flex items-center justify-center h-80 text-neutral-500">
        Failed to load analytics.
      </div>
    );
  }

  const { summary, history, topProjects, deviceBreakdown, referrerBreakdown } =
    data;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Analytics
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Track your profile performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Real-time Online Counter */}
          {onlineCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-sm bg-emerald-50/40 dark:bg-emerald-200/10 border border-emerald-100 dark:border-emerald-400">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-md bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {onlineCount} online
              </span>
            </div>
          )}

          {/* Time Range Selector */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            {[
              { value: 1, label: "24H" },
              { value: 7, label: "7D" },
              { value: 30, label: "30D" },
              { value: 90, label: "90D" },
              { value: 0, label: "All" },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setRange(value)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  range === value
                    ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* METRIC CARDS - Single container with dividers */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-neutral-200 dark:divide-neutral-800 ">
          {/* Total Views */}
          <div className="p-5">
            <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
              <Users
                className="w-4 h-4 text-neutral-500 dark:text-neutral-400"
                strokeWidth={1.5}
              />
            </div>
            <p className="text-2xl font-medium text-neutral-900 dark:text-neutral-100">
              {summary.totalViews.toLocaleString()}
            </p>
            <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mt-1">
              Total Views
            </p>
          </div>

          {/* Unique Visitors */}
          <div className="p-5">
            <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
              <Users
                className="w-4 h-4 text-neutral-500 dark:text-neutral-400"
                strokeWidth={1.5}
              />
            </div>
            <p className="text-2xl font-medium text-neutral-900 dark:text-neutral-100">
              {summary.uniqueVisitors.toLocaleString()}
            </p>
            <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mt-1">
              Unique Visitors
            </p>
          </div>

          {/* Avg Duration */}
          <div className="p-5">
            <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
              <Clock
                className="w-4 h-4 text-neutral-500 dark:text-neutral-400"
                strokeWidth={1.5}
              />
            </div>
            <p className="text-2xl font-medium text-neutral-900 dark:text-neutral-100">
              {summary.avgTimeOnPage}
              <span className="text-base font-normal text-neutral-400 ml-0.5">
                s
              </span>
            </p>
            <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mt-1">
              Avg. Duration
            </p>
          </div>

          {/* Returning */}
          <div className="p-5">
            <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
              <ArrowUpRight
                className="w-4 h-4 text-neutral-500 dark:text-neutral-400"
                strokeWidth={1.5}
              />
            </div>
            <p className="text-2xl font-medium text-neutral-900 dark:text-neutral-100">
              {summary.returningRate ?? 0}
              <span className="text-base font-normal text-neutral-400 ml-0.5">
                %
              </span>
            </p>
            <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mt-1">
              Returning
            </p>
          </div>

          {/* Bounce Rate */}
          <div className="p-5">
            <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
              <Users
                className="w-4 h-4 text-neutral-500 dark:text-neutral-400"
                strokeWidth={1.5}
              />
            </div>
            <p className="text-2xl font-medium text-neutral-900 dark:text-neutral-100">
              {summary.bounceRate ?? 0}
              <span className="text-base font-normal text-neutral-400 ml-0.5">
                %
              </span>
            </p>
            <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mt-1">
              Bounce Rate
            </p>
          </div>
        </div>
      </div>

      {/* BENTO GRID - Charts in unified container */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden">
        {/* Row 1: Traffic Chart (2 cols) + Devices (1 col) */}
        <div className="grid lg:grid-cols-4 divide-x divide-neutral-200 dark:divide-neutral-800">
          {/* Traffic Chart */}
          <div className="lg:col-span-3 p-6 flex flex-col">
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest font-mono">
                    Traffic Overview
                  </p>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <h3 className="text-4xl font-extrabold text-neutral-900 dark:text-white font-feature-settings-tnum tracking-tight">
                    {summary.totalViews.toLocaleString()}
                  </h3>
                  <div
                    className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-xs",
                      summary.viewTrend >= 0
                        ? "text-emerald-600  border border-emerald-100 dark:border-emerald-500/20"
                        : "text-rose-600 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20",
                    )}
                  >
                    {summary.viewTrend >= 0 ? (
                      <TrendingUp className="w-3 h-3" strokeWidth={2.5} />
                    ) : (
                      <TrendingDown className="w-3 h-3" strokeWidth={2.5} />
                    )}
                    <span>
                      {summary.viewTrend >= 0 ? "+" : ""}
                      {summary.viewTrend}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-neutral-400 mt-1 font-medium">
                  Total views over the last{" "}
                  {range === 0 ? "all time" : `${range} days`}
                </p>
              </div>

              {/* Legend / Filter */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-lime-500 shadow-[0_0_8px_rgba(132,204,22,0.5)]"></span>
                  <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                    Visits
                  </span>
                </div>
              </div>
            </div>

            <div
              className="flex-1 min-h-[280px] w-full outline-none focus:outline-none"
              style={{ outline: "none" }}
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
                style={{ outline: "none" }}
              >
                {/* Switch to Area/Line chart for large date ranges (>30 days) */}
                {history.length > 30 ? (
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
                        <stop
                          offset="0%"
                          stopColor="#84cc16"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#84cc16"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                      <filter
                        id="lineGlow"
                        height="300%"
                        width="300%"
                        x="-100%"
                        y="-100%"
                      >
                        <feGaussianBlur
                          in="SourceGraphic"
                          stdDeviation="3"
                          result="blur"
                        />
                        <feColorMatrix
                          in="blur"
                          type="matrix"
                          values="0 0 0 0 0.518  0 0 0 0 0.8  0 0 0 0 0.086  0 0 0 1 0"
                        />
                        <feMerge>
                          <feMergeNode />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="#e5e7eb"
                      vertical={false}
                      className="stroke-neutral-100 dark:stroke-neutral-800/50"
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#a3a3a3", fontWeight: 500 }}
                      dy={12}
                      minTickGap={60}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#a3a3a3", fontWeight: 500 }}
                      tickCount={5}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="relative group z-50">
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-900 rotate-45 transform"></div>
                            <div className="bg-neutral-900 text-white text-xs rounded-xl py-2.5 px-4 shadow-[0_10px_30px_-10px_rgba(132,204,22,0.4)] min-w-[120px] flex flex-col items-center border border-lime-500/20">
                              <p className="font-medium text-neutral-400 mb-1">
                                {label}
                              </p>
                              <div className="flex items-baseline gap-1">
                                <span className="font-bold text-xl tracking-tight text-lime-400">
                                  {payload[0].value?.toLocaleString()}
                                </span>
                                <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-500">
                                  Visits
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="#84cc16"
                      strokeWidth={2.5}
                      fill="url(#areaGradient)"
                      filter="url(#lineGlow)"
                      animationDuration={1500}
                    />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="#84cc16"
                      strokeWidth={2}
                      dot={{
                        fill: "#84cc16",
                        stroke: "#fff",
                        strokeWidth: 2,
                        r: 4,
                        filter: "url(#lineGlow)",
                      }}
                      activeDot={{
                        fill: "#84cc16",
                        stroke: "#fff",
                        strokeWidth: 3,
                        r: 7,
                        filter: "url(#lineGlow)",
                      }}
                    />
                  </AreaChart>
                ) : (
                  <ComposedChart
                    data={history}
                    margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                    barSize={
                      history.length <= 7 ? 36 : history.length <= 14 ? 24 : 16
                    }
                  >
                    <defs>
                      <linearGradient
                        id="gelGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#d9f99d" stopOpacity={1} />
                        <stop
                          offset="20%"
                          stopColor="#84cc16"
                          stopOpacity={1}
                        />
                        <stop
                          offset="100%"
                          stopColor="#15803d"
                          stopOpacity={1}
                        />
                      </linearGradient>
                      <filter id="gelShadow" height="200%">
                        <feDropShadow
                          dx="0"
                          dy="8"
                          stdDeviation="8"
                          floodColor="#84cc16"
                          floodOpacity="0.3"
                        />
                      </filter>
                      <filter
                        id="lineGlowBar"
                        height="300%"
                        width="300%"
                        x="-100%"
                        y="-100%"
                      >
                        <feGaussianBlur
                          in="SourceGraphic"
                          stdDeviation="2"
                          result="blur"
                        />
                        <feColorMatrix
                          in="blur"
                          type="matrix"
                          values="0 0 0 0 0.518  0 0 0 0 0.8  0 0 0 0 0.086  0 0 0 0.8 0"
                        />
                        <feMerge>
                          <feMergeNode />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="#e5e7eb"
                      vertical={false}
                      className="stroke-neutral-100 dark:stroke-neutral-800/50"
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#a3a3a3", fontWeight: 600 }}
                      dy={12}
                      minTickGap={30}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      dataKey="views"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#a3a3a3", fontWeight: 500 }}
                      tickCount={5}
                    />
                    <Tooltip
                      cursor={{
                        fill: "rgba(132, 204, 22, 0.1)",
                        radius: 12,
                      }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="relative group z-50">
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-900 rotate-45 transform"></div>
                            <div className="bg-neutral-900 text-white text-xs rounded-xl py-2.5 px-4 shadow-[0_10px_30px_-10px_rgba(132,204,22,0.4)] min-w-[120px] flex flex-col items-center border border-lime-500/20">
                              <p className="font-medium text-neutral-400 mb-1">
                                {label}
                              </p>
                              <div className="flex items-baseline gap-1">
                                <span className="font-bold text-xl tracking-tight text-lime-400">
                                  {payload[0].value?.toLocaleString()}
                                </span>
                                <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-500">
                                  Visits
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey="views"
                      name="Views"
                      fill="url(#gelGradient)"
                      radius={[8, 8, 8, 8]}
                      filter="url(#gelShadow)"
                      animationDuration={1500}
                      animationBegin={0}
                      background={{
                        fill: "#f3f4f6",
                        radius: 8,
                        className: "fill-neutral-100 dark:fill-neutral-800/80",
                      }}
                    >
                      {history.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill="url(#gelGradient)"
                          className="transition-all duration-300 hover:brightness-110 focus:outline-none outline-none"
                          style={{ outline: "none" }}
                        />
                      ))}
                    </Bar>
                    {/* Flowing line overlay */}
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="#84cc16"
                      strokeWidth={2.5}
                      dot={{
                        fill: "#84cc16",
                        stroke: "#fff",
                        strokeWidth: 2,
                        r: 5,
                      }}
                      activeDot={{
                        fill: "#84cc16",
                        stroke: "#fff",
                        strokeWidth: 3,
                        r: 8,
                        filter: "url(#lineGlowBar)",
                      }}
                      filter="url(#lineGlowBar)"
                      animationDuration={2000}
                    />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Devices */}
          <div className="p-5">
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest font-mono mb-4">
              Devices
            </p>
            {deviceBreakdown && deviceBreakdown.length > 0 ? (
              <div>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        {/* Desktop: Deep Emerald */}
                        <linearGradient
                          id="desktopGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#10b981"
                            stopOpacity={1}
                          />
                          <stop
                            offset="100%"
                            stopColor="#047857"
                            stopOpacity={1}
                          />
                        </linearGradient>
                        {/* Mobile: Vibrant Lime */}
                        <linearGradient
                          id="mobileGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#d9f99d"
                            stopOpacity={1}
                          />
                          <stop
                            offset="100%"
                            stopColor="#84cc16"
                            stopOpacity={1}
                          />
                        </linearGradient>
                        {/* Tablet: Cool Teal */}
                        <linearGradient
                          id="tabletGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#2dd4bf"
                            stopOpacity={1}
                          />
                          <stop
                            offset="100%"
                            stopColor="#0d9488"
                            stopOpacity={1}
                          />
                        </linearGradient>
                        <filter id="pieShadow" height="130%">
                          <feDropShadow
                            dx="0"
                            dy="3"
                            stdDeviation="3"
                            floodColor="#064e3b"
                            floodOpacity="0.2"
                          />
                        </filter>
                      </defs>
                      <Pie
                        data={deviceBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                        nameKey="name"
                        stroke="none"
                        filter="url(#pieShadow)"
                        cornerRadius={4}
                        animationDuration={1500}
                      >
                        {deviceBreakdown.map(
                          (entry: DeviceBreakdownItem, index: number) => {
                            const name = entry.name.toLowerCase();
                            const gradientId =
                              name === "desktop"
                                ? "url(#desktopGrad)"
                                : name === "mobile"
                                  ? "url(#mobileGrad)"
                                  : "url(#tabletGrad)";
                            return (
                              <Cell
                                key={`cell-${index}`}
                                fill={gradientId}
                                className="transition-all duration-300 hover:opacity-90 stroke-white dark:stroke-neutral-900 stroke-2"
                              />
                            );
                          },
                        )}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm text-neutral-900 dark:text-white text-xs rounded-xl py-2 px-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-neutral-200 dark:border-neutral-800">
                              <p className="font-bold text-sm tracking-tight">
                                {payload[0].name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <p className="text-neutral-500 font-medium">
                                  {payload[0].value} visits
                                </p>
                              </div>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  {deviceBreakdown.map(
                    (entry: DeviceBreakdownItem, index: number) => {
                      const colors: Record<string, string> = {
                        Desktop: "#10b981", // Emerald
                        Mobile: "#84cc16", // Lime
                        Tablet: "#2dd4bf", // Teal
                      };
                      const color = colors[entry.name] || "#94a3b8";
                      return (
                        <div
                          key={index}
                          className="flex flex-col items-center gap-1"
                        >
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                            {entry.name}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200">
                              {entry.value}
                            </span>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-sm text-neutral-400">
                No device data
              </div>
            )}
          </div>

          {/* Traffic Sources */}
          <div className="p-5 lg:col-span-2">
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest font-mono mb-4">
              Traffic Sources
            </p>
            {referrerBreakdown && referrerBreakdown.length > 0 ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={referrerBreakdown}
                    layout="vertical"
                    margin={{ left: 0, right: 10 }}
                    barSize={10}
                  >
                    <defs>
                      {/* Matching the main chart's Lime-to-Emerald gradient */}
                      <linearGradient
                        id="sourceGrad"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#d9f99d" stopOpacity={1} />
                        <stop
                          offset="50%"
                          stopColor="#84cc16"
                          stopOpacity={1}
                        />
                        <stop
                          offset="100%"
                          stopColor="#15803d"
                          stopOpacity={1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      className="stroke-neutral-100 dark:stroke-neutral-800/50"
                    />
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#a3a3a3", fontWeight: 500 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#a3a3a3", fontWeight: 600 }}
                      width={80}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm text-neutral-900 dark:text-white text-xs rounded-xl py-2 px-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-neutral-200 dark:border-neutral-800 z-50">
                            <p className="font-bold mb-0.5">{label}</p>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              {payload[0].value} visits
                            </span>
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey="value"
                      name="Visits"
                      fill="url(#sourceGrad)"
                      radius={10} // Full pill shape
                      animationDuration={1500}
                      // Meter track background
                      background={{
                        fill: "#f3f4f6",
                        radius: 10,
                        className: "fill-neutral-100 dark:fill-neutral-800/50",
                      }}
                    >
                      {referrerBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill="url(#sourceGrad)"
                          className="transition-all duration-300 hover:brightness-110"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-neutral-400">
                No referrer data
              </div>
            )}
          </div>

          {/* Top Projects */}
          {/* Top Projects - Radial Activity Rings */}
          <div className="p-5 flex flex-col lg:col-span-2">
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest font-mono mb-4">
              Top Projects
            </p>
            {topProjects.length > 0 ? (
              <div className="flex items-center h-[200px] gap-4">
                {/* Radial Chart */}
                <div className="w-[42%] h-full relative min-w-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="40%"
                      outerRadius="100%"
                      barSize={12}
                      data={topProjects
                        .map((p, i) => ({
                          name: p.id,
                          count: p.count,
                          fill: [
                            "#d9f99d",
                            "#84cc16",
                            "#22c55e",
                            "#10b981",
                            "#14b8a6",
                          ][i % 5],
                        }))
                        .reverse()} // Reverse so #1 is outer
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar
                        background={{ fill: "#f3f4f6" }} // Track color
                        dataKey="count"
                        cornerRadius={10}
                        label={false}
                      />
                      <Tooltip
                        cursor={false}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm text-neutral-900 dark:text-white text-xs rounded-xl py-2 px-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-neutral-200 dark:border-neutral-800 z-50">
                              <p className="font-bold mb-0.5 max-w-[150px] truncate">
                                {data.name}
                              </p>
                              <span
                                className="font-bold"
                                style={{ color: data.fill }}
                              >
                                {data.count} interactions
                              </span>
                            </div>
                          );
                        }}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  {/* Central Metric */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tighter">
                      {topProjects.reduce((acc, curr) => acc + curr.count, 0)}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-widest">
                      Total
                    </span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex-1 flex flex-col justify-center gap-3 pr-0">
                  {topProjects.slice(0, 5).map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 w-full group"
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white dark:ring-neutral-900 group-hover:scale-110 transition-transform"
                        style={{
                          backgroundColor: [
                            "#d9f99d",
                            "#84cc16",
                            "#22c55e",
                            "#10b981",
                            "#14b8a6",
                          ][i % 5],
                          boxShadow: `0 0 8px ${["#d9f99d", "#84cc16", "#22c55e", "#10b981", "#14b8a6"][i % 5]}60`,
                        }}
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center justify-between w-full">
                          <span
                            className="text-xs font-semibold text-neutral-700 dark:text-neutral-200 truncate pr-2"
                            title={p.id}
                          >
                            {p.id}
                          </span>
                          <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                            {p.count}
                          </span>
                        </div>
                        {/* Tiny progress bar for relative scale context */}
                        <div className="w-full h-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full opacity-70"
                            style={{
                              width: `${(p.count / (topProjects[0]?.count || 1)) * 100}%`,
                              backgroundColor: [
                                "#d9f99d",
                                "#84cc16",
                                "#22c55e",
                                "#10b981",
                                "#14b8a6",
                              ][i % 5],
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-neutral-400">
                No project data
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
