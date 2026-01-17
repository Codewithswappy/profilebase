"use client";

import { cn } from "@/lib/utils";
import { IconFolderCode, IconCheck } from "@tabler/icons-react";

interface SelectProjectProps {
  projects: Array<{ id: string; title: string; description?: string | null }>;
  selectedProjectId: string | null;
  onSelect: (projectId: string) => void;
  className?: string;
}

export function SelectProject({
  projects,
  selectedProjectId,
  onSelect,
  className,
}: SelectProjectProps) {
  if (projects.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
          <IconFolderCode className="w-6 h-6 text-stone-400" />
        </div>
        <h3 className="font-semibold text-stone-900 mb-2">No Projects Yet</h3>
        <p className="text-sm text-stone-500">
          Create a project first before adding evidence.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="font-semibold text-stone-900 mb-1">
          Which project does this proof belong to?
        </h3>
        <p className="text-sm text-stone-500">
          Select the project where you applied these skills.
        </p>
      </div>

      <div className="space-y-2">
        {projects.map((project) => {
          const isSelected = selectedProjectId === project.id;
          return (
            <button
              key={project.id}
              type="button"
              onClick={() => onSelect(project.id)}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all",
                isSelected
                  ? "border-stone-900 bg-stone-50"
                  : "border-stone-200 hover:border-stone-300 bg-white"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                      isSelected ? "bg-stone-900" : "bg-stone-100"
                    )}
                  >
                    <IconFolderCode
                      className={cn(
                        "w-5 h-5",
                        isSelected ? "text-white" : "text-stone-500"
                      )}
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-stone-900 truncate">
                      {project.title}
                    </h4>
                    {project.description && (
                      <p className="text-sm text-stone-500 line-clamp-2 mt-0.5">
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>
                {isSelected && (
                  <IconCheck className="w-5 h-5 text-stone-900 shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SelectProject;
