"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addAchievement,
  updateAchievement,
  deleteAchievement,
} from "@/lib/actions/achievements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Trophy,
  Loader2,
  Plus,
  Trash2,
  Pencil,
  ExternalLink,
  Medal,
  Award,
  Star,
} from "lucide-react";
import { format } from "date-fns";
import { Achievement } from "@prisma/client";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AchievementsFormProps {
  initialData: Achievement[];
}

interface AchievementFormData {
  title: string;
  subtitle: string;
  type: string;
  url: string;
  date: string;
  description: string;
}

export function AchievementsForm({ initialData }: AchievementsFormProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<AchievementFormData>({
    title: "",
    subtitle: "",
    type: "award",
    url: "",
    date: "",
    description: "", // Textarea content (newline separated)
  });

  function resetForm() {
    setFormData({
      title: "",
      subtitle: "",
      type: "award",
      url: "",
      date: "",
      description: "",
    });
    setEditingId(null);
    setIsAdding(false);
  }

  function handleEdit(item: Achievement) {
    setFormData({
      title: item.title,
      subtitle: item.subtitle || "",
      type: item.type || "award",
      url: item.url || "",
      date: item.date ? new Date(item.date).toISOString().split("T")[0] : "",
      description: (item.description || []).join("\n"),
    });
    setEditingId(item.id);
    setIsAdding(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        title: formData.title,
        subtitle: formData.subtitle || undefined,
        type: formData.type,
        url: formData.url || undefined,
        date: formData.date ? new Date(formData.date) : undefined,
        description: formData.description
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (editingId) {
        await updateAchievement(editingId, payload);
      } else {
        await addAchievement(payload);
      }

      resetForm();
      router.refresh();
    } catch (error) {
      console.error("Failed to save achievement", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this achievement?")) return;
    setIsLoading(true);
    try {
      await deleteAchievement(id);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete achievement", error);
    } finally {
      setIsLoading(false);
    }
  }

  const icons: Record<string, React.ElementType> = {
    award: Trophy,
    badge: Medal,
    hackathon: Award,
    oss: Star,
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden mt-6">
      <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800">
        <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5" />
          Honors & Awards
        </p>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            size="sm"
            variant="outline"
            className="h-8 text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add
          </Button>
        )}
      </div>

      {/* List of Achievements */}
      {!isAdding && (
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {(initialData || []).length === 0 && ( // Handle null/undefined initially
            <div className="p-8 text-center text-neutral-500 text-sm">
              No achievements added yet.
            </div>
          )}
          {(initialData || []).map((item) => {
            const Icon = icons[item.type] || Trophy;
            return (
              <div
                key={item.id}
                className="p-5 flex items-start justify-between group hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-neutral-500" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="text-xs text-neutral-500 pb-0.5">
                        {item.subtitle}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      {item.type && (
                        <span className="uppercase text-[10px] font-mono border border-neutral-200 dark:border-neutral-700 px-1.5 py-0.5 rounded">
                          {item.type}
                        </span>
                      )}
                      {item.date && (
                        <span>{format(new Date(item.date), "MMM yyyy")}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => handleEdit(item)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Form */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-4 animate-in slide-in-from-top-2"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[11px] uppercase text-neutral-400">
                Title
              </Label>
              <Input
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g. Vercel OSS Program"
                className="h-9 bg-neutral-50 dark:bg-neutral-950/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] uppercase text-neutral-400">
                SubTitle / Context
              </Label>
              <Input
                value={formData.subtitle}
                onChange={(e) =>
                  setFormData({ ...formData, subtitle: e.target.value })
                }
                placeholder="e.g. Summer 2025 Cohort"
                className="h-9 bg-neutral-50 dark:bg-neutral-950/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[11px] uppercase text-neutral-400">
                Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(val) =>
                  setFormData({ ...formData, type: String(val || "award") })
                }
              >
                <SelectTrigger className="h-9 bg-neutral-50 dark:bg-neutral-950/50">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="award">Award</SelectItem>
                  <SelectItem value="badge">Badge</SelectItem>
                  <SelectItem value="hackathon">Hackathon</SelectItem>
                  <SelectItem value="oss">Open Source</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] uppercase text-neutral-400">
                Date
              </Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="h-9 bg-neutral-50 dark:bg-neutral-950/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] uppercase text-neutral-400">
              URL (Certificate/Link)
            </Label>
            <Input
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              placeholder="https://..."
              className="h-9 bg-neutral-50 dark:bg-neutral-950/50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] uppercase text-neutral-400">
              Description (Bullet points)
            </Label>
            <p className="text-[10px] text-neutral-400 mb-1">
              Enter each point on a new line. Supports markdown links:
              [Title](url)
            </p>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="- Selected for program...&#10;- Received credits..."
              className="bg-neutral-50 dark:bg-neutral-950/50 resize-none"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetForm}
              className="h-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="h-8 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : editingId ? (
                "Update"
              ) : (
                "Add"
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
