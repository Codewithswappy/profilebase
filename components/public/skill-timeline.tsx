"use client";

import { useState } from "react";
import { SkillWithCredibility, EvidenceWithSkills } from "@/lib/actions/public";
import { cn } from "@/lib/utils";
import {
  IconCode,
  IconLink,
  IconPhoto,
  IconFileText,
  IconChartLine,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";

// ============================================
// TYPES
// ============================================

interface TimelineEvent {
  id: string;
  date: Date;
  type: "evidence" | "first" | "milestone";
  title: string;
  projectTitle?: string;
  evidenceType?: string;
}

interface SkillTimelineData {
  skill: SkillWithCredibility;
  events: TimelineEvent[];
  firstEvidenceDate: Date | null;
  latestEvidenceDate: Date | null;
  maturityScore: number;
  maturityLabel: string;
}

interface SkillTimelineProps {
  skill: SkillWithCredibility;
  evidence: EvidenceWithSkills[];
  projects: Array<{ id: string; title: string }>;
  compact?: boolean;
}

interface SkillTimelineViewProps {
  skills: SkillWithCredibility[];
  evidence: EvidenceWithSkills[];
  projects: Array<{ id: string; title: string }>;
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
  switch (type) {
    case "SCREENSHOT":
      return <IconPhoto className="w-3.5 h-3.5" />;
    case "LINK":
      return <IconLink className="w-3.5 h-3.5" />;
    case "CODE_SNIPPET":
      return <IconCode className="w-3.5 h-3.5" />;
    case "METRIC":
      return <IconChartLine className="w-3.5 h-3.5" />;
    default:
      return <IconFileText className="w-3.5 h-3.5" />;
  }
}

function calculateMaturity(
  firstDate: Date | null,
  evidenceCount: number
): { score: number; label: string } {
  if (!firstDate) {
    return { score: 0, label: "No Evidence" };
  }

  const monthsSinceFirst =
    (new Date().getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

  // Maturity is based on time + evidence count
  // More weight on evidence diversity and quantity
  const timeScore = Math.min(monthsSinceFirst / 24, 1) * 40; // Max 40 points for 2+ years
  const evidenceScore = Math.min(evidenceCount / 5, 1) * 60; // Max 60 points for 5+ evidence
  const totalScore = Math.round(timeScore + evidenceScore);

  let label = "Beginner";
  if (totalScore >= 80) label = "Expert";
  else if (totalScore >= 60) label = "Advanced";
  else if (totalScore >= 40) label = "Intermediate";
  else if (totalScore >= 20) label = "Developing";

  return { score: totalScore, label };
}

function buildTimelineData(
  skill: SkillWithCredibility,
  allEvidence: EvidenceWithSkills[],
  projects: Array<{ id: string; title: string }>
): SkillTimelineData {
  // Get evidence linked to this skill
  const skillEvidence = allEvidence.filter((e) =>
    e.skills.some((es) => es.skillId === skill.id)
  );

  // Create project map for quick lookup
  const projectMap = new Map(projects.map((p) => [p.id, p.title]));

  // Sort by date
  const sortedEvidence = [...skillEvidence].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const events: TimelineEvent[] = [];

  sortedEvidence.forEach((e, index) => {
    const eventType: "first" | "evidence" | "milestone" =
      index === 0
        ? "first"
        : index === sortedEvidence.length - 1 && index > 0
          ? "milestone"
          : "evidence";

    events.push({
      id: e.id,
      date: new Date(e.createdAt),
      type: eventType,
      title: e.title,
      projectTitle: projectMap.get(e.projectId),
      evidenceType: e.type,
    });
  });

  const firstDate =
    sortedEvidence.length > 0 ? new Date(sortedEvidence[0].createdAt) : null;
  const latestDate =
    sortedEvidence.length > 0
      ? new Date(sortedEvidence[sortedEvidence.length - 1].createdAt)
      : null;

  const { score, label } = calculateMaturity(firstDate, sortedEvidence.length);

  return {
    skill,
    events,
    firstEvidenceDate: firstDate,
    latestEvidenceDate: latestDate,
    maturityScore: score,
    maturityLabel: label,
  };
}

// ============================================
// MATURITY INDICATOR (Clean Pill)
// ============================================

function MaturityPill({ score, label }: { score: number; label: string }) {
  const getStyle = (s: number) => {
    if (s >= 80)
      return "text-purple-700 bg-purple-50 border-purple-100/50 dark:text-purple-300 dark:bg-purple-900/10 dark:border-purple-800/30";
    if (s >= 60)
      return "text-emerald-700 bg-emerald-50 border-emerald-100/50 dark:text-emerald-300 dark:bg-emerald-900/10 dark:border-emerald-800/30";
    if (s >= 40)
      return "text-blue-700 bg-blue-50 border-blue-100/50 dark:text-blue-300 dark:bg-blue-900/10 dark:border-blue-800/30";
    if (s >= 20)
      return "text-amber-700 bg-amber-50 border-amber-100/50 dark:text-amber-300 dark:bg-amber-900/10 dark:border-amber-800/30";
    return "text-stone-600 bg-stone-50 border-stone-100/50 dark:text-stone-400 dark:bg-stone-800/10 dark:border-stone-700/30";
  };

  return (
    <span
      className={cn(
        "px-1.5 py-0.5 rounded-[4px] text-[9px] uppercase tracking-wider font-semibold border",
        getStyle(score)
      )}
    >
      {label}
    </span>
  );
}

// ============================================
// SINGLE SKILL TIMELINE COMPONENT (Clean List)
// ============================================

export function SkillTimeline({
  skill,
  evidence,
  projects,
  compact = false,
}: SkillTimelineProps) {
  const [expanded, setExpanded] = useState(false);
  const data = buildTimelineData(skill, evidence, projects);

  if (data.events.length === 0) return null;

  return (
    <div className="group border-b border-stone-100 last:border-0 hover:bg-stone-50/50 transition-colors">
      {/* Clickable Header Row */}
      <div
        className={cn(
          "flex items-center justify-between cursor-pointer select-none transition-all",
          compact ? "py-1.5" : "py-2.5"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold text-stone-700 group-hover:text-stone-900 transition-colors">
            {skill.name}
          </span>
          <MaturityPill score={data.maturityScore} label={data.maturityLabel} />
        </div>

        <div className="flex items-center gap-1.5 text-stone-400 group-hover:text-stone-600 transition-colors mr-1">
          <span className="text-[9px] uppercase tracking-widest font-medium opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline-block">
            {expanded ? "Less" : "Details"}
          </span>
          {expanded ? (
            <IconChevronUp className="w-3.5 h-3.5" />
          ) : (
            <IconChevronDown className="w-3.5 h-3.5" />
          )}
        </div>
      </div>

      {/* Expanded Content - Clean Line */}
      {expanded && (
        <div className="pb-3 pl-1 animate-in slide-in-from-top-1 fade-in duration-200">
          <div className="relative border-l border-stone-200 ml-1.5 pl-4 space-y-3 pt-1">
            {data.events.map((event) => (
              <div key={event.id} className="relative group/event">
                {/* Timeline Dot */}
                <div className="absolute -left-[19.5px] top-1.5 w-1.5 h-1.5 bg-white border border-stone-300 rounded-full group-hover/event:border-stone-400 group-hover/event:scale-110 transition-all z-10" />

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5 sm:gap-4">
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-[11px] font-medium text-stone-800 truncate pr-2">
                      {event.title}
                    </div>
                    {event.projectTitle && (
                      <div className="text-[10px] text-stone-500 flex items-center gap-1 truncate">
                        <span className="opacity-60">in</span>
                        <span className="font-medium text-stone-600 truncate">
                          {event.projectTitle}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    {event.evidenceType && (
                      <div
                        className="text-stone-400"
                        title={event.evidenceType}
                      >
                        {getEvidenceIcon(event.evidenceType)}
                      </div>
                    )}
                    <div className="text-[9px] font-mono text-stone-400 whitespace-nowrap">
                      {formatDate(event.date)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// SKILL TIMELINE VIEW (Container)
// ============================================

export function SkillTimelineView({
  skills,
  evidence,
  projects,
  compact = false,
}: SkillTimelineViewProps) {
  // Filter skills that have evidence
  const skillsWithEvidence = skills.filter((skill) =>
    evidence.some((e) => e.skills.some((es) => es.skillId === skill.id))
  );

  if (skillsWithEvidence.length === 0) return null;

  // Sort by evidence count primarily
  const sortedSkills = [...skillsWithEvidence].sort(
    (a, b) => b.evidenceCount - a.evidenceCount
  );

  return (
    <div className="flex flex-col">
      {sortedSkills.map((skill) => (
        <SkillTimeline
          key={skill.id}
          skill={skill}
          evidence={evidence}
          projects={projects}
          compact={compact}
        />
      ))}
    </div>
  );
}

export default SkillTimelineView;
