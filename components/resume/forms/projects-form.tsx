"use client";

import { useResumeStore } from "@/stores/resume-store";
import { ListSection } from "./list-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/editor/rich-text-editor";

export function ProjectsForm() {
  const { content, addItem, updateItem, removeItem, reorderItems } =
    useResumeStore();
  const items = content.projects;

  return (
    <ListSection
      title="Projects"
      description="Showcase your best work and side projects."
      items={items}
      onAdd={() => addItem("projects")}
      onRemove={(id) => removeItem("projects", id)}
      onReorder={(newItems) => reorderItems("projects", newItems)}
      renderItem={(item) => (
        <div className="text-sm">
          <div className="font-semibold text-neutral-900 dark:text-neutral-100">
            {item.title || "New Project"}
          </div>
          <div className="text-neutral-500 dark:text-neutral-400 text-xs truncate max-w-[200px]">
            {item.subtitle ||
              item.description?.replace(/<[^>]*>?/gm, "") ||
              "No details"}
          </div>
        </div>
      )}
      renderForm={(item, _) => {
        const update = (data: any) => updateItem("projects", item.id, data);

        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
                Project Title
              </Label>
              <Input
                value={item.title}
                onChange={(e) => update({ title: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
                Subtitle / Tech Snippet
              </Label>
              <Input
                placeholder="Built with React & Node.js"
                value={item.subtitle || ""}
                onChange={(e) => update({ subtitle: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
                  Project URL
                </Label>
                <Input
                  value={item.url || ""}
                  onChange={(e) => update({ url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
                  Repo URL
                </Label>
                <Input
                  value={item.repoUrl || ""}
                  onChange={(e) => update({ repoUrl: e.target.value })}
                  placeholder="github.com/..."
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
                Description
              </Label>
              <RichTextEditor
                value={item.description || ""}
                onChange={(v) => update({ description: v })}
                placeholder="What did you build and why?"
              />
            </div>
          </div>
        );
      }}
    />
  );
}
