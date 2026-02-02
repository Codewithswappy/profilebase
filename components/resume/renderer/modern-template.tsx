"use client";

import React from "react";
import { ResumeContent } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";

interface TemplateProps {
  content: ResumeContent;
}

/**
 * Modern Template - Dense Tech Style
 * Dynamic Order & Custom Colors support
 */
export function ModernTemplate({ content }: TemplateProps) {
  const {
    profile,
    settings,
    customSections = [],
    sectionOrder = [
      "summary",
      "experience",
      "projects",
      "education",
      "skills",
      "certifications",
    ],
  } = content;

  // Defaults
  const themeColor = settings?.themeColor || "#000000";
  const sectionTitles = (settings?.sectionTitles || {}) as Record<
    string,
    string
  >;

  // Helper for rendering HTML content safely
  const HTML = ({
    html,
    className,
  }: {
    html?: string | null;
    className?: string;
  }) => {
    if (!html) return null;
    return (
      <div
        className={cn(
          "prose prose-sm max-w-none text-neutral-800 leading-snug font-sans",
          "[&>ul]:list-disc [&>ul]:ml-4 [&>ul]:space-y-0.5",
          "[&>ol]:list-decimal [&>ol]:ml-4 [&>ol]:space-y-0.5",
          "[&>p]:mb-1",
          "[&_li]:pl-0.5",
          className,
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  };

  // Format date helper
  const formatDate = (date?: string | null) => {
    if (!date) return "";
    if (date.includes("T")) {
      const d = new Date(date);
      return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }
    return date;
  };

  // Section Renderers
  const renderers: Record<string, React.ReactNode> = {
    summary: content.summary ? (
      <section key="summary">
        <h2
          className="text-[11pt] font-bold uppercase tracking-wider mb-2 border-b pb-1"
          style={{ color: themeColor, borderColor: themeColor + "40" }} // 40 = 25% opacity for border? Or just use gray.
        >
          {sectionTitles["summary"] || "Summary"}
        </h2>
        <HTML html={content.summary} />
      </section>
    ) : null,

    experience:
      content.experience.length > 0 ? (
        <section key="experience">
          <h2
            className="text-[11pt] font-bold uppercase tracking-wider mb-3 border-b pb-1"
            style={{ color: themeColor, borderColor: themeColor + "40" }}
          >
            {sectionTitles["experience"] || "Experience"}
          </h2>
          <div className="space-y-4">
            {content.experience.map((item) => (
              <div key={item.id}>
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="font-bold text-[11pt] text-black">
                    {item.company}
                  </h3>
                  <span className="text-[10pt] font-medium text-neutral-600">
                    {formatDate(item.startDate)} –{" "}
                    {item.current ? "Present" : formatDate(item.endDate)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline mb-1">
                  <div
                    className="text-[10.5pt] font-bold italic"
                    style={{ color: themeColor }}
                  >
                    {item.title}
                  </div>
                  {item.location && (
                    <span className="text-[10pt] text-neutral-500">
                      {item.location}
                    </span>
                  )}
                </div>
                <HTML html={item.description} className="text-neutral-800" />
              </div>
            ))}
          </div>
        </section>
      ) : null,

    projects:
      content.projects.length > 0 ? (
        <section key="projects">
          <h2
            className="text-[11pt] font-bold uppercase tracking-wider mb-3 border-b pb-1"
            style={{ color: themeColor, borderColor: themeColor + "40" }}
          >
            {sectionTitles["projects"] || "Projects"}
          </h2>
          <div className="space-y-3">
            {content.projects.map((item) => (
              <div key={item.id}>
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="font-bold text-[10.5pt] text-black flex items-center gap-2">
                    {item.title}
                    {(item.url || item.repoUrl) && (
                      <span className="font-normal text-[9pt] text-neutral-500">
                        [
                        {item.url && (
                          <a
                            href={item.url}
                            className="hover:underline"
                            style={{ color: themeColor }}
                          >
                            Link
                          </a>
                        )}
                        {item.url && item.repoUrl && " / "}
                        {item.repoUrl && (
                          <a
                            href={item.repoUrl}
                            className="hover:underline"
                            style={{ color: themeColor }}
                          >
                            Repo
                          </a>
                        )}
                        ]
                      </span>
                    )}
                  </h3>
                  {(item.startDate || item.endDate) && (
                    <span className="text-[10pt] text-neutral-600">
                      {formatDate(item.startDate)} - {formatDate(item.endDate)}
                    </span>
                  )}
                </div>
                <HTML
                  html={item.description ?? undefined}
                  className="text-neutral-800"
                />
                {item.techStack && item.techStack.length > 0 && (
                  <div className="text-[10pt] mt-0.5">
                    <span className="font-bold text-neutral-700">Stack:</span>{" "}
                    {item.techStack.join(", ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null,

    education:
      content.education.length > 0 ? (
        <section key="education">
          <h2
            className="text-[11pt] font-bold uppercase tracking-wider mb-3 border-b pb-1"
            style={{ color: themeColor, borderColor: themeColor + "40" }}
          >
            {sectionTitles["education"] || "Education"}
          </h2>
          <div className="space-y-2">
            {content.education.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div>
                  <div className="font-bold text-black">{item.school}</div>
                  <div className="text-neutral-800">
                    {item.degree} {item.field && `in ${item.field}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-neutral-600">
                    {formatDate(item.startDate)} - {formatDate(item.endDate)}
                  </div>
                  {item.location && (
                    <div className="text-neutral-500 text-[10pt]">
                      {item.location}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null,

    skills:
      content.skills.length > 0 ? (
        <section key="skills">
          <h2
            className="text-[11pt] font-bold uppercase tracking-wider mb-2 border-b pb-1"
            style={{ color: themeColor, borderColor: themeColor + "40" }}
          >
            {sectionTitles["skills"] || "Technical Skills"}
          </h2>
          <div className="space-y-1 text-[10.5pt]">
            {content.skills.map((group) => (
              <div key={group.id} className="flex flex-wrap">
                <span className="font-bold text-black mr-2">{group.name}:</span>
                <span className="text-neutral-800">
                  {group.skills.map((s) => s.name).join(", ")}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null,

    certifications:
      content.certifications.length > 0 ? (
        <section key="certifications">
          <h2
            className="text-[11pt] font-bold uppercase tracking-wider mb-2 border-b pb-1"
            style={{ color: themeColor, borderColor: themeColor + "40" }}
          >
            {sectionTitles["certifications"] || "Certifications"}
          </h2>
          <div className="space-y-1 text-[10.5pt]">
            {content.certifications.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="font-medium">
                  {item.name}{" "}
                  <span className="text-neutral-500">- {item.issuer}</span>
                </span>
                <span className="text-neutral-600 text-[10pt]">
                  {formatDate(item.date)}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null,
  };

  // Add Custom Section Renderers
  customSections.forEach((section) => {
    if (section.items.length > 0) {
      renderers[section.id] = (
        <section key={section.id}>
          <h2
            className="text-[11pt] font-bold uppercase tracking-wider mb-3 border-b pb-1"
            style={{ color: themeColor, borderColor: themeColor + "40" }}
          >
            {sectionTitles[section.id] || section.name}
          </h2>
          <div
            className={cn(
              "space-y-4",
              section.layout === "grid" && "grid grid-cols-2 gap-4 space-y-0",
            )}
          >
            {section.items.map((item) => (
              <div key={item.id}>
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="font-bold text-[10.5pt] text-black">
                    {item.title}
                  </h3>
                  <span className="text-[10pt] text-neutral-600">
                    {item.date}
                  </span>
                </div>
                {(item.subtitle ||
                  (item as any).location ||
                  (item as any).url) && (
                  <div className="flex flex-wrap gap-2 mb-1">
                    {item.subtitle && (
                      <div
                        className="text-[10pt] font-bold italic"
                        style={{ color: themeColor }}
                      >
                        {item.subtitle}
                      </div>
                    )}
                    {(item as any).location && (
                      <div className="text-[10pt] text-neutral-500 italic">
                        {item.subtitle && (
                          <span className="mr-2 text-neutral-300 not-italic">
                            |
                          </span>
                        )}
                        {(item as any).location}
                      </div>
                    )}
                    {(item as any).url && (
                      <div className="text-[10pt]">
                        {(item.subtitle || (item as any).location) && (
                          <span className="mr-2 text-neutral-300">|</span>
                        )}
                        <a
                          href={(item as any).url}
                          className="hover:underline"
                          style={{ color: themeColor }}
                        >
                          {(item as any).url}
                        </a>
                      </div>
                    )}
                  </div>
                )}
                <HTML html={item.description} className="text-neutral-800" />
              </div>
            ))}
          </div>
        </section>
      );
    }
  });

  return (
    <div
      className="w-full min-h-full bg-white text-neutral-900 p-[40px] font-sans"
      style={{
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        fontSize: "10.5pt",
      }}
    >
      {/* 1. Header (Always Top) */}
      <header
        className="border-b border-black pb-4 mb-5"
        style={{ borderColor: themeColor }}
      >
        <h1
          className="text-3xl font-bold tracking-tight mb-2 uppercase"
          style={{ color: themeColor }}
        >
          {profile.firstName} {profile.lastName}
        </h1>
        {profile.headline && (
          <p className="text-[11pt] font-medium text-neutral-700 mb-2">
            {profile.headline}
          </p>
        )}

        {/* Contact Grid */}
        <div className="flex flex-wrap gap-x-4 text-[10pt] text-neutral-600">
          {profile.location && (
            <div className="flex items-center gap-1">
              <span>{profile.location}</span>
            </div>
          )}
          {profile.phone && (
            <div className="flex items-center gap-1 before:content-['•'] before:mr-4 before:text-neutral-300">
              <span>{profile.phone}</span>
            </div>
          )}
          {profile.email && (
            <div className="flex items-center gap-1 before:content-['•'] before:mr-4 before:text-neutral-300">
              <span className="text-black">{profile.email}</span>
            </div>
          )}
          {profile.linkedin && (
            <div className="flex items-center gap-1 before:content-['•'] before:mr-4 before:text-neutral-300">
              <a
                href={profile.linkedin}
                className="hover:underline"
                style={{ color: themeColor }}
              >
                LinkedIn
              </a>
            </div>
          )}
          {profile.github && (
            <div className="flex items-center gap-1 before:content-['•'] before:mr-4 before:text-neutral-300">
              <a
                href={profile.github}
                className="hover:underline"
                style={{ color: themeColor }}
              >
                GitHub
              </a>
            </div>
          )}
          {profile.website && (
            <div className="flex items-center gap-1 before:content-['•'] before:mr-4 before:text-neutral-300">
              <a
                href={profile.website}
                className="hover:underline"
                style={{ color: themeColor }}
              >
                Portfolio
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Dynamic Body Content */}
      <div className="space-y-5">{sectionOrder.map((id) => renderers[id])}</div>
    </div>
  );
}
