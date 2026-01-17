"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createEvidence } from "@/lib/actions/evidence";
import {
  IconArrowLeft,
  IconArrowRight,
  IconLoader2,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

// Step Components
import { SelectProject } from "./steps/select-project";
import { SelectSkills } from "./steps/select-skills";
import { ChooseType, EvidenceType } from "./steps/choose-type";
import { LinkForm } from "./steps/link-form";
import { MetricForm } from "./steps/metric-form";
import { CodeForm } from "./steps/code-form";
import { ScreenshotForm } from "./steps/screenshot-form";
import { DescriptionForm } from "./steps/description-form";
import { ReviewStep } from "./steps/review-step";

// ============================================
// TYPES
// ============================================

type WizardStep = "project" | "skills" | "type" | "details" | "review";

interface EvidenceWizardProps {
  projects: Array<{ id: string; title: string; description?: string | null }>;
  skills: Array<{ id: string; name: string; category?: string }>;
  existingUrls?: string[];
  preselectedProjectId?: string;
  preselectedSkillId?: string;
  initialData?: Partial<WizardData>;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

interface WizardData {
  projectId: string | null;
  skillIds: string[];
  evidenceType: EvidenceType | null;
  title: string;
  content: string;
  url: string;
  description: string;
}

// ============================================
// STEP CONFIGURATION
// ============================================

const STEPS: { id: WizardStep; label: string }[] = [
  { id: "project", label: "Project" },
  { id: "skills", label: "Skills" },
  { id: "type", label: "Type" },
  { id: "details", label: "Details" },
  { id: "review", label: "Review" },
];

// ============================================
// MAIN WIZARD COMPONENT
// ============================================

export function EvidenceWizard({
  projects,
  skills: initialSkills,
  existingUrls = [],
  preselectedProjectId,
  preselectedSkillId,
  initialData,
  onSuccess,
  onCancel,
  className,
}: EvidenceWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>(
    preselectedProjectId
      ? "skills"
      : initialData?.projectId
        ? "skills"
        : "project",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local skills state (can grow as user creates new ones)
  const [skills, setSkills] = useState(initialSkills);

  // Wizard data
  const [data, setData] = useState<WizardData>({
    projectId: preselectedProjectId || initialData?.projectId || null,
    skillIds: preselectedSkillId
      ? [preselectedSkillId]
      : initialData?.skillIds || [],
    evidenceType: initialData?.evidenceType || null,
    title: initialData?.title || "",
    content: initialData?.content || "",
    url: initialData?.url || "",
    description: initialData?.description || "",
  });

  // Get current step index
  const currentStepIndex = useMemo(
    () => STEPS.findIndex((s) => s.id === currentStep),
    [currentStep],
  );

  // Selected project and skills for display
  const selectedProject = useMemo(
    () => projects.find((p) => p.id === data.projectId),
    [projects, data.projectId],
  );

  const selectedSkills = useMemo(
    () => skills.filter((s) => data.skillIds.includes(s.id)),
    [skills, data.skillIds],
  );

  // ============================================
  // VALIDATION
  // ============================================

  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case "project":
        return !!data.projectId;
      case "skills":
        return data.skillIds.length > 0;
      case "type":
        return !!data.evidenceType;
      case "details":
        if (!data.title) return false;
        if (data.evidenceType === "LINK" && !data.url) return false;
        if (data.evidenceType === "CODE_SNIPPET" && !data.content) return false;
        if (data.evidenceType === "DESCRIPTION" && !data.content) return false;
        if (data.evidenceType === "SCREENSHOT" && !data.url) return false;
        return true;
      case "review":
        return true;
      default:
        return false;
    }
  }, [currentStep, data]);

  // ============================================
  // NAVIGATION
  // ============================================

  const goNext = useCallback(() => {
    const idx = STEPS.findIndex((s) => s.id === currentStep);
    if (idx < STEPS.length - 1) {
      setCurrentStep(STEPS[idx + 1].id);
      setError(null);
    }
  }, [currentStep]);

  const goBack = useCallback(() => {
    const idx = STEPS.findIndex((s) => s.id === currentStep);
    if (idx > 0) {
      setCurrentStep(STEPS[idx - 1].id);
      setError(null);
    }
  }, [currentStep]);

  // ============================================
  // DATA HANDLERS
  // ============================================

  const handleSkillToggle = useCallback((skillId: string) => {
    setData((prev) => ({
      ...prev,
      skillIds: prev.skillIds.includes(skillId)
        ? prev.skillIds.filter((id) => id !== skillId)
        : [...prev.skillIds, skillId],
    }));
  }, []);

  const handleSkillCreated = useCallback(
    (skill: { id: string; name: string }) => {
      setSkills((prev) => [...prev, skill]);
    },
    [],
  );

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = async () => {
    if (!data.projectId || !data.evidenceType || data.skillIds.length === 0) {
      setError("Please complete all required fields");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createEvidence({
        projectId: data.projectId,
        skillIds: data.skillIds,
        title: data.title,
        type: data.evidenceType,
        content: data.content || undefined,
        url: data.url || undefined,
      });

      if (result.success) {
        onSuccess?.();
        router.refresh();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to create evidence. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // RENDER STEP CONTENT
  // ============================================

  const renderStepContent = () => {
    switch (currentStep) {
      case "project":
        return (
          <SelectProject
            projects={projects}
            selectedProjectId={data.projectId}
            onSelect={(projectId) => setData({ ...data, projectId })}
          />
        );

      case "skills":
        return (
          <SelectSkills
            skills={skills}
            selectedSkillIds={data.skillIds}
            onToggle={handleSkillToggle}
            onSkillCreated={handleSkillCreated}
            projectTitle={selectedProject?.title}
          />
        );

      case "type":
        return (
          <ChooseType
            selectedType={data.evidenceType}
            onSelect={(type) => setData({ ...data, evidenceType: type })}
          />
        );

      case "details":
        switch (data.evidenceType) {
          case "LINK":
            return (
              <LinkForm
                title={data.title}
                url={data.url}
                onTitleChange={(title) => setData({ ...data, title })}
                onUrlChange={(url) => setData({ ...data, url })}
              />
            );
          case "METRIC":
            return (
              <MetricForm
                title={data.title}
                content={data.content}
                url={data.url}
                onTitleChange={(title) => setData({ ...data, title })}
                onContentChange={(content) => setData({ ...data, content })}
                onUrlChange={(url) => setData({ ...data, url })}
              />
            );
          case "CODE_SNIPPET":
            return (
              <CodeForm
                title={data.title}
                content={data.content}
                description={data.description}
                onTitleChange={(title) => setData({ ...data, title })}
                onContentChange={(content) => setData({ ...data, content })}
                onDescriptionChange={(description) =>
                  setData({ ...data, description })
                }
              />
            );
          case "SCREENSHOT":
            return (
              <ScreenshotForm
                title={data.title}
                url={data.url}
                description={data.description}
                onTitleChange={(title) => setData({ ...data, title })}
                onUrlChange={(url) => setData({ ...data, url })}
                onDescriptionChange={(description) =>
                  setData({ ...data, description })
                }
              />
            );
          case "DESCRIPTION":
            return (
              <DescriptionForm
                title={data.title}
                content={data.content}
                onTitleChange={(title) => setData({ ...data, title })}
                onContentChange={(content) => setData({ ...data, content })}
              />
            );
          default:
            return null;
        }

      case "review":
        return (
          <ReviewStep
            projectTitle={selectedProject?.title || ""}
            selectedSkills={selectedSkills}
            evidenceType={data.evidenceType || "DESCRIPTION"}
            title={data.title}
            content={data.content}
            url={data.url}
            existingUrls={existingUrls}
          />
        );

      default:
        return null;
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header with Progress */}
      <div className="border-b border-stone-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-stone-900">Add Evidence</h2>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
            >
              <IconX className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-1">
          {STEPS.map((step, index) => {
            const isComplete = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all",
                      isComplete && "bg-stone-900 border-stone-900 text-white",
                      isCurrent && "bg-white border-stone-900 text-stone-900",
                      !isComplete &&
                        !isCurrent &&
                        "bg-stone-100 border-stone-200 text-stone-400",
                    )}
                  >
                    {isComplete ? (
                      <IconCheck className="w-3.5 h-3.5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-1 text-[10px] font-medium hidden sm:block",
                      isCurrent ? "text-stone-900" : "text-stone-400",
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-1 transition-colors",
                      index < currentStepIndex
                        ? "bg-stone-900"
                        : "bg-stone-200",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {renderStepContent()}
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-stone-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={goBack}
            disabled={currentStepIndex === 0}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              currentStepIndex === 0
                ? "text-stone-300 cursor-not-allowed"
                : "text-stone-700 hover:bg-stone-100",
            )}
          >
            <IconArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            {currentStep === "review" ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2 bg-stone-900 text-white text-sm font-semibold rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <IconLoader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <IconCheck className="w-4 h-4" />
                    Create Evidence
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                disabled={!canProceed()}
                className="inline-flex items-center gap-2 px-6 py-2 bg-stone-900 text-white text-sm font-semibold rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <IconArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EvidenceWizard;
