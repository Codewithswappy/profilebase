"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject, updateProject } from "@/lib/actions/project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  IconAlertCircle,
  IconPlus,
  IconX,
  IconPhoto,
  IconLoader2,
  IconEye,
  IconEyeOff,
  IconCloudUpload,
  IconEyeDotted,
  IconEyeCode,
  IconEyeglass,
  IconEyeglass2,
  IconEyeglassOff,
  IconTrash,
} from "@tabler/icons-react";
import { UploadButton, UploadDropzone } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

interface ProjectFormProps {
  initialData?: any; // Using any to avoid complex type matching
  onCancel: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS = [
  { value: "planning", label: "Planning", color: "bg-blue-500" },
  { value: "in_progress", label: "In Progress", color: "bg-yellow-500" },
  { value: "complete", label: "Complete", color: "bg-emerald-500" },
  { value: "archived", label: "Archived", color: "bg-neutral-400" },
] as const;

type ProjectStatus = (typeof STATUS_OPTIONS)[number]["value"];

export function ProjectForm({
  initialData,
  onCancel,
  onSuccess,
}: ProjectFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Form state
  const [thumbnail, setThumbnail] = useState<string>(
    initialData?.thumbnail || "",
  );
  const [techStack, setTechStack] = useState<string[]>(
    initialData?.techStack || [],
  );
  const [techInput, setTechInput] = useState("");
  const [status, setStatus] = useState<ProjectStatus>(
    initialData?.status || "complete",
  );
  const [isPublic, setIsPublic] = useState<boolean>(
    initialData?.isPublic !== undefined ? initialData.isPublic : true,
  );

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    setUploadError(null);

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const repoUrl = formData.get("repoUrl") as string;
    const demoUrl = formData.get("demoUrl") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;

    let result;

    if (initialData) {
      result = await updateProject({
        projectId: initialData.id,
        title,
        description,
        repoUrl: repoUrl || undefined,
        demoUrl: demoUrl || undefined,
        thumbnail: thumbnail || undefined,
        techStack,
        status,
        isPublic,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });
    } else {
      result = await createProject({
        title,
        description,
        repoUrl: repoUrl || undefined,
        demoUrl: demoUrl || undefined,
        thumbnail: thumbnail || undefined,
        techStack,
        status,
        isPublic,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });
    }

    if (result.success) {
      router.refresh();
      onSuccess();
    } else {
      setError(result.error);
      setIsLoading(false);
    }
  }

  const addTech = () => {
    const tech = techInput.trim();
    if (tech && !techStack.includes(tech)) {
      setTechStack([...techStack, tech]);
      setTechInput("");
    }
  };

  const removeTech = (tech: string) => {
    setTechStack(techStack.filter((t) => t !== tech));
  };

  const handleTechKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTech();
    }
  };

  return (
    <div className="flex flex-col bg-white dark:bg-neutral-950 h-full">
      <div className="sticky top-0 px-6 py-5 border-b border-dashed border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-neutral-950 z-20">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 font-mono tracking-tight leading-none">
            {initialData ? "Edit Project" : "Create Project"}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 font-mono">
            {initialData
              ? "Update your project details"
              : "Add a project to your portfolio"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-6 w-6 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-sm"
        >
          <IconX className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="p-6 overflow-y-auto">
        <form
          id="create-project-form"
          action={handleSubmit}
          className="space-y-6"
        >
          {/* Project Thumbnail */}
          <div className="space-y-3">
            <Label className="text-xs font-bold font-mono uppercase text-neutral-500 dark:text-neutral-400">
              Project Image
            </Label>

            {thumbnail ? (
              <div className="space-y-2">
                <div className="relative group rounded-sm overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 aspect-video w-full max-w-[280px]">
                  <img
                    src={thumbnail}
                    alt="Project thumbnail"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2 bg-neutral-900/40 backdrop-blur-[1px]">
                    <div className="relative">
                      <UploadButton
                        endpoint="imageUploader"
                        appearance={{
                          button: cn(
                            "h-8 px-3 text-[10px] font-mono uppercase font-bold bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-sm shadow-sm transition-transform active:scale-95 flex items-center gap-2",
                          ),
                          allowedContent: "hidden",
                        }}
                        content={{
                          button({ ready }) {
                            if (!ready) return "LOADING...";
                            return (
                              <>
                                <IconPhoto className="w-3.5 h-3.5" />
                                {isUploadingImage ? "UPLOADING..." : "CHANGE"}
                              </>
                            );
                          },
                        }}
                        onUploadBegin={() => {
                          setIsUploadingImage(true);
                          setUploadError(null);
                        }}
                        onClientUploadComplete={(res) => {
                          setIsUploadingImage(false);
                          if (res && res[0]) setThumbnail(res[0].url);
                        }}
                        onUploadError={(error: Error) => {
                          setIsUploadingImage(false);
                          let msg = error.message;
                          if (msg.includes("File size"))
                            msg = "Image too large (max 4MB)";
                          else if (msg.includes("Invalid file type"))
                            msg = "Unsupported file type";
                          setUploadError(msg);
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-sm"
                      onClick={() => {
                        setThumbnail("");
                        setUploadError(null);
                      }}
                    >
                      <IconTrash className="w-3.5 h-3.5 text-white" />
                    </Button>
                  </div>
                </div>
                {uploadError && (
                  <p className="text-[10px] font-mono text-red-500 font-medium animate-in fade-in">
                    {uploadError}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <UploadDropzone
                  endpoint="imageUploader"
                  appearance={{
                    container: cn(
                      "border border-dashed border-neutral-300 dark:border-neutral-700 rounded-sm bg-neutral-50/50 dark:bg-neutral-900/50 transition-colors cursor-pointer w-full h-48 py-8 px-4",
                      isUploadingImage
                        ? "opacity-50 pointer-events-none"
                        : "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                      uploadError &&
                        "border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/10",
                    ),
                    label:
                      "text-neutral-600 dark:text-neutral-300 text-sm font-medium mt-2 font-mono",
                    button:
                      "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-mono font-bold uppercase px-4 py-2 rounded-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-sm mt-4",
                    allowedContent:
                      "text-neutral-400 dark:text-neutral-500 text-[10px] font-mono mt-1 uppercase",
                  }}
                  content={{
                    label: isUploadingImage
                      ? "Uploading..."
                      : "Choose images or drag & drop",
                    uploadIcon: (
                      <IconCloudUpload className="w-8 h-8 text-neutral-400 mb-2" />
                    ),
                    button: isUploadingImage ? (
                      <IconLoader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Upload Image"
                    ),
                    allowedContent: "Img (max 4MB)",
                  }}
                  onUploadBegin={() => {
                    setIsUploadingImage(true);
                    setUploadError(null);
                  }}
                  onClientUploadComplete={(res) => {
                    setIsUploadingImage(false);
                    if (res && res[0]) setThumbnail(res[0].url);
                  }}
                  onUploadError={(error: Error) => {
                    setIsUploadingImage(false);
                    let msg = error.message;
                    if (msg.includes("File size"))
                      msg = "Image too large (max 4MB)";
                    else if (msg.includes("Invalid file type"))
                      msg = "Unsupported file type";
                    setUploadError(msg);
                  }}
                />
                {uploadError && (
                  <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded-sm animate-in fade-in border border-red-100 dark:border-red-900/30">
                    <IconAlertCircle className="w-3.5 h-3.5" />
                    <p className="text-[10px] font-mono font-medium">
                      {uploadError}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-xs font-bold font-mono uppercase text-neutral-500 dark:text-neutral-400"
            >
              Project Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              defaultValue={initialData?.title}
              required
              placeholder="e.g. Agency Landing Page"
              className="h-10 text-sm font-mono bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus-visible:ring-neutral-900/20 shadow-sm rounded-sm placeholder:text-neutral-400"
            />
          </div>

          {/* Status & Visibility Row */}
          <div className="grid grid-cols-1 gap-6">
            {/* Status */}
            <div className="space-y-3">
              <Label className="text-xs font-bold font-mono uppercase text-neutral-500 dark:text-neutral-400">
                Project Status
              </Label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatus(option.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-sm text-[10px] font-mono uppercase font-bold border transition-all flex items-center gap-2",
                      status === option.value
                        ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm"
                        : "bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700",
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        option.value === "planning"
                          ? "bg-blue-500"
                          : option.value === "in_progress"
                            ? "bg-yellow-500"
                            : option.value === "complete"
                              ? "bg-emerald-500"
                              : "bg-neutral-500",
                      )}
                    />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visibility Toggle */}
            <div className="space-y-3">
              <Label className="text-xs font-bold font-mono uppercase text-neutral-500 dark:text-neutral-400">
                Visibility
              </Label>
              <div className="flex items-center justify-between p-4 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/30">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-sm",
                      isPublic
                        ? "bg-neutral-100 dark:bg-neutral-100/20 text-neutral-900 dark:text-neutral-400"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500",
                    )}
                  >
                    {isPublic ? (
                      <IconEyeglass className="w-4 h-4" />
                    ) : (
                      <IconEyeglassOff className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">
                      {isPublic ? "Public" : "Private"}
                    </p>
                    <p className="text-[10px] font-mono text-neutral-500 mt-0.5">
                      {isPublic
                        ? "Visible on your public portfolio"
                        : "Hidden from public view"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                  className="data-[state=checked]:bg-neutral-900 dark:data-[state=checked]:bg-white border-neutral-200 dark:border-neutral-700"
                />
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="space-y-2">
            <Label className="text-xs font-bold font-mono uppercase text-neutral-500 dark:text-neutral-400">
              Tech Stack
            </Label>
            <div className="flex gap-2">
              <Input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={handleTechKeyDown}
                placeholder="e.g. React, Node.js"
                className="flex-1 h-9 text-xs font-mono bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus-visible:ring-neutral-900/20 rounded-sm"
              />
              <Button
                type="button"
                onClick={addTech}
                size="sm"
                variant="outline"
                className="h-9 px-3 border-neutral-200 dark:border-neutral-800 rounded-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                <IconPlus className="w-3.5 h-3.5" />
              </Button>
            </div>
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 rounded-sm text-[10px] font-mono uppercase font-bold"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTech(tech)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <IconX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label
                htmlFor="repoUrl"
                className="text-xs font-bold font-mono uppercase text-neutral-500 dark:text-neutral-400"
              >
                Repository URL
              </Label>
              <Input
                id="repoUrl"
                name="repoUrl"
                defaultValue={initialData?.repoUrl}
                type="url"
                placeholder="https://github.com/..."
                className="h-9 text-xs font-mono bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus-visible:ring-neutral-900/20 rounded-sm"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="demoUrl"
                className="text-xs font-bold font-mono uppercase text-neutral-500 dark:text-neutral-400"
              >
                Live Demo URL
              </Label>
              <Input
                id="demoUrl"
                name="demoUrl"
                defaultValue={initialData?.demoUrl}
                type="url"
                placeholder="https://..."
                className="h-9 text-xs font-mono bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus-visible:ring-neutral-900/20 rounded-sm"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label
                htmlFor="startDate"
                className="text-xs font-bold font-mono uppercase text-neutral-500 dark:text-neutral-400"
              >
                Start Date
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={
                  initialData?.startDate
                    ? new Date(initialData.startDate)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                className="h-9 text-xs font-mono bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus-visible:ring-neutral-900/20 rounded-sm"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="endDate"
                className="text-xs font-bold font-mono uppercase text-neutral-500 dark:text-neutral-400"
              >
                End Date
              </Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={
                  initialData?.endDate
                    ? new Date(initialData.endDate).toISOString().split("T")[0]
                    : ""
                }
                className="h-9 text-xs font-mono bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus-visible:ring-neutral-900/20 rounded-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-xs font-bold font-mono uppercase text-neutral-500 dark:text-neutral-400"
            >
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={initialData?.description}
              placeholder="Briefly describe what this project does..."
              rows={4}
              className="resize-none text-sm font-mono bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus-visible:ring-neutral-900/20 shadow-sm min-h-[100px] rounded-sm placeholder:text-neutral-400"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-xs font-mono text-red-600 bg-red-50 border border-red-100 rounded-sm dark:bg-red-900/10 dark:border-red-900/30 dark:text-red-400">
              <IconAlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>

      <div className="sticky bottom-0 px-6 py-4 border-t border-dashed border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex justify-end gap-3 z-20">
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
          className="h-8 text-xs font-bold font-mono uppercase text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 px-4 rounded-sm"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="create-project-form"
          disabled={isLoading || isUploadingImage}
          className="h-8 text-xs font-bold font-mono uppercase bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-sm px-6 rounded-sm"
        >
          {initialData
            ? isLoading
              ? "Saving..."
              : "Save Changes"
            : isLoading
              ? "Creating..."
              : "Create Project"}
        </Button>
      </div>
    </div>
  );
}
