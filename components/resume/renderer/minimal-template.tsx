"use client";

import React from "react";
import { ResumeContent } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";

interface MinimalTemplateProps {
  content: ResumeContent;
}

/**
 * Minimal Template - "The Standard"
 * Order: Dynamic
 */
export function MinimalTemplate({ content }: MinimalTemplateProps) {
  const {
    profile,
    settings,
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
          "prose prose-sm max-w-none text-black leading-normal font-sans",
          "[&>ul]:list-disc [&>ul]:ml-4 [&>ul]:space-y-0",
          "[&>ol]:list-decimal [&>ol]:ml-4 [&>ol]:space-y-0",
          "[&>p]:mb-0.5",
          "[&_li]:pl-0.5",
          className,
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  };

  const formatDate = (date?: string | null) => {
    if (!date) return "";
    if (date.includes("T")) {
      const d = new Date(date);
      return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }
    return date;
  };

  const renderers: Record<string, React.ReactNode> = {
    summary: content.summary ? (
      <section key="summary">
        <h2
          className="text-[10pt] font-bold uppercase border-b mb-2"
          style={{ color: themeColor, borderColor: themeColor }}
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
            className="text-[10pt] font-bold uppercase border-b mb-2"
            style={{ color: themeColor, borderColor: themeColor }}
          >
            {sectionTitles["experience"] || "Experience"}
          </h2>
          <div className="space-y-3">
            {content.experience.map((item) => (
              <div key={item.id}>
                <div className="flex flex-col sm:flex-row sm:justify-between font-bold text-[10pt] mb-1">
                  <span>{item.title}</span>
                  <span className="text-neutral-600 sm:text-black sm:text-right">
                    {formatDate(item.startDate)} –{" "}
                    {item.current ? "Present" : formatDate(item.endDate)}
                  </span>
                </div>
                <div className="italic text-[10pt] mb-1">
                  {item.company} {item.location && `– ${item.location}`}
                </div>
                <HTML html={item.description} />
              </div>
            ))}
          </div>
        </section>
      ) : null,

    projects:
      content.projects.length > 0 ? (
        <section key="projects">
          <h2
            className="text-[10pt] font-bold uppercase border-b mb-2"
            style={{ color: themeColor, borderColor: themeColor }}
          >
            {sectionTitles["projects"] || "Projects"}
          </h2>
          <div className="space-y-3">
            {content.projects.map((item) => (
              <div key={item.id}>
                <div className="flex flex-col sm:flex-row sm:justify-between font-bold text-[10pt] mb-1">
                  <span className="flex flex-wrap items-center gap-2">
                    {item.title}
                  </span>
                  {(item.startDate || item.endDate) && (
                    <span className="font-normal text-[9pt] text-neutral-600 sm:text-right">
                      {formatDate(item.startDate)} - {formatDate(item.endDate)}
                    </span>
                  )}
                </div>
                {(item.url || item.repoUrl) && (
                  <div className="text-[9pt] mb-0.5">
                    {item.url && (
                      <a
                        href={item.url}
                        className="hover:underline break-all"
                        style={{ color: themeColor }}
                      >
                        {item.url}
                      </a>
                    )}
                    {item.url && item.repoUrl && " | "}
                    {item.repoUrl && (
                      <a
                        href={item.repoUrl}
                        className="hover:underline break-all"
                        style={{ color: themeColor }}
                      >
                        {item.repoUrl}
                      </a>
                    )}
                  </div>
                )}
                <HTML html={item.description} />
                {item.techStack && item.techStack.length > 0 && (
                  <div className="text-[10pt] mt-0.5">
                    <span className="font-bold">Stack:</span>{" "}
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
            className="text-[10pt] font-bold uppercase border-b mb-2"
            style={{ color: themeColor, borderColor: themeColor }}
          >
            {sectionTitles["education"] || "Education"}
          </h2>
          <div className="space-y-3">
            {content.education.map((item) => (
              <div key={item.id}>
                <div className="flex flex-col sm:flex-row sm:justify-between font-bold text-[10pt] mb-1">
                  <span>{item.school}</span>
                  <span className="text-neutral-600 sm:text-black sm:text-right">
                    {formatDate(item.endDate)}
                  </span>
                </div>
                <div className="text-[10pt]">
                  {item.degree} {item.field && `in ${item.field}`}
                </div>
                {item.location && (
                  <div className="text-[10pt] italic text-neutral-600">
                    {item.location}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null,

    skills:
      content.skills.length > 0 ? (
        <section key="skills">
          <h2
            className="text-[10pt] font-bold uppercase border-b mb-2"
            style={{ color: themeColor, borderColor: themeColor }}
          >
            {sectionTitles["skills"] || "Technical Skills"}
          </h2>
          <div className="text-[10pt]">
            {content.skills.map((group) => (
              <div key={group.id} className="flex flex-wrap">
                <span className="font-bold mr-2">{group.name}:</span>
                <span>{group.skills.map((s) => s.name).join(", ")}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null,

    certifications:
      content.certifications.length > 0 ? (
        <section key="certifications">
          <h2
            className="text-[10pt] font-bold uppercase border-b mb-2"
            style={{ color: themeColor, borderColor: themeColor }}
          >
            {sectionTitles["certifications"] || "Certifications"}
          </h2>
          <div className="text-[10pt] space-y-1">
            {content.certifications.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="font-bold">
                  {item.name}{" "}
                  <span className="font-normal italic">- {item.issuer}</span>
                </span>
                <span>{formatDate(item.date)}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null,
  };

  // Add Custom Section Renderers
  (content.customSections || []).forEach((section) => {
    if (section.items.length > 0) {
      renderers[section.id] = (
        <section key={section.id}>
          <h2
            className="text-[10pt] font-bold uppercase border-b mb-2"
            style={{ color: themeColor, borderColor: themeColor }}
          >
            {sectionTitles[section.id] || section.name}
          </h2>
          <div
            className={cn(
              "space-y-3",
              section.layout === "grid" && "grid grid-cols-2 gap-4 space-y-0",
            )}
          >
            {section.items.map((item) => (
              <div key={item.id}>
                <div className="flex justify-between font-bold text-[10pt]">
                  <span>{item.title}</span>
                  <span>{item.date}</span>
                </div>
                {(item.subtitle ||
                  (item as any).location ||
                  (item as any).url) && (
                  <div className="italic text-[10pt] mb-1 flex flex-wrap gap-2 text-wrap wrap-break-word">
                    {item.subtitle && <span>{item.subtitle}</span>}
                    {(item as any).location && (
                      <span className="text-neutral-500">
                        {item.subtitle && (
                          <span className="mx-1 opacity-50 not-italic">|</span>
                        )}
                        {(item as any).location}
                      </span>
                    )}
                    {(item as any).url && (
                      <a
                        href={(item as any).url}
                        className="hover:underline text-neutral-500 break-all"
                        style={{ color: themeColor }}
                      >
                        {(item.subtitle || (item as any).location) && (
                          <span className="mx-1 opacity-50 not-italic">|</span>
                        )}
                        {(item as any).url}
                      </a>
                    )}
                  </div>
                )}
                <HTML html={item.description} />
              </div>
            ))}
          </div>
        </section>
      );
    }
  });

  return (
    <div
      className="w-full min-h-full bg-white text-black p-5 md:p-[40px] font-sans"
      style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: "10pt" }}
    >
      {/* 1. Header */}
      <header className="mb-4">
        <h1
          className="text-2xl font-bold uppercase mb-1"
          style={{ color: themeColor }}
        >
          {profile.firstName} {profile.lastName}
        </h1>
        <div className="text-[10pt] text-black">
          {profile.location && <span>{profile.location}</span>}
          {profile.location && (profile.email || profile.phone) && (
            <span> | </span>
          )}

          {profile.email && <span>{profile.email}</span>}
          {profile.email && profile.phone && <span> | </span>}

          {profile.phone && <span>{profile.phone}</span>}

          {(profile.linkedin || profile.website || profile.github) && (
            <span> | </span>
          )}

          {profile.linkedin && (
            <a
              href={profile.linkedin}
              className="hover:underline"
              style={{ color: themeColor }}
            >
              LinkedIn
            </a>
          )}
          {profile.linkedin && (profile.website || profile.github) && (
            <span> | </span>
          )}

          {profile.github && (
            <a
              href={profile.github}
              className="hover:underline"
              style={{ color: themeColor }}
            >
              GitHub
            </a>
          )}
          {profile.github && profile.website && <span> | </span>}

          {profile.website && (
            <a
              href={profile.website}
              className="hover:underline"
              style={{ color: themeColor }}
            >
              Portfolio
            </a>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="space-y-4">{sectionOrder.map((id) => renderers[id])}</div>
    </div>
  );
}
