"use client";

import { useEffect, useState } from "react";
import { Resume } from "@prisma/client";
import { useResumeStore } from "@/stores/resume-store";
import { updateResume } from "@/lib/actions/resume";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  IconDeviceFloppy,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconDownload,
  IconTemplate,
  IconEdit,
  IconEye,
  IconChartBar,
} from "@tabler/icons-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResumeEditorSidebar } from "./editor-sidebar";
import { ResumeEditorForm } from "./editor-form";
import { ResumePreview } from "./resume-preview";
import { ATSScoreAnalyzer, getATSScore } from "./ats-score-analyzer";
import { cn } from "@/lib/utils";

// Available templates - ordered by use case with ATS scores
const TEMPLATES = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean & contemporary with blue accents",
    atsScore: 85,
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple, ATS-optimized serif design",
    atsScore: 95,
  },
  {
    id: "professional",
    name: "Professional",
    description: "Maximum ATS compatibility",
    atsScore: 98,
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional formal style",
    atsScore: 90,
  },
  {
    id: "executive",
    name: "Executive",
    description: "Premium design for senior roles",
    atsScore: 80,
  },
] as const;

type TemplateId = (typeof TEMPLATES)[number]["id"];

interface ResumeEditorRootProps {
  resume: Resume;
}

export function ResumeEditorRoot({ resume }: ResumeEditorRootProps) {
  const { initialize, content, historyIndex, history, undo, redo, isSaving } =
    useResumeStore();

  // Local state
  const [title, setTitle] = useState(resume.title || "Untitled Resume");
  const [templateId, setTemplateId] = useState<TemplateId>(
    (resume.templateId as TemplateId) || "modern",
  );
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");

  // Initialize store on mount
  useEffect(() => {
    if (resume?.id) {
      const safeData =
        typeof resume.data === "string" ? JSON.parse(resume.data) : resume.data;
      initialize(resume.id, safeData);
    }
  }, [resume, initialize]);

  // Manual Save Handler
  const handleSave = async () => {
    if (!resume.id || !content) return;

    useResumeStore.setState({ isSaving: true });
    try {
      const result = await updateResume(resume.id, {
        title,
        templateId,
        data: content as any,
      });

      if (!result.success) {
        throw new Error("Failed to update");
      }

      useResumeStore.setState({ lastSavedAt: new Date() });
      toast.success("Resume saved successfully");
    } catch (error) {
      toast.error("Failed to save resume");
      console.error("Save error:", error);
    } finally {
      useResumeStore.setState({ isSaving: false });
    }
  };

  const handleDownload = async () => {
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.getElementById("resume-preview-content");

      if (!element) {
        toast.error("Resume content not found");
        return;
      }

      // Extract ONLY the paper element to avoid wrapper issues
      const originalPaper = element.querySelector(".bg-white") as HTMLElement;
      if (!originalPaper) {
        toast.error("Could not find resume paper");
        return;
      }

      const paper = originalPaper.cloneNode(true) as HTMLElement;

      // Create a temporary container
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.top = "-9999px";
      container.style.left = "0";
      container.style.width = "793px";
      container.style.background = "white";
      container.style.margin = "0";
      container.style.padding = "0";
      container.style.overflow = "hidden"; // Clip to single page logic

      // Style the paper
      paper.style.transform = "none";
      paper.style.boxShadow = "none";
      paper.style.margin = "0";
      paper.style.width = "100%";
      paper.style.minHeight = "1122px";
      // User wanted equal padding. 30px is a good balanced value (~0.8 inch)
      paper.style.setProperty("padding", "20px", "important");

      // TARGETED PAGE BREAK HANDLING
      const sections = paper.querySelectorAll("section");
      sections.forEach((s) => {
        (s as HTMLElement).style.pageBreakInside = "avoid";
        (s as HTMLElement).style.breakInside = "avoid";
      });

      container.appendChild(paper);
      document.body.appendChild(container);

      const opt = {
        margin: 0,
        filename: `${title.replace(/\s+/g, "_")}_resume.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0, windowWidth: 793 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf()
        .set(opt as any)
        .from(paper)
        .save();

      // Cleanup
      document.body.removeChild(container);
      toast.success("Resume downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-neutral-100 dark:bg-neutral-950 overflow-hidden">
      {/* MOBILE HEADER TOOLBAR */}
      <header className="h-14 border-b border-dashed border-neutral-200 dark:border-neutral-800 px-4 flex items-center justify-between shrink-0 bg-white dark:bg-neutral-900 md:hidden z-30">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-sm font-semibold bg-transparent border-none outline-none focus:ring-0 px-0 w-32 truncate text-neutral-900 dark:text-white placeholder:text-neutral-400 font-mono"
          placeholder="Resume Title"
        />
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 w-8 p-0 md:w-auto md:px-3 md:py-1.5"
          >
            <IconDeviceFloppy className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* MOBILE TABS */}
      <div className="flex border-b border-dashed border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 md:hidden shrink-0">
        <button
          onClick={() => setActiveTab("editor")}
          className={cn(
            "flex-1 py-3 text-xs font-medium font-mono flex items-center justify-center gap-2 border-b-2 transition-colors uppercase tracking-wider",
            activeTab === "editor"
              ? "border-neutral-900 dark:border-white text-neutral-900 dark:text-white"
              : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400",
          )}
        >
          <IconEdit className="w-4 h-4" /> Editor
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={cn(
            "flex-1 py-3 text-xs font-medium font-mono flex items-center justify-center gap-2 border-b-2 transition-colors uppercase tracking-wider",
            activeTab === "preview"
              ? "border-neutral-900 dark:border-white text-neutral-900 dark:text-white"
              : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400",
          )}
        >
          <IconEye className="w-4 h-4" /> Preview
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* LEFT: Editor Panel (Hidden on mobile if preview active) */}
        <div
          className={cn(
            "w-full md:w-1/2 flex flex-col border-r border-dashed border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 z-20 shadow-xl absolute md:relative inset-0 transition-transform duration-300 md:translate-x-0",
            activeTab === "preview"
              ? "-translate-x-full md:translate-x-0"
              : "translate-x-0",
          )}
        >
          {/* Desktop Header Toolbar */}
          <header className="hidden md:flex h-14 border-b border-dashed border-neutral-200 dark:border-neutral-800 px-4 items-center justify-between shrink-0 bg-white dark:bg-neutral-900">
            {/* Undo/Redo */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={undo}
                disabled={historyIndex <= 0}
                title="Undo"
              >
                <IconArrowBackUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                title="Redo"
              >
                <IconArrowForwardUp className="w-4 h-4" />
              </Button>
            </div>

            {/* Title Input */}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm font-semibold text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-lime-500 rounded px-2 py-1 w-48 truncate text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400 font-mono"
              placeholder="Resume Title"
            />

            {/* Save Button */}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2 font-mono text-xs uppercase tracking-wider"
            >
              <IconDeviceFloppy className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </header>

          {/* Editor Content */}
          <div className="flex-1 flex flex-col overflow-hidden bg-neutral-50/30 dark:bg-neutral-900/30">
            <aside className="w-full shrink-0 border-b border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 z-10">
              <ResumeEditorSidebar />
            </aside>

            <main className="flex-1 overflow-y-auto bg-white dark:bg-neutral-900 scrollbar-thin">
              <ResumeEditorForm />
            </main>
          </div>
        </div>

        {/* RIGHT: Preview Panel (Hidden on mobile if editor active) */}
        <div
          className={cn(
            "flex-1 bg-neutral-100 dark:bg-neutral-950 overflow-hidden flex flex-col absolute md:relative inset-0 transition-transform duration-300 md:translate-x-0",
            activeTab === "editor"
              ? "translate-x-full md:translate-x-0"
              : "translate-x-0",
          )}
        >
          {/* Preview Toolbar */}
          <header className="shrink-0 flex items-center justify-between px-4 md:px-6 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 md:bg-transparent gap-4">
            {/* Left: Template & ATS Score */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Template Selector */}
              <div className="flex items-center gap-2">
                <Select
                  value={templateId}
                  onValueChange={(val) => setTemplateId(val as TemplateId)}
                >
                  <SelectTrigger className="w-[180px] py-4 bg-white dark:bg-neutral-800 border border-dashed border-neutral-200 dark:border-neutral-700 h-9">
                    <SelectValue placeholder="Select Template" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATES.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <div className="flex items-center justify-between w-full gap-8">
                          <span className="font-medium">{t.name}</span>
                          <span
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                              t.atsScore >= 90
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : t.atsScore >= 80
                                  ? "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                            )}
                          >
                            {t.atsScore}%
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Live ATS Score Badge */}
              <div
                className={cn(
                  "hidden md:flex items-center gap-2 px-4 py-1.5 rounded-md border border-black/10 shadow shadow-black/10  transition-colors",
                  getATSScore(content) >= 80
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
                    : getATSScore(content) >= 60
                      ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400"
                      : "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400",
                )}
              >
                <IconChartBar className="w-4 h-4" />
                <span className="text-xs font-semibold">
                  ATS Score:{" "}
                  <span className="font-bold text-sm">
                    {getATSScore(content)}%
                  </span>
                </span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Export Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                className="gap-2 bg-black text-white dark:bg-white cursor-pointer dark:text-black dark:border-neutral-700 font-mono text-sm py-4 uppercase tracking-wider"
              >
                <IconDownload className="w-5 h-5" />
                <span className="hidden md:inline">Download PDF</span>
              </Button>
            </div>
          </header>

          {/* Preview Canvas */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-neutral-200/50 dark:bg-neutral-950/50">
            <div className="scale-[0.4] origin-top md:scale-[0.5] lg:scale-[0.6] xl:scale-[0.8] 2xl:scale-100 transition-transform w-[210mm] min-h-[297mm]">
              <div id="resume-preview-content">
                <ResumePreview content={content} template={templateId} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
