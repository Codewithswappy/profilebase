"use client";

import { Achievement } from "@prisma/client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown,
  ExternalLink,
  Award,
  Trophy,
  Medal,
  Star,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AchievementsSectionProps {
  achievements: Achievement[];
  showAchievements: boolean;
}

export function AchievementsSection({
  achievements,
  showAchievements,
}: AchievementsSectionProps) {
  if (!showAchievements || achievements.length === 0) return null;

  // Group achievements by type
  const groupedAchievements = achievements.reduce(
    (acc, item) => {
      const type = item.type || "award";
      if (!acc[type]) acc[type] = [];
      acc[type].push(item);
      return acc;
    },
    {} as Record<string, Achievement[]>,
  );

  // Define preferred order
  const order = ["award", "hackathon", "oss", "badge"];
  // Get all types that exist in data, sorted by defined order + others at the end
  const sortedTypes = Object.keys(groupedAchievements).sort((a, b) => {
    const indexA = order.indexOf(a);
    const indexB = order.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between md:justify-start gap-4 mb-6">
        <h2 className="font-mono text-xs font-bold text-neutral-500 dark:text-neutral-500 tracking-wider uppercase flex items-center gap-2">
          // Honors & Awards
        </h2>
        <span className="text-[10px] font-medium font-mono text-neutral-400 dark:text-neutral-600">
          // {achievements.length}
        </span>
      </div>

      <div className="space-y-8">
        {sortedTypes.map((type) => (
          <div key={type} className="relative group/section">
            {/* Vertical Timeline Line (Dashed for Achievements) */}
            <div className="absolute left-1px top-[10px] bottom-0 w-px border-l border-dashed border-neutral-300 dark:border-neutral-700 h-full" />

            <div className="space-y-6 relative">
              {groupedAchievements[type].map((item, index) => (
                <motion.div
                  key={item.id}
                  className="relative pl-8 md:pl-8"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  {/* Horizontal Connector (Dashed) */}
                  <div className="absolute left-0 top-[14px] w-[20px] md:w-[28px] h-px border-t border-dashed border-neutral-300 dark:border-neutral-700" />
                  {/* Connector Node (Diamond) */}
                  <div className="absolute -left-[4px] top-[10px] w-2 h-2 rotate-45 bg-white dark:bg-neutral-950 border border-neutral-400 dark:border-neutral-600 z-10" />

                  <AchievementItem item={item} />
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AchievementItem({ item }: { item: Achievement }) {
  const [isOpen, setIsOpen] = useState(false);

  const icons: Record<string, React.ElementType> = {
    award: Trophy,
    badge: Medal,
    hackathon: Award,
    oss: Star,
  };
  const Icon = icons[item.type] || Trophy;

  const formattedDate = item.date
    ? new Date(item.date)
        .toLocaleDateString("en-US", {
          month: "2-digit",
          year: "numeric",
        })
        .replace("/", ".")
    : "";

  const typeLabels: Record<string, string> = {
    award: "Award",
    badge: "Badge",
    hackathon: "Hackathon",
    oss: "Open Source Project",
  };

  const typeLabel = typeLabels[item.type] || item.type;

  return (
    <div className="relative group/role">
      <div
        className="group relative flex flex-col items-start gap-1 cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-full flex items-start justify-between gap-4 group-hover:translate-x-1 transition-transform duration-300">
          <div className="flex items-start gap-4 flex-1">
            <div className="relative z-30">
              {/* Icon Wrapper */}
              <div className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shrink-0 shadow-sm overflow-hidden ring-4 ring-neutral-50 dark:ring-neutral-950">
                <Icon className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              </div>
            </div>

            <div className="flex-1 pt-1">
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm leading-none">
                {item.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-neutral-500 mt-1.5 font-mono uppercase tracking-wide">
                {item.subtitle && <span>{item.subtitle}</span>}
                {item.subtitle && formattedDate && (
                  <span className="opacity-30">|</span>
                )}
                {formattedDate && <span>{formattedDate}</span>}
                {typeLabel && (formattedDate || item.subtitle) && (
                  <span className="opacity-30">|</span>
                )}
                {typeLabel && <span>{typeLabel}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 pt-1">
            {item.url && (
              <Link
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                title="View Link"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
            <div
              className={cn(
                "p-1 text-neutral-400 transition-transform duration-300",
                isOpen && "rotate-180",
              )}
            >
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && item.description.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden w-full pl-[48px]"
            >
              <div className="space-y-1 text-[12px] text-neutral-600 dark:text-neutral-400">
                {item.description.map(
                  (descBlock: string, blockIndex: number) => (
                    <div key={blockIndex} className="block">
                      {descBlock.split("\n").map((line, lineIndex) => {
                        const trimmed = line.trim();
                        const isBullet =
                          trimmed.startsWith("- ") ||
                          trimmed.startsWith("* ") ||
                          trimmed.startsWith("• ");

                        // If it's the very first line of a block and NOT a bullet, treat it as a main list item (default behavior)
                        // OR if the user explicitly used bullets, respect them.
                        // Current behavior: Every `descBlock` was a list item.
                        // New behavior: We preserve that wrapping unless we detect internal structure.

                        // Actually, simpler approach:
                        // Treat every `descBlock` as a potential multi-line content.
                        // If a line is a bullet, render bullet.
                        // If it's not, renders as text.
                        // But we want to maintain the "list" look of the Achievements section.

                        if (isBullet) {
                          const content = trimmed.substring(1).trim();
                          return (
                            <div
                              key={`${blockIndex}-${lineIndex}`}
                              className="flex items-start gap-2 leading-relaxed mb-1"
                            >
                              <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700 mt-2 shrink-0" />
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: parseLinks(content),
                                }}
                              />
                            </div>
                          );
                        }

                        // Non-bullet line
                        // If this is the start of the block and it's not a bullet, should we force a bullet?
                        // The original code forced a bullet for every item.
                        // If we stop forcing it, we might break existing designs unless we check.
                        // Let's force a bullet ONLY if the user didn't provide one, strictly for the first line?
                        // Or imply that `description` array IS the list.

                        // Decision: Let's render it as a bullet item IF it's the root line, otherwise indented text?
                        // Actually, if we just render lines, "Main Title" becomes a text.
                        // The user expects the array items to be distinct points.

                        return (
                          <div
                            key={`${blockIndex}-${lineIndex}`}
                            className="flex items-start gap-2 leading-relaxed mb-1"
                          >
                            {
                              /* Always add bullet for the first line of the block if it doesn't have one? */
                              lineIndex === 0 && !isBullet ? (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700 mt-2 shrink-0" />
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html: parseLinks(line),
                                    }}
                                  />
                                </>
                              ) : (
                                // Sub-text or indented?
                                <span
                                  className="pl-3 block"
                                  dangerouslySetInnerHTML={{
                                    __html: parseLinks(line),
                                  }}
                                />
                              )
                            }
                          </div>
                        );
                      })}
                    </div>
                  ),
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Helper to parse [text](url) to <a href="url" ...>text</a>
function parseLinks(text: string) {
  // Regex for markdown links: [text](http://...)
  // We'll replace them with <a ...>text</a> tags
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  return text.replace(linkRegex, (match, text, url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="underline decoration-neutral-300 dark:decoration-neutral-700 hover:decoration-neutral-900 dark:hover:decoration-neutral-400 underline-offset-4 transition-colors text-neutral-900 dark:text-neutral-200">${text}</a>`;
  });
}
