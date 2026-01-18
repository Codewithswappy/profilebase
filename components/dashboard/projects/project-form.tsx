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
    <div className="flex flex-col h-full w-full">
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl font-semibold">Add New Project</h2>
        <p className="text-sm text-muted-foreground">
          Add a project where you demonstrated your skills.
        </p>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <form
          id="create-project-form"
          action={handleSubmit}
          className="space-y-6 max-w-md"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="e.g. E-commerce Platform"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Briefly describe what this project does..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Project URL (Optional)</Label>
            <Input
              id="url"
              name="url"
              type="url"
              placeholder="https://github.com/..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" name="startDate" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" name="endDate" type="date" />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>

      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-muted/20 flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" form="create-project-form" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Project"}
        </Button>
      </div>
    </div>
  );
}
