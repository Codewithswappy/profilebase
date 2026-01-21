"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProject } from "@/lib/actions/project";
import { Button } from "@/components/ui/button";
import {
  IconTrash,
  IconX,
  IconExternalLink,
  IconCalendar,
  IconBrandGithub,
  IconWorld,
  IconStar,
  IconPencil,
  IconBrandReact,
  IconCode,
} from "@tabler/icons-react";
import { Project } from "@prisma/client";
import { cn } from "@/lib/utils";

interface ProjectDetailPanelProps {
  project: Project;
  onClose: () => void;
  onEdit: () => void;
}

export function ProjectDetailPanel({
  project,
  onClose,
  onEdit,
}: ProjectDetailPanelProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteProject({ projectId: project.id });
      if (result.success) {
        router.refresh();
        onClose();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-950">
      {/* Header */}
      <div className="flex items-start justify-between p-8 border-b border-dashed border-neutral-200 dark:border-neutral-800 shrink-0 bg-neutral-50/50 dark:bg-neutral-900/10">
        <div className="flex-1 min-w-0 pr-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
              {project.url?.includes("github.com") ? (
                <IconBrandGithub className="w-5 h-5" />
              ) : (
                <IconCode className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 font-mono tracking-tight">
                  {project.title}
                </h2>
                {project.isFeatured && (
                  <IconStar className="w-4 h-4 text-amber-500 fill-amber-500" />
                )}
              </div>
            </div>
          </div>

          {/* Role & Dates */}
          <div className="flex items-center gap-3 text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-4 pl-1">
            <IconCalendar className="w-3.5 h-3.5" />
            <span>
              {project.startDate ? formatDate(project.startDate) : "No Date"}
              {project.endDate
                ? ` - ${formatDate(project.endDate)}`
                : " - Present"}
            </span>
          </div>

          {/* Tech Stack */}
          {project.techStack && project.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5 pl-1">
              {project.techStack.map((tech, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-1 rounded-sm text-[10px] font-mono font-bold uppercase bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Links */}
          <div className="flex items-center gap-4 pl-1">
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                <IconBrandGithub className="w-3.5 h-3.5" />
                Repository
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                <IconWorld className="w-3.5 h-3.5" />
                Live Demo
              </a>
            )}
            {project.url && !project.repoUrl && !project.demoUrl && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                <IconExternalLink className="w-3.5 h-3.5" />
                View Project
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-8 w-8 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-sm"
          >
            <IconPencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-8 w-8 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-sm"
          >
            <IconTrash className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 md:hidden rounded-sm"
          >
            <IconX className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Description */}
        {project.description && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest border-b border-dashed border-neutral-200 dark:border-neutral-800 pb-2">
              Description
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-7 font-mono">
              {project.description}
            </p>
          </div>
        )}

        {/* Highlights */}
        {project.highlights && project.highlights.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest border-b border-dashed border-neutral-200 dark:border-neutral-800 pb-2">
              Key Highlights
            </h3>
            <ul className="space-y-3">
              {project.highlights.map((highlight, i) => (
                <li
                  key={i}
                  className="text-sm text-neutral-600 dark:text-neutral-300 flex items-start gap-3 font-mono leading-relaxed"
                >
                  <span className="text-neutral-300 dark:text-neutral-700 mt-1.5 text-[10px]">
                    0{i + 1}
                  </span>
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
