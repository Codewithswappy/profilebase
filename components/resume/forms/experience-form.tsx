"use client";

import { useResumeStore } from "@/stores/resume-store";
import { ListSection } from "./list-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";

export function ExperienceForm() {
  const { content, addItem, updateItem, removeItem, reorderItems } =
    useResumeStore();
  const items = content.experience;

  return (
    <ListSection
      title="Work Experience"
      description="Your professional career history."
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
          </div>
        </div>
      )}
      renderForm={(item, _) => {
        // Wrapper to simplify updates
        const update = (data: any) => updateItem("experience", item.id, data);

        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
                Position Title
              </Label>
              <Input
                value={item.title}
                onChange={(e) => update({ title: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
                Company
              </Label>
              <Input
                value={item.company}
                onChange={(e) => update({ company: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
                  Start Date
                </Label>
                <Input
                  type="text"
                  placeholder="MM/YYYY"
                  value={item.startDate || ""}
                  onChange={(e) => update({ startDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
                    End Date
                  </Label>
                  <div className="flex items-center gap-1.5">
                    <Switch
                      className="h-4 w-7"
                      checked={item.current}
                      onCheckedChange={(c) => update({ current: c })}
                    />
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                      Current
                    </span>
                  </div>
                </div>
                <Input
                  type="text"
                  placeholder="MM/YYYY"
                  value={item.endDate || ""}
                  onChange={(e) => update({ endDate: e.target.value })}
                  disabled={item.current}
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
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
                Description
              </Label>
              <RichTextEditor
                value={item.description || ""}
                onChange={(v) => update({ description: v })}
                placeholder="Bullets about your responsibilities..."
              />
            </div>
          </div>
        );
      }}
    />
  );
}
