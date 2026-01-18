"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createEvidence } from "@/lib/actions/evidence";
import {
  detectPlatform,
  isValidUrl,
  suggestTitleFromUrl,
  detectInputType,
  type DetectedPlatform,
} from "@/lib/platform-detection";
import { SmartUrlInput } from "./smart-url-input";
import { QuickSkillPicker } from "./quick-skill-picker";
import { URLPreview } from "./url-preview";
import { DropZone } from "./drop-zone";
import { EvidenceTemplates, type EvidenceTemplate } from "./evidence-templates";
import {
  IconX,
  IconLoader2,
  IconCheck,
  IconChevronDown,
  IconFolderCode,
  IconAlertCircle,
  IconCommand,
  IconCornerDownLeft,
} from "@tabler/icons-react";

// ============================================
// TYPES
// ============================================

interface Skill {
  id: string;
  name: string;
  category?: string;
}

interface Project {
  id: string;
  title: string;
  description?: string | null;
}

interface AddProofModalProps {
  projects: Project[];
  skills: Skill[];
  existingUrls?: string[];
  preselectedProjectId?: string;
  preselectedSkillId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

type ProofType =
  | "LINK"
  | "CODE_SNIPPET"
  | "SCREENSHOT"
  | "METRIC"
  | "DESCRIPTION";

// Draft persistence key
const DRAFT_KEY = "skillproof-evidence-draft";

// ============================================
// ADD PROOF MODAL COMPONENT
// ============================================

export function AddProofModal({
  projects,
  skills: initialSkills,
  existingUrls = [],
  preselectedProjectId,
  preselectedSkillId,
  onSuccess,
  onCancel,
  className,
}: AddProofModalProps) {
  const router = useRouter();

  // Form State
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(
    preselectedProjectId || "",
  );
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(
    preselectedSkillId ? [preselectedSkillId] : [],
  );
  const [skills, setSkills] = useState(initialSkills);

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [detectedPlatform, setDetectedPlatform] =
    useState<DetectedPlatform | null>(null);
  const [autoSuggestedTitle, setAutoSuggestedTitle] = useState<string | null>(
    null,
  );
  const [showTemplates, setShowTemplates] = useState(true);

  // Auto-detect proof type from content
  const proofType = useMemo<ProofType>(() => {
    if (screenshotUrl) return "SCREENSHOT";
    if (isValidUrl(content)) return "LINK";

    const type = detectInputType(content);
    if (type === "url") return "LINK";
    if (type === "code") return "CODE_SNIPPET";
    if (type === "metric") return "METRIC";
    return "DESCRIPTION";
  }, [content, screenshotUrl]);

  // Get effective URL
  const effectiveUrl = useMemo(() => {
    if (screenshotUrl) return screenshotUrl;
    if (isValidUrl(content)) return content;
    return url;
  }, [content, url, screenshotUrl]);

  // Auto-select project if only one
  useEffect(() => {
    if (!selectedProjectId && projects.length === 1) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // ============================================
  // DRAFT PERSISTENCE
  // ============================================

  // Load draft on mount
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved && !preselectedProjectId && !preselectedSkillId) {
      try {
        const draft = JSON.parse(saved);
        if (draft.content) setContent(draft.content);
        if (draft.title) setTitle(draft.title);
        if (draft.url) setUrl(draft.url);
        if (draft.projectId) setSelectedProjectId(draft.projectId);
        if (draft.skillIds?.length) setSelectedSkillIds(draft.skillIds);
        setShowTemplates(false);
      } catch {}
    }
  }, [preselectedProjectId, preselectedSkillId]);

  // Save draft on change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        content ||
        title ||
        selectedProjectId ||
        selectedSkillIds.length > 0
      ) {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            content,
            title,
            url,
            projectId: selectedProjectId,
            skillIds: selectedSkillIds,
          }),
        );
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [content, title, url, selectedProjectId, selectedSkillIds]);

  // Clear draft on success
  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
  }, []);

  // ============================================
  // HANDLERS
  // ============================================

  const handlePlatformDetected = useCallback(
    (platform: DetectedPlatform | null) => {
      setDetectedPlatform(platform);
    },
    [],
  );

  const handleTitleSuggested = useCallback(
    (suggested: string) => {
      setAutoSuggestedTitle(suggested);
      if (!title) {
        setTitle(suggested);
      }
    },
    [title],
  );

  const handleToggleSkill = useCallback((skillId: string) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId],
    );
  }, []);

  const handleSkillCreated = useCallback((skill: Skill) => {
    setSkills((prev) => [...prev, skill]);
  }, []);

  const handleTemplateSelect = useCallback((template: EvidenceTemplate) => {
    setTitle(template.title);
    if (template.content) {
      setContent(template.content);
    }
    setShowTemplates(false);
  }, []);

  const handleScreenshotUpload = useCallback((uploadedUrl: string) => {
    setScreenshotUrl(uploadedUrl);
    setContent("");
    setShowTemplates(false);
  }, []);

  const handleRemoveScreenshot = useCallback(() => {
    setScreenshotUrl("");
  }, []);

  // Selected project
  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId),
    [projects, selectedProjectId],
  );

  // Validation
  const canSubmit = useMemo(() => {
    if (!selectedProjectId) return false;
    if (selectedSkillIds.length === 0) return false;
    if (!title.trim()) return false;

    if (proofType === "LINK" && !effectiveUrl) return false;
    if (proofType === "SCREENSHOT" && !screenshotUrl) return false;
    if (proofType === "CODE_SNIPPET" && !content.trim()) return false;
    if (proofType === "DESCRIPTION" && !content.trim()) return false;

    return true;
  }, [
    selectedProjectId,
    selectedSkillIds,
    title,
    proofType,
    effectiveUrl,
    screenshotUrl,
    content,
  ]);

  // Submit handler
  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createEvidence({
        projectId: selectedProjectId,
        skillIds: selectedSkillIds,
        title: title.trim(),
        type: proofType,
        content:
          proofType !== "LINK" && proofType !== "SCREENSHOT"
            ? content.trim()
            : undefined,
        url: effectiveUrl || undefined,
      });

      if (result.success) {
        clearDraft();
        onSuccess?.();
        router.refresh();
      } else {
        setError(result.error || "Failed to add proof");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // KEYBOARD SHORTCUTS
  // ============================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close
      if (e.key === "Escape") {
        onCancel?.();
        return;
      }

      // Cmd/Ctrl + Enter to submit
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (canSubmit && !isSubmitting) {
          handleSubmit();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, canSubmit, isSubmitting, handleSubmit]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white dark:bg-neutral-950",
        className,
      )}
    >
      {/* Header - Compact */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Add Proof
          </h2>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Evidence of your skills
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 transition-colors"
          >
            <IconX className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-5 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400">
              <IconAlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="text-xs">{error}</span>
            </div>
          )}

          {/* Templates - Show only when fresh */}
          {showTemplates && !content && !screenshotUrl && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
                Quick Start
              </span>
              <EvidenceTemplates onSelect={handleTemplateSelect} />
            </div>
          )}

          {/* Screenshot Mode */}
          {proofType === "SCREENSHOT" || screenshotUrl ? (
            <DropZone
              onUploadComplete={handleScreenshotUpload}
              onUploadError={(err) => setError(err)}
              currentImage={screenshotUrl}
              onRemove={handleRemoveScreenshot}
              compact
            />
          ) : (
            <>
              {/* Smart Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
                  Content
                </label>
                <SmartUrlInput
                  value={content}
                  onChange={(val) => {
                    setContent(val);
                    setShowTemplates(false);
                  }}
                  onPlatformDetected={handlePlatformDetected}
                  onTitleSuggested={handleTitleSuggested}
                  existingUrls={existingUrls}
                  autoFocus
                />
              </div>

              {/* URL Preview */}
              {proofType === "LINK" && effectiveUrl && (
                <URLPreview
                  url={effectiveUrl}
                  onTitleSuggested={handleTitleSuggested}
                  compact
                />
              )}

              {/* Screenshot alternative */}
              <div className="flex items-center gap-2">
                <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
                <span className="text-[10px] text-neutral-400">
                  or upload screenshot
                </span>
                <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
              </div>
              <DropZone
                onUploadComplete={handleScreenshotUpload}
                onUploadError={(err) => setError(err)}
                compact
              />
            </>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
                Title
              </label>
              {autoSuggestedTitle && title !== autoSuggestedTitle && (
                <button
                  type="button"
                  onClick={() => setTitle(autoSuggestedTitle)}
                  className="text-[10px] text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                >
                  Use suggestion
                </button>
              )}
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Built authentication flow with JWT"
              className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-800 rounded-md bg-white dark:bg-neutral-900 outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors placeholder:text-neutral-400"
            />
          </div>

          {/* Project Selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
              Project
            </label>

            {projects.length === 0 ? (
              <div className="p-3 rounded-md border border-dashed border-neutral-200 dark:border-neutral-800 text-center">
                <IconFolderCode className="w-5 h-5 mx-auto text-neutral-300 dark:text-neutral-700 mb-1" />
                <p className="text-xs text-neutral-500">
                  Create a project first
                </p>
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-800 rounded-md bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors text-left"
                >
                  {selectedProject ? (
                    <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                      <IconFolderCode className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="truncate">{selectedProject.title}</span>
                    </div>
                  ) : (
                    <span className="text-neutral-400">Select project...</span>
                  )}
                  <IconChevronDown
                    className={cn(
                      "w-3.5 h-3.5 text-neutral-400 transition-transform",
                      showProjectDropdown && "rotate-180",
                    )}
                  />
                </button>

                {showProjectDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => {
                          setSelectedProjectId(project.id);
                          setShowProjectDropdown(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors",
                          selectedProjectId === project.id &&
                            "bg-neutral-50 dark:bg-neutral-800",
                        )}
                      >
                        <IconFolderCode className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="flex-1 truncate text-neutral-900 dark:text-neutral-100">
                          {project.title}
                        </span>
                        {selectedProjectId === project.id && (
                          <IconCheck className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Skills Selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
              Skills Demonstrated
            </label>
            <QuickSkillPicker
              skills={skills}
              selectedIds={selectedSkillIds}
              onToggle={handleToggleSkill}
              onSkillCreated={handleSkillCreated}
            />
          </div>
        </div>
      </div>

      {/* Footer - Compact */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
        {/* Keyboard hint */}
        <div className="hidden sm:flex items-center gap-1 text-[10px] text-neutral-400">
          <IconCommand className="w-3 h-3" />
          <IconCornerDownLeft className="w-3 h-3" />
          <span>to submit</span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-neutral-900 text-white rounded-md hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <IconLoader2 className="w-3.5 h-3.5 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <IconCheck className="w-3.5 h-3.5" />
                Add Proof
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddProofModal;
