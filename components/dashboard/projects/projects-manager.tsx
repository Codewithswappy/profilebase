"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FullProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Plus, FolderPlus } from "lucide-react";
import { IconBrandGithub } from "@tabler/icons-react";
import { ProjectsList } from "./projects-list";
import { ProjectDetailPanel } from "./project-detail-panel";
import { ProjectForm } from "./project-form";
import { GitHubImportPanel } from "../github-import";

interface ProjectsManagerProps {
  data: FullProfile;
}

type ViewMode = "list" | "github" | "create";

export function ProjectsManager({ data }: ProjectsManagerProps) {
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const selectedProject = data.projects.find((p) => p.id === selectedProjectId);

  // Filter evidence for the selected project (cast to any since evidence includes skills from getMyProfile)
  const projectEvidence = selectedProject
    ? (data.evidence as any[]).filter((e) => e.projectId === selectedProject.id)
    : [];

  const handleSelect = (id: string) => {
    setSelectedProjectId(id);
    setViewMode("list");
  };

  const handleCreate = () => {
    setSelectedProjectId(null);
    setViewMode("create");
  };

  const handleGitHub = () => {
    setSelectedProjectId(null);
    setViewMode("github");
  };

  const handleClose = () => {
    setSelectedProjectId(null);
    setViewMode("list");
  };

  const handleImported = () => {
    // Refresh the page to get updated data
    router.refresh();
    setViewMode("list");
  };

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      {/* Controls Header */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider hidden md:block">
          Projects & Cases
        </p>
        <div className="flex gap-2 w-full md:w-auto justify-end">
          <Button
            variant="outline"
            onClick={handleGitHub}
            className="rounded-sm h-8 text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-none hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <IconBrandGithub className="w-3.5 h-3.5 mr-2" />
            Import GitHub
          </Button>
          <Button
            onClick={handleCreate}
            className="rounded-sm h-8 text-xs shadow-none bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Project
          </Button>
        </div>
      </div>

      {/* BENTO GRID - List + Detail */}
      <div className="flex flex-1 overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm">
        {/* Left List Panel */}
        <div className="w-full md:w-1/3 border-r border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
          <ProjectsList
            projects={data.projects}
            selectedId={selectedProjectId}
            onSelect={handleSelect}
          />
        </div>

        {/* Right Detail Panel */}
        <div className="hidden md:flex flex-1 overflow-hidden">
          {viewMode === "github" ? (
            <div className="w-full h-full overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
              <GitHubImportPanel onImported={handleImported} />
            </div>
          ) : viewMode === "create" ? (
            <ProjectForm onCancel={handleClose} onSuccess={handleClose} />
          ) : selectedProject ? (
            <ProjectDetailPanel
              project={selectedProject}
              evidence={projectEvidence}
              allSkills={data.skills}
              onClose={handleClose}
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full text-zinc-400 p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-sm bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-2 border border-zinc-200 dark:border-zinc-700">
                <FolderPlus className="w-7 h-7 text-zinc-300 dark:text-zinc-600" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-zinc-600 dark:text-zinc-400">
                  No Project Selected
                </p>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Select a project from the list to manage evidence, or start
                  fresh.
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleGitHub}
                  className="rounded-sm h-8 text-xs border-zinc-200 dark:border-zinc-800 shadow-none"
                >
                  <IconBrandGithub className="w-3.5 h-3.5 mr-2" />
                  Import
                </Button>
                <Button
                  onClick={handleCreate}
                  className="rounded-sm h-8 text-xs bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-none"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Create
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Modal */}
      {(selectedProjectId || viewMode !== "list") && (
        <div className="fixed inset-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm md:hidden p-4 overflow-y-auto animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Details
            </p>
            <Button
              variant="ghost"
              onClick={handleClose}
              className="rounded-sm text-zinc-500 hover:text-zinc-900"
            >
              Close
            </Button>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm overflow-hidden min-h-[50vh]">
            {viewMode === "github" ? (
              <GitHubImportPanel onImported={handleImported} />
            ) : viewMode === "create" ? (
              <ProjectForm onCancel={handleClose} onSuccess={handleClose} />
            ) : selectedProject ? (
              <ProjectDetailPanel
                project={selectedProject}
                evidence={projectEvidence}
                allSkills={data.skills}
                onClose={handleClose}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
