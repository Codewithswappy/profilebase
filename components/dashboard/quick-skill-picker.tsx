"use client";

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { createSkill } from "@/lib/actions/skill";
import {
  IconCheck,
  IconPlus,
  IconX,
  IconLoader2,
  IconSearch,
} from "@tabler/icons-react";

// ============================================
// TYPES
// ============================================

interface Skill {
  id: string;
  name: string;
  category?: string;
}

interface QuickSkillPickerProps {
  skills: Skill[];
  selectedIds: string[];
  onToggle: (skillId: string) => void;
  onSkillCreated?: (skill: Skill) => void;
  suggestedSkills?: string[];
  maxDisplay?: number;
  className?: string;
}

// ============================================
// SKILL CATEGORY COLORS
// ============================================

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  LANGUAGE: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
  },
  FRAMEWORK: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800",
  },
  TOOL: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
  },
  DATABASE: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  CONCEPT: {
    bg: "bg-pink-50 dark:bg-pink-900/20",
    text: "text-pink-700 dark:text-pink-400",
    border: "border-pink-200 dark:border-pink-800",
  },
  SOFT_SKILL: {
    bg: "bg-orange-50 dark:bg-orange-900/20",
    text: "text-orange-700 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-800",
  },
  OTHER: {
    bg: "bg-neutral-50 dark:bg-neutral-800",
    text: "text-neutral-700 dark:text-neutral-300",
    border: "border-neutral-200 dark:border-neutral-700",
  },
};

// ============================================
// QUICK SKILL PICKER COMPONENT
// ============================================

export function QuickSkillPicker({
  skills,
  selectedIds,
  onToggle,
  onSkillCreated,
  suggestedSkills = [],
  maxDisplay = 20,
  className,
}: QuickSkillPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Filter skills based on search
  const filteredSkills = useMemo(() => {
    if (!searchQuery) return skills;
    const query = searchQuery.toLowerCase();
    return skills.filter((skill) =>
      skill.name.toLowerCase().includes(query)
    );
  }, [skills, searchQuery]);

  // Skills to display (with limit)
  const displaySkills = useMemo(() => {
    if (showAll) return filteredSkills;
    return filteredSkills.slice(0, maxDisplay);
  }, [filteredSkills, showAll, maxDisplay]);

  // Check if we can create a new skill
  const canCreateSkill = useMemo(() => {
    if (!searchQuery.trim()) return false;
    const query = searchQuery.toLowerCase().trim();
    return !skills.some((s) => s.name.toLowerCase() === query);
  }, [searchQuery, skills]);

  // Create new skill
  const handleCreateSkill = useCallback(async () => {
    if (!canCreateSkill || isCreating) return;

    setIsCreating(true);
    try {
      const result = await createSkill({
        name: searchQuery.trim(),
        category: "OTHER",
      });

      if (result.success && result.data) {
        onSkillCreated?.(result.data);
        onToggle(result.data.id);
        setSearchQuery("");
      }
    } catch (error) {
      console.error("Failed to create skill:", error);
    } finally {
      setIsCreating(false);
    }
  }, [canCreateSkill, isCreating, searchQuery, onSkillCreated, onToggle]);

  // Get color for skill
  const getSkillColors = (category?: string) => {
    return CATEGORY_COLORS[category || "OTHER"] || CATEGORY_COLORS.OTHER;
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Search Input */}
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search or create skill..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors"
        />
      </div>

      {/* Selected Skills Count */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span className="font-medium">{selectedIds.length} skill{selectedIds.length !== 1 ? "s" : ""} selected</span>
          <button
            type="button"
            onClick={() => selectedIds.forEach(id => onToggle(id))}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Suggested Skills (from URL detection) */}
      {suggestedSkills.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Suggested Skills
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestedSkills.map((skillName) => {
              const existingSkill = skills.find(
                (s) => s.name.toLowerCase() === skillName.toLowerCase()
              );
              const isSelected = existingSkill
                ? selectedIds.includes(existingSkill.id)
                : false;

              return (
                <button
                  key={skillName}
                  type="button"
                  onClick={() => {
                    if (existingSkill) {
                      onToggle(existingSkill.id);
                    } else {
                      // Create and select
                      setSearchQuery(skillName);
                    }
                  }}
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                    isSelected
                      ? "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700"
                      : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/30"
                  )}
                >
                  {isSelected ? (
                    <IconCheck className="w-3 h-3" />
                  ) : (
                    <IconPlus className="w-3 h-3" />
                  )}
                  {skillName}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Skills Grid */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
          Your Skills
        </span>
        
        {skills.length === 0 ? (
          <div className="text-center py-6 text-sm text-neutral-500">
            No skills yet. Type above to create one.
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {displaySkills.map((skill) => {
              const isSelected = selectedIds.includes(skill.id);
              const colors = getSkillColors(skill.category);

              return (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => onToggle(skill.id)}
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all",
                    isSelected
                      ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white"
                      : cn(colors.bg, colors.text, colors.border, "hover:opacity-80")
                  )}
                >
                  {isSelected && <IconCheck className="w-3 h-3" />}
                  {skill.name}
                </button>
              );
            })}

            {/* Show More Button */}
            {filteredSkills.length > maxDisplay && !showAll && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="px-2.5 py-1.5 rounded-full text-xs font-medium text-neutral-500 border border-dashed border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                +{filteredSkills.length - maxDisplay} more
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create New Skill */}
      {canCreateSkill && (
        <button
          type="button"
          onClick={handleCreateSkill}
          disabled={isCreating}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 transition-colors disabled:opacity-50"
        >
          {isCreating ? (
            <IconLoader2 className="w-4 h-4 animate-spin" />
          ) : (
            <IconPlus className="w-4 h-4" />
          )}
          Create "{searchQuery.trim()}"
        </button>
      )}
    </div>
  );
}

export default QuickSkillPicker;
