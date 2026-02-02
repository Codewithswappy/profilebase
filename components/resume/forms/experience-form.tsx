"use client";

import { useResumeStore } from "@/stores/resume-store";
import { ListSection } from "./list-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { ResumeTips } from "../resume-tips";
import { IconSparkles, IconAlertCircle } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// Power action verbs for suggestions
const SUGGESTED_VERBS = [
  "Led",
  "Developed",
  "Implemented",
  "Managed",
  "Achieved",
  "Improved",
  "Built",
  "Designed",
];

export function ExperienceForm() {
  const { content, addItem, updateItem, removeItem, reorderItems } =
    useResumeStore();
  const items = content.experience;

  return (
    <div className="space-y-4">
      {/* Tips Section */}
      <div className="px-6 pt-4">
        <ResumeTips section="experience" />
      </div>

      <ListSection
        title="Work Experience"
        description="List your professional experience in reverse chronological order. Use action verbs and quantify achievements."
        items={items}
        onAdd={() => addItem("experience")}
        onRemove={(id) => removeItem("experience", id)}
        onReorder={(newItems) => reorderItems("experience", newItems)}
        renderItem={(item) => (
          <div className="text-sm">
            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
              {item.title || "New Role"}
            </div>
            <div className="text-neutral-500 dark:text-neutral-400 text-xs">
              {item.company || "Company"}
              {item.startDate && (
                <span className="ml-2 text-neutral-400">
                  {item.startDate} – {item.current ? "Present" : item.endDate}
                </span>
              )}
            </div>
          </div>
        )}
        renderForm={(item, _) => {
          // Wrapper to simplify updates
          const update = (data: any) => updateItem("experience", item.id, data);

          // Check if description has action verbs
          const descriptionText =
            item.description?.replace(/<[^>]*>/g, "") || "";
          const hasActionVerb = SUGGESTED_VERBS.some((verb) =>
            new RegExp(`\\b${verb}`, "i").test(descriptionText),
          );
          const hasMetrics =
            /\d+%|\d+x|\$\d+|\d+ (users|clients|team|projects)/i.test(
              descriptionText,
            );

          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
                    Position Title
                  </Label>
                  <Input
                    value={item.title}
                    onChange={(e) => update({ title: e.target.value })}
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
                    Company
                  </Label>
                  <Input
                    value={item.company}
                    onChange={(e) => update({ company: e.target.value })}
                    placeholder="e.g., Google, Inc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
                    Start Date
                  </Label>
                  <Input
                    type="text"
                    placeholder="e.g., Jan 2022"
                    value={item.startDate || ""}
                    onChange={(e) => update({ startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
                      End Date
                    </Label>
                    <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800/80 px-2 py-0.5 rounded-full scale-90 origin-right">
                      <Switch
                        checked={item.current}
                        onCheckedChange={(c) => update({ current: c })}
                        className="scale-75 ml-0 data-[state=checked]:bg-emerald-500"
                      />
                      <span
                        className={cn(
                          "text-[9px] font-bold uppercase tracking-widest transition-colors",
                          item.current
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-neutral-500",
                        )}
                      >
                        Current
                      </span>
                    </div>
                  </div>
                  <Input
                    type="text"
                    placeholder="e.g., Dec 2024"
                    value={item.endDate || ""}
                    onChange={(e) => update({ endDate: e.target.value })}
                    disabled={item.current}
                    className={cn(
                      item.current &&
                        "opacity-50 grayscale bg-neutral-50 dark:bg-neutral-900",
                    )}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
                  Location
                </Label>
                <Input
                  value={item.location || ""}
                  onChange={(e) => update({ location: e.target.value })}
                  placeholder="e.g., San Francisco, CA or Remote"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
                    Description & Achievements
                  </Label>
                  <div className="flex items-center gap-2">
                    {descriptionText.length > 0 && !hasActionVerb && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                        <IconAlertCircle className="w-3 h-3" />
                        Add action verbs
                      </span>
                    )}
                    {descriptionText.length > 0 && !hasMetrics && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                        <IconAlertCircle className="w-3 h-3" />
                        Add metrics
                      </span>
                    )}
                  </div>
                </div>

                {/* Suggested Action Verbs */}
                <div className="flex flex-wrap items-center gap-1 mb-2">
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 mr-1">
                    <IconSparkles className="w-3 h-3 inline mr-0.5" />
                    Start with:
                  </span>
                  {SUGGESTED_VERBS.map((verb) => (
                    <button
                      key={verb}
                      type="button"
                      onClick={() => {
                        // Insert verb at beginning of description or add as new bullet
                        const newDesc = item.description
                          ? item.description.includes("<ul>")
                            ? item.description.replace(
                                "<ul>",
                                `<ul><li>${verb} `,
                              )
                            : `<ul><li>${verb} </li></ul>`
                          : `<ul><li>${verb} </li></ul>`;
                        update({ description: newDesc });
                      }}
                      className="px-1.5 py-0.5 text-[10px] rounded bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 hover:bg-lime-200 dark:hover:bg-lime-900/50 transition-colors"
                    >
                      {verb}
                    </button>
                  ))}
                </div>

                <RichTextEditor
                  value={item.description || ""}
                  onChange={(v) => update({ description: v })}
                  placeholder="• Led development of microservices architecture serving 1M+ users&#10;• Improved API response time by 60% through optimization&#10;• Mentored team of 5 junior developers"
                />

                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
                  💡 Tip: Use bullet points with format: [Action Verb] + [What
                  you did] + [Result/Impact]
                </p>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
