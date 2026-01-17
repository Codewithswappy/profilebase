"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { createSkill } from "@/lib/actions/skill";
import { IconPlus, IconLoader2, IconX, IconSearch } from "@tabler/icons-react";

interface SelectSkillsProps {
  skills: Array<{ id: string; name: string; category?: string }>;
  selectedSkillIds: string[];
  onToggle: (skillId: string) => void;
  onSkillCreated: (skill: { id: string; name: string }) => void;
  projectTitle?: string;
  className?: string;
}

export function SelectSkills({
  skills,
  selectedSkillIds,
  onToggle,
  onSkillCreated,
  projectTitle,
  className,
}: SelectSkillsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [newSkillName, setNewSkillName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter skills by search
  const filteredSkills = skills.filter((skill) =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if search query could be a new skill
  const canCreateNew =
    searchQuery.length >= 2 &&
    !skills.some((s) => s.name.toLowerCase() === searchQuery.toLowerCase());

  const handleCreateSkill = async () => {
    const skillName = newSkillName || searchQuery;
    if (!skillName.trim()) return;

    setIsCreating(true);
    setError(null);

    try {
      const result = await createSkill({ name: skillName.trim() });
      if (result.success) {
        onSkillCreated({ id: result.data.id, name: result.data.name });
        onToggle(result.data.id);
        setNewSkillName("");
        setSearchQuery("");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to create skill");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="font-semibold text-stone-900 mb-1">
          What skills does this evidence prove?
        </h3>
        <p className="text-sm text-stone-500">
          Select all skills demonstrated in this proof. You can add new skills
          if needed.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search or add skills..."
          className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent text-sm"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Selected skills */}
      {selectedSkillIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSkillIds.map((id) => {
            const skill = skills.find((s) => s.id === id);
            if (!skill) return null;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onToggle(id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 transition-colors"
              >
                {skill.name}
                <IconX className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>
      )}

      {/* Skills list */}
      <div className="max-h-48 overflow-y-auto space-y-1 border border-stone-200 rounded-lg p-2">
        {filteredSkills.length === 0 && !canCreateNew ? (
          <div className="text-center py-4 text-sm text-stone-500">
            No skills found. Type to create a new one.
          </div>
        ) : (
          <>
            {filteredSkills.map((skill) => {
              const isSelected = selectedSkillIds.includes(skill.id);
              return (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => onToggle(skill.id)}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg text-left text-sm transition-all",
                    isSelected
                      ? "bg-stone-100 text-stone-900 font-medium"
                      : "text-stone-700 hover:bg-stone-50"
                  )}
                >
                  {skill.name}
                  {skill.category && (
                    <span className="ml-2 text-xs text-stone-400">
                      {skill.category}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Create new option */}
            {canCreateNew && (
              <button
                type="button"
                onClick={handleCreateSkill}
                disabled={isCreating}
                className="w-full px-3 py-2 rounded-lg text-left text-sm text-blue-600 hover:bg-blue-50 transition-all flex items-center gap-2"
              >
                {isCreating ? (
                  <IconLoader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <IconPlus className="w-4 h-4" />
                )}
                Create "{searchQuery}"
              </button>
            )}
          </>
        )}
      </div>

      {/* Selected count */}
      <div className="text-sm text-stone-500">
        {selectedSkillIds.length === 0 ? (
          <span className="text-amber-600">Select at least one skill</span>
        ) : (
          <span>
            {selectedSkillIds.length} skill
            {selectedSkillIds.length > 1 ? "s" : ""} selected
          </span>
        )}
      </div>
    </div>
  );
}

export default SelectSkills;
