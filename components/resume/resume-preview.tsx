"use client";

import { ResumeContent } from "@/lib/schemas/resume";
import { useRef, useState, useEffect } from "react";
import { ModernTemplate } from "./renderer/modern-template";
import { MinimalTemplate } from "./renderer/minimal-template";
import { ClassicTemplate } from "./renderer/classic-template";
import { ExecutiveTemplate } from "./renderer/executive-template";
import { ProfessionalTemplate } from "./renderer/professional-template";

export type TemplateId =
  | "modern"
  | "minimal"
  | "classic"
  | "executive"
  | "professional"
  | "creative";

interface ResumePreviewProps {
  content: ResumeContent;
  template?: TemplateId;
}

export function ResumePreview({
  content,
  template = "modern",
}: ResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Auto-fit preview to container
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const parent = containerRef.current.parentElement;
      if (!parent) return;

      const availableWidth = parent.clientWidth - 80;
      const baseWidth = 794; // A4 width at 96 DPI
      const newScale = Math.min(availableWidth / baseWidth, 1.2);
      setScale(newScale);
    };

    window.addEventListener("resize", updateScale);
    const timer = setTimeout(updateScale, 100);

    return () => {
      window.removeEventListener("resize", updateScale);
      clearTimeout(timer);
    };
  }, []);

  // Render the selected template
  const renderTemplate = () => {
    switch (template) {
      case "minimal":
        return <MinimalTemplate content={content} />;
      case "classic":
        return <ClassicTemplate content={content} />;
      case "executive":
        return <ExecutiveTemplate content={content} />;
      case "professional":
        return <ProfessionalTemplate content={content} />;
      case "modern":
      default:
        return <ModernTemplate content={content} />;
    }
  };

  return (
    <div className="relative py-10" ref={containerRef}>
      <div
        className="bg-white shadow-2xl transition-transform origin-top duration-200 print:shadow-none print:transform-none"
        style={{
          width: "794px",
          minHeight: "1123px",
          transform: `scale(${scale})`,
        }}
      >
        {renderTemplate()}
      </div>
    </div>
  );
}
