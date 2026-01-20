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
      <div className="flex items-center gap-2">
        <h2 className="font-bold font-mono text-neutral-400 dark:text-neutral-600 tracking-tight uppercase text-xs">
          // Honors & Awards
        </h2>
        <span className="text-[10px] font-medium font-mono text-neutral-500">
          ({achievements.length})
        </span>
      </div>

      <div className="space-y-4">
        {sortedTypes.map((type) => (
          <div key={type} className="relative group/section">
            <div className="grid gap-2 relative">
              {groupedAchievements[type].map((item, index) => (
                <AchievementItem
                  key={item.id}
                  item={item}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === groupedAchievements[type].length - 1}
                  groupSize={groupedAchievements[type].length}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AchievementItem({
  item,
  index,
  isFirst,
  isLast,
  groupSize,
}: {
  item: Achievement;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  groupSize: number;
}) {
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
    <div className="relative">
      {/* Connector Lines - Dotted SVG */}
      {groupSize > 1 && (
        <div
          className="absolute left-[30px] top-0 bottom-0 flex flex-col items-center justify-center w-px pointer-events-none"
          style={{ zIndex: 0 }}
        >
          {/* Top segment */}
          {!isFirst && (
            <svg className="absolute -top-3 h-[42px] w-px overflow-visible">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="42"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="text-neutral-200 dark:text-neutral-800"
              />
            </svg>
          )}

          {/* Bottom segment */}
          {!isLast && (
            <svg className="absolute top-[30px] -bottom-3 w-px h-[calc(100%-18px)] overflow-visible">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="text-neutral-200 dark:text-neutral-800"
              />
            </svg>
          )}
        </div>
      )}

      <div
        className="group relative flex flex-col items-start gap-1 p-4 cursor-pointer select-none "
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-full flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="relative z-30">
              {/* Icon Wrapper z-30 to cover line */}
              <div className="mt-0.5 w-[28px] h-[28px] flex items-center justify-center rounded-md bg-neutral-200 dark:bg-neutral-900 ring-4 ring-neutral-50 dark:ring-[#0a0a0a]">
                <Icon className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              </div>
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base flex items-center gap-2">
                {item.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-neutral-500 mt-0.5 font-mono">
                {item.subtitle && <span>{item.subtitle}</span>}
                {item.subtitle && formattedDate && (
                  <span className="opacity-50">|</span>
                )}
                {formattedDate && <span>{formattedDate}</span>}
                {typeLabel && (formattedDate || item.subtitle) && (
                  <span className="opacity-50">|</span>
                )}
                {typeLabel && <span>{typeLabel}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {item.url && (
              <Link
                href={item.url}
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            )}
            <div
              className={cn(
                "p-2 text-neutral-400 transition-transform duration-300",
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
              className="overflow-hidden w-full pl-13"
            >
              <div className="pt-4 pb-2">
                <ul className="space-y-2 list-none">
                  {item.description.map((desc: string, i: number) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-[12px] text-neutral-600 dark:text-neutral-400 leading-normal"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 mt-2 shrink-0" />
                      <span
                        dangerouslySetInnerHTML={{ __html: parseLinks(desc) }}
                      />
                    </li>
                  ))}
                </ul>
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
