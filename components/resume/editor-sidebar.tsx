"use client";

import { useResumeStore } from "@/stores/resume-store";
import { cn } from "@/lib/utils";
import {
  IconUser,
  IconBriefcase,
  IconCode,
  IconSchool,
  IconCertificate,
  IconList,
  IconLayoutList,
} from "@tabler/icons-react";

export function ResumeEditorSidebar() {
  const { activeSection } = useResumeStore();

  const sections = [
    { id: "profile", label: "Personal", icon: IconUser },
    { id: "summary", label: "Summary", icon: IconLayoutList },
    { id: "experience", label: "Experience", icon: IconBriefcase },
    { id: "projects", label: "Projects", icon: IconCode },
    { id: "skills", label: "Skills", icon: IconList },
    { id: "education", label: "Education", icon: IconSchool },
    { id: "certifications", label: "Certificates", icon: IconCertificate },
  ];

  return (
    <div className="flex flex-row p-2 gap-2 overflow-x-auto no-scrollbar w-full items-center bg-neutral-50/50 dark:bg-neutral-900/50">
      {sections.map((section) => {
        const isActive = activeSection === section.id;
        return (
          <button
            key={section.id}
            onClick={() =>
              useResumeStore.setState({ activeSection: section.id })
            }
            className={cn(
              "shrink-0 flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all duration-200 border",
              isActive
                ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border-neutral-200 dark:border-neutral-700 shadow-sm ring-1 ring-neutral-900/5 dark:ring-white/10"
                : "text-neutral-500 dark:text-neutral-400 border-transparent hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-200",
            )}
          >
            <section.icon
              className={cn(
                "w-4 h-4",
                isActive ? "text-lime-600 dark:text-lime-400" : "opacity-70",
              )}
              strokeWidth={1.5}
            />
            <span className="whitespace-nowrap">{section.label}</span>
          </button>
        );
      })}
    </div>
  );
}
