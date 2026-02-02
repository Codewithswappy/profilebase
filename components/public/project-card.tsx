"use client";

import { cn } from "@/lib/utils";
import { Github, MonitorPlay, ChevronRight } from "lucide-react";
import { Project } from "@prisma/client";
import Image from "next/image";
import { ViewfinderFrame } from "@/components/ui/viewfinder-frame";
import { TechIcons } from "@/components/TechIcons";
import {
  IconArrowUp,
  IconArrowUpFromArc,
  IconArrowUpRight,
  IconBrandGithub,
} from "@tabler/icons-react";

interface ProjectCardProps {
  project: Project;
  onInteraction?: () => void;
  onClick?: () => void;
}

// Helper to get tech icon (case-insensitive)
function getTechIcon(techName: string) {
  const iconKey = Object.keys(TechIcons).find(
    (key) => key.toLowerCase() === techName.toLowerCase(),
  );
  return iconKey ? TechIcons[iconKey] : null;
}

export function ProjectCard({
  project,
  onInteraction,
  onClick,
}: ProjectCardProps) {
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

  const handleTrack = (e?: React.MouseEvent) => {
    // e?.stopPropagation(); // Optional: depending on if we want bubble
    if (onInteraction) onInteraction();
  };

  return (
    <div className="group w-full">
      <div className="flex flex-col w-full relative">
        {/* Project Image - Main focus */}
        <div
          onClick={() => {
            handleTrack();
            if (onClick) onClick();
          }}
          className="aspect-video relative overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 cursor-pointer"
        >
          {project.thumbnail ? (
            <Image
              src={project.thumbnail}
              alt={project.title}
              fill
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 384px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
              <span className="text-4xl font-mono text-neutral-300 dark:text-neutral-800 font-bold">
                {project.title.charAt(0)}
              </span>
            </div>
          )}

          {/* Overlay Title on Hover (to keep context since we removed it) */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
            <h3 className="text-white font-bold tracking-tight text-lg">
              {project.title}
            </h3>
          </div>
        </div>

        {/* Footer Actions Bar - Dashed Style */}
        <div className="flex items-stretch h-10 border-x border-b border-dashed border-neutral-300 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/50">
          {/* Github Link */}
          {project.repoUrl ? (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 border-r border-dashed border-neutral-300 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors text-xs font-mono lowercase"
            >
              Github
              <IconBrandGithub className="w-3 h-3 ml-2" />
            </a>
          ) : (
            <div className="w-16 border-r border-dashed border-neutral-300 dark:border-neutral-800" />
          )}

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Preview Link */}
          {project.demoUrl || project.url ? (
            <a
              href={(project.demoUrl || project.url) as string}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-4 border-l border-dashed border-neutral-300 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors text-xs font-mono lowercase"
            >
              preview
              <IconArrowUpRight className="w-3 h-3 ml-2" />
            </a>
          ) : (
            <div className="w-16 border-l border-dashed border-neutral-300 dark:border-neutral-800" />
          )}
        </div>
      </div>
    </div>
  );
}
