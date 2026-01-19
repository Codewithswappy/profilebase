"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProject } from "@/lib/actions/project";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  X,
  ExternalLink,
  Calendar,
  Github,
  Globe,
  Star,
  Pencil,
} from "lucide-react";
import { Project } from "@prisma/client";

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
      <div className="flex items-start justify-between p-6 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-2">
            {project.isFeatured && (
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            )}
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {project.title}
            </h2>
          </div>

          {/* Role & Dates */}
          <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400 mb-3">
            {project.role && (
              <span className="font-medium">{project.role}</span>
            )}
            {project.startDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(project.startDate)}
                {project.endDate && ` - ${formatDate(project.endDate)}`}
                {!project.endDate && " - Present"}
              </span>
            )}
          </div>

          {/* Tech Stack */}
          {project.techStack && project.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {project.techStack.map((tech, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="text-xs font-normal bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          )}

          {/* Links */}
          <div className="flex items-center gap-3">
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                Repository
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                Live Demo
              </a>
            )}
            {project.url && !project.repoUrl && !project.demoUrl && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Project
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-neutral-400 hover:text-red-600 dark:hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 md:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Description */}
        {project.description && (
          <div>
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Description
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {project.description}
            </p>
          </div>
        )}

        {/* Highlights */}
        {project.highlights && project.highlights.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Key Highlights
            </h3>
            <ul className="space-y-2">
              {project.highlights.map((highlight, i) => (
                <li
                  key={i}
                  className="text-sm text-neutral-600 dark:text-neutral-400 flex items-start gap-2"
                >
                  <span className="text-neutral-300 dark:text-neutral-600 mt-1">
                    •
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
