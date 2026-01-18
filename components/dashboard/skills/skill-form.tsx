"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSkill } from "@/lib/actions/skill";
import { SkillCategory } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

interface SkillFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

const CATEGORIES: { value: SkillCategory; label: string }[] = [
  { value: "LANGUAGE", label: "Language" },
  { value: "FRAMEWORK", label: "Framework" },
  { value: "TOOL", label: "Tool" },
  { value: "DATABASE", label: "Database" },
  { value: "CONCEPT", label: "Concept" },
  { value: "SOFT_SKILL", label: "Soft Skill" },
  { value: "OTHER", label: "Other" },
];

export function SkillForm({ onCancel, onSuccess }: SkillFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const name = formData.get("name") as string;
    const category = formData.get("category") as SkillCategory;

    const result = await createSkill({ name, category });

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
        <h2 className="text-xl font-semibold">Add New Skill</h2>
        <p className="text-sm text-muted-foreground">
          Define a skill you want to prove.
        </p>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <form
          id="create-skill-form"
          action={handleSubmit}
          className="space-y-6 max-w-md"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Skill Name</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="e.g. React, TypeScript, Communication"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category" items={CATEGORIES} defaultValue="OTHER">
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>

      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-muted/20 flex unstack justify-end gap-3">
        <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" form="create-skill-form" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Skill"}
        </Button>
      </div>
    </div>
  );
}
