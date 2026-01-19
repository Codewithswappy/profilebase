"use client";

import { cn } from "@/lib/utils";
import { Github, MonitorPlay, ChevronRight } from "lucide-react";
import { Project } from "@prisma/client";
import Image from "next/image";
import { ViewfinderFrame } from "@/components/ui/viewfinder-frame";
import { TechIcons } from "@/components/TechIcons";

interface ProjectCardProps {
  project: Project;
}

// Helper to get tech icon (case-insensitive)
function getTechIcon(techName: string) {
  // Find matching key in TechIcons (case-insensitive)
  const iconKey = Object.keys(TechIcons).find(
    (key) => key.toLowerCase() === techName.toLowerCase(),
  );
  return iconKey ? TechIcons[iconKey] : null;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusLabels = {
    planning: "Planning",
    in_progress: "In Progress",
    complete: "Complete",
    archived: "Archived",
  };

  const status =
    (project.status
      ?.toLowerCase()
      .replace(" ", "_") as keyof typeof statusLabels) || "complete";

  return (
    <div className="group h-full">
      {/* <ViewfinderFrame className="h-full bg-white dark:bg-neutral-950 p-0 md:p-0"> */}
        <div className="flex flex-col h-full border-[1.5px] border-dashed border-neutral-300 dark:border-neutral-800 overflow-hidden relative bg-white/10 dark:bg-neutral-900/10 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5">
          {/* Project Image - Sharp corners */}
          <div className="w-full aspect-video relative overflow-hidden border-b border-dashed border-neutral-300 dark:border-neutral-800">
            {project.thumbnail ? (
              <Image
                src={project.thumbnail}
                alt={project.title}
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-500 p-1 rounded-md"
              />
            ) : (
              <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                <span className="text-4xl font-mono text-neutral-300 dark:text-neutral-800 font-bold">
                  {project.title.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex flex-col flex-1 p-4 gap-2">
            {/* Header: Title & Actions */}
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tighter leading-none px-2 py-1 -ml-1 w-fit">
                {project.title}
              </h3>

              <div className="flex items-center gap-1.5 shrink-0">
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
                  >
                    {TechIcons.GlobeIcon}
                  </a>
                )}
              </div>
            </div>

            {/* Description - Compact block */}
            <div className="">
              <p className="text-sm font-inter text-neutral-600 dark:text-neutral-400 leading-tight line-clamp-2">
                {project.description || "No description provided."}
              </p>
            </div>

            {/* Tech Stack - Exact match to design */}
            {project.techStack && project.techStack.length > 0 && (
              <div className="mt-auto pt-2">
                <h4 className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider mb-2 font-mono">
                  TechStacks
                </h4>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {project.techStack.slice(0, 5).map((tech, i) => {
                    const Icon = getTechIcon(tech);
                    return (
                      <div key={i} className="flex items-center gap-1.5">
                        {/* Render Icon without border */}
                        <span className="w-3.5 h-3.5 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full text-neutral-900 dark:text-neutral-100">
                          {Icon || (
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                          )}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-600 dark:text-neutral-400">
                          {tech}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Divider Line */}
            <div className="w-full h-px bg-neutral-200 dark:bg-neutral-800" />

            {/* Footer: Status & View Details button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-800 dark:bg-neutral-200 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-neutral-800 dark:bg-neutral-200"></span>
                </span>
                <span className="text-[12px] font-medium text-neutral-500 dark:text-neutral-400">
                  {statusLabels[status]}
                </span>
              </div>

              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[12px] text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors hover:underline"
                >
                  View Details
                  <ChevronRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      {/* </ViewfinderFrame> */}
    </div>
  );
}
