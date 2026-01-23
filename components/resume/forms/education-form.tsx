"use client";

import { useResumeStore } from "@/stores/resume-store";
import { ListSection } from "./list-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EducationForm() {
  const { content, addItem, updateItem, removeItem, reorderItems } =
    useResumeStore();
  const items = content.education;

  return (
    <ListSection
      title="Education"
      description="Degrees and academic achievements."
      items={items}
      onAdd={() => addItem("education")}
      onRemove={(id) => removeItem("education", id)}
      onReorder={(newItems) => reorderItems("education", newItems)}
      renderItem={(item) => (
        <div className="text-sm">
          <div className="font-semibold text-neutral-900 dark:text-neutral-100">
            {item.school || "School"}
          </div>
          <div className="text-neutral-500 dark:text-neutral-400 text-xs">
            {item.degree}
          </div>
        </div>
      )}
      renderForm={(item, _) => {
        const update = (data: any) => updateItem("education", item.id, data);

        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
                School / University
              </Label>
              <Input
                value={item.school}
                onChange={(e) => update({ school: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
                Degree / Major
              </Label>
              <Input
                value={item.degree}
                onChange={(e) => update({ degree: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
                  Start Date
                </Label>
                <Input
                  value={item.startDate || ""}
                  onChange={(e) => update({ startDate: e.target.value })}
                  placeholder="YYYY"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
                  End Date
                </Label>
                <Input
                  value={item.endDate || ""}
                  onChange={(e) => update({ endDate: e.target.value })}
                  placeholder="YYYY"
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
          </div>
        );
      }}
    />
  );
}
