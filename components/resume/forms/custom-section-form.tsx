"use client";

import { useResumeStore } from "@/stores/resume-store";
import { ListSection } from "./list-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { v4 as uuidv4 } from "uuid";

interface CustomSectionFormProps {
  sectionId: string;
}

export function CustomSectionForm({ sectionId }: CustomSectionFormProps) {
  const { content, updateContent } = useResumeStore();

  // Find the specific custom section
  const sectionIndex = content.customSections.findIndex(
    (s) => s.id === sectionId,
  );
  const section = content.customSections[sectionIndex];

  if (!section) return null;

  // Helpers to update this specific section
  const updateSectionName = (name: string) => {
    const newSections = [...content.customSections];
    newSections[sectionIndex] = { ...section, name };
    updateContent({ customSections: newSections });
  };

  const addItem = () => {
    const newItem = {
      id: uuidv4(),
      title: "",
      subtitle: "",
      location: "",
      date: "",
      url: "",
      description: "",
    };
    const newSections = [...content.customSections];
    newSections[sectionIndex] = {
      ...section,
      items: [newItem, ...section.items], // Add to top
    };
    updateContent({ customSections: newSections });
  };

  const removeItem = (itemId: string) => {
    const newSections = [...content.customSections];
    newSections[sectionIndex] = {
      ...section,
      items: section.items.filter((i) => i.id !== itemId),
    };
    updateContent({ customSections: newSections });
  };

  const updateItem = (
    itemId: string,
    data: Partial<(typeof section.items)[0]>,
  ) => {
    const newSections = [...content.customSections];
    const itemIndex = section.items.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return;

    const newItems = [...section.items];
    newItems[itemIndex] = { ...newItems[itemIndex], ...data };

    newSections[sectionIndex] = { ...section, items: newItems };
    updateContent({ customSections: newSections });
  };

  const reorderItems = (newItems: typeof section.items) => {
    const newSections = [...content.customSections];
    newSections[sectionIndex] = { ...section, items: newItems };
    updateContent({ customSections: newSections });
  };

  const updateSectionLayout = (layout: "list" | "grid") => {
    const newSections = [...content.customSections];
    newSections[sectionIndex] = { ...section, layout };
    updateContent({ customSections: newSections });
  };

  return (
    <div className="space-y-6">
      {/* Section Renaming and Layout */}
      <div className="px-6 pt-4 space-y-4">
        <div className="space-y-2">
          <Label className="uppercase text-xs font-bold text-neutral-500">
            Section Title
          </Label>
          <Input
            value={section.name}
            onChange={(e) => updateSectionName(e.target.value)}
            placeholder="e.g. Volunteering, Awards..."
            className="font-semibold text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-xs font-bold text-neutral-500">
            Layout Style
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => updateSectionLayout("list")}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-lg border transition-all",
                section.layout === "list"
                  ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800"
                  : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400",
              )}
            >
              List (Detailed)
            </button>
            <button
              onClick={() => updateSectionLayout("grid")}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-lg border transition-all",
                section.layout === "grid"
                  ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800"
                  : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400",
              )}
            >
              Grid (Skills/Compact)
            </button>
          </div>
        </div>
      </div>

      <ListSection
        title={section.name || "Custom Section"}
        description="Add items to this section. You can customize the structure."
        items={section.items}
        onAdd={addItem}
        onRemove={removeItem}
        onReorder={reorderItems}
        renderItem={(item) => (
          <div className="text-sm">
            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
              {item.title || "New Item"}
            </div>
            {(item.subtitle || item.date) && (
              <div className="text-neutral-500 dark:text-neutral-400 text-xs mt-0.5">
                {item.subtitle} {item.date && <span>• {item.date}</span>}
              </div>
            )}
          </div>
        )}
        renderForm={(item) => (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input
                  value={item.title}
                  onChange={(e) =>
                    updateItem(item.id, { title: e.target.value })
                  }
                  placeholder="e.g. Project Name / Award Title"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Subtitle</Label>
                <Input
                  value={item.subtitle || ""}
                  onChange={(e) =>
                    updateItem(item.id, { subtitle: e.target.value })
                  }
                  placeholder="e.g. Organization / Achievement"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Date / Duration</Label>
                <Input
                  value={item.date || ""}
                  onChange={(e) =>
                    updateItem(item.id, { date: e.target.value })
                  }
                  placeholder="e.g. 2020 - 2021"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input
                  value={item.location || ""}
                  onChange={(e) =>
                    updateItem(item.id, { location: e.target.value })
                  }
                  placeholder="e.g. Remote / New York"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>URL / Link</Label>
              <Input
                value={item.url || ""}
                onChange={(e) => updateItem(item.id, { url: e.target.value })}
                placeholder="e.g. https://github.com/..."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <RichTextEditor
                value={item.description || ""}
                onChange={(value) =>
                  updateItem(item.id, { description: value })
                }
              />
            </div>
          </div>
        )}
      />
    </div>
  );
}
