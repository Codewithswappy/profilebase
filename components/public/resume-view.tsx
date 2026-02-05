"use client";

import { useRouter } from "next/navigation";
import { PublicProfileData } from "@/lib/actions/public";
import { aiEvaluateResume } from "@/lib/actions/ai";
import { trackInteraction } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import {
  IconX,
  IconDownload,
  IconScan,
  IconLoader2,
  IconCheck,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconWorld,
  IconLink,
  IconAward,
  IconBriefcase,
  IconCode,
  IconMail,
  IconMapPin,
  IconPhone,
  IconSchool,
  IconCertificate,
  IconCalendar,
  IconBuilding,
  IconUser,
} from "@tabler/icons-react";
import { useState, useEffect, useRef } from "react";
import { MinimalTemplate } from "@/components/resume/renderer/minimal-template";
import { ModernTemplate } from "@/components/resume/renderer/modern-template";
import { toast } from "sonner";

interface ResumeViewProps {
  data: PublicProfileData;
  onClose: () => void;
}

// Ensure strict Tabler Icon usage
const getSocialIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case "github":
      return <IconBrandGithub className="w-3.5 h-3.5" />;
    case "linkedin":
      return <IconBrandLinkedin className="w-3.5 h-3.5" />;
    case "twitter":
    case "x":
      return <IconBrandTwitter className="w-3.5 h-3.5" />;
    case "website":
    case "portfolio":
      return <IconWorld className="w-3.5 h-3.5" />;
    default:
      return <IconLink className="w-3.5 h-3.5" />;
  }
};

const getSocialLabel = (platform: string) => {
  switch (platform.toLowerCase()) {
    case "github":
      return "GitHub";
    case "linkedin":
      return "LinkedIn";
    case "twitter":
    case "x":
      return "Twitter";
    default:
      return "Portfolio";
  }
};

const formatBullets = (text: string | null) => {
  if (!text) return null;
  const lines = text.split("\n").filter((t) => t.trim());
  if (lines.length > 0) {
    return (
      <ul className="list-disc list-outside ml-3 space-y-1 text-sm text-neutral-700">
        {lines.map((item, idx) => (
          <li key={idx} className="pl-1 leading-relaxed">
            {item.trim()}
          </li>
        ))}
      </ul>
    );
  }
  return <p className="text-sm text-neutral-700 leading-relaxed">{text}</p>;
};

export function ResumeView({ data, onClose }: ResumeViewProps) {
  const router = useRouter(); // Refresh data on mount
  const { profile, experiences, projects, profileSettings, primaryResume } =
    data;
  const displayName = data.userName || profile.slug;
  const [isScanning, setIsScanning] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [atsScore, setAtsScore] = useState<{
    score: number;
    status: string;
    feedback: string[];
    summarySuggestion?: string;
    isFallback?: boolean;
    missingKeywords?: string[];
    improvementPlan?: { action: string; impact: "high" | "medium" | "low" }[];
    checks?: {
      label: string;
      status: "pass" | "warning" | "fail";
      message: string;
    }[];
  } | null>(null);

  // Track Resume View on mount
  const viewTracked = useRef(false);
  useEffect(() => {
    if (!viewTracked.current) {
      trackInteraction(profile.slug, "resume", "view");
      router.refresh(); // Force refresh to get latest portfolio data
      viewTracked.current = true;
    }
  }, [profile.slug, router]);

  const handleDownload = async () => {
    // Track download first
    trackInteraction(profile.slug, "resume", "download");

    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.getElementById("resume-content-view");

      if (!element) {
        toast.error("Resume content not found");
        return;
      }

      // Clone the element to avoid manipulating the visible DOM
      const clone = element.cloneNode(true) as HTMLElement;

      // Create a temporary container for the clone
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.top = "-9999px";
      container.style.left = "0";
      container.style.width = "210mm"; // Exact A4 width
      container.style.minHeight = "297mm"; // A4 Height
      container.style.background = "white";
      container.style.margin = "0";
      container.style.padding = "0"; // No padding in container

      // Ensure the clone fills the container and has no transforms
      clone.style.transform = "none";
      clone.style.margin = "0";
      clone.style.padding = "0";
      clone.style.width = "100%";
      clone.style.height = "100%";

      container.appendChild(clone);
      document.body.appendChild(container);

      const opt = {
        margin: [10, 10, 10, 10], // Increased side margins slightly
        filename: `${displayName.replace(/\s+/g, "_")}_resume.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0, windowWidth: 800 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      };

      await html2pdf()
        .set(opt as any)
        .from(clone)
        .save();

      document.body.removeChild(container);
      toast.success("Resume downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF");
    }
  };

  // Enhanced ATS Analysis
  const calculateATS = async () => {
    setIsScanning(true);
    setShowFeedback(false);

    try {
      const res = await aiEvaluateResume(data);
      if (res.success && res.data) {
        setTimeout(() => {
          setAtsScore({
            score: res.data!.score,
            status: res.data!.status,
            feedback: res.data!.feedback,
            summarySuggestion: res.data!.summarySuggestion,
            missingKeywords: res.data!.missingKeywords,
            isFallback: false,
          });
          setIsScanning(false);
          setShowFeedback(true);
        }, 2000);
        return;
      }
    } catch (e) {
      console.error("AI Scan Integrity Failed:", e);
    }

    // Enhanced Fallback Analysis
    setTimeout(() => {
      const fullText = JSON.stringify(data).toLowerCase();
      const checks: {
        label: string;
        status: "pass" | "warning" | "fail";
        message: string;
      }[] = [];
      const improvementPlan: {
        action: string;
        impact: "high" | "medium" | "low";
      }[] = [];
      let score = 0;
      let totalWeight = 0;

      // Power action verbs
      const POWER_VERBS = [
        "led",
        "directed",
        "managed",
        "developed",
        "designed",
        "built",
        "implemented",
        "architected",
        "achieved",
        "exceeded",
        "improved",
        "increased",
        "reduced",
        "optimized",
        "streamlined",
        "automated",
        "created",
        "launched",
        "delivered",
        "resolved",
        "analyzed",
        "collaborated",
        "mentored",
        "established",
      ];

      // Common tech keywords with relationships
      const TECH_KEYWORDS: Record<string, string[]> = {
        docker: ["kubernetes", "devops", "aws", "cloud", "containerization"],
        kubernetes: ["docker", "k8s", "devops", "aws", "cloud"],
        "ci/cd": ["jenkins", "github actions", "devops", "automation"],
        testing: ["jest", "cypress", "tdd", "unit test", "qa"],
        typescript: ["javascript", "react", "node", "frontend"],
        react: ["javascript", "frontend", "next.js", "redux"],
        node: ["javascript", "backend", "api", "express"],
        aws: ["cloud", "s3", "ec2", "lambda", "infrastructure"],
        python: ["django", "flask", "ml", "data"],
        sql: ["database", "postgresql", "mysql", "backend"],
        graphql: ["api", "apollo", "react"],
        redis: ["caching", "database", "performance"],
        mongodb: ["nosql", "database", "node"],
      };

      // Weak phrases to avoid
      const WEAK_PHRASES = [
        "responsible for",
        "helped with",
        "assisted in",
        "worked on",
        "was involved in",
        "participated in",
        "duties included",
      ];

      // Detection for Lorem Ipsum / Empty content
      if (fullText.includes("lorem") || fullText.length < 200) {
        setAtsScore({
          score: 0,
          status: "Invalid Content",
          feedback: [
            "Placeholder or insufficient content detected. Replace with real content.",
          ],
          missingKeywords: ["Real Experience", "Real Skills", "Achievements"],
          isFallback: true,
        });
        setIsScanning(false);
        setShowFeedback(true);
        return;
      }

      // ============ CHECK 1: Profile Completeness ============
      const profileWeight = 15;
      totalWeight += profileWeight;
      const hasName = !!displayName;
      const hasHeadline = !!profile.headline;
      const hasLocation = !!profile.location;
      const profileScore = [hasName, hasHeadline, hasLocation].filter(
        Boolean,
      ).length;

      if (profileScore === 3) {
        score += profileWeight;
        checks.push({
          label: "Profile Info",
          status: "pass",
          message: "Name, headline, and location complete",
        });
      } else if (profileScore >= 2) {
        score += profileWeight * 0.5;
        checks.push({
          label: "Profile Info",
          status: "warning",
          message: `Missing: ${[!hasHeadline && "headline", !hasLocation && "location"].filter(Boolean).join(", ")}`,
        });
        improvementPlan.push({
          action: "Complete your profile with headline and location",
          impact: "high",
        });
      } else {
        checks.push({
          label: "Profile Info",
          status: "fail",
          message: "Profile information incomplete",
        });
        improvementPlan.push({
          action: "Add professional headline and location",
          impact: "high",
        });
      }

      // ============ CHECK 2: Professional Summary ============
      const summaryWeight = 15;
      totalWeight += summaryWeight;
      const summaryLength = profile.summary?.length || 0;
      const summaryHasYears = /\d+\+?\s*(years?|yrs?)/i.test(
        profile.summary || "",
      );

      if (summaryLength >= 100 && summaryHasYears) {
        score += summaryWeight;
        checks.push({
          label: "Summary",
          status: "pass",
          message: `Well-structured summary (${summaryLength} chars)`,
        });
      } else if (summaryLength >= 50) {
        score += summaryWeight * 0.5;
        checks.push({
          label: "Summary",
          status: "warning",
          message: "Summary could be more detailed",
        });
        if (!summaryHasYears)
          improvementPlan.push({
            action: "Add years of experience to summary",
            impact: "medium",
          });
      } else {
        checks.push({
          label: "Summary",
          status: "fail",
          message: "Add a professional summary",
        });
        improvementPlan.push({
          action: "Write a 2-3 sentence professional summary",
          impact: "high",
        });
      }

      // ============ CHECK 3: Work Experience ============
      const expWeight = 20;
      totalWeight += expWeight;
      const expCount = experiences.length;
      const expWithDescriptions = experiences.filter(
        (e) => e.description && e.description.length > 50,
      ).length;

      if (expCount >= 2 && expWithDescriptions >= 2) {
        score += expWeight;
        checks.push({
          label: "Experience",
          status: "pass",
          message: `${expCount} positions with detailed descriptions`,
        });
      } else if (expCount >= 1) {
        score += expWeight * 0.5;
        checks.push({
          label: "Experience",
          status: "warning",
          message: `${expCount} position(s), ${expWithDescriptions} with details`,
        });
        if (expWithDescriptions < expCount) {
          improvementPlan.push({
            action: "Add detailed bullet points to all experience entries",
            impact: "high",
          });
        }
      } else {
        checks.push({
          label: "Experience",
          status: "fail",
          message: "Add work experience",
        });
        improvementPlan.push({
          action: "Add at least 2 relevant work experiences",
          impact: "high",
        });
      }

      // ============ CHECK 4: Action Verbs ============
      const verbWeight = 10;
      totalWeight += verbWeight;
      const verbsUsed = POWER_VERBS.filter((verb) => fullText.includes(verb));
      const uniqueVerbs = verbsUsed.length;

      if (uniqueVerbs >= 6) {
        score += verbWeight;
        checks.push({
          label: "Action Verbs",
          status: "pass",
          message: `Using ${uniqueVerbs} power verbs`,
        });
      } else if (uniqueVerbs >= 3) {
        score += verbWeight * 0.5;
        checks.push({
          label: "Action Verbs",
          status: "warning",
          message: `Only ${uniqueVerbs} action verbs found`,
        });
        improvementPlan.push({
          action:
            "Start bullet points with action verbs (Led, Built, Achieved)",
          impact: "medium",
        });
      } else {
        checks.push({
          label: "Action Verbs",
          status: "fail",
          message: "Use more action verbs",
        });
        improvementPlan.push({
          action: "Replace passive language with action verbs",
          impact: "high",
        });
      }

      // ============ CHECK 5: Quantifiable Metrics ============
      const metricsWeight = 12;
      totalWeight += metricsWeight;
      const metricsPatterns = [
        /\d+%/g,
        /\$[\d,]+/g,
        /\d+x/g,
        /\d+\+?\s*(users?|clients?|customers?|team|members?)/gi,
        /\d+\+?\s*(projects?|apps?|features?)/gi,
        /(increased?|decreased?|reduced?|improved?)\s*(by\s*)?\d+/gi,
      ];
      const metricsFound = metricsPatterns.reduce((count, pattern) => {
        const matches = fullText.match(pattern);
        return count + (matches?.length || 0);
      }, 0);

      if (metricsFound >= 4) {
        score += metricsWeight;
        checks.push({
          label: "Metrics",
          status: "pass",
          message: `${metricsFound} quantifiable achievements`,
        });
      } else if (metricsFound >= 1) {
        score += metricsWeight * 0.5;
        checks.push({
          label: "Metrics",
          status: "warning",
          message: `Only ${metricsFound} metric(s) found`,
        });
        improvementPlan.push({
          action: "Add metrics: %, $, team sizes, user counts",
          impact: "high",
        });
      } else {
        checks.push({
          label: "Metrics",
          status: "fail",
          message: "No quantifiable achievements found",
        });
        improvementPlan.push({
          action: "Quantify achievements with specific numbers",
          impact: "high",
        });
      }

      // ============ CHECK 6: Projects ============
      const projectWeight = 10;
      totalWeight += projectWeight;
      const projectCount = projects.length;
      const projectsWithTech = projects.filter(
        (p) => p.techStack && p.techStack.length > 0,
      ).length;

      if (projectCount >= 2 && projectsWithTech >= 2) {
        score += projectWeight;
        checks.push({
          label: "Projects",
          status: "pass",
          message: `${projectCount} projects with tech stacks`,
        });
      } else if (projectCount >= 1) {
        score += projectWeight * 0.5;
        checks.push({
          label: "Projects",
          status: "warning",
          message: `${projectCount} project(s)`,
        });
      } else {
        checks.push({
          label: "Projects",
          status: "fail",
          message: "Add personal/work projects",
        });
        improvementPlan.push({
          action: "Add 2-3 relevant projects with descriptions",
          impact: "medium",
        });
      }

      // ============ CHECK 7: Technical Skills ============
      const skillWeight = 15;
      totalWeight += skillWeight;
      const allSkills = new Set<string>();
      projects.forEach((p) =>
        p.techStack?.forEach((t) => allSkills.add(t.toLowerCase())),
      );
      experiences.forEach((e) =>
        e.skills?.forEach((s) => allSkills.add(s.toLowerCase())),
      );
      const skillsCount = allSkills.size;

      if (skillsCount >= 8) {
        score += skillWeight;
        checks.push({
          label: "Skills",
          status: "pass",
          message: `${skillsCount} technical skills`,
        });
      } else if (skillsCount >= 4) {
        score += skillWeight * 0.5;
        checks.push({
          label: "Skills",
          status: "warning",
          message: `${skillsCount} skills (aim for 8+)`,
        });
        improvementPlan.push({
          action: "Add more relevant technical skills",
          impact: "medium",
        });
      } else {
        checks.push({
          label: "Skills",
          status: "fail",
          message: "Add technical skills",
        });
        improvementPlan.push({
          action: "Add 8-15 relevant technical skills",
          impact: "high",
        });
      }

      // ============ CHECK 8: Weak Phrases ============
      const languageWeight = 5;
      totalWeight += languageWeight;
      const weakFound = WEAK_PHRASES.filter((phrase) =>
        fullText.includes(phrase),
      );

      if (weakFound.length === 0) {
        score += languageWeight;
        checks.push({
          label: "Language",
          status: "pass",
          message: "No weak phrases detected",
        });
      } else {
        score += languageWeight * 0.3;
        checks.push({
          label: "Language",
          status: "warning",
          message: `Found: "${weakFound[0]}"`,
        });
        improvementPlan.push({
          action: `Replace "${weakFound[0]}" with action verbs`,
          impact: "low",
        });
      }

      // ============ MISSING KEYWORDS DETECTION ============
      const missingKeywords: string[] = [];
      const skillsLower = Array.from(allSkills);

      Object.entries(TECH_KEYWORDS).forEach(([keyword, relatedTerms]) => {
        const keywordPresent = fullText.includes(keyword);
        if (!keywordPresent) {
          // Check if related terms exist (meaning this keyword would be relevant)
          const hasRelated = relatedTerms.some(
            (term) =>
              fullText.includes(term) ||
              skillsLower.some((s) => s.includes(term)),
          );
          if (hasRelated && missingKeywords.length < 5) {
            missingKeywords.push(keyword.toUpperCase());
          }
        }
      });

      // Add generic missing keywords if we don't have enough
      const genericMissing = [
        "Docker",
        "CI/CD",
        "Testing Frameworks",
        "Cloud Services",
        "Agile",
      ];
      genericMissing.forEach((kw) => {
        if (
          !fullText.includes(kw.toLowerCase()) &&
          missingKeywords.length < 5
        ) {
          // Only add if not already present in some form
          if (
            !missingKeywords.some((m) => m.toLowerCase() === kw.toLowerCase())
          ) {
            missingKeywords.push(kw);
          }
        }
      });

      // Calculate final score
      const finalScore = Math.round((score / totalWeight) * 100);

      // Determine status
      let status: string;
      if (finalScore >= 85) status = "Excellent";
      else if (finalScore >= 70) status = "Good";
      else if (finalScore >= 50) status = "Needs Improvement";
      else status = "Poor";

      // Generate feedback from failed checks
      const feedback = checks
        .filter((c) => c.status !== "pass")
        .map((c) => `${c.label}: ${c.message}`)
        .slice(0, 5);

      // Sort improvement plan by impact
      improvementPlan.sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.impact] - order[b.impact];
      });

      setAtsScore({
        score: finalScore,
        status,
        feedback:
          feedback.length > 0
            ? feedback
            : [
                "Your resume looks good! Consider adding more quantifiable achievements.",
              ],
        missingKeywords: missingKeywords.slice(0, 5),
        improvementPlan: improvementPlan.slice(0, 5),
        checks,
        isFallback: true,
      });
      setIsScanning(false);
      setShowFeedback(true);
    }, 2500);
  };

  const renderResumeContent = () => {
    if (primaryResume) {
      if (primaryResume.templateId === "minimal") {
        return <MinimalTemplate content={primaryResume.data} />;
      }
      return <ModernTemplate content={primaryResume.data} />;
    }

    // Fallback Legacy Layout with Dashed styles
    // --- DEFAULT/FALLBACK RESUME LAYOUT (EDIT HERE) ---
    // This layout is shown when no custom template is selected.
    return (
      <div className="w-full max-w-[210mm] min-h-[297mm] h-fit bg-white text-black shadow-xl print:shadow-none mx-auto p-[8mm] flex flex-col gap-6 print:p-0 font-sans relative">
        {/* RESUME HEADER */}
        <header className="border-b border-dashed border-neutral-300 pb-6 mb-2">
          <h1 className="text-4xl font-extrabold uppercase tracking-tight text-neutral-900 mb-1">
            {displayName}
          </h1>
          {profile.headline && (
            <p className="text-sm font-medium text-neutral-600 uppercase tracking-widest mb-4 font-mono">
              {profile.headline}
            </p>
          )}

          {/* Contact Row */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-neutral-600 font-mono">
            {profile.location && (
              <div className="flex items-center gap-1.5">
                <IconMapPin className="w-3.5 h-3.5 text-neutral-400" />
                <span>{profile.location}</span>
              </div>
            )}
            {data.email && profileSettings.showEmail && (
              <a
                href={`mailto:${data.email}`}
                className="flex items-center gap-1.5 hover:text-black transition-colors"
              >
                <IconMail className="w-3.5 h-3.5 text-neutral-400" />
                <span>Email</span>
              </a>
            )}
            {/* Socials */}
            {data.socialLinks.slice(0, 4).map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-black transition-colors"
              >
                <span className="text-neutral-400">
                  {getSocialIcon(link.platform)}
                </span>
                <span>{getSocialLabel(link.platform)}</span>
              </a>
            ))}
          </div>
        </header>

        {/* SUMMARY */}
        {profileSettings.showSummary && profile.summary && (
          <section>
            <h3 className="flex items-center gap-2 text-lg font-bold uppercase tracking-widest text-neutral-900 border-b border-dashed border-neutral-300 pb-1 mb-2 font-mono">
              <IconUser className="w-3.5 h-3.5 text-neutral-400" /> Summary
            </h3>
            <p className="text-sm leading-relaxed text-neutral-700 text-justify">
              {profile.summary}
            </p>
          </section>
        )}

        {/* EXPERIENCE */}
        {profileSettings.showExperience && experiences.length > 0 && (
          <section>
            <h3 className="flex items-center gap-2 text-lg font-bold uppercase tracking-widest text-neutral-900 border-b border-dashed border-neutral-300 pb-1 mb-3 font-mono">
              <IconBriefcase className="w-3.5 h-3.5 text-neutral-400" />{" "}
              Experience
            </h3>
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="font-bold text-sm text-neutral-900">
                      {exp.position}
                    </h4>
                    <span className="text-xs font-semibold text-neutral-500 font-mono">
                      {new Date(exp.startDate).getFullYear()} –{" "}
                      {exp.endDate
                        ? new Date(exp.endDate).getFullYear()
                        : "Present"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-600 mb-1.5 font-mono">
                    <span className="font-semibold">{exp.company}</span>
                    <span>•</span>
                    <span>{exp.location}</span>
                  </div>
                  {formatBullets(exp.description)}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PROJECTS */}
        {profileSettings.showProjects && projects.length > 0 && (
          <section>
            <h3 className="flex items-center gap-2 text-lg font-bold uppercase tracking-widest text-neutral-900 border-b border-dashed border-neutral-300 pb-1 mb-3 font-mono">
              <IconCode className="w-3.5 h-3.5 text-neutral-400" /> Projects
            </h3>
            <div className="space-y-4">
              {projects.slice(0, 5).map((proj) => (
                <div key={proj.id} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                      {proj.title}
                    </h4>
                  </div>
                  {proj.techStack && (
                    <p className="text-[10px] uppercase tracking-wide text-neutral-500 mb-2 font-mono border-b border-neutral-100 pb-1">
                      {(() => {
                        const normalizedMap = new Map<string, string>();
                        proj.techStack.forEach((t) => {
                          if (!t) return;
                          const key = t.toLowerCase().replace(/[\s\.\-]/g, "");
                          if (!normalizedMap.has(key))
                            normalizedMap.set(key, t);
                        });
                        return Array.from(normalizedMap.values()).join(" • ");
                      })()}
                    </p>
                  )}
                  {formatBullets(proj.description)}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SKILLS */}
        {profileSettings.showTechStack && (
          <section>
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-900 border-b border-dashed border-neutral-300 pb-1 mb-3 font-mono">
              <IconCode className="w-3.5 h-3.5 text-neutral-400" /> Technical
              Skills
            </h3>
            <div className="text-xs text-neutral-700 leading-relaxed font-mono">
              {(() => {
                // Normalize and deduplicate skills
                const normalizedSkills = new Map<string, string>();

                const addSkill = (s: string) => {
                  if (!s) return;
                  // distinct key: lowercase, no spaces/dots/dashes
                  const key = s.toLowerCase().replace(/[\s\.\-]/g, "");
                  // If key doesn't exist, or if the current 's' looks "better" (e.g. has casing), update it?
                  // Actually, usually the first one found wins, or we prioritize the one with proper casing?
                  // Let's just keep the first one encountered, but checking against normalized key.
                  if (!normalizedSkills.has(key)) {
                    normalizedSkills.set(key, s);
                  }
                };

                projects.forEach((p) =>
                  p.techStack?.forEach((t) => addSkill(t)),
                );
                experiences.forEach((e) =>
                  e.skills?.forEach((s) => addSkill(s)),
                );

                const distinctSkills = Array.from(normalizedSkills.values());

                return distinctSkills.length > 0
                  ? distinctSkills.join(" • ")
                  : "No specific skills listed.";
              })()}
            </div>
          </section>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 w-full h-full bg-neutral-100 dark:bg-neutral-900 flex flex-col print:bg-white print:h-auto print:static print:block">
      {/* SCANNING OVERLAY */}
      {isScanning && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none print:hidden overflow-hidden bg-black/50 backdrop-blur-sm">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-size-[40px_40px] perspective-[1000px] transform-3d animate-[gridMove_20s_linear_infinite]" />
          <div className="absolute top-0 left-0 right-0 h-[5px] bg-emerald-500 shadow-[0_0_20px_#10b981] animate-[scanLaser_2s_ease-in-out_infinite]" />
          <div className="bg-black/80 text-emerald-400 px-6 py-2 rounded-full border border-emerald-500/50 font-mono text-xs tracking-widest animate-pulse z-50">
            ANALYZING RESUME...
          </div>
          <style jsx>{`
            @keyframes scanLaser {
              0%,
              100% {
                top: 0%;
                opacity: 0;
              }
              10% {
                opacity: 1;
              }
              90% {
                opacity: 1;
              }
            }
          `}</style>
        </div>
      )}

      {/* FEEDBACK SIDEBAR */}
      <div
        className={cn(
          "print-hide fixed top-0 right-0 z-[70] h-full w-full md:w-[420px] bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] border-l border-dashed border-neutral-300 dark:border-neutral-700",
          showFeedback && atsScore ? "translate-x-0" : "translate-x-full",
        )}
      >
        {atsScore && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-dashed border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2 tracking-tight font-mono uppercase">
                  <IconScan className="w-5 h-5 text-emerald-500" />
                  ATS Analysis
                </h3>
                {(atsScore as any).isFallback && (
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                    Basic Mode (Simulation)
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowFeedback(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent">
              {/* Score Display (Circle) */}
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-neutral-200 dark:text-neutral-800"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={440}
                      strokeDashoffset={440 - (440 * atsScore.score) / 100}
                      className={cn(
                        "transition-all duration-1000 ease-out",
                        atsScore.score >= 80
                          ? "text-emerald-500"
                          : atsScore.score >= 50
                            ? "text-amber-500"
                            : "text-red-500",
                      )}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                    <span className="text-4xl font-black text-neutral-900 dark:text-white">
                      {atsScore.score}
                    </span>
                    <span className="text-xs uppercase tracking-widest text-neutral-500">
                      Score
                    </span>
                  </div>
                </div>
                <div className="mt-4 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700 font-mono text-neutral-700 dark:text-neutral-300">
                  Status:{" "}
                  <span
                    className={cn(
                      atsScore.score >= 80
                        ? "text-emerald-600 dark:text-emerald-500"
                        : atsScore.score >= 50
                          ? "text-amber-600 dark:text-amber-500"
                          : "text-red-600 dark:text-red-500",
                    )}
                  >
                    {atsScore.status}
                  </span>
                </div>
              </div>

              {/* Missing Keywords (Amber Style) */}
              {atsScore.missingKeywords &&
                atsScore.missingKeywords.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest text-xs mb-4 font-mono">
                      <IconCode className="w-4 h-4" /> Missing Keywords
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {atsScore.missingKeywords.map((kw: string, i: number) => (
                        <div
                          key={i}
                          className="px-4 py-2 rounded-full border border-dashed border-amber-300 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-500 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.1)] font-mono"
                        >
                          <span>+</span> {kw}
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-3 leading-relaxed font-mono">
                      * These keywords are commonly found in job descriptions
                      for your profile type. Adding them can improve your
                      visibility.
                    </p>
                  </div>
                )}

              {/* Improvement Plan with Impact Levels */}
              {atsScore.improvementPlan &&
                atsScore.improvementPlan.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-widest text-xs mb-4 font-mono">
                      <IconBriefcase className="w-4 h-4" /> Improvement Plan
                    </h4>
                    <ol className="space-y-3">
                      {atsScore.improvementPlan.map(
                        (
                          item: { action: string; impact: string },
                          i: number,
                        ) => (
                          <li
                            key={i}
                            className="flex gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/50 border border-dashed border-neutral-200 dark:border-neutral-800"
                          >
                            <span
                              className={cn(
                                "shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white",
                                item.impact === "high" && "bg-red-500",
                                item.impact === "medium" && "bg-amber-500",
                                item.impact === "low" && "bg-neutral-400",
                              )}
                            >
                              {i + 1}
                            </span>
                            <div className="flex-1">
                              <span className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-mono">
                                {item.action}
                              </span>
                              <span
                                className={cn(
                                  "ml-2 text-[10px] font-bold uppercase",
                                  item.impact === "high" && "text-red-500",
                                  item.impact === "medium" && "text-amber-500",
                                  item.impact === "low" && "text-neutral-400",
                                )}
                              >
                                ({item.impact})
                              </span>
                            </div>
                          </li>
                        ),
                      )}
                    </ol>
                  </div>
                )}

              {/* Analysis Checks Summary */}
              {atsScore.checks && atsScore.checks.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-widest text-xs mb-4 font-mono">
                    <IconAward className="w-4 h-4" /> Analysis Breakdown
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {atsScore.checks.map(
                      (
                        check: {
                          label: string;
                          status: string;
                          message: string;
                        },
                        i: number,
                      ) => (
                        <div
                          key={i}
                          className={cn(
                            "p-2.5 rounded-lg border border-dashed text-center",
                            check.status === "pass" &&
                              "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50",
                            check.status === "warning" &&
                              "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50",
                            check.status === "fail" &&
                              "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50",
                          )}
                        >
                          <div
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-wide mb-0.5",
                              check.status === "pass" &&
                                "text-emerald-600 dark:text-emerald-500",
                              check.status === "warning" &&
                                "text-amber-600 dark:text-amber-500",
                              check.status === "fail" &&
                                "text-red-600 dark:text-red-500",
                            )}
                          >
                            {check.status === "pass"
                              ? "✓"
                              : check.status === "warning"
                                ? "!"
                                : "✗"}{" "}
                            {check.label}
                          </div>
                          <div
                            className="text-[9px] text-neutral-500 dark:text-neutral-400 font-mono truncate"
                            title={check.message}
                          >
                            {check.message.length > 25
                              ? check.message.substring(0, 25) + "..."
                              : check.message}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* Fallback: Show feedback if no improvement plan */}
              {(!atsScore.improvementPlan ||
                atsScore.improvementPlan.length === 0) &&
                atsScore.feedback.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-widest text-xs mb-4 font-mono">
                      <IconBriefcase className="w-4 h-4" /> Suggestions
                    </h4>
                    <div className="space-y-3">
                      {atsScore.feedback.map((item: string, i: number) => (
                        <div
                          key={i}
                          className="flex gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/50 border border-dashed border-neutral-200 dark:border-neutral-800"
                        >
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-mono">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Empty footer */}
            <div className="p-6 border-t border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50">
              <p className="text-[10px] text-neutral-400 text-center font-mono">
                Analysis generated by Profilebase AI
              </p>
            </div>
          </div>
        )}
      </div>

      {/* FLOATING ACTION BAR */}
      <div className="print-hide fixed z-50 bottom-6 left-1/2 -translate-x-1/2 md:top-80 md:bottom-auto md:-right-10 md:left-auto flex items-center gap-2 backdrop-blur-md bg-white/90 dark:bg-neutral-900/90 p-2 rounded-full border border-dashed border-neutral-300 dark:border-neutral-700 shadow-2xl">
        <button
          onClick={calculateATS}
          disabled={isScanning}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-50"
        >
          {isScanning ? (
            <IconLoader2 className="w-4 h-4 animate-spin" />
          ) : (
            <IconScan className="w-4 h-4" />
          )}
          <span className="text-xs md:hidden font-bold uppercase tracking-wide font-mono">
            Analyze
          </span>
        </button>
        <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-1" />
        <button
          onClick={handleDownload}
          className="p-2.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Download PDF"
        >
          <IconDownload className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
        </button>
        <button
          onClick={onClose}
          className="p-2.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-500"
          title="Close"
        >
          <IconX className="w-4 h-4" />
        </button>
      </div>

      {/* MAIN DOCUMENT VIEW */}
      <div className="print-content flex-1 overflow-y-auto bg-neutral-100 dark:bg-neutral-900/50 flex max-w-3xl mx-auto justify-center md:py-4 print:p-0 print:m-0 print:overflow-visible print:bg-white">
        <div className="print-content transform origin-top transition-transform print:scale-100 print:w-full">
          <div id="resume-content-view">{renderResumeContent()}</div>
        </div>
      </div>
    </div>
  );
}
