"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useKeyboardShortcut, useEscapeKey } from "@/lib/hooks/use-keyboard-shortcut";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  IconCommand,
  IconPlus,
  IconLink,
  IconCode,
  IconPhoto,
  IconChartBar,
  IconBolt,
  IconFolderPlus,
  IconUser,
  IconChartLine,
  IconSearch,
  IconArrowRight,
  IconBrandGithub,
} from "@tabler/icons-react";

// ============================================
// TYPES
// ============================================

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  category: "proof" | "create" | "navigate" | "quick";
}

interface CommandPaletteProps {
  onAddProof?: (type?: string) => void;
  onAddSkill?: () => void;
  onAddProject?: () => void;
  onImportGithub?: () => void;
  className?: string;
}

// ============================================
// COMMAND PALETTE COMPONENT
// ============================================

export function CommandPalette({
  onAddProof,
  onAddSkill,
  onAddProject,
  onImportGithub,
  className,
}: CommandPaletteProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Register Ctrl+K shortcut
  useKeyboardShortcut({
    key: "k",
    modifiers: ["ctrl"],
    callback: () => setIsOpen(true),
  });

  // Close on Escape
  useEscapeKey(() => setIsOpen(false), isOpen);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Command items
  const commands = useMemo<CommandItem[]>(() => [
    // Proof commands
    {
      id: "add-proof",
      label: "Add Proof",
      description: "Add verifiable proof to your skills",
      icon: <IconPlus className="w-4 h-4" />,
      shortcut: "P",
      action: () => {
        setIsOpen(false);
        onAddProof?.();
      },
      category: "proof",
    },
    {
      id: "add-link",
      label: "Add Link Proof",
      description: "Paste a URL as proof",
      icon: <IconLink className="w-4 h-4" />,
      action: () => {
        setIsOpen(false);
        onAddProof?.("LINK");
      },
      category: "proof",
    },
    {
      id: "add-code",
      label: "Add Code Snippet",
      description: "Paste code as proof",
      icon: <IconCode className="w-4 h-4" />,
      action: () => {
        setIsOpen(false);
        onAddProof?.("CODE_SNIPPET");
      },
      category: "proof",
    },
    {
      id: "add-screenshot",
      label: "Add Screenshot",
      description: "Upload a screenshot as proof",
      icon: <IconPhoto className="w-4 h-4" />,
      action: () => {
        setIsOpen(false);
        onAddProof?.("SCREENSHOT");
      },
      category: "proof",
    },
    {
      id: "add-metric",
      label: "Add Metric",
      description: "Add measurable achievement",
      icon: <IconChartBar className="w-4 h-4" />,
      action: () => {
        setIsOpen(false);
        onAddProof?.("METRIC");
      },
      category: "proof",
    },
    // Create commands
    {
      id: "add-skill",
      label: "Add Skill",
      description: "Add a new skill to your profile",
      icon: <IconBolt className="w-4 h-4" />,
      shortcut: "S",
      action: () => {
        setIsOpen(false);
        onAddSkill?.();
      },
      category: "create",
    },
    {
      id: "add-project",
      label: "Add Project",
      description: "Create a new project",
      icon: <IconFolderPlus className="w-4 h-4" />,
      action: () => {
        setIsOpen(false);
        onAddProject?.();
      },
      category: "create",
    },
    {
      id: "import-github",
      label: "Import from GitHub",
      description: "Import repository as project",
      icon: <IconBrandGithub className="w-4 h-4" />,
      action: () => {
        setIsOpen(false);
        onImportGithub?.();
      },
      category: "create",
    },
    // Navigate commands
    {
      id: "go-profile",
      label: "Go to Profile",
      description: "Edit your profile",
      icon: <IconUser className="w-4 h-4" />,
      action: () => {
        setIsOpen(false);
        router.push("/dashboard/profile");
      },
      category: "navigate",
    },
    {
      id: "go-analytics",
      label: "Go to Analytics",
      description: "View your analytics",
      icon: <IconChartLine className="w-4 h-4" />,
      action: () => {
        setIsOpen(false);
        router.push("/dashboard/analytics");
      },
      category: "navigate",
    },
  ], [onAddProof, onAddSkill, onAddProject, onImportGithub, router]);

  // Filter commands based on search
  const filteredCommands = useMemo(() => {
    if (!search) return commands;
    
    const query = search.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(query) ||
        cmd.description?.toLowerCase().includes(query)
    );
  }, [commands, search]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {
      proof: [],
      create: [],
      navigate: [],
      quick: [],
    };
    
    filteredCommands.forEach((cmd) => {
      groups[cmd.category].push(cmd);
    });
    
    return groups;
  }, [filteredCommands]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;
      }
    },
    [filteredCommands, selectedIndex]
  );

  // Reset selected index when filtered results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Category labels
  const categoryLabels: Record<string, string> = {
    proof: "Add Proof",
    create: "Create",
    navigate: "Navigate",
    quick: "Quick Actions",
  };

  let globalIndex = -1;

  return (
    <>
      {/* Trigger Button (optional, shows shortcut hint) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-500 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors",
          className
        )}
      >
        <IconSearch className="w-3.5 h-3.5" />
        <span>Quick actions</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800 rounded">
          <IconCommand className="w-2.5 h-2.5" />K
        </kbd>
      </button>

      {/* Command Palette Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="p-0 max-w-lg overflow-hidden rounded-xl border-none shadow-2xl">
          <div className="bg-white dark:bg-neutral-900">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
              <IconSearch className="w-5 h-5 text-neutral-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search actions..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
              />
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded">
                ESC
              </kbd>
            </div>

            {/* Commands List */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filteredCommands.length === 0 ? (
                <div className="py-8 text-center text-sm text-neutral-500">
                  No results found
                </div>
              ) : (
                Object.entries(groupedCommands).map(([category, items]) => {
                  if (items.length === 0) return null;
                  
                  return (
                    <div key={category} className="mb-2">
                      <div className="px-2 py-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                        {categoryLabels[category]}
                      </div>
                      <div className="space-y-0.5">
                        {items.map((item) => {
                          globalIndex++;
                          const isSelected = globalIndex === selectedIndex;
                          
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={item.action}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                                isSelected
                                  ? "bg-neutral-100 dark:bg-neutral-800"
                                  : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                              )}
                            >
                              <div className={cn(
                                "p-1.5 rounded-md",
                                isSelected
                                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                                  : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                              )}>
                                {item.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                  {item.label}
                                </div>
                                {item.description && (
                                  <div className="text-xs text-neutral-500 truncate">
                                    {item.description}
                                  </div>
                                )}
                              </div>
                              {item.shortcut && (
                                <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded">
                                  {item.shortcut}
                                </kbd>
                              )}
                              {isSelected && (
                                <IconArrowRight className="w-4 h-4 text-neutral-400" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Hints */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
              <div className="flex items-center gap-3 text-[10px] text-neutral-400">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-[9px]">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-[9px]">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-[9px]">esc</kbd>
                  Close
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CommandPalette;
