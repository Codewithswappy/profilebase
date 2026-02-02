"use client";

import { ResumeContent } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";

interface ExecutiveTemplateProps {
  content: ResumeContent;
}

/**
 * Executive Template - C-Suite Standard
 * Order: Header -> Summary -> Experience -> Projects -> Education -> Skills -> Certifications
 */
export function ExecutiveTemplate({ content }: ExecutiveTemplateProps) {
  const { profile } = content;

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
          "prose prose-sm max-w-none text-neutral-900 leading-normal font-serif",
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
      return d.toLocaleDateString("en-US", { year: "numeric" });
    }
    return date;
  };

  return (
    <div
      className="w-full min-h-full bg-white text-black p-[40px] font-serif"
      style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "11pt",
      }}
    >
      {/* 1. Header */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold uppercase tracking-widest text-black mb-1">
          {profile.firstName} {profile.lastName}
        </h1>
        {profile.headline && (
          <p className="text-[11pt] italic text-neutral-700 mb-2">
            {profile.headline}
          </p>
        )}

        <div className="text-[10pt] text-black">
          {profile.location && <span>{profile.location}</span>}
          {profile.location && (profile.email || profile.phone) && (
            <span> | </span>
          )}

          {profile.email && <span>{profile.email}</span>}
          {profile.email && profile.phone && <span> | </span>}

          {profile.phone && <span>{profile.phone}</span>}

          {profile.linkedin && <span> | </span>}
          {profile.linkedin && (
            <a href={profile.linkedin} className="text-black hover:underline">
              LinkedIn
            </a>
          )}
          {profile.website && <span> | </span>}
          {profile.website && (
            <a href={profile.website} className="text-black hover:underline">
              Portfolio
            </a>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="space-y-6">
        {/* 2. Executive Summary */}
        {content.summary && (
          <section>
            <h2 className="text-[11pt] font-bold uppercase tracking-widest text-black text-center border-b border-black mb-3 pb-1">
              Executive Profile
            </h2>
            <HTML html={content.summary} />
          </section>
        )}

        {/* 3. Experience */}
        {content.experience.length > 0 && (
          <section>
            <h2 className="text-[11pt] font-bold uppercase tracking-widest text-black text-center border-b border-black mb-4 pb-1">
              Professional Experience
            </h2>
            <div className="space-y-5">
              {content.experience.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-bold text-[12pt] text-black">
                      {item.company}
                    </span>
                    <span className="font-bold text-[10pt] text-black">
                      {item.location}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline mb-2">
                    <span className="italic text-[11pt] font-semibold text-neutral-800">
                      {item.title}
                    </span>
                    <span className="text-[10pt] italic">
                      {formatDate(item.startDate)} –{" "}
                      {item.current ? "Present" : formatDate(item.endDate)}
                    </span>
                  </div>

                  <HTML html={item.description} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Projects (With Links) */}
        {content.projects.length > 0 && (
          <section>
            <h2 className="text-[11pt] font-bold uppercase tracking-widest text-black text-center border-b border-black mb-4 pb-1">
              Significant Projects
            </h2>
            <div className="space-y-4">
              {content.projects.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="font-bold text-[11pt] text-black flex items-center gap-2">
                      {item.title}
                      {(item.url || item.repoUrl) && (
                        <span className="text-[9pt] font-normal text-neutral-500">
                          [
                          {item.url && (
                            <a href={item.url} className="hover:underline">
                              Link
                            </a>
                          )}
                          {item.url && item.repoUrl && " / "}
                          {item.repoUrl && (
                            <a href={item.repoUrl} className="hover:underline">
                              Repo
                            </a>
                          )}
                          ]
                        </span>
                      )}
                    </div>
                    <span className="text-[10pt] italic">
                      {formatDate(item.startDate)} –{" "}
                      {item.endDate ? formatDate(item.endDate) : "Present"}
                    </span>
                  </div>
                  <HTML html={item.description} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Education */}
        {content.education.length > 0 && (
          <section>
            <h2 className="text-[11pt] font-bold uppercase tracking-widest text-black text-center border-b border-black mb-4 pb-1">
              Education
            </h2>
            <div className="space-y-3">
              {content.education.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-baseline"
                >
                  <div>
                    <div className="font-bold text-[11pt]">{item.school}</div>
                    <div className="text-[11pt] italic">
                      {item.degree} {item.field && `in ${item.field}`}
                    </div>
                  </div>
                  <div className="text-[10pt]">{formatDate(item.endDate)}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. Skills */}
        {content.skills.length > 0 && (
          <section>
            <h2 className="text-[11pt] font-bold uppercase tracking-widest text-black text-center border-b border-black mb-3 pb-1">
              Core Competencies
            </h2>
            <div className="text-center text-[10.5pt] leading-relaxed">
              {content.skills
                .flatMap((g) => g.skills)
                .map((s) => s.name)
                .join(" • ")}
            </div>
          </section>
        )}

        {/* 7. Certifications */}
        {content.certifications.length > 0 && (
          <section>
            <h2 className="text-[11pt] font-bold uppercase tracking-widest text-black text-center border-b border-black mb-4 pb-1">
              Certifications & Awards
            </h2>
            <div className="space-y-2">
              {content.certifications.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-baseline"
                >
                  <div className="font-medium text-[11pt]">
                    {item.name}{" "}
                    <span className="text-neutral-600 italic">
                      - {item.issuer}
                    </span>
                  </div>
                  <div className="text-[10pt]">{formatDate(item.date)}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
