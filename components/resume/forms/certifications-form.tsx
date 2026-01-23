"use client";

import { useResumeStore } from "@/stores/resume-store";
import { ListSection } from "./list-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CertificationsForm() {
  const { content, addItem, updateItem, removeItem, reorderItems } =
    useResumeStore();
  const items = content.certifications;

  return (
    <ListSection
      title="Certifications"
      description="Licenses and professional certificates."
      items={items}
      onAdd={() => addItem("certifications")}
      onRemove={(id) => removeItem("certifications", id)}
      onReorder={(newItems) => reorderItems("certifications", newItems)}
      renderItem={(item) => (
        <div className="text-sm">
          <div className="font-semibold text-neutral-900 dark:text-neutral-100">
            {item.name || "Certificate"}
          </div>
          <div className="text-neutral-500 dark:text-neutral-400 text-xs">
            {item.issuer}
          </div>
        </div>
      )}
      renderForm={(item, _) => {
        const update = (data: any) =>
          updateItem("certifications", item.id, data);

        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
                Certificate Name
              </Label>
              <Input
                value={item.name}
                onChange={(e) => update({ name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
                Issuer / Organization
              </Label>
              <Input
                value={item.issuer || ""}
                onChange={(e) => update({ issuer: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
                  Date
                </Label>
                <Input
                  value={item.date || ""}
                  onChange={(e) => update({ date: e.target.value })}
                  placeholder="MM/YYYY"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
                  Credential URL
                </Label>
                <Input
                  value={item.url || ""}
                  onChange={(e) => update({ url: e.target.value })}
                />
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}
