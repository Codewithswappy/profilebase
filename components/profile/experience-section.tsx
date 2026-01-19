"use client";

import { Experience } from "@prisma/client";
import { ChevronDown, Building2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import * as Collapsible from "@radix-ui/react-collapsible";

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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
      {grouped.map(([company, roles], groupIndex) => (
        <CompanyGroup
          key={company}
          company={company}
          roles={roles}
          isFirstGroup={groupIndex === 0}
          isLast={groupIndex === grouped.length - 1}
        />
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
    <div className={cn("relative", !isLast && "pb-8")}>
      {/* Continuous Timeline Line */}
      <div
        className={cn(
          "absolute left-4 w-px bg-neutral-200 dark:bg-neutral-800 -translate-x-1/2",
          isFirstGroup ? "top-6" : "top-0",
          isLast ? "bottom-auto h-full" : "bottom-0",
        )}
      />

      {/* Company Header */}
      <div className="relative flex items-center gap-4 mb-2">
        <div className="relative z-10 w-8 h-8 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shrink-0 shadow-sm overflow-hidden p-1">
          {roles[0].logo ? (
            <img
              src={roles[0].logo}
              alt={company}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <Building2 className="w-5 h-5 text-neutral-500" />
          )}
        </div>
        <div className="flex flex-col pt-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 leading-none">
              {company}
            </h3>
            {hasCurrent && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
            )}
          </div>
          {roles[0].location && (
            <span className="text-xs text-neutral-400 font-medium mt-1.5">
              {roles[0].location}
            </span>
          )}
        </div>
      </div>

      {/* Roles container */}
      <div className="pl-14 space-y-8">
        {roles.map((role, index) => (
          <RoleItem
            key={role.id}
            experience={role}
            defaultOpen={isFirstGroup && index === 0}
            isLast={isLast && index === roles.length - 1}
          />
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
    <div className="relative">
      <Collapsible.Root
        open={isOpen}
        onOpenChange={setIsOpen}
        className="group"
      >
        <Collapsible.Trigger className="w-full text-left cursor-pointer outline-none">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-neutral-900  dark:text-neutral-100 text-sm">
                  {experience.position}
                </h4>
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
                <span className="font-mono">{dateRange}</span>
              </div>
            </div>

            <ChevronDown
              className={cn(
                "w-4 h-4 text-neutral-400 transition-transform duration-300 shrink-0 mt-1",
                isOpen && "rotate-180",
              )}
            />
          </div>
        </Collapsible.Trigger>

        <Collapsible.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 overflow-hidden">
          <div className=" space-y-3">
            {experience.description && (
              <p className="text-[12px] text-neutral-600 dark:text-neutral-400">
                {experience.description}
              </p>
            )}

            {/* Skills */}
            {experience.skills && experience.skills.length > 0 && (
              <div className="">
                <div className="flex flex-wrap gap-1">
                  {experience.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="relative inline-flex items-center px-2.5 py-0.5 text-[10px] font-medium bg-neutral-50 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400 rounded-[3px] overflow-hidden"
                    >
                      <svg className="absolute inset-0 w-full h-full text-neutral-300 dark:text-neutral-600">
                        <rect
                          x="0.5"
                          y="0.5"
                          width="calc(100% - 1px)"
                          height="calc(100% - 1px)"
                          rx="3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                        />
                      </svg>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
    </div>
  );
}
