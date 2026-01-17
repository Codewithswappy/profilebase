"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvidence } from "@/lib/actions/evidence";
import { EvidenceType } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Link2,
  Image,
  Code,
  BarChart3,
  X,
  Check,
} from "lucide-react";
import { IconSparkles } from "@tabler/icons-react";
import { Skill, Project } from "@prisma/client";
import { UploadButton } from "@/lib/uploadthing";

interface EvidenceFormProps {
  preselectedSkillId?: string;
  preselectedProjectId?: string;
  skills?: Skill[];
  projects?: Project[];
  onCancel: () => void;
  onSuccess: () => void;
  initialData?: {
    title?: string;
    type?: string;
    content?: string;
    url?: string;
  };
}

// Simplified evidence types - focused on verifiable proof
const EVIDENCE_TYPES: {
  value: EvidenceType;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    value: "LINK",
    label: "Link",
    icon: <Link2 className="w-4 h-4" />,
    description: "GitHub repo, live demo, or documentation URL",
  },
  {
    value: "SCREENSHOT",
    label: "Screenshot",
    icon: <Image className="w-4 h-4" />,
    description: "Upload a screenshot as proof",
  },
  {
    value: "CODE_SNIPPET",
    label: "Code",
    icon: <Code className="w-4 h-4" />,
    description: "Paste code with repository link",
  },
  {
    value: "METRIC",
    label: "Metric",
    icon: <BarChart3 className="w-4 h-4" />,
    description: "Performance stats with source link",
  },
];

export function EvidenceForm({
  preselectedSkillId,
  preselectedProjectId,
  skills = [],
  projects = [],
  onCancel,
  onSuccess,
  initialData,
}: EvidenceFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<EvidenceType>(
    (initialData?.type as EvidenceType) || "LINK",
  );
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(
    preselectedSkillId ? [preselectedSkillId] : [],
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    preselectedProjectId || "",
  );
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [url, setUrl] = useState(initialData?.url || "");

  const isAIPrefilled = !!initialData;

  // Toggle skill selection
  const toggleSkill = (skillId: string) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId],
    );
  };

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    // Get IDs from state
    const skillIds = preselectedSkillId
      ? [preselectedSkillId]
      : selectedSkillIds;
    const projectId = preselectedProjectId || selectedProjectId;

    if (skillIds.length === 0) {
      setError("Please select at least one skill.");
      setIsLoading(false);
      return;
    }

    if (!projectId) {
      setError("Please select a project.");
      setIsLoading(false);
      return;
    }

    // Validate URL is required for LINK type
    if (selectedType === "LINK" && !url) {
      setError("URL is required for link evidence.");
      setIsLoading(false);
      return;
    }

    // Validate screenshot upload
    if (selectedType === "SCREENSHOT" && !uploadedImageUrl) {
      setError("Please upload a screenshot.");
      setIsLoading(false);
      return;
    }

    // For CODE_SNIPPET, require both code and URL
    if (selectedType === "CODE_SNIPPET" && (!content || !url)) {
      setError("Please provide both code snippet and repository URL.");
      setIsLoading(false);
      return;
    }

    // For METRIC, require URL as source
    if (selectedType === "METRIC" && !url) {
      setError("Please provide the source URL for the metric.");
      setIsLoading(false);
      return;
    }

    const result = await createEvidence({
      skillIds,
      projectId,
      title,
      type: selectedType,
      url: selectedType === "SCREENSHOT" ? uploadedImageUrl : url || undefined,
      content: content || undefined,
    });

    if (result.success) {
      router.refresh();
      onSuccess();
    } else {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Add Evidence</h2>
        <p className="text-sm text-muted-foreground">
          Provide verifiable proof of your skill usage.
        </p>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <form
          id="create-evidence-form"
          action={handleSubmit}
          className="space-y-6 max-w-md"
        >
          {/* Multi-Skill Selection */}
          {!preselectedSkillId && (
            <div className="space-y-2">
              <Label>
                Skills *{" "}
                <span className="text-muted-foreground text-xs">
                  (select multiple)
                </span>
              </Label>
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-1">
                {skills.length === 0 ? (
                  <p className="text-xs text-amber-600">
                    You need to add skills first.
                  </p>
                ) : (
                  skills.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(skill.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-left transition-colors ${
                        selectedSkillIds.includes(skill.id)
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <span>{skill.name}</span>
                      {selectedSkillIds.includes(skill.id) && (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  ))
                )}
              </div>
              {selectedSkillIds.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedSkillIds.length} skill(s) selected
                </p>
              )}
            </div>
          )}

          {/* Project Selection */}
          {!preselectedProjectId && (
            <div className="space-y-2">
              <Label>Project *</Label>
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-1">
                {projects.length === 0 ? (
                  <p className="text-xs text-amber-600">
                    You need to add a project first.
                  </p>
                ) : (
                  projects.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => setSelectedProjectId(project.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-left transition-colors ${
                        selectedProjectId === project.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <span>{project.title}</span>
                      {selectedProjectId === project.id && (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* AI Prefilled Indicator */}
          {isAIPrefilled && (
            <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-700">
              <IconSparkles className="w-4 h-4" />
              AI-suggested evidence - review and customize as needed
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Evidence Title *</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="e.g. Implemented Auth Flow"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Brief description of what you did
            </p>
          </div>

          {/* Evidence Type Selection */}
          <div className="space-y-3">
            <Label>Evidence Type *</Label>
            <div className="grid grid-cols-2 gap-2">
              {EVIDENCE_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setSelectedType(type.value)}
                  className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-colors ${
                    selectedType === type.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {type.icon}
                  <div>
                    <p className="text-sm font-medium">{type.label}</p>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {
                EVIDENCE_TYPES.find((t) => t.value === selectedType)
                  ?.description
              }
            </p>
          </div>

          {/* Conditional Fields Based on Type */}

          {/* LINK Type - URL Required */}
          {selectedType === "LINK" && (
            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                name="url"
                placeholder="https://github.com/..."
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                GitHub repo, live demo, PR, or documentation
              </p>
            </div>
          )}

          {/* SCREENSHOT Type - Image Upload */}
          {selectedType === "SCREENSHOT" && (
            <div className="space-y-2">
              <Label>Upload Screenshot *</Label>
              {uploadedImageUrl ? (
                <div className="relative">
                  <img
                    src={uploadedImageUrl}
                    alt="Uploaded screenshot"
                    className="w-full rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setUploadedImageUrl("")}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      if (res && res[0]) {
                        setUploadedImageUrl(res[0].url);
                      }
                    }}
                    onUploadError={(error: Error) => {
                      setError(`Upload failed: ${error.message}`);
                    }}
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Upload a screenshot showing your work
              </p>
            </div>
          )}

          {/* CODE_SNIPPET Type - Code + URL */}
          {selectedType === "CODE_SNIPPET" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="content">Code Snippet *</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="// Paste your code here..."
                  rows={6}
                  className="font-mono text-sm"
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Repository URL *</Label>
                <Input
                  id="url"
                  name="url"
                  placeholder="https://github.com/..."
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Link to the file or commit in your repository
                </p>
              </div>
            </>
          )}

          {/* METRIC Type - Content + URL */}
          {selectedType === "METRIC" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="content">Metric Details *</Label>
                <Input
                  id="content"
                  name="content"
                  placeholder="e.g. Reduced load time by 40%"
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Source URL *</Label>
                <Input
                  id="url"
                  name="url"
                  placeholder="https://..."
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Link to analytics dashboard, report, or documentation
                </p>
              </div>
            </>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>

      <div className="p-4 border-t bg-muted/20 flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" form="create-evidence-form" disabled={isLoading}>
          {isLoading ? "Saving..." : "Add Evidence"}
        </Button>
      </div>
    </div>
  );
}
