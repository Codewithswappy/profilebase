"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addExperience,
  updateExperience,
  deleteExperience,
} from "@/lib/actions/experience";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Briefcase,
  Calendar,
  Loader2,
  Plus,
  Trash2,
  Pencil,
  X,
  MapPin,
  Building2,
} from "lucide-react";
import { format } from "date-fns";
import { Experience } from "@prisma/client";
import { cn } from "@/lib/utils";

interface ExperienceFormProps {
  initialData: Experience[];
}

export function ExperienceForm({ initialData }: ExperienceFormProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    position: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    employmentType: "",
    skills: "",
    description: "",
    logo: "",
  });

  function resetForm() {
    setFormData({
      position: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      employmentType: "",
      skills: "",
      description: "",
      logo: "",
    });
    setEditingId(null);
    setIsAdding(false);
  }

  function handleEdit(exp: Experience) {
    setFormData({
      position: exp.position,
      company: exp.company,
      location: exp.location || "",
      startDate: exp.startDate
        ? new Date(exp.startDate).toISOString().split("T")[0]
        : "",
      endDate: exp.endDate
        ? new Date(exp.endDate).toISOString().split("T")[0]
        : "",
      current: exp.current,
      employmentType: exp.employmentType || "",
      skills: (exp.skills || []).join(", "),
      description: exp.description || "",
      logo: exp.logo || "",
    });
    setEditingId(exp.id);
    setIsAdding(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        startDate: new Date(formData.startDate),
        endDate: formData.current
          ? undefined
          : formData.endDate
            ? new Date(formData.endDate)
            : undefined,
      };

      if (editingId) {
        await updateExperience(editingId, payload);
      } else {
        await addExperience(payload);
      }

      resetForm();
      router.refresh();
    } catch (error) {
      console.error("Failed to save experience", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this experience?")) return;
    setIsLoading(true);
    try {
      await deleteExperience(id);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete experience", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden mt-6">
      <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800">
        <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Briefcase className="w-3.5 h-3.5" />
          Work Experience
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

      {/* List of Experiences */}
      {!isAdding && (
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {initialData.length === 0 && (
            <div className="p-8 text-center text-neutral-500 text-sm">
              No experience added yet.
            </div>
          )}
          {initialData.map((exp) => (
            <div
              key={exp.id}
              className="p-5 flex items-start justify-between group hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {exp.position}
                </h3>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {exp.company}
                  </span>
                  <span>•</span>
                  <span>
                    {format(new Date(exp.startDate), "MMM yyyy")} -{" "}
                    {exp.current
                      ? "Present"
                      : exp.endDate
                        ? format(new Date(exp.endDate), "MMM yyyy")
                        : ""}
                  </span>
                </div>
                {exp.logo && (
                  <img
                    src={exp.logo}
                    alt={exp.company}
                    className="w-6 h-6 rounded object-cover mt-1"
                  />
                )}
                {exp.skills && exp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {exp.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => handleEdit(exp)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  onClick={() => handleDelete(exp.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
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
                Position
              </Label>
              <Input
                required
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                placeholder="e.g. Senior Developer"
                className="h-9 bg-neutral-50 dark:bg-neutral-950/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] uppercase text-neutral-400">
                Company
              </Label>
              <Input
                required
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                placeholder="e.g. Acme Inc"
                className="h-9 bg-neutral-50 dark:bg-neutral-950/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[11px] uppercase text-neutral-400">
                Company Logo URL
              </Label>
              <Input
                value={formData.logo}
                onChange={(e) =>
                  setFormData({ ...formData, logo: e.target.value })
                }
                placeholder="https://..."
                className="h-9 bg-neutral-50 dark:bg-neutral-950/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] uppercase text-neutral-400">
                Location
              </Label>
              <Input
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g. Remote / New York"
                className="h-9 bg-neutral-50 dark:bg-neutral-950/50"
              />
            </div>
            <div className="flex items-end pb-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.current}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, current: checked })
                  }
                />
                <Label>I currently work here</Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[11px] uppercase text-neutral-400">
                Start Date
              </Label>
              <Input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="h-9 bg-neutral-50 dark:bg-neutral-950/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] uppercase text-neutral-400">
                End Date
              </Label>
              <Input
                type="date"
                disabled={formData.current}
                required={!formData.current}
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="h-9 bg-neutral-50 dark:bg-neutral-950/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] uppercase text-neutral-400">
              Skills used
            </Label>
            <Input
              value={formData.skills}
              onChange={(e) =>
                setFormData({ ...formData, skills: e.target.value })
              }
              placeholder="e.g. React, Node.js, Leadership (comma separated)"
              className="h-9 bg-neutral-50 dark:bg-neutral-950/50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] uppercase text-neutral-400">
              Description
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Key responsibilities and achievements..."
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
