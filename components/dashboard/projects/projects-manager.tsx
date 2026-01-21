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
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* 
        TOOLBAR
        Mobile: Hidden if project selected.
        Desktop: Always visible at top, full width.
      */}
      <div
        className={cn(
          "px-6 py-4 border-b border-dashed border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0",
          selectedProjectId ? "hidden md:flex" : "flex",
        )}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-xs font-bold font-mono uppercase tracking-widest text-neutral-500 flex items-center gap-2">
              <IconBoxMultiple className="w-4 h-4" />
              Projects
            </h2>
            <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 hidden md:block" />
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
              <Input
                placeholder="SEARCH PROJECTS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-9 bg-neutral-50 dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 text-[10px] font-mono uppercase placeholder:text-neutral-400 focus-visible:ring-0 focus-visible:border-neutral-400 rounded-sm w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowGithubModal(true)}
              className="h-8 text-[10px] uppercase font-mono font-bold border-dashed border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-sm"
            >
              <IconBrandGithub className="w-3.5 h-3.5 mr-2" />
              <span className="hidden md:inline">Import GitHub</span>
              <span className="md:hidden">Import</span>
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="h-8 text-[10px] uppercase font-mono font-bold bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-sm rounded-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-2" />
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
            "w-full flex-col border-r border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 md:w-80",
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
              <div className="w-24 h-24 rounded-full border border-dashed border-neutral-200 dark:border-neutral-800 flex items-center justify-center mb-6 bg-neutral-50/50 dark:bg-neutral-900/50">
                <IconBoxMultiple className="w-10 h-10 text-neutral-300 dark:text-neutral-700" />
              </div>
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-2">
                No Project Selected
              </h3>
              <p className="text-xs font-mono text-neutral-500 dark:text-neutral-500 max-w-sm leading-relaxed mb-8">
                Select a project from the list or create a new one to get
                started.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] p-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] border-none shadow-2xl rounded-sm">
          <ProjectForm
            initialData={editingProject}
            onCancel={handleCreateClosed}
            onSuccess={handleCreateClosed}
          />
        </DialogContent>
      </Dialog>

      {/* GitHub Import Modal */}
      <Dialog open={showGithubModal} onOpenChange={setShowGithubModal}>
        <DialogContent className="w-full max-w-[500px] p-6 border-none shadow-2xl rounded-sm bg-white dark:bg-neutral-950">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-dashed border-neutral-200 dark:border-neutral-800">
            <div className="p-1 rounded-sm bg-black text-white dark:bg-white dark:text-black">
              <IconBrandGithub className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider">
              GitHub Import
            </h3>
          </div>
          <GitHubImportPanel onImported={handleImported} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
