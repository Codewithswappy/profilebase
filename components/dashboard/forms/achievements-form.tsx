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
  IconTrophy,
  IconLoader2,
  IconPlus,
  IconTrash,
  IconPencil,
  IconExternalLink,
  IconMedal,
  IconAward,
  IconStar,
} from "@tabler/icons-react";
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
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

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
  const { confirm } = useConfirmDialog();
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
        toast.success("Achievement updated successfully");
      } else {
        await addAchievement(payload);
        toast.success("Achievement added successfully");
      }

      resetForm();
      router.refresh();
    } catch (error) {
      toast.error("Failed to save achievement. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = await confirm({
      title: "Delete Achievement",
      description:
        "Are you sure you want to delete this achievement? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (!confirmed) return;

    setIsLoading(true);
    try {
      await deleteAchievement(id);
      toast.success("Achievement deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete achievement. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const icons: Record<string, React.ElementType> = {
    award: IconTrophy,
    badge: IconMedal,
    hackathon: IconAward,
    oss: IconStar,
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-500 flex items-center gap-2">
          <IconTrophy className="w-4 h-4" />
          Honors & Awards
        </h3>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            size="sm"
            variant="ghost"
            className="h-7 text-[10px] font-mono uppercase tracking-wider hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <IconPlus className="w-3.5 h-3.5 mr-1" /> Add
          </Button>
        )}
      </div>

      {/* List of Achievements */}
      {!isAdding && (
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {(initialData || []).length === 0 && ( // Handle null/undefined initially
            <div className="p-8 text-center text-neutral-500 text-xs font-mono uppercase tracking-wide">
              No achievements added yet.
            </div>
          )}
          {(initialData || []).map((item) => {
            const Icon = icons[item.type] || IconTrophy;
            return (
              <div
                key={item.id}
                className="p-5 flex items-start justify-between group hover:bg-neutral-50 dark:hover:bg-neutral-800/20 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-sm bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-200 dark:border-neutral-700">
                    <Icon className="w-4 h-4 text-neutral-500" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {item.subtitle}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1 font-mono">
                      {item.type && (
                        <span className="uppercase text-[10px] border border-neutral-200 dark:border-neutral-700 px-1.5 py-0.5 rounded-sm bg-neutral-50 dark:bg-neutral-800/50">
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
                    className="h-7 w-7 rounded-sm"
                    onClick={() => handleEdit(item)}
                  >
                    <IconPencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <IconTrash className="w-3.5 h-3.5" />
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
          className="p-5 space-y-4 animate-in slide-in-from-top-2 bg-neutral-50/30 dark:bg-neutral-900/30"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-mono uppercase text-neutral-500">
                Title
              </Label>
              <Input
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g. Vercel OSS Program"
                className="h-9 font-mono text-xs bg-white dark:bg-neutral-900"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-mono uppercase text-neutral-500">
                SubTitle / Context
              </Label>
              <Input
                value={formData.subtitle}
                onChange={(e) =>
                  setFormData({ ...formData, subtitle: e.target.value })
                }
                placeholder="e.g. Summer 2025 Cohort"
                className="h-9 font-mono text-xs bg-white dark:bg-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-mono uppercase text-neutral-500">
                Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(val) =>
                  setFormData({ ...formData, type: String(val || "award") })
                }
              >
                <SelectTrigger className="h-9 font-mono text-xs bg-white dark:bg-neutral-900 uppercase">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="award"
                    className="font-mono text-xs uppercase"
                  >
                    Award
                  </SelectItem>
                  <SelectItem
                    value="badge"
                    className="font-mono text-xs uppercase"
                  >
                    Badge
                  </SelectItem>
                  <SelectItem
                    value="hackathon"
                    className="font-mono text-xs uppercase"
                  >
                    Hackathon
                  </SelectItem>
                  <SelectItem
                    value="oss"
                    className="font-mono text-xs uppercase"
                  >
                    Open Source
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-mono uppercase text-neutral-500">
                Date
              </Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="h-9 font-mono text-xs bg-white dark:bg-neutral-900"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-mono uppercase text-neutral-500">
              URL (Certificate/Link)
            </Label>
            <Input
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              placeholder="https://..."
              className="h-9 font-mono text-xs bg-white dark:bg-neutral-900"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-mono uppercase text-neutral-500">
              Description (Bullet points)
            </Label>
            <p className="text-[10px] text-neutral-400 font-mono">
              Enter each point on a new line.
            </p>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="- Selected for program...&#10;- Received credits..."
              className="bg-white dark:bg-neutral-900 font-mono text-xs resize-none"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-dashed border-neutral-200 dark:border-neutral-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetForm}
              className="h-8 font-mono text-xs uppercase"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="h-8 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-mono text-xs uppercase font-bold rounded-sm"
            >
              {isLoading ? (
                <IconLoader2 className="w-3 h-3 animate-spin" />
              ) : editingId ? (
                "Update Item"
              ) : (
                <>
                  <IconPlus className="w-3 h-3 mr-1" /> Add Item
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
