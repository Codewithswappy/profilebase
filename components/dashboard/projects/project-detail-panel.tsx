"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProject } from "@/lib/actions/project";
import { deleteEvidence } from "@/lib/actions/evidence";
import { AddProofModal } from "@/components/dashboard/add-proof-modal";
import { EvidenceSuggester } from "@/components/dashboard/ai-suggestions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  X,
  Plus,
  ExternalLink,
  Calendar,
  Image as ImageIcon,
  Link2,
  Code,
  BarChart3,
} from "lucide-react";
import {
  IconSparkles,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { Project, Evidence, Skill, EvidenceSkill } from "@prisma/client";
import type { AIEvidenceSuggestion } from "@/lib/types";

// Extended evidence type with skills
type EvidenceWithSkills = Evidence & {
  skills: (EvidenceSkill & { skill: Skill })[];
};

interface ProjectDetailPanelProps {
  project: Project;
  evidence: EvidenceWithSkills[];
  allSkills: Skill[];
  onClose: () => void;
}

export function ProjectDetailPanel({
  project,
  evidence,
  allSkills,
  onClose,
}: ProjectDetailPanelProps) {
  const router = useRouter();
  const [isAddingEvidence, setIsAddingEvidence] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [prefillEvidence, setPrefillEvidence] = useState<{
    title: string;
    type: string;
    content?: string;
  } | null>(null);

  // Get skills associated with this project's evidence
  const projectSkillNames = [
    ...new Set(evidence.flatMap((e) => e.skills.map((es) => es.skill.name))),
  ];

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case "SCREENSHOT":
        return <ImageIcon className="w-4 h-4" />;
      case "LINK":
        return <Link2 className="w-4 h-4" />;
      case "CODE_SNIPPET":
        return <Code className="w-4 h-4" />;
      case "METRIC":
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <Link2 className="w-4 h-4" />;
    }
  };

  async function handleDeleteProject() {
    if (
      !confirm(
        "Are you sure? This will delete the project and all its evidence.",
      )
    )
      return;
    setIsDeleting(true);
    const result = await deleteProject({ projectId: project.id });
    if (result.success) {
      router.refresh();
      onClose();
    } else {
      alert(result.error);
      setIsDeleting(false);
    }
  }

  async function handleDeleteEvidence(evidenceId: string) {
    if (!confirm("Remove this evidence?")) return;
    const result = await deleteEvidence({ evidenceId });
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error);
    }
  }

  // Handle AI evidence suggestion selection
  const handleSelectAIEvidence = (suggestion: AIEvidenceSuggestion) => {
    setPrefillEvidence({
      title: suggestion.title,
      type: suggestion.type,
      content: suggestion.content,
    });
    setIsAddingEvidence(true);
    setShowAISuggestions(false);
  };

  if (isAddingEvidence) {
    // Get existing URLs for duplicate detection
    const existingUrls = evidence
      .map((e) => e.url)
      .filter((url): url is string => !!url);

    return (
      <div className="flex flex-col h-full w-full">
        <AddProofModal
          projects={[
            {
              id: project.id,
              title: project.title,
              description: project.description,
            },
          ]}
          skills={allSkills.map((s) => ({
            id: s.id,
            name: s.name,
            category: s.category,
          }))}
          existingUrls={existingUrls}
          preselectedProjectId={project.id}
          onCancel={() => {
            setIsAddingEvidence(false);
            setPrefillEvidence(null);
          }}
          onSuccess={() => {
            setIsAddingEvidence(false);
            setPrefillEvidence(null);
            router.refresh();
          }}
          className="h-full border-0"
        />
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b">
        <div>
          <h2 className="text-2xl font-bold mb-1">{project.title}</h2>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> {project.url}
              </a>
            )}
            {(project.startDate || project.endDate) && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {project.startDate ? formatDate(project.startDate) : "Start"}
                {" - "}
                {project.endDate ? formatDate(project.endDate) : "Present"}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {project.description && (
          <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/80">
            {project.description}
          </div>
        )}

        {/* AI Suggestions Collapsible */}
        {allSkills.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <button
              onClick={() => setShowAISuggestions(!showAISuggestions)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <span className="flex items-center gap-2 font-medium">
                <IconSparkles className="w-4 h-4 text-purple-500" />
                AI Evidence Suggestions
              </span>
              {showAISuggestions ? (
                <IconChevronUp className="w-4 h-4" />
              ) : (
                <IconChevronDown className="w-4 h-4" />
              )}
            </button>
            {showAISuggestions && (
              <div className="p-4 pt-0 border-t">
                <EvidenceSuggester
                  projectTitle={project.title}
                  projectDescription={project.description || undefined}
                  skills={
                    projectSkillNames.length > 0
                      ? projectSkillNames
                      : allSkills.slice(0, 5).map((s) => s.name)
                  }
                  onSelectEvidence={handleSelectAIEvidence}
                />
              </div>
            )}
          </div>
        )}

        {/* Evidence List */}
        <div className="space-y-4 pt-4 border-t">
          {evidence.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <p className="text-muted-foreground mb-4">
                No skills proven with this project yet.
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAISuggestions(true)}
                >
                  <IconSparkles className="w-4 h-4 mr-2" />
                  AI Suggest
                </Button>
                <Button onClick={() => setIsAddingEvidence(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Evidence
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  Proven Skills ({evidence.length})
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddingEvidence(true)}
                  disabled={allSkills.length === 0}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              {allSkills.length === 0 && (
                <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-200">
                  You need to add a Skill before you can add evidence.
                </div>
              )}

              {evidence.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-md p-4 bg-card relative group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-medium">
                        {getEvidenceIcon(item.type)}
                        {item.title}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.skills.map((es) => (
                          <Badge
                            key={es.id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {es.skill.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteEvidence(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Screenshot Preview */}
                  {item.type === "SCREENSHOT" && item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-2"
                    >
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full max-h-40 object-cover rounded-md border hover:opacity-90 transition-opacity"
                      />
                    </a>
                  )}

                  {/* Code Snippet */}
                  {item.type === "CODE_SNIPPET" && item.content && (
                    <pre className="mt-2 p-3 bg-neutral-900 text-neutral-100 rounded-md text-xs overflow-x-auto max-h-32">
                      <code>{item.content}</code>
                    </pre>
                  )}

                  {/* Metric */}
                  {item.type === "METRIC" && item.content && (
                    <p className="mt-2 text-lg font-bold text-primary">
                      {item.content}
                    </p>
                  )}

                  {/* URL Link (for non-screenshot types) */}
                  {item.url && item.type !== "SCREENSHOT" && (
                    <div className="mt-3">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs flex items-center gap-1 text-primary hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {item.url.length > 50
                          ? item.url.substring(0, 50) + "..."
                          : item.url}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/20 flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleDeleteProject}
          disabled={isDeleting}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Project
        </Button>
      </div>
    </div>
  );
}
