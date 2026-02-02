"use client";

import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useResumeStore } from "@/stores/resume-store";
import { ListSection } from "./list-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ResumeTips } from "../resume-tips";
import { IconInfoCircle, IconChecks } from "@tabler/icons-react";

// Suggested skill categories for quick adding
const SUGGESTED_CATEGORIES = [
  { name: "Languages", example: "JavaScript, TypeScript, Python, Go, Rust" },
  { name: "Frameworks", example: "React, Next.js, Node.js, Express, Django" },
  { name: "Databases", example: "PostgreSQL, MongoDB, Redis, MySQL, DynamoDB" },
  {
    name: "Cloud & DevOps",
    example: "AWS, Docker, Kubernetes, CI/CD, Terraform",
  },
  { name: "Tools", example: "Git, VS Code, Jira, Figma, Postman" },
];

// Helper component to manage the raw string input separately from the structured store data
function SkillStringHelper({
  skills,
  onUpdate,
}: {
  skills: any[];
  onUpdate: (s: any[]) => void;
}) {
  const [value, setValue] = useState(() =>
    skills.map((s) => s.name).join(", "),
  );
  const [isTyping, setIsTyping] = useState(false);

  // Sync from store only if we're not actively typing (prevents cursor jumps/fighting)
  useEffect(() => {
    if (!isTyping) {
      setValue(skills.map((s) => s.name).join(", "));
    }
  }, [skills, isTyping]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setValue(newVal);
    setIsTyping(true);

    const newSkills = newVal
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => ({ id: s, name: s }));

    onUpdate(newSkills);
  };

  const handleBlur = () => {
    setIsTyping(false);
  };

  // Count skills
  const skillCount = skills.length;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
          Skills List
        </Label>
        <span
          className={`text-[10px] ${skillCount >= 3 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}
        >
          {skillCount} skill{skillCount !== 1 ? "s" : ""}
          {skillCount >= 3 && " ✓"}
        </span>
      </div>
      <Textarea
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="React, TypeScript, Node.js, PostgreSQL..."
        className="h-20"
      />
      <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
        Separate skills with commas. Match skills from target job descriptions.
      </p>
    </div>
  );
}

export function SkillsForm() {
  const { content } = useResumeStore();
  const items = content.skills;

  // Total skill count across all categories
  const totalSkills = useMemo(() => {
    return items.reduce((acc, group) => acc + group.skills.length, 0);
  }, [items]);

  const addGroup = () => {
    useResumeStore.setState((state) => ({
      content: {
        ...state.content,
        skills: [
          ...state.content.skills,
          { id: crypto.randomUUID(), name: "New Category", skills: [] },
        ],
      },
    }));
  };

  // Quick add suggested category
  const addSuggestedCategory = (category: (typeof SUGGESTED_CATEGORIES)[0]) => {
    useResumeStore.setState((state) => ({
      content: {
        ...state.content,
        skills: [
          ...state.content.skills,
          {
            id: crypto.randomUUID(),
            name: category.name,
            skills: category.example
              .split(", ")
              .map((s) => ({ id: s, name: s })),
          },
        ],
      },
    }));
  };

  const removeGroup = (id: string) => {
    useResumeStore.setState((state) => ({
      content: {
        ...state.content,
        skills: state.content.skills.filter((s) => s.id !== id),
      },
    }));
  };

  const updateGroup = (id: string, data: any) => {
    useResumeStore.setState((state) => ({
      content: {
        ...state.content,
        skills: state.content.skills.map((s) =>
          s.id === id ? { ...s, ...data } : s,
        ),
      },
    }));
  };

  const reorderGroups = (newItems: any[]) => {
    useResumeStore.setState((state) => ({
      content: { ...state.content, skills: newItems },
    }));
  };

  return (
    <div className="space-y-4">
      {/* Tips Section */}
      <div className="px-6 pt-4">
        <ResumeTips section="skills" />
      </div>

      {/* Skill Count Summary */}
      <div className="px-6">
        <div
          className={cn(
            "flex items-center justify-between p-3 rounded-lg border transition-colors",
            totalSkills >= 8
              ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
              : totalSkills >= 4
                ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
          )}
        >
          <div className="flex items-center gap-2">
            <IconChecks
              className={cn(
                "w-4 h-4",
                totalSkills >= 8
                  ? "text-emerald-600 dark:text-emerald-400"
                  : totalSkills >= 4
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-red-600 dark:text-red-400",
              )}
            />
            <span
              className={cn(
                "text-xs font-medium",
                totalSkills >= 8
                  ? "text-emerald-800 dark:text-emerald-300"
                  : totalSkills >= 4
                    ? "text-amber-800 dark:text-amber-300"
                    : "text-red-800 dark:text-red-300",
              )}
            >
              Total Skills
            </span>
          </div>
          <span
            className={cn(
              "text-xs font-bold",
              totalSkills >= 8
                ? "text-emerald-700 dark:text-emerald-400"
                : totalSkills >= 4
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-red-700 dark:text-red-400",
            )}
          >
            {totalSkills} / 8+ recommended
          </span>
        </div>
      </div>

      {/* Quick Add Categories */}
      {items.length < 4 && (
        <div className="px-6">
          <div className="flex items-center gap-1.5 mb-2">
            <IconInfoCircle className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
              Quick add category:
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_CATEGORIES.filter(
              (cat) =>
                !items.some(
                  (item) => item.name.toLowerCase() === cat.name.toLowerCase(),
                ),
            )
              .slice(0, 4)
              .map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => addSuggestedCategory(cat)}
                  className="px-2 py-1 text-[10px] rounded bg-lime-50 dark:bg-lime-900/20 text-lime-700 dark:text-lime-400 border border-lime-200 dark:border-lime-800 hover:bg-lime-100 dark:hover:bg-lime-900/30 transition-colors"
                >
                  + {cat.name}
                </button>
              ))}
          </div>
        </div>
      )}

      <ListSection
        title="Skills"
        description="Group your skills by category for better ATS parsing. Include 8-15 relevant skills."
        items={items}
        onAdd={addGroup}
        onRemove={removeGroup}
        onReorder={reorderGroups}
        renderItem={(item) => (
          <div className="text-sm">
            <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              {item.name || "Category"}
              <span className="text-[10px] font-normal text-neutral-400">
                ({item.skills.length})
              </span>
            </div>
            <div className="text-neutral-500 dark:text-neutral-400 text-xs truncate max-w-[200px]">
              {item.skills.map((s: any) => s.name).join(", ") || "No skills"}
            </div>
          </div>
        )}
        renderForm={(item, _) => {
          return (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
                  Category Name
                </Label>
                <Input
                  value={item.name}
                  onChange={(e) =>
                    updateGroup(item.id, { name: e.target.value })
                  }
                  placeholder="e.g., Languages, Frameworks, Tools"
                />
              </div>

              <SkillStringHelper
                skills={item.skills}
                onUpdate={(s) => updateGroup(item.id, { skills: s })}
              />
            </div>
          );
        }}
      />
    </div>
  );
}
