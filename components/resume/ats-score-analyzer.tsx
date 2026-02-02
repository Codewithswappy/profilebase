"use client";

import { ResumeContent } from "@/lib/schemas/resume";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconChartBar,
  IconBulb,
  IconCode,
  IconRocket,
  IconArrowRight,
} from "@tabler/icons-react";

interface ATSScoreAnalyzerProps {
  content: ResumeContent;
  className?: string;
}

interface ATSCheck {
  id: string;
  label: string;
  status: "pass" | "warning" | "fail";
  message: string;
  weight: number;
  priority: number; // 1 = critical, 2 = important, 3 = nice to have
}

interface ATSAnalysis {
  score: number;
  status: "excellent" | "good" | "needs_improvement" | "poor";
  checks: ATSCheck[];
  suggestions: string[];
  missingKeywords: string[];
  improvementPlan: { action: string; impact: "high" | "medium" | "low" }[];
}

// Action verbs that ATS systems and recruiters love
export const POWER_ACTION_VERBS = [
  // Leadership
  "Led",
  "Directed",
  "Managed",
  "Supervised",
  "Coordinated",
  "Headed",
  "Oversaw",
  "Spearheaded",
  // Achievement
  "Achieved",
  "Exceeded",
  "Improved",
  "Increased",
  "Reduced",
  "Decreased",
  "Surpassed",
  "Maximized",
  "Minimized",
  // Technical
  "Developed",
  "Designed",
  "Built",
  "Implemented",
  "Architected",
  "Engineered",
  "Programmed",
  "Coded",
  "Deployed",
  // Problem Solving
  "Resolved",
  "Solved",
  "Optimized",
  "Streamlined",
  "Transformed",
  "Automated",
  "Debugged",
  "Troubleshot",
  "Refactored",
  // Creation
  "Created",
  "Launched",
  "Initiated",
  "Established",
  "Founded",
  "Introduced",
  "Pioneered",
  "Formulated",
  // Analysis
  "Analyzed",
  "Evaluated",
  "Assessed",
  "Researched",
  "Investigated",
  "Audited",
  "Identified",
  "Discovered",
  // Collaboration
  "Collaborated",
  "Partnered",
  "Facilitated",
  "Mentored",
  "Trained",
  "Coached",
  "Consulted",
  "Advised",
  // Delivery
  "Delivered",
  "Produced",
  "Generated",
  "Executed",
  "Completed",
  "Accomplished",
  "Finalized",
  "Shipped",
];

// Common technical keywords that ATS systems look for
const COMMON_TECH_KEYWORDS = [
  // Languages
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "Go",
  "Rust",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  // Frontend
  "React",
  "Vue",
  "Angular",
  "Next.js",
  "HTML",
  "CSS",
  "Tailwind",
  "SASS",
  "Redux",
  "GraphQL",
  // Backend
  "Node.js",
  "Express",
  "Django",
  "Flask",
  "Spring",
  "Rails",
  "FastAPI",
  "REST",
  "API",
  // Databases
  "SQL",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "DynamoDB",
  "Elasticsearch",
  "Firebase",
  // Cloud & DevOps
  "AWS",
  "Azure",
  "GCP",
  "Docker",
  "Kubernetes",
  "CI/CD",
  "Jenkins",
  "GitHub Actions",
  "Terraform",
  // Testing
  "Jest",
  "Cypress",
  "Selenium",
  "Unit Testing",
  "Integration Testing",
  "TDD",
  "Testing Frameworks",
  // Methodologies
  "Agile",
  "Scrum",
  "Kanban",
  "DevOps",
  "Microservices",
  "System Design",
  // Tools
  "Git",
  "Linux",
  "Jira",
  "Figma",
  "VS Code",
];

// Standard section keywords ATS looks for
export const STANDARD_SECTIONS = [
  "Summary",
  "Professional Summary",
  "Experience",
  "Work Experience",
  "Education",
  "Skills",
  "Technical Skills",
  "Certifications",
  "Projects",
];

// Weak/passive phrases to avoid
const WEAK_PHRASES = [
  "responsible for",
  "helped with",
  "assisted in",
  "worked on",
  "was involved in",
  "participated in",
  "duties included",
  "tasks included",
];

export function ATSScoreAnalyzer({
  content,
  className,
}: ATSScoreAnalyzerProps) {
  const analysis = useMemo(() => analyzeResume(content), [content]);

  const scoreColor =
    analysis.score >= 80
      ? "text-emerald-600 dark:text-emerald-400"
      : analysis.score >= 60
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";

  const scoreBg =
    analysis.score >= 80
      ? "bg-emerald-500"
      : analysis.score >= 60
        ? "bg-amber-500"
        : "bg-red-500";

  const scoreBorder =
    analysis.score >= 80
      ? "border-emerald-500"
      : analysis.score >= 60
        ? "border-amber-500"
        : "border-red-500";

  const statusText = {
    excellent: "Excellent - ATS Ready",
    good: "Good - Minor Improvements",
    needs_improvement: "Needs Improvement",
    poor: "Major Updates Required",
  };

  // Group checks by priority
  const criticalChecks = analysis.checks.filter((c) => c.priority === 1);
  const importantChecks = analysis.checks.filter((c) => c.priority === 2);
  const niceToHaveChecks = analysis.checks.filter((c) => c.priority === 3);

  return (
    <div
      className={cn(
        "space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto",
        className,
      )}
    >
      {/* Score Header Card */}
      <div className="grid md:grid-cols-2 gap-6 items-stretch">
        <div className="border border-dashed border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-neutral-200 dark:bg-neutral-800 transition-colors group-hover:bg-neutral-300 dark:group-hover:bg-neutral-700"></div>
          <div className="pl-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-mono mb-4">
              ATS Compatibility Score
            </h3>
            <div className="flex items-end gap-3 mb-4">
              <div
                className={cn(
                  "text-5xl font-black tracking-tighter leading-none",
                  scoreColor,
                )}
              >
                {analysis.score}%
              </div>
            </div>

            <div className="space-y-3">
              <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-1000 ease-out",
                    scoreBg,
                  )}
                  style={{ width: `${analysis.score}%` }}
                />
              </div>
              <div
                className={cn(
                  "inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider border border-dashed",
                  analysis.status === "excellent" &&
                    "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800",
                  analysis.status === "good" &&
                    "bg-lime-50 dark:bg-lime-950/30 text-lime-700 dark:text-lime-400 border-lime-300 dark:border-lime-800",
                  analysis.status === "needs_improvement" &&
                    "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800",
                  analysis.status === "poor" &&
                    "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800",
                )}
              >
                {statusText[analysis.status]}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Improvement Card */}
        {analysis.improvementPlan.length > 0 && (
          <div className="border border-dashed border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 relative overflow-hidden">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-mono mb-4 flex items-center gap-2">
              <IconRocket className="w-4 h-4" /> Top Priority
            </h3>
            <div className="space-y-3">
              {analysis.improvementPlan.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <span
                    className={cn(
                      "shrink-0 mt-0.5 w-4 h-4 flex items-center justify-center text-[10px] font-bold border rounded-sm transition-colors",
                      item.impact === "high"
                        ? "border-red-500 text-red-600 bg-red-50 dark:bg-red-900/20"
                        : item.impact === "medium"
                          ? "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/20"
                          : "border-neutral-500 text-neutral-600 bg-neutral-50 dark:bg-neutral-900",
                    )}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-snug group-hover:text-black dark:group-hover:text-white transition-colors">
                    {item.action}
                  </p>
                </div>
              ))}
              {analysis.improvementPlan.length > 3 && (
                <p className="text-xs text-neutral-500 pl-7 pt-1 font-mono hover:underline cursor-pointer">
                  + {analysis.improvementPlan.length - 3} more actions below
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Missing Keywords Section */}
      {analysis.missingKeywords.length > 0 && (
        <div className="border border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/10 p-6 relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-400 dark:bg-amber-600"></div>
          <div className="pl-2">
            <h3 className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-500 uppercase tracking-widest font-mono mb-3">
              <IconCode className="w-4 h-4" /> Missing Keywords
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {analysis.missingKeywords.slice(0, 8).map((keyword) => (
                <span
                  key={keyword}
                  className="px-3 py-1 text-xs font-bold font-mono border border-dashed border-amber-400 dark:border-amber-700 text-amber-800 dark:text-amber-400 bg-white dark:bg-neutral-900 hover:scale-105 transition-transform cursor-default"
                >
                  + {keyword}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-500/80 font-mono">
              * Optimization Tip: Seamlessly integrate these relevant keywords
              into your descriptions or skills section.
            </p>
          </div>
        </div>
      )}

      {/* Detailed Analysis Breakdown */}
      <div className="space-y-8">
        {/* Critical Checks */}
        {criticalChecks.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-4 border-b border-dashed border-neutral-200 dark:border-neutral-800 pb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Critical Issues
            </h4>
            <div className="grid gap-3">
              {criticalChecks.map((check) => (
                <CheckItem key={check.id} check={check} />
              ))}
            </div>
          </div>
        )}

        {/* Important Checks */}
        {importantChecks.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-4 border-b border-dashed border-neutral-200 dark:border-neutral-800 pb-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Important Improvements
            </h4>
            <div className="grid gap-3">
              {importantChecks.map((check) => (
                <CheckItem key={check.id} check={check} />
              ))}
            </div>
          </div>
        )}

        {/* Optimizations */}
        {niceToHaveChecks.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-4 border-b border-dashed border-neutral-200 dark:border-neutral-800 pb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Refinements & Optimizations
            </h4>
            <div className="grid gap-3">
              {niceToHaveChecks.map((check) => (
                <CheckItem key={check.id} check={check} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Check Item Component
function CheckItem({ check }: { check: ATSCheck }) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 border border-dashed transition-all duration-200 group bg-white dark:bg-neutral-900 hover:shadow-sm",
        check.status === "pass"
          ? "border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-300 dark:hover:border-emerald-800"
          : check.status === "warning"
            ? "border-amber-200 dark:border-amber-900/50 hover:border-amber-300 dark:hover:border-amber-800"
            : "border-red-200 dark:border-red-900/50 hover:border-red-300 dark:hover:border-red-800",
      )}
    >
      <div
        className={cn(
          "shrink-0 p-1.5 rounded-sm border transition-colors",
          check.status === "pass"
            ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-500"
            : check.status === "warning"
              ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-500"
              : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-600 dark:text-red-500",
        )}
      >
        {check.status === "pass" && (
          <IconCheck className="w-4 h-4" strokeWidth={2.5} />
        )}
        {check.status === "warning" && (
          <IconAlertTriangle className="w-4 h-4" strokeWidth={2.5} />
        )}
        {check.status === "fail" && (
          <IconX className="w-4 h-4" strokeWidth={2.5} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h5 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          {check.label}
          {check.status === "pass" && (
            <span className="text-[10px] font-mono font-normal text-neutral-400 uppercase border border-neutral-200 dark:border-neutral-800 px-1.5 rounded-sm">
              Passed
            </span>
          )}
        </h5>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed font-mono">
          {check.message}
        </p>
      </div>
    </div>
  );
}

// Comprehensive Resume Analysis
function analyzeResume(content: ResumeContent): ATSAnalysis {
  const checks: ATSCheck[] = [];
  const suggestions: string[] = [];
  const improvementPlan: {
    action: string;
    impact: "high" | "medium" | "low";
  }[] = [];

  // Helper: Get all text content
  const allDescriptions = content.experience
    .map((e) => e.description || "")
    .join(" ");
  const allProjectDescriptions = content.projects
    .map((p) => p.description || "")
    .join(" ");
  const allText =
    `${content.summary || ""} ${allDescriptions} ${allProjectDescriptions}`.toLowerCase();
  const plainAllText = allText.replace(/<[^>]*>/g, "");

  // Helper: Get all skills as flat array
  const allSkills = content.skills.flatMap((g) =>
    g.skills.map((s) => s.name.toLowerCase()),
  );

  // ============ CRITICAL CHECKS (Priority 1) ============

  // Check 1: Contact Information Completeness
  const hasEmail = !!content.profile.email?.trim();
  const hasPhone = !!content.profile.phone?.trim();
  const hasLocation = !!content.profile.location?.trim();
  const hasName =
    !!content.profile.firstName?.trim() && !!content.profile.lastName?.trim();
  const contactScore = [hasEmail, hasPhone, hasLocation, hasName].filter(
    Boolean,
  ).length;

  checks.push({
    id: "contact",
    label: "Contact Information",
    status:
      contactScore === 4 ? "pass" : contactScore >= 3 ? "warning" : "fail",
    message:
      contactScore === 4
        ? "Name, email, phone, and location provided"
        : `Missing: ${[!hasName && "name", !hasEmail && "email", !hasPhone && "phone", !hasLocation && "location"].filter(Boolean).join(", ")}`,
    weight: 12,
    priority: 1,
  });

  if (contactScore < 4) {
    improvementPlan.push({
      action: "Complete all contact information fields",
      impact: "high",
    });
  }

  // Check 2: Professional Summary Quality
  const summaryText = (content.summary || "").replace(/<[^>]*>/g, "");
  const summaryLength = summaryText.length;
  const summaryHasYears = /\d+\+?\s*(years?|yrs?)/i.test(summaryText);
  const summaryHasKeywords = allSkills.some((skill) =>
    summaryText.toLowerCase().includes(skill),
  );
  const summaryQuality = [
    summaryLength >= 100,
    summaryLength <= 400,
    summaryHasYears,
    summaryHasKeywords,
  ].filter(Boolean).length;

  checks.push({
    id: "summary",
    label: "Professional Summary",
    status:
      summaryQuality >= 3 ? "pass" : summaryQuality >= 2 ? "warning" : "fail",
    message:
      summaryLength === 0
        ? "Add a professional summary"
        : summaryQuality >= 3
          ? `Well-structured summary (${summaryLength} chars)`
          : `Improve summary: ${[summaryLength < 100 && "too short", summaryLength > 400 && "too long", !summaryHasYears && "add years of experience", !summaryHasKeywords && "include key skills"].filter(Boolean).join(", ")}`,
    weight: 12,
    priority: 1,
  });

  if (summaryLength < 100) {
    improvementPlan.push({
      action: "Expand professional summary to 2-3 impactful sentences",
      impact: "high",
    });
  }

  // Check 3: Work Experience Quantity & Quality
  const expCount = content.experience.length;
  const expWithDescriptions = content.experience.filter(
    (e) => (e.description?.replace(/<[^>]*>/g, "").length || 0) > 50,
  ).length;

  checks.push({
    id: "experience",
    label: "Work Experience",
    status:
      expCount >= 2 && expWithDescriptions >= 2
        ? "pass"
        : expCount >= 1
          ? "warning"
          : "fail",
    message:
      expCount === 0
        ? "Add your work experience"
        : `${expCount} positions (${expWithDescriptions} with detailed descriptions)`,
    weight: 18,
    priority: 1,
  });

  if (expCount === 0) {
    improvementPlan.push({
      action: "Add at least 2 relevant work experiences",
      impact: "high",
    });
  } else if (expWithDescriptions < expCount) {
    improvementPlan.push({
      action: "Add detailed bullet points to all experience entries",
      impact: "high",
    });
  }

  // Check 4: Skills Section Completeness
  const skillsCount = content.skills.reduce(
    (acc, g) => acc + g.skills.length,
    0,
  );
  const skillCategories = content.skills.length;

  checks.push({
    id: "skills",
    label: "Skills Section",
    status:
      skillsCount >= 8 && skillCategories >= 2
        ? "pass"
        : skillsCount >= 4
          ? "warning"
          : "fail",
    message:
      skillsCount === 0
        ? "Add your technical and professional skills"
        : `${skillsCount} skills in ${skillCategories} categories`,
    weight: 14,
    priority: 1,
  });

  if (skillsCount < 8) {
    improvementPlan.push({
      action: `Add ${8 - skillsCount} more relevant skills`,
      impact: "high",
    });
  }

  // ============ IMPORTANT CHECKS (Priority 2) ============

  // Check 5: Action Verbs Usage
  const actionVerbsUsed = POWER_ACTION_VERBS.filter((verb) =>
    new RegExp(`\\b${verb}\\b`, "i").test(plainAllText),
  );
  const uniqueActionVerbs = actionVerbsUsed.length;

  checks.push({
    id: "actionVerbs",
    label: "Action Verbs",
    status:
      uniqueActionVerbs >= 6
        ? "pass"
        : uniqueActionVerbs >= 3
          ? "warning"
          : "fail",
    message:
      uniqueActionVerbs >= 6
        ? `Using ${uniqueActionVerbs} power verbs (${actionVerbsUsed.slice(0, 5).join(", ")}...)`
        : `Only ${uniqueActionVerbs} action verbs. Start bullets with: Led, Developed, Achieved, Implemented`,
    weight: 8,
    priority: 2,
  });

  if (uniqueActionVerbs < 6) {
    suggestions.push("Start each bullet point with a strong action verb");
  }

  // Check 6: Quantifiable Achievements (Enhanced)
  const metricsPatterns = [
    /\d+%/g, // Percentages
    /\$[\d,]+[KMB]?/gi, // Dollar amounts
    /\d+x/g, // Multipliers
    /\d+\+?\s*(users?|clients?|customers?|team|members?|people|engineers?|developers?)/gi,
    /\d+\+?\s*(projects?|apps?|applications?|features?|products?)/gi,
    /(increased?|decreased?|reduced?|improved?|grew?|saved?)\s*(by\s*)?\d+/gi,
    /\d+\s*(million|thousand|hundred)/gi,
    /\d+\s*(hours?|days?|weeks?|months?)\s*(saved?|reduced?|faster)/gi,
  ];

  const metricsFound = metricsPatterns.reduce((count, pattern) => {
    const matches = plainAllText.match(pattern);
    return count + (matches?.length || 0);
  }, 0);

  checks.push({
    id: "metrics",
    label: "Quantifiable Metrics",
    status: metricsFound >= 4 ? "pass" : metricsFound >= 1 ? "warning" : "fail",
    message:
      metricsFound >= 4
        ? `${metricsFound} quantifiable achievements found`
        : metricsFound >= 1
          ? `Only ${metricsFound} metric(s). Add more percentages, dollar amounts, or numbers`
          : "No metrics found. Quantify your achievements with specific numbers",
    weight: 12,
    priority: 2,
  });

  if (metricsFound < 4) {
    improvementPlan.push({
      action: "Add quantifiable metrics (%, $, team sizes) to each role",
      impact: "high",
    });
  }

  // Check 7: Bullet Point Structure
  const bulletPointPattern = /<li>/gi;
  const bulletPoints = allDescriptions.match(bulletPointPattern)?.length || 0;
  const avgBulletsPerExp = expCount > 0 ? bulletPoints / expCount : 0;

  checks.push({
    id: "bulletPoints",
    label: "Bullet Point Structure",
    status:
      avgBulletsPerExp >= 3
        ? "pass"
        : avgBulletsPerExp >= 1
          ? "warning"
          : "fail",
    message:
      avgBulletsPerExp >= 3
        ? `Good average of ${avgBulletsPerExp.toFixed(1)} bullets per role`
        : expCount > 0
          ? `Average ${avgBulletsPerExp.toFixed(1)} bullets/role. Aim for 3-5 per position`
          : "Use bullet points to list achievements",
    weight: 8,
    priority: 2,
  });

  // Check 8: Weak Phrases Detection
  const weakPhrasesFound = WEAK_PHRASES.filter((phrase) =>
    plainAllText.includes(phrase.toLowerCase()),
  );

  checks.push({
    id: "weakPhrases",
    label: "Language Quality",
    status:
      weakPhrasesFound.length === 0
        ? "pass"
        : weakPhrasesFound.length <= 2
          ? "warning"
          : "fail",
    message:
      weakPhrasesFound.length === 0
        ? "No weak phrases detected"
        : `Found passive phrases: "${weakPhrasesFound.slice(0, 2).join('", "')}"`,
    weight: 6,
    priority: 2,
  });

  if (weakPhrasesFound.length > 0) {
    suggestions.push(`Replace "${weakPhrasesFound[0]}" with action verbs`);
  }

  // Check 9: Description Depth
  const descriptionLengths = content.experience.map(
    (e) => e.description?.replace(/<[^>]*>/g, "").length || 0,
  );
  const avgDescLength =
    descriptionLengths.length > 0
      ? descriptionLengths.reduce((a, b) => a + b, 0) /
        descriptionLengths.length
      : 0;

  checks.push({
    id: "descriptionDepth",
    label: "Description Depth",
    status:
      avgDescLength >= 200 ? "pass" : avgDescLength >= 100 ? "warning" : "fail",
    message:
      avgDescLength >= 200
        ? "Detailed descriptions across roles"
        : avgDescLength >= 100
          ? "Add more detail to your job descriptions"
          : "Expand descriptions with specific achievements",
    weight: 8,
    priority: 2,
  });

  // Check 10: Date Consistency
  const datesProvided = content.experience.filter((e) => e.startDate).length;
  const datesComplete = datesProvided === expCount;

  checks.push({
    id: "dates",
    label: "Date Consistency",
    status:
      datesComplete && expCount > 0
        ? "pass"
        : datesProvided > 0
          ? "warning"
          : "fail",
    message:
      datesComplete && expCount > 0
        ? "All positions have dates"
        : datesProvided > 0
          ? `${expCount - datesProvided} position(s) missing dates`
          : "Add dates to your work experience",
    weight: 6,
    priority: 2,
  });

  // ============ NICE TO HAVE CHECKS (Priority 3) ============

  // Check 11: Education
  const hasEducation = content.education.length > 0;
  const educationWithDates = content.education.filter((e) => e.endDate).length;

  checks.push({
    id: "education",
    label: "Education",
    status:
      hasEducation && educationWithDates > 0
        ? "pass"
        : hasEducation
          ? "warning"
          : "warning",
    message: hasEducation
      ? `${content.education.length} education entries`
      : "Consider adding educational background",
    weight: 6,
    priority: 3,
  });

  // Check 12: Professional Links
  const hasLinkedIn = !!content.profile.linkedin?.trim();
  const hasGitHub = !!content.profile.github?.trim();
  const hasWebsite = !!content.profile.website?.trim();
  const linksCount = [hasLinkedIn, hasGitHub, hasWebsite].filter(
    Boolean,
  ).length;

  checks.push({
    id: "links",
    label: "Professional Links",
    status: linksCount >= 2 ? "pass" : linksCount === 1 ? "warning" : "warning",
    message:
      linksCount >= 2
        ? `${linksCount} professional links included`
        : linksCount === 1
          ? "Add more professional links"
          : "Add LinkedIn and/or portfolio links",
    weight: 4,
    priority: 3,
  });

  // Check 13: Certifications
  const hasCerts = content.certifications && content.certifications.length > 0;
  checks.push({
    id: "certifications",
    label: "Certifications",
    status: hasCerts ? "pass" : "warning",
    message: hasCerts
      ? `${content.certifications?.length} certifications listed`
      : "Consider adding relevant certifications",
    weight: 4,
    priority: 3,
  });

  // Check 14: Projects
  const hasProjects = content.projects && content.projects.length > 0;
  const projectsWithLinks =
    content.projects?.filter((p) => p.url || p.repoUrl).length || 0;

  checks.push({
    id: "projects",
    label: "Projects",
    status:
      hasProjects && projectsWithLinks > 0
        ? "pass"
        : hasProjects
          ? "warning"
          : "warning",
    message: hasProjects
      ? `${content.projects.length} projects (${projectsWithLinks} with links)`
      : "Consider adding relevant projects",
    weight: 4,
    priority: 3,
  });

  // Check 15: Headline
  const hasHeadline = !!content.profile.headline?.trim();
  checks.push({
    id: "headline",
    label: "Professional Headline",
    status: hasHeadline ? "pass" : "warning",
    message: hasHeadline
      ? "Professional headline present"
      : "Add a professional headline/title",
    weight: 4,
    priority: 3,
  });

  // ============ KEYWORD GAP ANALYSIS ============
  const missingKeywords: string[] = [];

  // Check which common tech keywords are missing from the resume
  COMMON_TECH_KEYWORDS.forEach((keyword) => {
    const lowerKeyword = keyword.toLowerCase();
    const inSkills = allSkills.some(
      (s) => s.includes(lowerKeyword) || lowerKeyword.includes(s),
    );
    const inText = plainAllText.includes(lowerKeyword);

    if (!inSkills && !inText) {
      // Check if it's a commonly expected keyword based on what IS on the resume
      const isRelevant = checkKeywordRelevance(
        lowerKeyword,
        allSkills,
        plainAllText,
      );
      if (isRelevant) {
        missingKeywords.push(keyword);
      }
    }
  });

  // ============ CALCULATE SCORE ============
  let totalWeight = 0;
  let earnedWeight = 0;

  checks.forEach((check) => {
    totalWeight += check.weight;
    if (check.status === "pass") {
      earnedWeight += check.weight;
    } else if (check.status === "warning") {
      earnedWeight += check.weight * 0.5;
    }
  });

  const score = Math.round((earnedWeight / totalWeight) * 100);

  // Determine status
  let status: ATSAnalysis["status"];
  if (score >= 85) status = "excellent";
  else if (score >= 70) status = "good";
  else if (score >= 50) status = "needs_improvement";
  else status = "poor";

  // Sort improvement plan by impact
  improvementPlan.sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 };
    return impactOrder[a.impact] - impactOrder[b.impact];
  });

  return {
    score,
    status,
    checks,
    suggestions,
    missingKeywords: missingKeywords.slice(0, 6),
    improvementPlan,
  };
}

// Helper: Check if a keyword is relevant based on existing resume content
function checkKeywordRelevance(
  keyword: string,
  skills: string[],
  text: string,
): boolean {
  // Define keyword relationships
  const keywordGroups: Record<string, string[]> = {
    docker: [
      "kubernetes",
      "containerization",
      "devops",
      "aws",
      "cloud",
      "deployment",
    ],
    kubernetes: ["docker", "containerization", "devops", "aws", "cloud", "k8s"],
    "ci/cd": [
      "jenkins",
      "github actions",
      "devops",
      "automation",
      "deployment",
      "docker",
    ],
    "testing frameworks": [
      "jest",
      "cypress",
      "unit testing",
      "tdd",
      "testing",
      "qa",
    ],
    jest: ["react", "javascript", "typescript", "testing", "node"],
    cypress: ["testing", "e2e", "react", "frontend", "javascript"],
    typescript: ["javascript", "react", "node", "frontend", "angular"],
    graphql: ["react", "api", "apollo", "node", "frontend"],
    redis: ["database", "caching", "node", "backend", "performance"],
    postgresql: ["database", "sql", "backend", "node", "python"],
    mongodb: ["database", "nosql", "node", "backend", "javascript"],
    aws: [
      "cloud",
      "s3",
      "ec2",
      "lambda",
      "backend",
      "devops",
      "infrastructure",
    ],
    "next.js": ["react", "javascript", "typescript", "frontend", "vercel"],
    tailwind: ["css", "frontend", "react", "ui", "styling"],
  };

  const lowerKeyword = keyword.toLowerCase();
  const relatedTerms = keywordGroups[lowerKeyword] || [];

  // Check if any related term exists in the resume
  const hasRelatedContent = relatedTerms.some(
    (term) => skills.some((s) => s.includes(term)) || text.includes(term),
  );

  return hasRelatedContent;
}

// Export for use in other components
export function getATSScore(content: ResumeContent): number {
  return analyzeResume(content).score;
}

// Export full analysis for detailed usage
export function getATSAnalysis(content: ResumeContent): ATSAnalysis {
  return analyzeResume(content);
}
