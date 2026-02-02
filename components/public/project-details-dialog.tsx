"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Project } from "@prisma/client";
import Image from "next/image";
import { TechIcons } from "@/components/TechIcons";
import { Github, ExternalLink, Calendar } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ProjectDetailsDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper to get tech icon (case-insensitive)
function getTechIcon(techName: string) {
  const iconKey = Object.keys(TechIcons).find(
    (key) => key.toLowerCase() === techName.toLowerCase(),
  );
  return iconKey ? TechIcons[iconKey] : null;
}

export function ProjectDetailsDialog({
  project,
  open,
  onOpenChange,
}: ProjectDetailsDialogProps) {
  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white dark:bg-neutral-950 border border-dashed border-neutral-300 dark:border-neutral-800">
        <div className="flex flex-col max-h-[90vh]">
          {/* Scrollable Content Container */}
          <div className="overflow-y-auto no-scrollbar">
            {/* Header / Hero Image */}
            <div className="w-full aspect-video relative bg-neutral-100 dark:bg-neutral-900 border-b border-dashed border-neutral-300 dark:border-neutral-800">
              {project.thumbnail ? (
                <Image
                  src={project.thumbnail}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl font-mono text-neutral-300 dark:text-neutral-800 font-bold">
                    {project.title.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Content Body */}
            <div className="p-6 md:p-8 space-y-8">
              {/* Title & Links Row */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-2">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
                    {project.title}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-neutral-500 font-mono">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        project.status === "planning"
                          ? "bg-lime-500"
                          : project.status === "in_progress"
                            ? "bg-yellow-500"
                            : project.status === "complete"
                              ? "bg-emerald-500"
                              : project.status === "archived"
                                ? "bg-neutral-400"
                                : "bg-neutral-500",
                      )}
                    />
                    <span>
                      {project.status?.replace("_", " ").toUpperCase() ||
                        "PROJECT"}
                    </span>
                    {(project.startDate || project.endDate) && (
                      <>
                        <span className="text-neutral-300 dark:text-neutral-700">
                          |
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {project.startDate &&
                            new Date(project.startDate).getFullYear() > 1900
                              ? format(new Date(project.startDate), "MMM yyyy")
                              : "TBD"}
                            {" - "}
                            {project.endDate &&
                            new Date(project.endDate).getFullYear() > 1900
                              ? format(new Date(project.endDate), "MMM yyyy")
                              : project.status === "in_progress"
                                ? "Ongoing"
                                : "Present"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 shrink-0">
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-medium uppercase border border-dashed border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all rounded-sm text-neutral-600 dark:text-neutral-400"
                    >
                      <Github className="w-4 h-4" />
                      <span>Code</span>
                    </a>
                  )}
                  {(project.demoUrl || project.url) && (
                    <a
                      href={project.demoUrl || project.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-medium uppercase bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border border-transparent hover:opacity-90 transition-all rounded-sm shadow-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Live Demo</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono uppercase text-neutral-400 tracking-wider">
                  // About Project
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl">
                  {project.description || "No description provided."}
                </p>
              </div>

              {/* Problem */}
              {(project as any).problem && (
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase text-neutral-400 tracking-wider">
                    // Why I Built This
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl">
                    {(project as any).problem}
                  </p>
                </div>
              )}

              {/* Solution */}
              {(project as any).solution && (
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase text-neutral-400 tracking-wider">
                    // The Solution
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl">
                    {(project as any).solution}
                  </p>
                </div>
              )}

              {/* Key Features */}
              {(project as any).keyFeatures &&
                (project as any).keyFeatures.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-mono uppercase text-neutral-400 tracking-wider">
                      // Key Features
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(project as any).keyFeatures.map(
                        (feature: string, i: number) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-300"
                          >
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0" />
                            <span className="leading-relaxed">{feature}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}

              {/* Impact */}
              {(project as any).impact && (
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase text-neutral-400 tracking-wider">
                    // Impact
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl">
                    {(project as any).impact}
                  </p>
                </div>
              )}

              {/* Future Plans */}
              {(project as any).futurePlans && (
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase text-neutral-400 tracking-wider">
                    // Future Plans
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl">
                    {(project as any).futurePlans}
                  </p>
                </div>
              )}

              {/* Tech Stack */}
              {project.techStack && project.techStack.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase text-neutral-400 tracking-wider">
                    // Technologies
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {project.techStack.map((tech, i) => {
                      const Icon = getTechIcon(tech);
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-3 py-1.5 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-sm bg-neutral-50/50 dark:bg-neutral-900/50"
                        >
                          <span className="w-4 h-4 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full text-neutral-600 dark:text-neutral-400">
                            {Icon}
                          </span>
                          <span className="text-xs font-mono text-neutral-600 dark:text-neutral-400">
                            {tech}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
