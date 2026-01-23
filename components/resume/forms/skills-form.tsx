"use client";

import React, { useState, useEffect } from "react";
import { useResumeStore } from "@/stores/resume-store";
import { ListSection } from "./list-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

    // Parse and update store immediately?
    // If we update store, parent re-renders, triggers useEffect.
    // We blocked useEffect with isTyping.

    const newSkills = newVal
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => ({ id: s, name: s })); // Simple ID strategy for now

    onUpdate(newSkills);
  };

  const handleBlur = () => {
    setIsTyping(false);
    // On blur, ensure formatted neatly?
    // setValue(skills.map(s => s.name).join(", "));
    // Actually, better to leave it as is so user doesn't feel it changed under them.
    // But we should reset isTyping so external updates (undo) work again.
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase text-neutral-500 dark:text-neutral-400">
        Skills List
      </Label>
      <Textarea
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="React, TypeScript, Node.js"
        className="h-24"
      />
      <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
        Separate skills with commas.
      </p>
    </div>
  );
}

export function SkillsForm() {
  const { content } = useResumeStore();
  const items = content.skills;

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
    <ListSection
      title="Skills"
      description="Group your skills by category."
      items={items}
      onAdd={addGroup}
      onRemove={removeGroup}
      onReorder={reorderGroups}
      renderItem={(item) => (
        <div className="text-sm">
          <div className="font-semibold text-neutral-900 dark:text-neutral-100">
            {item.name || "Category"}
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
                onChange={(e) => updateGroup(item.id, { name: e.target.value })}
                placeholder="Languages, Frameworks, etc."
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
  );
}
