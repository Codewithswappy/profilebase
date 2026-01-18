"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/lib/actions/project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";

interface ProjectFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export function ProjectForm({ onCancel, onSuccess }: ProjectFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const url = formData.get("url") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;

    const result = await createProject({
      title,
      description,
      url,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
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
    <div className="flex flex-col h-full bg-white dark:bg-neutral-950">
      <div className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-800">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
          Create Project
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Add a project to your portfolio layout.
        </p>
      </div>

      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        <form
          id="create-project-form"
          action={handleSubmit}
          className="space-y-5"
        >
          <div className="space-y-1.5">
            <Label
              htmlFor="title"
              className="text-xs font-semibold text-neutral-600 dark:text-neutral-300"
            >
              Project Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="e.g. E-commerce Platform"
              className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 transition-all focus:bg-white dark:focus:bg-neutral-950"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="description"
              className="text-xs font-semibold text-neutral-600 dark:text-neutral-300"
            >
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Briefly describe what this project does and the tech stack used..."
              rows={4}
              className="resize-none bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 transition-all focus:bg-white dark:focus:bg-neutral-950"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="url"
              className="text-xs font-semibold text-neutral-600 dark:text-neutral-300"
            >
              Project URL
            </Label>
            <Input
              id="url"
              name="url"
              type="url"
              placeholder="https://..."
              className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 transition-all focus:bg-white dark:focus:bg-neutral-950"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="startDate"
                className="text-xs font-semibold text-neutral-600 dark:text-neutral-300"
              >
                Start Date
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="endDate"
                className="text-xs font-semibold text-neutral-600 dark:text-neutral-300"
              >
                End Date
              </Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-md dark:bg-red-900/10 dark:border-red-900/30 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>

      <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="text-xs bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="create-project-form"
          disabled={isLoading}
          className="text-xs bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200"
        >
          {isLoading ? "Creating..." : "Create Project"}
        </Button>
      </div>
    </div>
  );
}
