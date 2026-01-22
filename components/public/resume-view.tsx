"use client";

import { PublicProfileData } from "@/lib/actions/public";
import { aiEvaluateResume } from "@/lib/actions/ai";
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
import { useState } from "react";

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
  const { profile, experiences, projects, certificates, profileSettings } =
    data;
  const displayName = data.userName || profile.slug;
  const [isScanning, setIsScanning] = useState(false);
  const [atsScore, setAtsScore] = useState<{
    score: number;
    status: string;
    feedback: string[];
    summarySuggestion?: string;
    isFallback?: boolean;
    missingKeywords?: string[];
  } | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const [showFeedback, setShowFeedback] = useState(false);

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

    // Strict Fallback
    setTimeout(() => {
      let score = 0;
      const feedback: string[] = [];
      const missingKeywords: string[] = [];
      const fullText = JSON.stringify(data).toLowerCase();

      // Detection for Lorem Ipsum
      if (fullText.includes("lorem") || fullText.length < 200) {
        setAtsScore({
          score: 0,
          status: "Invalid Content",
          feedback: [
            "Placeholder text detected found. Replace with real content.",
          ],
          missingKeywords: ["Real Experience", "Real Skills"],
          isFallback: true,
        });
        setIsScanning(false);
        setShowFeedback(true);
        return;
      }

      // Basic Scoring
      if (profile.headline) score += 10;
      else feedback.push("Add a professional headline.");
      if (profile.summary) score += 10;
      else feedback.push("Add a summary.");
      if (experiences.length > 0) score += 20;
      else feedback.push("Add work experience.");
      if (projects.length > 0) score += 15;
      else feedback.push("Add projects.");

      const commonTech = [
        "react",
        "node",
        "typescript",
        "python",
        "aws",
        "docker",
        "sql",
        "api",
        "git",
        "ci/cd",
        "agile",
        "testing",
      ];
      const matches = commonTech.filter((k) => fullText.includes(k));
      const needed = commonTech
        .filter((k) => !fullText.includes(k))
        .slice(0, 4);

      score += Math.min(30, matches.length * 4);
      if (matches.length < 5) feedback.push("Add more technical skills.");

      setAtsScore({
        score: Math.min(95, score),
        status: score > 70 ? "Good" : "Needs Work",
        feedback: feedback.slice(0, 3),
        missingKeywords: needed,
        isFallback: true,
      });
      setIsScanning(false);
      setShowFeedback(true);
    }, 2500);
  };

  const location = (profile as any).location;

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
          "fixed top-0 right-0 z-[70] h-full w-full md:w-[420px] bg-neutral-950 text-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] border-l border-neutral-800",
          showFeedback && atsScore ? "translate-x-0" : "translate-x-full",
        )}
      >
        {atsScore && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50 backdrop-blur-md">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2 tracking-tight">
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
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-800 transition-colors text-neutral-400 hover:text-white"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
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
                      className="text-neutral-800"
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black">
                      {atsScore.score}
                    </span>
                    <span className="text-xs uppercase tracking-widest text-neutral-500">
                      Score
                    </span>
                  </div>
                </div>
                <div className="mt-4 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-neutral-900 border border-neutral-800">
                  Status:{" "}
                  <span
                    className={cn(
                      atsScore.score >= 80
                        ? "text-emerald-500"
                        : atsScore.score >= 50
                          ? "text-amber-500"
                          : "text-red-500",
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
                    <h4 className="flex items-center gap-2 font-bold text-amber-500 uppercase tracking-widest text-xs mb-4">
                      <IconCode className="w-4 h-4" /> Missing Keywords
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {atsScore.missingKeywords.map((kw, i) => (
                        <div
                          key={i}
                          className="px-4 py-2 rounded-full border border-amber-900/50 bg-amber-950/20 text-amber-500 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                        >
                          <span>+</span> {kw}
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-3 leading-relaxed">
                      * These keywords are commonly found in job descriptions
                      for your profile type. Adding them can improve your
                      visibility.
                    </p>
                  </div>
                )}

              {/* Improvements */}
              <div>
                <h4 className="flex items-center gap-2 font-bold text-neutral-300 uppercase tracking-widest text-xs mb-4">
                  <IconBriefcase className="w-4 h-4" /> Improvement Plan
                </h4>
                <div className="space-y-3">
                  {atsScore.feedback.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-3 p-3 rounded-lg bg-neutral-900/50 border border-neutral-800"
                    >
                      <span className="text-red-500 mt-0.5">•</span>
                      <span className="text-xs text-neutral-400 leading-relaxed">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-neutral-800 bg-neutral-950">
              <button
                onClick={() => {
                  setShowFeedback(false);
                  onClose();
                }}
                className="w-full py-3 bg-white text-black font-bold rounded-md hover:bg-neutral-200 transition-colors text-sm uppercase tracking-wide"
              >
                Edit Resume
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FLOATING ACTION BAR */}
      <div className="fixed z-50 bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 print:hidden backdrop-blur-md bg-white/90 dark:bg-neutral-900/90 p-2 rounded-full border border-neutral-200 dark:border-neutral-800 shadow-2xl">
        <button
          onClick={calculateATS}
          disabled={isScanning}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 text-white hover:bg-black transition-all active:scale-95 disabled:opacity-50"
        >
          {isScanning ? (
            <IconLoader2 className="w-4 h-4 animate-spin" />
          ) : (
            <IconScan className="w-4 h-4" />
          )}
          <span className="text-xs font-bold uppercase tracking-wide">
            Analyze
          </span>
        </button>
        <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-1" />
        <button
          onClick={handlePrint}
          className="p-2.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Download"
        >
          <IconDownload className="w-4 h-4" />
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
      <div className="flex-1 overflow-y-auto bg-neutral-100 dark:bg-neutral-900/50 flex justify-center py-8 print:p-0 print:m-0 print:overflow-visible print:bg-white">
        <div className="w-full max-w-[210mm] min-h-[297mm] h-fit bg-white text-black shadow-xl print:shadow-none mx-auto p-[15mm] flex flex-col gap-6 print:p-0 font-sans relative">
          {/* RESUME HEADER */}
          <header className="border-b border-neutral-200 pb-6 mb-2">
            <h1 className="text-4xl font-extrabold uppercase tracking-tight text-neutral-900 mb-1">
              {displayName}
            </h1>
            {profile.headline && (
              <p className="text-sm font-medium text-neutral-600 uppercase tracking-widest mb-4">
                {profile.headline}
              </p>
            )}

            {/* Contact Row - Clean Icons */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-neutral-600">
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
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-900 border-b border-neutral-100 pb-1 mb-2">
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
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-900 border-b border-neutral-100 pb-1 mb-3">
                <IconBriefcase className="w-3.5 h-3.5 text-neutral-400" />{" "}
                Experience
              </h3>
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="font-bold text-sm text-neutral-900">
                        {exp.position}
                      </h4>
                      <span className="text-xs font-semibold text-neutral-500">
                        {new Date(exp.startDate).getFullYear()} –{" "}
                        {exp.endDate
                          ? new Date(exp.endDate).getFullYear()
                          : "Present"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-600 mb-1.5">
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
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-900 border-b border-neutral-100 pb-1 mb-3">
                <IconCode className="w-3.5 h-3.5 text-neutral-400" /> Projects
              </h3>
              <div className="space-y-4">
                {projects.slice(0, 5).map((proj) => (
                  <div key={proj.id}>
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                        {proj.title}
                        <div className="flex gap-1 print:hidden opacity-50 hover:opacity-100 ml-2">
                          {proj.repoUrl && (
                            <a href={proj.repoUrl} target="_blank">
                              <IconBrandGithub className="w-3 h-3" />
                            </a>
                          )}
                          {proj.demoUrl && (
                            <a href={proj.demoUrl} target="_blank">
                              <IconLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </h4>
                    </div>
                    {proj.techStack && (
                      <p className="text-[10px] uppercase tracking-wide text-neutral-500 mb-1.5">
                        {proj.techStack.join(" • ")}
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
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-900 border-b border-neutral-100 pb-1 mb-3">
                <IconCode className="w-3.5 h-3.5 text-neutral-400" /> Technical
                Skills
              </h3>
              <div className="text-sm text-neutral-700 leading-relaxed">
                {(() => {
                  const skills = new Set<string>();
                  projects.forEach((p) =>
                    p.techStack?.forEach((t) => skills.add(t)),
                  );
                  experiences.forEach((e) =>
                    e.skills.forEach((s) => skills.add(s)),
                  );
                  return Array.from(skills).length > 0
                    ? Array.from(skills).join(" • ")
                    : "No specific skills listed.";
                })()}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
