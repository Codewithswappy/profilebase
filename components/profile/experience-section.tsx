"use client";

import { Experience } from "@prisma/client";
import { ChevronDown, Building2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";

interface ExperienceSectionProps {
  experiences: Experience[];
}

// Group experiences by company
function groupByCompany(experiences: Experience[]) {
  const groups: Record<string, Experience[]> = {};
  experiences.forEach((exp) => {
    if (!groups[exp.company]) {
      groups[exp.company] = [];
    }
    groups[exp.company].push(exp);
  });
  return Object.entries(groups);
}

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  if (!experiences || experiences.length === 0) return null;

  const grouped = groupByCompany(experiences);

  // Create a flattened list to determine global index for "first open" logic
  // But actually the user request implies "only first one should stay open by default"
  // which usually means the very first role of the very first company.

  return (
    <div className="space-y-6">
      {grouped.map(([company, roles], groupIndex) => (
        <motion.div
          key={company}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: groupIndex * 0.1, duration: 0.4 }}
        >
          <CompanyGroup
            company={company}
            roles={roles}
            isFirstGroup={groupIndex === 0}
            isLast={groupIndex === grouped.length - 1}
          />
        </motion.div>
      ))}
    </div>
  );
}

function CompanyGroup({
  company,
  roles,
  isFirstGroup,
  isLast,
}: {
  company: string;
  roles: Experience[];
  isFirstGroup: boolean;
  isLast: boolean;
}) {
  const hasCurrent = roles.some((r) => r.current);

  return (
    <div className={cn("relative pl-0 md:pl-0", !isLast && "pb-0")}>
      {/* Vertical Timeline Line */}
      <div
        className={cn(
          "absolute left-[19px] top-[40px] bottom-0 w-px bg-linear-to-b from-neutral-200 via-neutral-200 to-transparent dark:from-neutral-800 dark:via-neutral-800",
          isLast ? "h-[calc(100%-10px)]" : "h-full",
        )}
      />

      {/* Company Header */}
      <div className="relative flex items-center gap-4">
        <div className="relative z-10 w-8 h-8 rounded-lg bg-white border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shrink-0 shadow-sm overflow-hidden ring-4 ring-neutral-50 dark:ring-neutral-950">
          {roles[0].logo ? (
            <img
              src={roles[0].logo}
              alt={company}
              className="w-full h-full object-contain p-1"
            />
          ) : (
            <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="text-md font-bold text-neutral-900 dark:text-neutral-100 leading-none tracking-tight">
              {company}
            </h3>
            {hasCurrent && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </div>
          {roles[0].location && (
            <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 mt-1 uppercase tracking-wide">
              {roles[0].location}
            </span>
          )}
        </div>
      </div>

      {/* Roles container */}
      <div className="space-y-6">
        {roles.map((role, index) => (
          <div key={role.id} className="relative pl-12 md:pl-14">
            {/* Horizontal Connector */}
            <div className="absolute left-[20px] top-[14px] w-[20px] md:w-[28px] h-px bg-neutral-200 dark:bg-neutral-800" />
            {/* Connector Node */}
            <div className="absolute left-[18px] top-[12px] w-1.5 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 ring-2 ring-white dark:ring-neutral-950" />

            <RoleItem
              experience={role}
              defaultOpen={isFirstGroup && index === 0}
              isLast={isLast && index === roles.length - 1}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function RoleItem({
  experience,
  defaultOpen,
  isLast,
}: {
  experience: Experience;
  defaultOpen: boolean;
  isLast: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Format date range
  const dateRange = `${format(new Date(experience.startDate), "MMM yyyy")} – ${
    experience.current
      ? "Present"
      : experience.endDate
        ? format(new Date(experience.endDate), "MMM yyyy")
        : ""
  }`;

  return (
    <div className="relative group/role">
      <div
        className="cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-full text-left outline-none">
          <div className="flex items-start justify-between gap-4 group-hover/role:translate-x-1 transition-transform duration-300">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-[13px]">
                  {experience.position}
                </h4>
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2 font-mono">
                <span>{dateRange}</span>
              </div>
            </div>

            <div
              className={cn(
                "transition-transform duration-300 shrink-0 mt-1 text-neutral-400",
                isOpen && "rotate-180",
              )}
            >
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-4">
              {experience.description && (
                <div className="text-[12px] text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
                  {experience.description.split("\n").map((line, i) => {
                    const trimmed = line.trim();
                    const isBullet =
                      trimmed.startsWith("- ") ||
                      trimmed.startsWith("* ") ||
                      trimmed.startsWith("• ");

                    if (isBullet) {
                      const content = trimmed.substring(1).trim();
                      return (
                        <div
                          key={i}
                          className="flex items-start gap-2 mb-1.5 pl-2"
                        >
                          <span className="w-1 h-1 rounded-full bg-neutral-400 dark:bg-neutral-600 mt-2 shrink-0 opacity-80" />
                          <span
                            dangerouslySetInnerHTML={{
                              __html: parseLinks(content),
                            }}
                          />
                        </div>
                      );
                    }

                    // Handle empty lines as spacers
                    if (!trimmed) {
                      return <div key={i} className="h-2" />;
                    }

                    return (
                      <p
                        key={i}
                        className="mb-1.5 last:mb-0"
                        dangerouslySetInnerHTML={{ __html: parseLinks(line) }}
                      />
                    );
                  })}
                </div>
              )}

              {/* Skills */}
              {experience.skills && experience.skills.length > 0 && (
                <div className="pt-1">
                  <div className="flex flex-wrap gap-1.5">
                    {experience.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded border border-dashed border-neutral-200 dark:border-neutral-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper to parse [text](url) to <a href="url" ...>text</a>
function parseLinks(text: string) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  return text.replace(linkRegex, (match, text, url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="underline decoration-neutral-300 dark:decoration-neutral-700 hover:decoration-neutral-900 dark:hover:decoration-neutral-400 underline-offset-4 transition-colors text-neutral-900 dark:text-neutral-200">${text}</a>`;
  });
}
