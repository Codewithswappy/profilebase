"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FullProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus, Search } from "lucide-react";
import { IconBrandGithub, IconBoxMultiple } from "@tabler/icons-react";
import { ProjectsList } from "./projects-list";
import { ProjectDetailPanel } from "./project-detail-panel";
import { ProjectForm } from "./project-form";
import { GitHubImportPanel } from "../github-import";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ProjectsManagerProps {
  data: FullProfile;
}

export function ProjectsManager({ data }: ProjectsManagerProps) {
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [editingProject, setEditingProject] = useState<any>(null); // Use existing project type
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedProject = data.projects.find((p) => p.id === selectedProjectId);

  const handleSelect = (id: string) => {
    setSelectedProjectId(id);
  };

  const handleCreateClosed = () => {
    setShowCreateModal(false);
    setEditingProject(null);
  };

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setShowCreateModal(true);
  };

  const handleImported = () => {
    router.refresh();
    setShowGithubModal(false);
  };

  const filteredProjects = data.projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] -mt-4">
      {/* 
        TOOLBAR
        Mobile: Hidden if project selected.
        Desktop: Always visible at top, full width.
      */}
      <div
        className={cn(
          "px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 shrink-0",
          selectedProjectId ? "hidden md:flex" : "flex",
        )}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Projects
            </h2>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-xs focus-visible:ring-1 focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-700 w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowGithubModal(true)}
              className="h-9 text-xs font-medium border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
            >
              <IconBrandGithub className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Import GitHub</span>
              <span className="md:hidden">Import</span>
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="h-9 text-xs font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              <span className="hidden md:inline">New Project</span>
              <span className="md:hidden">New</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex flex-1 overflow-hidden">
        {/* 
          LEFT SIDE: List 
          Mobile: Hidden if project selected.
          Desktop: Visible (w-80).
        */}
        <div
          className={cn(
            "w-full flex-col border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/10 md:w-80",
            selectedProjectId ? "hidden md:flex" : "flex",
          )}
        >
          <ProjectsList
            projects={filteredProjects}
            selectedId={selectedProjectId}
            onSelect={handleSelect}
          />
        </div>

        {/* 
          RIGHT SIDE: Detail 
          Mobile: Fixed full screen if selected. Hidden if not.
          Desktop: Flex-1 visible.
        */}
        <div
          className={cn(
            "bg-white dark:bg-neutral-950 md:flex-1 md:overflow-hidden md:relative",
            selectedProjectId
              ? "fixed inset-0 z-50 flex flex-col md:static" // Mobile: Fixed overlay
              : "hidden md:flex",
          )}
        >
          {selectedProject ? (
            <ProjectDetailPanel
              project={selectedProject}
              onClose={() => setSelectedProjectId(null)}
              onEdit={() => handleEdit(selectedProject)}
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
              <div className="w-20 h-20 rounded-2xl bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center mb-6 shadow-sm border border-neutral-100 dark:border-neutral-800 rotate-3 transform transition-transform hover:rotate-6">
                <IconBoxMultiple className="w-10 h-10 text-neutral-300 dark:text-neutral-600" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Select a project to manage
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed mb-8">
                View project details, manage tech stack, or create new projects
                for your portfolio.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] p-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] border-none shadow-2xl rounded-xl">
          <ProjectForm
            initialData={editingProject}
            onCancel={handleCreateClosed}
            onSuccess={handleCreateClosed}
          />
        </DialogContent>
      </Dialog>

      {/* GitHub Import Modal */}
      <Dialog open={showGithubModal} onOpenChange={setShowGithubModal}>
        <DialogContent className="w-full max-w-[500px] p-6 border-none shadow-2xl rounded-xl bg-white dark:bg-neutral-950">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div className="p-1 rounded-md bg-black text-white dark:bg-white dark:text-black">
              <IconBrandGithub className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-semibold">GitHub Import</h3>
          </div>
          <GitHubImportPanel onImported={handleImported} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
