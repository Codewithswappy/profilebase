"use client";

import { cn } from "@/lib/utils";
import { Project } from "@prisma/client";
import { IconFolderCode, IconBrandGithub } from "@tabler/icons-react";

interface ProjectsListProps {
  projects: Project[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ProjectsList({
  projects,
  selectedId,
  onSelect,
}: ProjectsListProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
          <IconFolderCode className="w-6 h-6 text-neutral-300 dark:text-neutral-600" />
        </div>
        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          No projects found
        </p>
        <p className="text-xs text-neutral-400 mt-1 max-w-[150px]">
          Create a project to get started.
        </p>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      {projects.map((project) => {
        const isSelected = project.id === selectedId;

        return (
          <button
            key={project.id}
            onClick={() => onSelect(project.id)}
            className={cn(
              "group w-full flex items-start gap-3 p-3 rounded-sm text-left transition-all duration-200 border",
              isSelected
                ? "bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                : "bg-transparent border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:border-neutral-200/50 dark:hover:border-neutral-800",
            )}
          >
            <div
              className={cn(
                "mt-0.5 w-8 h-8 rounded-sm flex items-center justify-center shrink-0 transition-colors border",
                isSelected
                  ? "bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-200 border-neutral-200 dark:border-neutral-600"
                  : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-400",
              )}
            >
              {project.url?.includes("github.com") ? (
                <IconBrandGithub className="w-4 h-4" />
              ) : (
                <IconFolderCode className="w-4 h-4" />
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs font-bold truncate pr-2",
                    isSelected
                      ? "text-neutral-900 dark:text-neutral-100"
                      : "text-neutral-700 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-300",
                  )}
                >
                  {project.title}
                </span>
                {project.startDate && (
                  <span className="text-[10px] font-mono text-neutral-400">
                    {formatDate(project.startDate)}
                  </span>
                )}
              </div>

              {project.techStack && project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.techStack.slice(0, 3).map((tech, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-mono uppercase bg-neutral-100 dark:bg-neutral-900 px-1 rounded-sm text-neutral-500 border border-neutral-200 dark:border-neutral-700"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.techStack.length > 3 && (
                    <span className="text-[9px] font-mono uppercase bg-neutral-50 dark:bg-neutral-900 px-1 rounded-sm text-neutral-400 border border-neutral-200 dark:border-neutral-800">
                      +{project.techStack.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
