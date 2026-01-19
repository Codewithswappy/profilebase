"use client";

import { useState } from "react";
import Link from "next/link";
import { FullProfile } from "@/lib/actions/profile";
import { ProfileHeader } from "@/components/dashboard/profile-header";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpRight, Layers, Code2 } from "lucide-react";
import { IconFolderCode } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface DashboardOverviewProps {
  data: FullProfile;
}

export function DashboardOverview({ data }: DashboardOverviewProps) {
  const { projects } = data;

  // Get all unique tech from projects
  const allTech = [...new Set(projects.flatMap((p) => p.techStack || []))];

  return (
    <div className="min-h-screen space-y-6 animate-in fade-in duration-500">
      <ProfileHeader data={data} />

      {/* Floating Toolbar with Command Palette */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center p-1 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <Link href="/dashboard?tab=portfolio">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-md h-8 px-4 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
            >
              <Plus className="w-3.5 h-3.5 mr-2 opacity-60" />
              Add Project
            </Button>
          </Link>
          <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-700 mx-1" />
          <Link href="/dashboard?tab=portfolio">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-md h-8 px-4 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
            >
              <IconFolderCode className="w-3.5 h-3.5 mr-2 opacity-60" />
              Manage Portfolio
            </Button>
          </Link>
        </div>

        {/* Command Palette Trigger */}
        <CommandPalette />
      </div>

      {/* BENTO GRID - Tech Stack + Projects */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm">
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-200 dark:divide-neutral-800">
          {/* TECH STACK COLUMN */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                Tech Stack
              </p>
              <span className="flex items-center gap-1.5 text-[10px] bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full text-neutral-500 font-medium">
                <Code2 className="w-3 h-3 text-blue-500" />
                {allTech.length} Technologies
              </span>
            </div>

            {allTech.length === 0 ? (
              <div className="h-[200px] flex flex-col items-center justify-center text-center space-y-3 opacity-60">
                <Layers className="w-8 h-8 text-neutral-300" />
                <p className="text-sm text-neutral-500">
                  No tech detected yet.
                </p>
                <p className="text-xs text-neutral-400">
                  Add projects with tech stack to see them here.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap content-start gap-2">
                {allTech.map((tech) => (
                  <div
                    key={tech}
                    className="flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full text-xs font-medium bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    {tech}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PROJECTS COLUMN */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                Projects
              </p>
              <span className="flex items-center gap-1.5 text-[10px] bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full text-neutral-500 font-medium">
                <IconFolderCode className="w-3 h-3 text-emerald-500" />
                {projects.length} Total
              </span>
            </div>

            {projects.length === 0 ? (
              <div className="h-[200px] flex flex-col items-center justify-center text-center space-y-3 opacity-60">
                <IconFolderCode className="w-8 h-8 text-neutral-300" />
                <p className="text-sm text-neutral-500">No projects yet.</p>
                <Link href="/dashboard?tab=portfolio">
                  <Button variant="link" size="sm">
                    Create your first project
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {projects.slice(0, 5).map((project) => (
                  <Link
                    key={project.id}
                    href="/dashboard?tab=portfolio"
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200 border",
                      "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600",
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <IconFolderCode className="w-4 h-4 text-neutral-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200 truncate block">
                          {project.title}
                        </span>
                        {project.techStack && project.techStack.length > 0 && (
                          <span className="text-[10px] text-neutral-400 truncate block">
                            {project.techStack.slice(0, 3).join(", ")}
                            {project.techStack.length > 3 &&
                              ` +${project.techStack.length - 3}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
                {projects.length > 5 && (
                  <Link
                    href="/dashboard?tab=portfolio"
                    className="flex items-center justify-center gap-1 py-2 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  >
                    View all {projects.length} projects
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 text-center">
          <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            {projects.length}
          </p>
          <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mt-1">
            Projects
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 text-center">
          <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            {allTech.length}
          </p>
          <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mt-1">
            Technologies
          </p>
        </div>
      </div>
    </div>
  );
}
