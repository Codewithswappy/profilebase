"use client";

import React from "react";
import { ResumeContent } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";

interface ClassicTemplateProps {
  content: ResumeContent;
}

/**
 * Classic Template - Strict Professional
 * Fixed Order: Dynamic now
 */
export function ClassicTemplate({ content }: ClassicTemplateProps) {
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
          "prose prose-sm max-w-none text-black leading-snug font-serif",
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

  const formatDate = (date?: string | null) => {
    if (!date) return "";
    if (date.includes("T")) {
      const d = new Date(date);
      return d.toLocaleDateString("en-US", {
        month: "2-digit",
        year: "numeric",
      });
    }
    return date;
  };

  // Section Renderers
  const renderers: Record<string, React.ReactNode> = {
    summary: content.summary ? (
      <section key="summary">
        <h2
          className="text-[10pt] font-bold uppercase tracking-widest mb-2 border-b pb-1"
          style={{ color: themeColor, borderColor: "#d1d5db" }}
        >
          {sectionTitles["summary"] || "Professional Profile"}
        </h2>
        <HTML html={content.summary} className="text-justify" />
      </section>
    ) : null,

    experience:
      content.experience.length > 0 ? (
        <section key="experience">
          <h2
            className="text-[10pt] font-bold uppercase tracking-widest mb-3 border-b pb-1"
            style={{ color: themeColor, borderColor: "#d1d5db" }}
          >
            {sectionTitles["experience"] || "Work Experience"}
          </h2>
          <div className="space-y-4">
            {content.experience.map((item) => (
              <div key={item.id}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                  <span className="font-bold text-[11pt] uppercase text-black">
                    {item.title}
                  </span>
                  <span className="font-bold text-[10pt] text-black sm:text-right">
                    {formatDate(item.startDate)} –{" "}
                    {item.current ? "Present" : formatDate(item.endDate)}
                  </span>
                </div>

                <div className="text-[11pt] text-black italic mb-1 font-bold">
                  {item.company}{" "}
                  <span className="font-normal not-italic">
                    ({item.location})
                  </span>
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
            className="text-[10pt] font-bold uppercase tracking-widest mb-3 border-b pb-1"
            style={{ color: themeColor, borderColor: "#d1d5db" }}
          >
            {sectionTitles["projects"] || "Projects"}
          </h2>
          <div className="space-y-4">
            {content.projects.map((item) => (
              <div key={item.id}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline font-bold mb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{item.title}</span>
                    {(item.url || item.repoUrl) && (
                      <span className="text-[9pt] font-normal text-gray-700">
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
                  </div>
                  {(item.startDate || item.endDate) && (
                    <span className="text-[10pt] font-normal sm:text-right">
                      {formatDate(item.startDate)}{" "}
                      {item.endDate && `– ${formatDate(item.endDate)}`}
                    </span>
                  )}
                </div>
                {item.subtitle && (
                  <p className="text-[10pt] italic mb-1">{item.subtitle}</p>
                )}
                <HTML html={item.description} />
                {item.techStack && item.techStack.length > 0 && (
                  <div className="text-[10pt] mt-1">
                    <span className="font-bold">Technologies:</span>{" "}
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
            className="text-[10pt] font-bold uppercase tracking-widest mb-3 border-b pb-1"
            style={{ color: themeColor, borderColor: "#d1d5db" }}
          >
            {sectionTitles["education"] || "Education"}
          </h2>
          <div className="space-y-3">
            {content.education.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline"
              >
                <div className="mb-1 sm:mb-0">
                  <span className="font-bold text-[11pt] text-black">
                    {item.degree}
                    {item.field && <span> in {item.field}</span>}
                  </span>
                  <div className="text-[11pt] text-black italic">
                    {item.school}, {item.location}
                  </div>
                </div>
                <div className="text-[10pt] font-bold text-black shrink-0 sm:text-right">
                  {formatDate(item.endDate)}
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
            className="text-[10pt] font-bold uppercase tracking-widest mb-2 border-b pb-1"
            style={{ color: themeColor, borderColor: "#d1d5db" }}
          >
            {sectionTitles["skills"] || "Skills"}
          </h2>
          <div className="space-y-1">
            {content.skills.map((group) => (
              <div key={group.id} className="flex flex-wrap">
                <span className="font-bold text-[10pt] text-black select-none mr-2">
                  {group.name}:
                </span>
                <span className="text-[10pt] text-black leading-snug">
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
            className="text-[10pt] font-bold uppercase tracking-widest mb-2 border-b pb-1"
            style={{ color: themeColor, borderColor: "#d1d5db" }}
          >
            {sectionTitles["certifications"] || "Certifications"}
          </h2>
          <div className="space-y-1">
            {content.certifications.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="font-bold text-[10pt]">
                  {item.name}{" "}
                  <span className="font-normal text-gray-700">
                    - {item.issuer}
                  </span>
                </span>
                <span className="text-[10pt]">{formatDate(item.date)}</span>
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
            className="text-[10pt] font-bold uppercase tracking-widest mb-3 border-b pb-1"
            style={{ color: themeColor, borderColor: "#d1d5db" }}
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
                  <span className="font-bold text-[11pt] uppercase text-black">
                    {item.title}
                  </span>
                  <span className="font-bold text-[10pt] text-black">
                    {item.date}
                  </span>
                </div>
                {(item.subtitle ||
                  (item as any).location ||
                  (item as any).url) && (
                  <div className="text-[11pt] text-black italic mb-1 font-bold flex flex-wrap gap-2 text-wrap wrap-break-word">
                    {item.subtitle && <span>{item.subtitle}</span>}
                    {(item as any).location && (
                      <>
                        {item.subtitle && (
                          <span className="not-italic opacity-50 font-normal ml-1">
                            |
                          </span>
                        )}
                        <span>{(item as any).location}</span>
                      </>
                    )}
                    {(item as any).url && (
                      <>
                        {(item.subtitle || (item as any).location) && (
                          <span className="not-italic opacity-50 font-normal ml-1">
                            |
                          </span>
                        )}
                        <a
                          href={(item as any).url}
                          className="hover:underline not-italic font-normal"
                          style={{ color: themeColor }}
                        >
                          {(item as any).url}
                        </a>
                      </>
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
      className="w-full min-h-full bg-white text-black p-5 md:p-[40px] font-serif"
      style={{
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: "11pt",
      }}
    >
      {/* 1. Header */}
      <header className="mb-6">
        <h1
          className="text-3xl font-bold uppercase tracking-wide mb-1"
          style={{ color: themeColor }}
        >
          {profile.firstName} {profile.lastName}
        </h1>
        {profile.headline && (
          <p className="text-[11pt] text-gray-800 italic mb-2">
            {profile.headline}
          </p>
        )}

        {/* Contact Line */}
        <div className="text-[10pt] text-black border-b border-black pb-4 mb-4 flex flex-wrap gap-x-1 items-center">
          {profile.location && <span>{profile.location}</span>}
          {profile.location && (profile.phone || profile.email) && (
            <span> | </span>
          )}

          {profile.phone && <span>{profile.phone}</span>}
          {profile.phone && profile.email && <span> | </span>}

          {profile.email && <span>{profile.email}</span>}

          {(profile.linkedin || profile.website || profile.github) && (
            <span> | </span>
          )}

          {profile.linkedin && (
            <>
              <a
                href={profile.linkedin}
                className="hover:underline"
                style={{ color: themeColor }}
              >
                LinkedIn
              </a>
              {(profile.website || profile.github) && <span> • </span>}
            </>
          )}
          {profile.github && (
            <>
              <a
                href={profile.github}
                className="hover:underline"
                style={{ color: themeColor }}
              >
                GitHub
              </a>
              {profile.website && <span> • </span>}
            </>
          )}
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

      {/* Body Content */}
      <div className="space-y-5">{sectionOrder.map((id) => renderers[id])}</div>
    </div>
  );
}
