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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  TrendingUp,
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
  const [range, setRange] = useState(30);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getAnalytics(profileId, range);
      setData(res);
      setLoading(false);
    }
    load();
  }, [profileId, range]);

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
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          {[
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
              {summary.totalUniques.toLocaleString()}
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
              {summary.avgDuration}
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
        <div className="grid lg:grid-cols-3 divide-x divide-neutral-200 dark:divide-neutral-800">
          {/* Traffic Chart */}
          <div className="lg:col-span-2 p-5">
            <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-4">
              Traffic Overview
            </p>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={history}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#71717a" }}
                    dy={10}
                    minTickGap={40}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#71717a" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ paddingTop: 16 }}
                    formatter={(v) => (
                      <span className="text-xs text-neutral-500 ml-1">{v}</span>
                    )}
                  />
                  <Bar
                    dataKey="views"
                    name="Views"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                  <Line
                    type="monotone"
                    dataKey="visitors"
                    name="Visitors"
                    stroke="#22c55e"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: "#22c55e",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Devices */}
          <div className="p-5">
            <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-4">
              Devices
            </p>
            {deviceBreakdown && deviceBreakdown.length > 0 ? (
              <div>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        stroke="none"
                      >
                        {deviceBreakdown.map(
                          (entry: DeviceBreakdownItem, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                DEVICE_COLORS[entry.name]?.color || "#94a3b8"
                              }
                            />
                          ),
                        )}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  {deviceBreakdown.map(
                    (entry: DeviceBreakdownItem, index: number) => {
                      const deviceInfo = DEVICE_COLORS[entry.name] || {
                        color: "#94a3b8",
                        icon: Monitor,
                      };
                      return (
                        <div key={index} className="flex items-center gap-1.5">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: deviceInfo.color }}
                          />
                          <span className="text-[11px] font-medium text-neutral-500">
                            {entry.name}
                          </span>
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
        </div>

        {/* Divider between rows */}
        <div className="border-t border-neutral-200 dark:border-neutral-800" />

        {/* Row 2: Sources + Projects */}
        <div className="grid lg:grid-cols-2 divide-x divide-neutral-200 dark:divide-neutral-800">
          {/* Traffic Sources */}
          <div className="p-5">
            <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-4">
              Traffic Sources
            </p>
            {referrerBreakdown && referrerBreakdown.length > 0 ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={referrerBreakdown}
                    layout="vertical"
                    margin={{ left: 0, right: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#71717a" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#52525b" }}
                      width={60}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="value"
                      name="Visits"
                      radius={[0, 4, 4, 0]}
                      barSize={14}
                    >
                      {referrerBreakdown.map(
                        (entry: ReferrerBreakdownItem, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              REFERRER_COLORS[index % REFERRER_COLORS.length]
                            }
                          />
                        ),
                      )}
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
          <div className="p-5">
            <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-4">
              Top Projects
            </p>
            {topProjects.length > 0 ? (
              <div className="space-y-3">
                {topProjects.map((p: TopItem, i: number) => {
                  const max = topProjects[0]?.count || 1;
                  const pct = Math.round((p.count / max) * 100);
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate max-w-[200px]">
                          {p.id}
                        </span>
                        <span className="text-xs font-medium text-neutral-400">
                          {p.count}
                        </span>
                      </div>
                      <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            backgroundColor:
                              REFERRER_COLORS[i % REFERRER_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
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
