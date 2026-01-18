"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FullProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FolderPlus, Search, LayoutGrid } from "lucide-react";
import { IconBrandGithub, IconBoxMultiple } from "@tabler/icons-react";
import { ProjectsList } from "./projects-list";
import { ProjectDetailPanel } from "./project-detail-panel";
import { ProjectForm } from "./project-form";
import { GitHubImportPanel } from "../github-import";
import { Input } from "@/components/ui/input";

interface ProjectsManagerProps {
  data: FullProfile;
}

export function ProjectsManager({ data }: ProjectsManagerProps) {
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedProject = data.projects.find((p) => p.id === selectedProjectId);

  // Filter evidence for the selected project
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projectEvidence = selectedProject
    ? (data.evidence as any[]).filter((e) => e.projectId === selectedProject.id)
    : [];

  const handleSelect = (id: string) => {
    setSelectedProjectId(id);
  };

  const handleCreateClosed = () => {
    setShowCreateModal(false);
  };

  const handleGithubClosed = () => {
    setShowGithubModal(false);
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
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Projects
          </h2>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-xs focus-visible:ring-1 focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-700"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowGithubModal(true)}
            className="h-9 text-xs font-medium border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
          >
            <IconBrandGithub className="w-3.5 h-3.5 mr-2" />
            Import GitHub
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="h-9 text-xs font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Project
          </Button>
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Project List */}
        <div className="w-80 flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/10">
          <ProjectsList
            projects={filteredProjects}
            selectedId={selectedProjectId}
            onSelect={handleSelect}
          />
        </div>

        {/* Right Side: Detail or Empty State */}
        <div className="flex-1 overflow-hidden bg-white dark:bg-neutral-950 relative">
          {selectedProject ? (
            <ProjectDetailPanel
              project={selectedProject}
              evidence={projectEvidence}
              allSkills={data.skills}
              onClose={() => setSelectedProjectId(null)}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
              <div className="w-20 h-20 rounded-2xl bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center mb-6 shadow-sm border border-neutral-100 dark:border-neutral-800 rotate-3 transform transition-transform hover:rotate-6">
                <IconBoxMultiple className="w-10 h-10 text-neutral-300 dark:text-neutral-600" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Select a project to manage
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed mb-8">
                View detailed evidence, manage skills, or create new proof for
                your portfolio projects.
              </p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowGithubModal(true)}
                  className="h-9 text-xs"
                >
                  <IconBrandGithub className="w-3.5 h-3.5 mr-2" />
                  Import
                </Button>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="h-9 text-xs bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Create Project
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
          <ProjectForm
            onCancel={handleCreateClosed}
            onSuccess={handleCreateClosed}
          />
        </DialogContent>
      </Dialog>

      {/* GitHub Import Modal */}
      <Dialog open={showGithubModal} onOpenChange={setShowGithubModal}>
        <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden border-none shadow-2xl">
          <div className="h-full overflow-y-auto bg-white dark:bg-neutral-950">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-black text-white dark:bg-white dark:text-black">
                  <IconBrandGithub className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Import from GitHub</h3>
                  <p className="text-sm text-neutral-500">
                    Select repositories to import as projects
                  </p>
                </div>
              </div>
              <GitHubImportPanel onImported={handleImported} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
