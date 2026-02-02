"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  IconBulb,
  IconChevronDown,
  IconChevronUp,
  IconCopy,
  IconCheck,
  IconSparkles,
  IconInfoCircle,
  IconSchool,
  IconCertificate,
  IconBriefcase,
  IconUser,
  IconCode,
} from "@tabler/icons-react";
import { POWER_ACTION_VERBS } from "./ats-score-analyzer";

interface ResumeTipsProps {
  section: string;
  className?: string;
}

// Section styling configuration with gradients and colors
const SECTION_THEMES: Record<
  string,
  {
    bg: string;
    border: string;
    icon: string;
    text: string;
    accent: string;
    hover: string;
  }
> = {
  profile: {
    bg: "from-slate-50 to-gray-50 dark:from-slate-900/30 dark:to-gray-900/30",
    border: "border-slate-200 dark:border-slate-700",
    icon: "text-slate-600 dark:text-slate-400",
    text: "text-slate-700 dark:text-slate-300",
    accent: "bg-slate-100",
    hover: "hover:bg-slate-100",
  },
  summary: {
    bg: "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
    border: "border-amber-200 dark:border-amber-700/50",
    icon: "text-amber-600 dark:text-amber-400",
    text: "text-amber-800 dark:text-amber-300",
    accent: "bg-amber-100",
    hover: "hover:bg-amber-100/50",
  },
  experience: {
    bg: "from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20",
    border: "border-indigo-200 dark:border-indigo-700/50",
    icon: "text-indigo-600 dark:text-indigo-400",
    text: "text-indigo-800 dark:text-indigo-300",
    accent: "bg-indigo-100",
    hover: "hover:bg-indigo-100/50",
  },
  projects: {
    bg: "from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20",
    border: "border-violet-200 dark:border-violet-700/50",
    icon: "text-violet-600 dark:text-violet-400",
    text: "text-violet-800 dark:text-violet-300",
    accent: "bg-violet-100",
    hover: "hover:bg-violet-100/50",
  },
  skills: {
    bg: "from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20",
    border: "border-emerald-200 dark:border-emerald-700/50",
    icon: "text-emerald-600 dark:text-emerald-400",
    text: "text-emerald-800 dark:text-emerald-300",
    accent: "bg-emerald-100",
    hover: "hover:bg-emerald-100/50",
  },
  education: {
    bg: "from-sky-50 to-cyan-50 dark:from-sky-900/20 dark:to-cyan-900/20",
    border: "border-sky-200 dark:border-sky-700/50",
    icon: "text-sky-600 dark:text-sky-400",
    text: "text-sky-800 dark:text-sky-300",
    accent: "bg-sky-100",
    hover: "hover:bg-sky-100/50",
  },
  certifications: {
    bg: "from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20",
    border: "border-rose-200 dark:border-rose-700/50",
    icon: "text-rose-600 dark:text-rose-400",
    text: "text-rose-800 dark:text-rose-300",
    accent: "bg-rose-100",
    hover: "hover:bg-rose-100/50",
  },
};

const DEFAULT_THEME = SECTION_THEMES.summary;

// Tips content
const SECTION_TIPS: Record<
  string,
  { title: string; tips: string[]; examples?: string[]; icon?: any }
> = {
  profile: {
    title: "Contact Information",
    icon: IconUser,
    tips: [
      "Use a professional email address (firstname.lastname@email.com)",
      "Include city and state/country, not full address (for privacy)",
      "LinkedIn URL should be customized (linkedin.com/in/yourname)",
      "Ensure phone number includes country code for international applications",
    ],
  },
  summary: {
    title: "Professional Summary",
    icon: IconSparkles,
    tips: [
      "Keep it to 2-4 sentences (150-300 characters)",
      "Lead with years of experience and job title",
      "Include 3-4 key skills matching the target role",
      "Mention 1-2 notable achievements with metrics",
      "Avoid first-person pronouns (I, me, my)",
    ],
    examples: [
      "Results-driven Software Engineer with 5+ years building scalable web applications. Expert in React, Node.js, and AWS with proven track record of improving system performance by 40%.",
      "Strategic Product Manager with 7+ years leading cross-functional teams. Launched 15+ products generating $10M+ revenue. Skilled in agile methodologies.",
    ],
  },
  experience: {
    title: "Experience",
    icon: IconBriefcase,
    tips: [
      "Start each bullet with a power action verb",
      "Use the format: [Action Verb] + [What] + [How/Result]",
      "Include metrics and quantifiable achievements",
      "Keep bullets to 1-2 lines for easy scanning",
      "Focus on impact, not just responsibilities",
    ],
    examples: [
      "Led development of microservices architecture serving 1M+ daily users, reducing API latency by 60%",
      "Managed cross-functional team of 8 engineers delivering product 2 weeks ahead of schedule",
    ],
  },
  projects: {
    title: "Projects",
    icon: IconCode,
    tips: [
      "Include 2-3 most relevant projects",
      "Describe the problem you solved",
      "Highlight technologies used",
      "Include links to live demos or GitHub repos",
      "Mention team size if collaborative",
    ],
    examples: [
      "Built real-time chat application using WebSocket, React, and Redis, supporting 10K concurrent users",
      "Developed ML-powered recommendation engine increasing user engagement by 35%",
    ],
  },
  skills: {
    title: "Skills",
    icon: IconBulb,
    tips: [
      "Group skills by category (Languages, Frameworks, Tools)",
      "Put most relevant skills first",
      "Methodically list technical and soft skills",
      "Match skills to job description keywords",
      "Remove outdated technologies",
    ],
  },
  education: {
    title: "Education",
    icon: IconSchool,
    tips: [
      "Include degree, major, school, and graduation year",
      "Add GPA if 3.5+ (or equivalent)",
      "Include relevant coursework for recent graduates",
      "List academic honors and achievements",
    ],
  },
  certifications: {
    title: "Certifications",
    icon: IconCertificate,
    tips: [
      "Include certification name, issuing organization, and date",
      "List most relevant certifications first",
      "Add credential IDs for verification",
      "Remove expired certifications",
    ],
  },
};

const ACTION_VERB_CATEGORIES = {
  Leadership: [
    "Led",
    "Directed",
    "Managed",
    "Supervised",
    "Coordinated",
    "Headed",
  ],
  Achievement: [
    "Achieved",
    "Exceeded",
    "Improved",
    "Increased",
    "Reduced",
    "Decreased",
  ],
  Technical: [
    "Developed",
    "Designed",
    "Built",
    "Implemented",
    "Architected",
    "Engineered",
  ],
  ProblemSolving: [
    "Resolved",
    "Solved",
    "Optimized",
    "Streamlined",
    "Automated",
  ],
};

export function ResumeTips({ section, className }: ResumeTipsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedVerb, setCopiedVerb] = useState<string | null>(null);

  const sectionTips = SECTION_TIPS[section];
  if (!sectionTips) return null;

  const theme = SECTION_THEMES[section] || DEFAULT_THEME;
  const Icon = sectionTips.icon || IconBulb;

  const handleCopyVerb = (verb: string) => {
    navigator.clipboard.writeText(verb);
    setCopiedVerb(verb);
    setTimeout(() => setCopiedVerb(null), 1500);
  };

  return (
    <div
      className={cn(
        "border border-dashed rounded-md overflow-hidden transition-all duration-300 font-mono",
        theme.border,
        `bg-linear-to-br ${theme.bg}`,
        className,
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between p-4 text-left transition-colors",
          theme.hover,
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-1.5 rounded-md bg-white dark:bg-neutral-800 shadow-sm border border-neutral-100 dark:border-neutral-700",
              theme.icon,
            )}
          >
            <Icon className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div>
            <h3
              className={cn(
                "text-xs font-bold uppercase tracking-widest",
                theme.text,
              )}
            >
              {sectionTips.title} Tips
            </h3>
            {!isExpanded && (
              <p className="text-[10px] opacity-70 font-medium text-neutral-600 dark:text-neutral-400 mt-0.5">
                Click to view guidelines
              </p>
            )}
          </div>
        </div>

        <div
          className={cn(
            "p-1 rounded-sm bg-white/50 dark:bg-black/20",
            theme.icon,
          )}
        >
          {isExpanded ? (
            <IconChevronUp className="w-4 h-4" />
          ) : (
            <IconChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 animate-in slide-in-from-top-1 duration-200">
          <div className="h-px w-full bg-neutral-200/50 dark:bg-neutral-700/50 mb-4" />

          {/* Tips List */}
          <div className="space-y-2.5 mb-5">
            {sectionTips.tips.map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-3 text-xs text-neutral-700 dark:text-neutral-300 group"
              >
                <div
                  className={cn(
                    "mt-1.5 w-1.5 h-1.5 rounded-full shrink-0",
                    theme.icon.replace("text-", "bg-"),
                  )}
                />
                <span className="leading-relaxed font-medium opacity-90">
                  {tip}
                </span>
              </div>
            ))}
          </div>

          {/* Examples */}
          {sectionTips.examples && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <IconSparkles className={cn("w-3.5 h-3.5", theme.icon)} />
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest opacity-80",
                    theme.text,
                  )}
                >
                  Proven Examples
                </span>
              </div>
              <div className="space-y-2">
                {sectionTips.examples.map((example, i) => (
                  <div
                    key={i}
                    className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-300 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-lg p-3 border border-dashed border-neutral-200 dark:border-neutral-700 shadow-sm"
                  >
                    "{example}"
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Verbs for Experience Section */}
          {section === "experience" && (
            <div className="pt-4 border-t border-dashed border-neutral-200/60 dark:border-neutral-700">
              <span
                className={cn(
                  "text-[11px] font-bold uppercase tracking-widest block mb-3",
                  theme.text,
                )}
              >
                Power Action Verbs
              </span>
              <div className="space-y-4">
                {Object.entries(ACTION_VERB_CATEGORIES).map(
                  ([category, verbs]) => (
                    <div key={category}>
                      <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 mb-2 block uppercase tracking-wide opacity-80">
                        {category}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {verbs.map((verb) => (
                          <button
                            key={verb}
                            onClick={() => handleCopyVerb(verb)}
                            className={cn(
                              "px-2.5 py-1 rounded-md text-[10px] font-bold transition-all border shadow-sm",
                              copiedVerb === verb
                                ? "bg-emerald-500 text-white border-emerald-500 transform scale-105"
                                : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:text-neutral-900 dark:hover:text-white hover:shadow-md",
                            )}
                          >
                            {copiedVerb === verb ? (
                              <span className="flex items-center gap-1">
                                <IconCheck className="w-3 h-3" /> Copied
                              </span>
                            ) : (
                              verb
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Compact verb picker with consistent styling
export function ActionVerbPicker({
  onSelect,
}: {
  onSelect: (verb: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 border border-dashed border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all shadow-sm"
      >
        <IconSparkles className="w-3.5 h-3.5" />
        AI Action Verbs
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-neutral-950 rounded-noneshadow-2xl border border-neutral-200 dark:border-neutral-800 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5">
          <div className="max-h-64 overflow-y-auto pr-1 customize-scrollbar space-y-4">
            {Object.entries(ACTION_VERB_CATEGORIES).map(([category, verbs]) => (
              <div key={category}>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">
                  {category}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {verbs.map((verb) => (
                    <button
                      key={verb}
                      onClick={() => {
                        onSelect(verb);
                        setIsOpen(false);
                      }}
                      className="px-2 py-1 text-[10px] font-medium rounded bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-800 hover:text-white dark:hover:bg-neutral-100 dark:hover:text-black transition-colors"
                    >
                      {verb}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
