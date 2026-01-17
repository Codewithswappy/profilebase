"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { SkillWithCredibility, EvidenceWithSkills } from "@/lib/actions/public";
import {
  calculateSkillMaturity,
  EvidenceInput,
  MaturityResult,
} from "@/lib/utils/skill-maturity";
import {
  narrateTimeline,
  NarratedTimelineEvent,
} from "@/lib/utils/timeline-narrator";
import {
  MaturityBadge,
  RecencyIndicator,
  MilestoneBadge,
} from "./maturity-badge";
import { ConfidenceMeter, ConfidenceDot } from "./confidence-meter";
import { SkillGrowthGraph } from "./skill-growth-graph";
import { SkillInsights, QuickInsightBadge } from "./skill-insights";
import {
  TimelineFilters,
  FilterOption,
  filterEvidence,
  getFilterCounts,
} from "./timeline-filters";
import {
  IconChevronDown,
  IconChevronUp,
  IconCode,
  IconLink,
  IconPhoto,
  IconChartLine,
  IconFileText,
  IconTrendingUp,
} from "@tabler/icons-react";

// ============================================
// TYPES
// ============================================

interface SkillTimelineData {
  skill: SkillWithCredibility;
  evidence: EvidenceWithSkills[];
  maturity: MaturityResult;
  narratedEvents: NarratedTimelineEvent[];
}

interface SkillTimelineV2Props {
  skills: SkillWithCredibility[];
  evidence: EvidenceWithSkills[];
  projects: Array<{ id: string; title: string }>;
  compact?: boolean;
}

interface SingleSkillTimelineProps {
  data: SkillTimelineData;
  projectMap: Map<string, string>;
  isExpanded: boolean;
  onToggle: () => void;
  compact?: boolean;
}

// ============================================
// HELPERS
// ============================================

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function getEvidenceIcon(type: string) {
  const iconClass = "w-3.5 h-3.5";
  switch (type) {
    case "SCREENSHOT":
      return <IconPhoto className={iconClass} />;
    case "LINK":
      return <IconLink className={iconClass} />;
    case "CODE_SNIPPET":
      return <IconCode className={iconClass} />;
    case "METRIC":
      return <IconChartLine className={iconClass} />;
    default:
      return <IconFileText className={iconClass} />;
  }
}

function buildSkillTimelineData(
  skill: SkillWithCredibility,
  allEvidence: EvidenceWithSkills[],
  projectMap: Map<string, string>
): SkillTimelineData {
  // Get evidence linked to this skill
  const skillEvidence = allEvidence.filter((e) =>
    e.skills.some((es) => es.skillId === skill.id)
  );

  // Transform for maturity calculation
  const evidenceInputs: EvidenceInput[] = skillEvidence.map((e) => ({
    id: e.id,
    type: e.type,
    createdAt: new Date(e.createdAt),
    projectId: e.projectId,
  }));

  // Calculate maturity
  const maturity = calculateSkillMaturity(evidenceInputs);

  // Build narrated timeline
  const timelineEvents = skillEvidence.map((e) => ({
    id: e.id,
    type: e.type,
    title: e.title,
    projectTitle: projectMap.get(e.projectId),
    createdAt: new Date(e.createdAt),
  }));

  const narratedEvents = narrateTimeline(timelineEvents, skill.name);

  return {
    skill,
    evidence: skillEvidence,
    maturity,
    narratedEvents,
  };
}

// ============================================
// SINGLE SKILL TIMELINE COMPONENT
// ============================================

function SingleSkillTimeline({
  data,
  projectMap,
  isExpanded,
  onToggle,
  compact = false,
}: SingleSkillTimelineProps) {
  const [filter, setFilter] = useState<FilterOption>("all");

  const { skill, evidence, maturity, narratedEvents } = data;

  // Transform evidence for filtering
  const evidenceForFilter = useMemo(
    () =>
      evidence.map((e) => ({
        ...e,
        createdAt: new Date(e.createdAt),
      })),
    [evidence]
  );

  const filterCounts = useMemo(
    () => getFilterCounts(evidenceForFilter),
    [evidenceForFilter]
  );

  const filteredEvents = useMemo(() => {
    const filtered = filterEvidence(evidenceForFilter, filter);
    const filteredIds = new Set(filtered.map((e) => e.id));
    return narratedEvents.filter((e) => filteredIds.has(e.id));
  }, [evidenceForFilter, filter, narratedEvents]);

  // Transform for insights
  const evidenceInputs: EvidenceInput[] = useMemo(
    () =>
      evidence.map((e) => ({
        id: e.id,
        type: e.type,
        createdAt: new Date(e.createdAt),
        projectId: e.projectId,
      })),
    [evidence]
  );

  if (evidence.length === 0) return null;

  return (
    <div
      className={cn(
        "group border-b border-stone-100 last:border-0",
        isExpanded && "bg-stone-50/30"
      )}
      id={`skill-${skill.id}`}
    >
      {/* Header Row */}
      <div
        className={cn(
          "flex items-center justify-between cursor-pointer select-none transition-all",
          compact ? "py-2 px-1" : "py-3 px-2"
        )}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-controls={`skill-content-${skill.id}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={cn(
              "font-semibold text-stone-700 group-hover:text-stone-900 transition-colors truncate",
              compact ? "text-sm" : "text-sm"
            )}
          >
            {skill.name}
          </span>

          <MaturityBadge
            level={maturity.level}
            score={maturity.maturityScore}
            compact={compact}
          />

          <QuickInsightBadge evidence={evidenceInputs} />

          {!compact && <RecencyIndicator status={maturity.recencyStatus} />}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!compact && (
            <ConfidenceMeter confidence={maturity.confidence} compact />
          )}

          <div className="flex items-center gap-1 text-stone-400 group-hover:text-stone-600 transition-colors">
            <span className="text-[9px] uppercase tracking-widest font-medium opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline-block">
              {isExpanded ? "Less" : "Details"}
            </span>
            {isExpanded ? (
              <IconChevronUp className="w-3.5 h-3.5" />
            ) : (
              <IconChevronDown className="w-3.5 h-3.5" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div
          id={`skill-content-${skill.id}`}
          className="pb-4 px-2 animate-in slide-in-from-top-1 fade-in duration-200"
        >
          {/* Stats Bar */}
          <div className="flex flex-wrap items-center gap-4 mb-4 py-2 px-3 bg-white rounded-lg border border-stone-100">
            <div className="flex items-center gap-2">
              <IconTrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                Score
              </span>
              <span className="text-sm font-bold text-stone-800 font-mono">
                {maturity.maturityScore}
              </span>
            </div>

            <div className="h-4 w-px bg-stone-200" />

            <ConfidenceMeter confidence={maturity.confidence} showLabel />

            <div className="h-4 w-px bg-stone-200" />

            <RecencyIndicator status={maturity.recencyStatus} />

            <div className="h-4 w-px bg-stone-200 hidden sm:block" />

            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                Proofs
              </span>
              <span className="text-sm font-bold text-stone-800 font-mono">
                {evidence.length}
              </span>
            </div>
          </div>

          {/* Growth Graph */}
          {evidence.length >= 2 && (
            <div className="mb-4 p-3 bg-white rounded-lg border border-stone-100">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                Growth Over Time
              </h4>
              <SkillGrowthGraph
                evidence={evidence.map((e) => ({
                  createdAt: new Date(e.createdAt),
                }))}
                height={80}
              />
            </div>
          )}

          {/* Filters */}
          {evidence.length > 2 && (
            <div className="mb-3">
              <TimelineFilters
                activeFilter={filter}
                onFilterChange={setFilter}
                evidenceCounts={filterCounts}
                compact
              />
            </div>
          )}

          {/* Timeline Events */}
          <div className="relative border-l border-stone-200 ml-2 pl-4 space-y-3 pt-1">
            {filteredEvents.map((event) => (
              <div key={event.id} className="relative group/event">
                {/* Timeline Dot */}
                <div className="absolute -left-[18.5px] top-1.5 w-1.5 h-1.5 bg-white border border-stone-300 rounded-full group-hover/event:border-stone-400 group-hover/event:scale-110 transition-all z-10" />

                <div className="flex flex-col gap-1">
                  {/* Milestone Badge */}
                  {event.milestone && <MilestoneBadge type={event.milestone} />}

                  {/* Event Content */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5 sm:gap-4">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="text-[11px] font-medium text-stone-800">
                        {event.title}
                      </div>
                      <div className="text-[10px] text-stone-500 leading-relaxed">
                        {event.narrative}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-stone-400" title={event.type}>
                        {getEvidenceIcon(event.type)}
                      </div>
                      <div className="text-[9px] font-mono text-stone-400 whitespace-nowrap">
                        {formatDate(event.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredEvents.length === 0 && (
              <div className="text-[11px] text-stone-400 py-2">
                No evidence matches the current filter.
              </div>
            )}
          </div>

          {/* Insights Panel */}
          <div className="mt-4">
            <SkillInsights skillName={skill.name} evidence={evidenceInputs} />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN V2 TIMELINE VIEW
// ============================================

export function SkillTimelineV2({
  skills,
  evidence,
  projects,
  compact = false,
}: SkillTimelineV2Props) {
  const searchParams = useSearchParams();
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());

  // Create project map
  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p.id, p.title])),
    [projects]
  );

  // Build timeline data for all skills with memoization
  const skillTimelineData = useMemo(() => {
    return skills
      .map((skill) => buildSkillTimelineData(skill, evidence, projectMap))
      .filter((data) => data.evidence.length > 0)
      .sort((a, b) => b.maturity.maturityScore - a.maturity.maturityScore);
  }, [skills, evidence, projectMap]);

  // Handle deep linking
  useEffect(() => {
    const skillParam = searchParams.get("skill");
    if (skillParam) {
      const matchingSkill = skillTimelineData.find(
        (data) =>
          data.skill.name.toLowerCase() === skillParam.toLowerCase() ||
          data.skill.id === skillParam
      );
      if (matchingSkill) {
        setExpandedSkills((prev) => new Set([...prev, matchingSkill.skill.id]));

        // Scroll to skill after a short delay
        setTimeout(() => {
          const element = document.getElementById(
            `skill-${matchingSkill.skill.id}`
          );
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      }
    }
  }, [searchParams, skillTimelineData]);

  // Toggle handler
  const handleToggle = useCallback((skillId: string) => {
    setExpandedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skillId)) {
        next.delete(skillId);
      } else {
        next.add(skillId);
      }
      return next;
    });
  }, []);

  if (skillTimelineData.length === 0) {
    return (
      <div className="text-center py-8 text-stone-400 text-sm">
        No skills with evidence to display.
      </div>
    );
  }

  return (
    <div className="flex flex-col" role="list" aria-label="Skills timeline">
      {skillTimelineData.map((data) => (
        <SingleSkillTimeline
          key={data.skill.id}
          data={data}
          projectMap={projectMap}
          isExpanded={expandedSkills.has(data.skill.id)}
          onToggle={() => handleToggle(data.skill.id)}
          compact={compact}
        />
      ))}
    </div>
  );
}

// ============================================
// SUMMARY STATS COMPONENT
// ============================================

interface TimelineSummaryProps {
  skills: SkillWithCredibility[];
  evidence: EvidenceWithSkills[];
  className?: string;
}

export function TimelineSummary({
  skills,
  evidence,
  className,
}: TimelineSummaryProps) {
  const stats = useMemo(() => {
    const skillsWithEvidence = skills.filter((skill) =>
      evidence.some((e) => e.skills.some((es) => es.skillId === skill.id))
    );

    const avgMaturity =
      skillsWithEvidence.length > 0
        ? Math.round(
            skillsWithEvidence.reduce((sum, skill) => {
              const skillEvidence = evidence.filter((e) =>
                e.skills.some((es) => es.skillId === skill.id)
              );
              const inputs: EvidenceInput[] = skillEvidence.map((e) => ({
                id: e.id,
                type: e.type,
                createdAt: new Date(e.createdAt),
                projectId: e.projectId,
              }));
              return sum + calculateSkillMaturity(inputs).maturityScore;
            }, 0) / skillsWithEvidence.length
          )
        : 0;

    const expertCount = skillsWithEvidence.filter((skill) => {
      const skillEvidence = evidence.filter((e) =>
        e.skills.some((es) => es.skillId === skill.id)
      );
      const inputs: EvidenceInput[] = skillEvidence.map((e) => ({
        id: e.id,
        type: e.type,
        createdAt: new Date(e.createdAt),
        projectId: e.projectId,
      }));
      return calculateSkillMaturity(inputs).level === "Expert";
    }).length;

    return {
      totalSkills: skillsWithEvidence.length,
      totalEvidence: evidence.length,
      avgMaturity,
      expertCount,
    };
  }, [skills, evidence]);

  return (
    <div
      className={cn(
        "grid grid-cols-4 gap-4 p-4 bg-white rounded-xl border border-stone-100",
        className
      )}
    >
      <div className="text-center">
        <div className="text-xl font-bold text-stone-900 font-mono">
          {stats.totalSkills}
        </div>
        <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">
          Skills
        </div>
      </div>
      <div className="text-center">
        <div className="text-xl font-bold text-stone-900 font-mono">
          {stats.totalEvidence}
        </div>
        <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">
          Proofs
        </div>
      </div>
      <div className="text-center">
        <div className="text-xl font-bold text-blue-600 font-mono">
          {stats.avgMaturity}%
        </div>
        <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">
          Avg Score
        </div>
      </div>
      <div className="text-center">
        <div className="text-xl font-bold text-purple-600 font-mono">
          {stats.expertCount}
        </div>
        <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">
          Expert
        </div>
      </div>
    </div>
  );
}

export default SkillTimelineV2;
