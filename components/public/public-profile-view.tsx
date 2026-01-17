"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CredibilityBadge } from "@/components/ui/credibility-badge";
import { getTierInfo } from "@/lib/credibility";
import {
  Mail,
  ArrowUpRight,
  User,
  LayoutGrid,
  List,
  Sparkles,
  FileCheck,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";
import Image from "next/image";
import { PublicProfileData } from "@/lib/actions/public";
import { Project } from "@prisma/client";
import { SkillTimelineV2 } from "./skill-timeline-v2";

interface PublicProfileViewProps {
  data: PublicProfileData;
}

type ProjectWithCount = Project & { evidenceCount: number };

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

export function PublicProfileView({ data }: PublicProfileViewProps) {
  const {
    profile,
    skills,
    projects,
    evidence,
    email,
    userName,
    profileCredibility,
  } = data;

  const typedProjects = projects as ProjectWithCount[];
  const displayName = userName || profile.slug;
  const [activeTab, setActiveTab] = useState<"overview" | "projects">(
    "overview"
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-stone-900 font-sans p-4 md:p-8 flex justify-center items-start">
      <div className="w-full max-w-3xl space-y-6">
        {/* --- SIMPLE COMPACT HEADER --- */}
        <div className="flex items-center gap-4 px-2">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-stone-200 shadow-sm bg-white shrink-0">
            {profile.image ? (
              <Image
                src={profile.image}
                alt={displayName}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-300">
                <User className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-stone-900 truncate">
              {displayName}
            </h1>
            <p className="text-sm font-medium text-stone-500 truncate">
              {profile.headline || "Design Engineer"}
            </p>
          </div>
          {email && (
            <a
              href={`mailto:${email}`}
              className="text-xs font-bold text-stone-900 bg-white border border-stone-200 hover:bg-stone-50 px-4 py-2 rounded-full transition-colors flex items-center gap-2 shadow-sm"
            >
              <Mail className="w-3.5 h-3.5" />
              Contact
            </a>
          )}
        </div>

        {/* --- TABS --- */}
        <div className="border-b border-stone-200 flex gap-6 text-sm px-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "pb-3 -mb-px font-semibold transition-colors flex items-center gap-2",
              activeTab === "overview"
                ? "text-stone-900 border-b-2 border-stone-900"
                : "text-stone-400 hover:text-stone-600"
            )}
          >
            <LayoutGrid className="w-4 h-4" /> Overview
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={cn(
              "pb-3 -mb-px font-semibold transition-colors flex items-center gap-2",
              activeTab === "projects"
                ? "text-stone-900 border-b-2 border-stone-900"
                : "text-stone-400 hover:text-stone-600"
            )}
          >
            <List className="w-4 h-4" /> Projects
          </button>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="space-y-6">
          {activeTab === "overview" && (
            <>
              {/* 
                        THE WIDGETS (EXACTLY AS REQUESTED) 
                        - Compact
                        - Solid Colors (No Gradients)
                        - Specific Typography 
                    */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 px-2 py-4 border-b border-stone-200/60">
                {/* WIDGET 1: CREDIBILITY */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">
                        Credibility Score
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold font-mono text-stone-900 tracking-tight">
                          {profileCredibility.overallScore}%
                        </span>
                        <span className="text-[10px] font-medium text-stone-400">
                          Top {100 - profileCredibility.overallScore}%
                        </span>
                      </div>
                    </div>
                    <div className="text-[9px] font-bold text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded-md mb-1">
                      Updated today
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0EA5E9] rounded-full relative"
                        style={{ width: `${profileCredibility.overallScore}%` }}
                      >
                        <div
                          className="absolute inset-0 w-full h-full"
                          style={{
                            backgroundImage:
                              "linear-gradient(45deg,rgba(255,255,255,0.3) 25%,transparent 25%,transparent 50%,rgba(255,255,255,0.3) 50%,rgba(255,255,255,0.3) 75%,transparent 75%,transparent)",
                            backgroundSize: "4px 4px",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* WIDGET 2: STATS */}
                <div className="flex items-center justify-between sm:justify-start sm:gap-12">
                  <div>
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">
                      Skills
                    </div>
                    <div className="text-2xl font-bold text-[#A855F7] leading-none">
                      {skills.length}
                    </div>
                  </div>

                  <div className="w-px h-8 bg-stone-200" />

                  <div>
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">
                      Proofs
                    </div>
                    <div className="text-2xl font-bold text-[#EC4899] leading-none">
                      {evidence.length}
                    </div>
                  </div>

                  <div className="hidden sm:block w-px h-8 bg-stone-200" />

                  <div className="hidden sm:block text-right">
                    <div className="text-[10px] font-medium text-stone-400">
                      Verification
                    </div>
                    <div className="text-base font-bold text-stone-900">
                      100%
                    </div>
                  </div>
                </div>
              </div>

              {/* TIMELINE V2 (Enhanced Credibility Engine) */}
              {skills.length > 0 && (
                <div className="px-2 pt-2 pb-6 border-b border-stone-200/60">
                  <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">
                    Competency Evolution
                  </h3>
                  <SkillTimelineV2
                    skills={skills}
                    evidence={evidence}
                    projects={typedProjects.map((p) => ({
                      id: p.id,
                      title: p.title,
                    }))}
                    compact
                  />
                </div>
              )}
            </>
          )}

          {/* PROJECTS TAB (Standard Professoinal Cards) */}
          {activeTab === "projects" && (
            <div className="space-y-4">
              {typedProjects.length > 0 ? (
                typedProjects.map((project) => {
                  const projectEvidence = evidence.filter(
                    (e) => e.projectId === project.id
                  );
                  return (
                    <div
                      key={project.id}
                      className="bg-white rounded-2xl p-5 border border-stone-100 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-base font-bold text-stone-900">
                          {project.title}
                        </h3>
                        {project.url && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener"
                            className="text-stone-400 hover:text-stone-900 transition-colors"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wide mb-3">
                        {project.startDate
                          ? formatDate(project.startDate)
                          : "Ongoing"}
                      </div>
                      {project.description && (
                        <p className="text-sm text-stone-600 leading-relaxed mb-4 max-w-2xl">
                          {project.description}
                        </p>
                      )}

                      {/* Standard Mini Grid for Evidence */}
                      {projectEvidence.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                          {projectEvidence.map((item) => (
                            <div
                              key={item.id}
                              className="bg-stone-50 rounded-lg p-2.5 border border-stone-100 flex flex-col justify-center min-h-[60px] hover:border-stone-200 transition-colors"
                            >
                              <div className="flex items-center gap-1.5 mb-1.5 opacity-70">
                                {item.type === "SCREENSHOT" ? (
                                  <ImageIcon className="w-3 h-3 text-purple-600" />
                                ) : item.type === "CODE_SNIPPET" ? (
                                  <FileCheck className="w-3 h-3 text-stone-600" />
                                ) : (
                                  <LinkIcon className="w-3 h-3 text-sky-600" />
                                )}
                                <span className="text-[9px] font-bold uppercase">
                                  {item.type}
                                </span>
                              </div>
                              <div className="text-[11px] font-semibold text-stone-900 truncate">
                                {item.title}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-stone-400 text-sm">
                  No projects found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
