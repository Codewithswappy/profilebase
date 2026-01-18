"use client";

import { useState } from "react";
import Link from "next/link";
import { FullProfile } from "@/lib/actions/profile";
import { ProfileHeader } from "@/components/dashboard/profile-header";
import { AddProofModal } from "@/components/dashboard/add-proof-modal";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  CheckCircle,
  Plus,
  ArrowUpRight,
  Layers,
} from "lucide-react";
import { IconBolt, IconShieldCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { SkillForm } from "@/components/dashboard/skills/skill-form";

interface DashboardOverviewProps {
  data: FullProfile;
}

export function DashboardOverview({ data }: DashboardOverviewProps) {
  const { skills, projects, evidence } = data;
  const [showAddProof, setShowAddProof] = useState(false);
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
    setShowAddProof(true);
  };

  const handleAddProof = () => {
    setSelectedSkillId(undefined);
    setShowAddProof(true);
  };

  return (
    <div className="min-h-screen space-y-6 animate-in fade-in duration-500">
      <ProfileHeader data={data} />

      {/* Floating Toolbar with Command Palette */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center p-1 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddProof}
            disabled={projects.length === 0}
            className="rounded-md h-8 px-4 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
          >
            <Plus className="w-3.5 h-3.5 mr-2 opacity-60" />
            Add Proof
          </Button>
          <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-700 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddSkill(true)}
            className="rounded-md h-8 px-4 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
          >
            <IconBolt className="w-3.5 h-3.5 mr-2 opacity-60" />
            New Skill
          </Button>
        </div>

        {/* Command Palette Trigger */}
        <CommandPalette
          onAddProof={handleAddProof}
          onAddSkill={() => setShowAddSkill(true)}
        />
      </div>

      {/* BENTO GRID - Skills + Projects */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm">
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-200 dark:divide-neutral-800">
          {/* SKILLS COLUMN */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                Tech Stack
              </p>
              <span className="flex items-center gap-1.5 text-[10px] bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full text-neutral-500 font-medium">
                <IconShieldCheck className="w-3 h-3 text-emerald-500" />
                {provenSkillsCount}/{skills.length} Proven
              </span>
            </div>

            {skills.length === 0 ? (
              <div className="h-[200px] flex flex-col items-center justify-center text-center space-y-3 opacity-60">
                <Layers className="w-8 h-8 text-neutral-300" />
                <p className="text-sm text-neutral-500">No skills yet.</p>
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
                    title={skill.evidenceCount > 0 ? `${skill.evidenceCount} proof(s)` : "Click to add proof"}
                    className={cn(
                      "group flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                      skill.evidenceCount > 0
                        ? "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-sm"
                        : "bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:border-neutral-300",
                    )}
                  >
                    {skill.evidenceCount > 0 ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600 group-hover:bg-neutral-400" />
                    )}
                    {skill.name}
                    {skill.evidenceCount > 0 && (
                      <span className="ml-1 text-[10px] text-emerald-600 dark:text-emerald-400 opacity-75">
                        {skill.evidenceCount}
                      </span>
                    )}
                  </button>
                ))}
                <button
                  onClick={() => setShowAddSkill(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-neutral-400 border border-dashed border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
            )}
          </div>

          {/* PROJECTS COLUMN */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                Recent Work
              </p>
              <Link
                href="/dashboard/portfolio"
                className="text-[10px] font-medium text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
              >
                VIEW ALL
              </Link>
            </div>

            <div className="space-y-3">
              {projects.slice(0, 4).map((project) => (
                <div
                  key={project.id}
                  className="group relative bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg border border-neutral-100 dark:border-neutral-700/50 hover:border-neutral-200 dark:hover:border-neutral-600 transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                        {project.title}
                      </h4>
                      {project.description && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1">
                          {project.description}
                        </p>
                      )}
                    </div>
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 hover:text-neutral-900" />
                      </a>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="px-2 py-0.5 rounded-full bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/50">
                      <span className="text-[10px] font-medium text-neutral-500">
                        {project.evidenceCount} Proof{project.evidenceCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {projects.length === 0 && (
                <div className="h-[200px] flex items-center justify-center text-center rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800">
                  <p className="text-xs text-neutral-400">No projects yet.</p>
                </div>
              )}

              {projects.length > 0 && (
                <div className="text-center pt-2">
                  <Link
                    href="/dashboard/portfolio"
                    className="text-xs font-medium text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    Manage Projects &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Proof Modal (New Simplified Version) */}
      <Dialog open={showAddProof} onOpenChange={setShowAddProof}>
        <DialogContent className="max-w-2xl h-[85vh] p-0 overflow-hidden rounded-xl border-none shadow-2xl">
          <AddProofModal
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
            onCancel={() => setShowAddProof(false)}
            onSuccess={() => {
              setShowAddProof(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Add Skill Modal */}
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
