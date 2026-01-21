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
  IconBriefcase,
  IconCalendar,
  IconLoader2,
  IconPlus,
  IconTrash,
  IconPencil,
  IconX,
  IconMapPin,
  IconBuildingSkyscraper,
  IconDeviceFloppy,
} from "@tabler/icons-react";
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
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-500 flex items-center gap-2">
          <IconBriefcase className="w-4 h-4" />
          Work Experience
        </h3>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            size="sm"
            variant="ghost"
            className="h-7 text-[10px] font-mono uppercase tracking-wider hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <IconPlus className="w-3.5 h-3.5 mr-1" /> Add Position
          </Button>
        )}
      </div>

      {/* List of Experiences */}
      {!isAdding && (
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {initialData.length === 0 && (
            <div className="p-8 text-center text-neutral-500 text-xs font-mono uppercase tracking-wide">
              No experience added yet.
            </div>
          )}
          {initialData.map((exp) => (
            <div
              key={exp.id}
              className="p-5 flex items-start justify-between group hover:bg-neutral-50 dark:hover:bg-neutral-800/20 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {exp.logo ? (
                    <img
                      src={exp.logo}
                      alt={exp.company}
                      className="w-10 h-10 rounded-sm object-cover border border-neutral-200 dark:border-neutral-800"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-sm bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border border-neutral-200 dark:border-neutral-700">
                      <IconBuildingSkyscraper className="w-5 h-5 text-neutral-400" />
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {exp.position}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono mt-0.5">
                      <span className="font-medium">{exp.company}</span>
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
                  </div>
                </div>

                {exp.skills && exp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 ml-12">
                    {exp.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-mono font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 uppercase"
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
                  className="h-7 w-7 rounded-sm"
                  onClick={() => handleEdit(exp)}
                >
                  <IconPencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-sm"
                  onClick={() => handleDelete(exp.id)}
                >
                  <IconTrash className="w-3.5 h-3.5" />
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
          className="p-5 space-y-5 animate-in slide-in-from-top-2 bg-neutral-50/30 dark:bg-neutral-900/30"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-mono uppercase text-neutral-500">
                Position / Role
              </Label>
              <Input
                required
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                placeholder="e.g. Senior Developer"
                className="h-9 font-mono text-xs bg-white dark:bg-neutral-900"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-mono uppercase text-neutral-500">
                Company
              </Label>
              <Input
                required
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                placeholder="e.g. Acme Inc"
                className="h-9 font-mono text-xs bg-white dark:bg-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-mono uppercase text-neutral-500">
                Company Logo URL
              </Label>
              <Input
                value={formData.logo}
                onChange={(e) =>
                  setFormData({ ...formData, logo: e.target.value })
                }
                placeholder="https://..."
                className="h-9 font-mono text-xs bg-white dark:bg-neutral-900"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-mono uppercase text-neutral-500">
                Location
              </Label>
              <Input
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g. Remote"
                className="h-9 font-mono text-xs bg-white dark:bg-neutral-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.current}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, current: checked })
              }
              className="scale-75"
            />
            <Label className="text-xs font-mono text-neutral-600 dark:text-neutral-400">
              I currently work here
            </Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-mono uppercase text-neutral-500">
                Start Date
              </Label>
              <Input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="h-9 font-mono text-xs bg-white dark:bg-neutral-900"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-mono uppercase text-neutral-500">
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
                className="h-9 font-mono text-xs bg-white dark:bg-neutral-900"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-mono uppercase text-neutral-500">
              Skills used
            </Label>
            <Input
              value={formData.skills}
              onChange={(e) =>
                setFormData({ ...formData, skills: e.target.value })
              }
              placeholder="e.g. React, Node.js, Leadership (comma separated)"
              className="h-9 font-mono text-xs bg-white dark:bg-neutral-900"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-mono uppercase text-neutral-500">
              Description
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Key responsibilities and achievements..."
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
                "Update Position"
              ) : (
                <>
                  <IconPlus className="w-3 h-3 mr-1" /> Add Position
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
