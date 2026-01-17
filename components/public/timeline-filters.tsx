"use client";

import { cn } from "@/lib/utils";
import {
  IconCode,
  IconLink,
  IconClock,
  IconX,
  IconFilter,
} from "@tabler/icons-react";

// ============================================
// TYPES
// ============================================

export type FilterOption = "all" | "code" | "links" | "recent";

interface TimelineFiltersProps {
  activeFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  evidenceCounts: {
    all: number;
    code: number;
    links: number;
    recent: number;
  };
  className?: string;
  compact?: boolean;
}

// ============================================
// FILTER BUTTON
// ============================================

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
  compact?: boolean;
}

function FilterButton({
  active,
  onClick,
  icon,
  label,
  count,
  compact = false,
}: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border transition-all",
        compact ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]",
        active
          ? "bg-stone-900 text-white border-stone-900"
          : "bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
      )}
      aria-pressed={active}
    >
      {icon}
      <span className="font-medium">{label}</span>
      {count > 0 && (
        <span
          className={cn(
            "font-mono",
            active ? "text-stone-300" : "text-stone-400"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function TimelineFilters({
  activeFilter,
  onFilterChange,
  evidenceCounts,
  className,
  compact = false,
}: TimelineFiltersProps) {
  const iconSize = compact ? "w-3 h-3" : "w-3.5 h-3.5";

  return (
    <div
      className={cn(
        "flex items-center flex-wrap",
        compact ? "gap-1" : "gap-1.5",
        className
      )}
      role="group"
      aria-label="Filter timeline events"
    >
      <FilterButton
        active={activeFilter === "all"}
        onClick={() => onFilterChange("all")}
        icon={<IconFilter className={iconSize} />}
        label="All"
        count={evidenceCounts.all}
        compact={compact}
      />

      <FilterButton
        active={activeFilter === "code"}
        onClick={() => onFilterChange("code")}
        icon={<IconCode className={iconSize} />}
        label="Code"
        count={evidenceCounts.code}
        compact={compact}
      />

      <FilterButton
        active={activeFilter === "links"}
        onClick={() => onFilterChange("links")}
        icon={<IconLink className={iconSize} />}
        label="Links"
        count={evidenceCounts.links}
        compact={compact}
      />

      <FilterButton
        active={activeFilter === "recent"}
        onClick={() => onFilterChange("recent")}
        icon={<IconClock className={iconSize} />}
        label="Recent"
        count={evidenceCounts.recent}
        compact={compact}
      />

      {/* Clear filter button */}
      {activeFilter !== "all" && (
        <button
          onClick={() => onFilterChange("all")}
          className={cn(
            "inline-flex items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400 hover:text-stone-600 hover:border-stone-300 transition-colors",
            compact ? "w-5 h-5" : "w-6 h-6"
          )}
          aria-label="Clear filter"
        >
          <IconX className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
        </button>
      )}
    </div>
  );
}

// ============================================
// FILTER HELPERS
// ============================================

export function filterEvidence<T extends { type: string; createdAt: Date }>(
  evidence: T[],
  filter: FilterOption
): T[] {
  switch (filter) {
    case "code":
      return evidence.filter((e) => e.type === "CODE_SNIPPET");
    case "links":
      return evidence.filter((e) => e.type === "LINK");
    case "recent":
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return evidence.filter(
        (e) => new Date(e.createdAt).getTime() >= threeMonthsAgo.getTime()
      );
    default:
      return evidence;
  }
}

export function getFilterCounts<T extends { type: string; createdAt: Date }>(
  evidence: T[]
): { all: number; code: number; links: number; recent: number } {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  return {
    all: evidence.length,
    code: evidence.filter((e) => e.type === "CODE_SNIPPET").length,
    links: evidence.filter((e) => e.type === "LINK").length,
    recent: evidence.filter(
      (e) => new Date(e.createdAt).getTime() >= threeMonthsAgo.getTime()
    ).length,
  };
}

export default TimelineFilters;
