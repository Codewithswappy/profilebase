/**
 * Timeline Narrator
 * 
 * Generates human-readable, contextual narratives for timeline events
 * based on evidence type, skill name, and project metadata.
 */

// ============================================
// TYPES
// ============================================

export type MilestoneType = 
  | "FIRST_EVIDENCE" 
  | "FIFTH_EVIDENCE" 
  | "FIRST_DEPLOYED_LINK" 
  | "MOST_RECENT";

export interface NarrativeContext {
  evidenceType: string;
  evidenceTitle: string;
  skillName: string;
  projectTitle?: string;
  isFirst?: boolean;
  isMostRecent?: boolean;
  evidenceIndex?: number;
}

export interface NarrativeResult {
  description: string;
  milestone?: MilestoneType;
  milestoneLabel?: string;
}

// ============================================
// NARRATIVE TEMPLATES BY EVIDENCE TYPE
// ============================================

const NARRATIVE_TEMPLATES: Record<string, (ctx: NarrativeContext) => string> = {
  CODE_SNIPPET: (ctx) => {
    if (ctx.projectTitle) {
      return `Implemented code demonstrating ${ctx.skillName} in ${ctx.projectTitle}`;
    }
    return `Wrote code showcasing ${ctx.skillName} proficiency`;
  },

  LINK: (ctx) => {
    if (ctx.projectTitle) {
      return `Deployed live demonstration of ${ctx.skillName} for ${ctx.projectTitle}`;
    }
    return `Published working example using ${ctx.skillName}`;
  },

  SCREENSHOT: (ctx) => {
    if (ctx.projectTitle) {
      return `Captured visual proof of ${ctx.skillName} work in ${ctx.projectTitle}`;
    }
    return `Documented ${ctx.skillName} implementation visually`;
  },

  METRIC: (ctx) => {
    if (ctx.projectTitle) {
      return `Achieved measurable results with ${ctx.skillName} in ${ctx.projectTitle}`;
    }
    return `Demonstrated quantifiable ${ctx.skillName} impact`;
  },

  DESCRIPTION: (ctx) => {
    if (ctx.projectTitle) {
      return `Documented ${ctx.skillName} usage in ${ctx.projectTitle}`;
    }
    return `Added context about ${ctx.skillName} experience`;
  },
};

// ============================================
// MILESTONE DETECTION
// ============================================

export function detectMilestone(
  evidenceType: string,
  evidenceIndex: number,
  totalEvidence: number,
  isFirstLink: boolean
): MilestoneType | undefined {
  // Most recent (last item)
  if (evidenceIndex === totalEvidence - 1 && totalEvidence > 1) {
    return "MOST_RECENT";
  }

  // First evidence ever
  if (evidenceIndex === 0) {
    return "FIRST_EVIDENCE";
  }

  // Fifth evidence milestone
  if (evidenceIndex === 4) {
    return "FIFTH_EVIDENCE";
  }

  // First deployed link
  if (evidenceType === "LINK" && isFirstLink) {
    return "FIRST_DEPLOYED_LINK";
  }

  return undefined;
}

export function getMilestoneLabel(milestone: MilestoneType): string {
  switch (milestone) {
    case "FIRST_EVIDENCE":
      return "First Proof";
    case "FIFTH_EVIDENCE":
      return "5× Verified";
    case "FIRST_DEPLOYED_LINK":
      return "First Deploy";
    case "MOST_RECENT":
      return "Latest";
    default:
      return "";
  }
}

// ============================================
// MAIN NARRATOR FUNCTION
// ============================================

export function generateNarrative(context: NarrativeContext): NarrativeResult {
  const template = NARRATIVE_TEMPLATES[context.evidenceType] || NARRATIVE_TEMPLATES.DESCRIPTION;
  const description = template(context);

  // Detect milestone if index info is provided
  let milestone: MilestoneType | undefined;
  let milestoneLabel: string | undefined;

  if (context.isFirst) {
    milestone = "FIRST_EVIDENCE";
    milestoneLabel = getMilestoneLabel(milestone);
  } else if (context.isMostRecent) {
    milestone = "MOST_RECENT";
    milestoneLabel = getMilestoneLabel(milestone);
  } else if (context.evidenceIndex === 4) {
    milestone = "FIFTH_EVIDENCE";
    milestoneLabel = getMilestoneLabel(milestone);
  }

  return {
    description,
    milestone,
    milestoneLabel,
  };
}

// ============================================
// BATCH NARRATOR FOR TIMELINE
// ============================================

export interface TimelineEventInput {
  id: string;
  type: string;
  title: string;
  projectTitle?: string;
  createdAt: Date;
}

export interface NarratedTimelineEvent extends TimelineEventInput {
  narrative: string;
  milestone?: MilestoneType;
  milestoneLabel?: string;
}

export function narrateTimeline(
  events: TimelineEventInput[],
  skillName: string
): NarratedTimelineEvent[] {
  // Sort by date ascending
  const sorted = [...events].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  let firstLinkSeen = false;

  return sorted.map((event, index) => {
    const isFirst = index === 0;
    const isMostRecent = index === sorted.length - 1 && sorted.length > 1;
    const isFirstLink = event.type === "LINK" && !firstLinkSeen;

    if (event.type === "LINK") {
      firstLinkSeen = true;
    }

    const result = generateNarrative({
      evidenceType: event.type,
      evidenceTitle: event.title,
      skillName,
      projectTitle: event.projectTitle,
      isFirst,
      isMostRecent,
      evidenceIndex: index,
    });

    // Override milestone for first link if not already first evidence
    let milestone = result.milestone;
    let milestoneLabel = result.milestoneLabel;

    if (isFirstLink && !isFirst && index !== 4) {
      milestone = "FIRST_DEPLOYED_LINK";
      milestoneLabel = getMilestoneLabel(milestone);
    }

    return {
      ...event,
      narrative: result.description,
      milestone,
      milestoneLabel,
    };
  });
}
