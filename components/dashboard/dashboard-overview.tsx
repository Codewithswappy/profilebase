"use client";

import { useState } from "react";
import Link from "next/link";
import { FullProfile } from "@/lib/actions/profile";
import { ProfileHeader } from "@/components/dashboard/profile-header";
import { EvidenceWizard } from "@/components/dashboard/evidence-wizard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  CheckCircle,
  Plus,
  Zap,
  ArrowUpRight,
  Layers,
  Box,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SkillForm } from "@/components/dashboard/skills/skill-form";

interface DashboardOverviewProps {
  data: FullProfile;
}

export function DashboardOverview({ data }: DashboardOverviewProps) {
  const { skills, projects, evidence } = data;
  const [showEvidenceWizard, setShowEvidenceWizard] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<string | undefined>(
    undefined,
  );

  const provenSkillsCount = skills.filter((s) => s.evidenceCount > 0).length;

  // Get existing URLs for duplicate detection
  const existingUrls = (evidence || [])
    .map((e) => e.url)
    .filter((url): url is string => !!url);

  const handleProveSkill = (skillId: string) => {
    setSelectedSkillId(skillId);
    setShowEvidenceWizard(true);
  };

  return (
    <div className="min-h-screen space-y-6 animate-in fade-in duration-500">
      <ProfileHeader data={data} />

      {/* Floating Toolbar */}
      <div className="flex items-center gap-2">
        <div className="flex items-center p-1 rounded-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedSkillId(undefined);
              setShowEvidenceWizard(true);
            }}
            disabled={projects.length === 0}
            className="rounded-sm h-8 px-4 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
          >
            <Plus className="w-3.5 h-3.5 mr-2 opacity-60" />
            Add Evidence
          </Button>
          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddSkill(true)}
            className="rounded-sm h-8 px-4 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
          >
            <Zap className="w-3.5 h-3.5 mr-2 opacity-60" />
            New Skill
          </Button>
        </div>
      </div>

      {/* BENTO GRID - Skills + Projects */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm overflow-hidden">
        <div className="grid md:grid-cols-2 divide-x divide-zinc-200 dark:divide-zinc-800">
          {/* SKILLS COLUMN */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Tech Stack
              </p>
              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-sm text-zinc-500 font-medium">
                {provenSkillsCount}/{skills.length} Certified
              </span>
            </div>

            {skills.length === 0 ? (
              <div className="h-[200px] flex flex-col items-center justify-center text-center space-y-3 opacity-60">
                <Layers className="w-8 h-8 text-zinc-300" />
                <p className="text-sm text-zinc-500">No skills yet.</p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setShowAddSkill(true)}
                >
                  Add your first skill
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap content-start gap-2">
                {skills.map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => handleProveSkill(skill.id)}
                    className={cn(
                      "group flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-sm text-xs font-medium transition-all duration-200 border",
                      skill.evidenceCount > 0
                        ? "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-700"
                        : "bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-200",
                    )}
                  >
                    {skill.evidenceCount > 0 ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50 dark:fill-emerald-900/20" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 group-hover:bg-zinc-400" />
                    )}
                    {skill.name}
                  </button>
                ))}
                <button
                  onClick={() => setShowAddSkill(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-sm text-xs font-medium text-zinc-400 border border-dashed border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
            )}
          </div>

          {/* PROJECTS COLUMN */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Recent Work
              </p>
              <Link
                href="/dashboard/portfolio"
                className="text-[10px] font-medium text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                VIEW ALL
              </Link>
            </div>

            <div className="space-y-3">
              {projects.slice(0, 4).map((project) => (
                <div
                  key={project.id}
                  className="group relative bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-sm border border-zinc-100 dark:border-zinc-700/50 hover:border-zinc-200 dark:hover:border-zinc-600 transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        {project.title}
                      </h4>
                      {project.description && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
                          {project.description}
                        </p>
                      )}
                    </div>
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-sm"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-900" />
                      </a>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="px-2 py-0.5 rounded-sm bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/50">
                      <span className="text-[10px] font-medium text-zinc-500">
                        {project.evidenceCount} Proofs
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {projects.length === 0 && (
                <div className="h-[200px] flex items-center justify-center text-center rounded-sm border border-dashed border-zinc-200 dark:border-zinc-800">
                  <p className="text-xs text-zinc-400">No projects yet.</p>
                </div>
              )}

              {projects.length > 0 && (
                <div className="text-center pt-2">
                  <Link
                    href="/dashboard/portfolio"
                    className="text-xs font-medium text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    Manage Projects &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Dialog open={showEvidenceWizard} onOpenChange={setShowEvidenceWizard}>
        <DialogContent className="max-w-2xl h-[85vh] p-0 overflow-hidden rounded-xl border-none shadow-2xl">
          <EvidenceWizard
            projects={projects.map((p) => ({
              id: p.id,
              title: p.title,
              description: p.description,
            }))}
            skills={skills.map((s) => ({
              id: s.id,
              name: s.name,
              category: s.category,
            }))}
            preselectedSkillId={selectedSkillId}
            existingUrls={existingUrls}
            onCancel={() => setShowEvidenceWizard(false)}
            onSuccess={() => {
              setShowEvidenceWizard(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showAddSkill} onOpenChange={setShowAddSkill}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-xl border-none shadow-2xl">
          <SkillForm
            onCancel={() => setShowAddSkill(false)}
            onSuccess={() => setShowAddSkill(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
