"use client";

import { cn } from "@/lib/utils";
import {
  IconBrandGithub,
  IconLink,
  IconCode,
  IconChartBar,
  IconPhoto,
  IconRocket,
} from "@tabler/icons-react";

// ============================================
// TYPES
// ============================================

export interface EvidenceTemplate {
  id: string;
  label: string;
  icon: React.ReactNode;
  type: "LINK" | "CODE_SNIPPET" | "SCREENSHOT" | "METRIC" | "DESCRIPTION";
  title: string;
  content?: string;
  placeholder?: string;
}

interface EvidenceTemplatesProps {
  onSelect: (template: EvidenceTemplate) => void;
  className?: string;
}

// ============================================
// TEMPLATE DEFINITIONS
// ============================================

export const TEMPLATES: EvidenceTemplate[] = [
  {
    id: "github-pr",
    label: "GitHub PR",
    icon: <IconBrandGithub className="w-3.5 h-3.5" />,
    type: "LINK",
    title: "Pull Request: ",
    placeholder: "https://github.com/owner/repo/pull/123",
  },
  {
    id: "live-demo",
    label: "Live Demo",
    icon: <IconRocket className="w-3.5 h-3.5" />,
    type: "LINK",
    title: "Live Demo: ",
    placeholder: "https://your-app.vercel.app",
  },
  {
    id: "code-snippet",
    label: "Code Sample",
    icon: <IconCode className="w-3.5 h-3.5" />,
    type: "CODE_SNIPPET",
    title: "Implementation: ",
    content: "// Paste relevant code here\n",
  },
  {
    id: "performance",
    label: "Metric",
    icon: <IconChartBar className="w-3.5 h-3.5" />,
    type: "METRIC",
    title: "Improved ",
    content: "Reduced load time from 3s to 800ms (73% improvement)",
  },
  {
    id: "design",
    label: "Screenshot",
    icon: <IconPhoto className="w-3.5 h-3.5" />,
    type: "SCREENSHOT",
    title: "Design: ",
  },
];

// ============================================
// EVIDENCE TEMPLATES COMPONENT
// ============================================

export function EvidenceTemplates({
  onSelect,
  className,
}: EvidenceTemplatesProps) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {TEMPLATES.map((template) => (
        <button
          key={template.id}
          type="button"
          onClick={() => onSelect(template)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
        >
          {template.icon}
          {template.label}
        </button>
      ))}
    </div>
  );
}

export default EvidenceTemplates;
