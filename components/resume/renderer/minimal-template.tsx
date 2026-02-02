"use client";

import { ResumeContent } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";

interface MinimalTemplateProps {
  content: ResumeContent;
}

/**
 * Minimal Template - "The Standard"
 * Order: Header -> Summary -> Experience -> Projects -> Education -> Skills -> Certifications
 */
export function MinimalTemplate({ content }: MinimalTemplateProps) {
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

  return (
    <div
      className="w-full min-h-full bg-white text-black p-[40px] font-sans"
      style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: "10pt" }}
    >
      {/* 1. Header */}
      <header className="mb-4">
        <h1 className="text-2xl font-bold uppercase text-black mb-1">
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
            <a href={profile.linkedin} className="hover:underline">
              LinkedIn
            </a>
          )}
          {profile.linkedin && (profile.website || profile.github) && (
            <span> | </span>
          )}

          {profile.github && (
            <a href={profile.github} className="hover:underline">
              GitHub
            </a>
          )}
          {profile.github && profile.website && <span> | </span>}

          {profile.website && (
            <a href={profile.website} className="hover:underline">
              Portfolio
            </a>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="space-y-4">
        {/* 2. Summary */}
        {content.summary && (
          <section>
            <h2 className="text-[10pt] font-bold uppercase border-b border-black mb-2">
              Summary
            </h2>
            <HTML html={content.summary} />
          </section>
        )}

        {/* 3. Experience */}
        {content.experience.length > 0 && (
          <section>
            <h2 className="text-[10pt] font-bold uppercase border-b border-black mb-2">
              Experience
            </h2>
            <div className="space-y-3">
              {content.experience.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between font-bold text-[10pt]">
                    <span>{item.title}</span>
                    <span>
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
        )}

        {/* 4. Projects (Moved Up) */}
        {content.projects.length > 0 && (
          <section>
            <h2 className="text-[10pt] font-bold uppercase border-b border-black mb-2">
              Projects
            </h2>
            <div className="space-y-3">
              {content.projects.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between font-bold text-[10pt]">
                    <span>{item.title}</span>
                    {(item.startDate || item.endDate) && (
                      <span className="font-normal text-[9pt]">
                        {formatDate(item.startDate)} -{" "}
                        {formatDate(item.endDate)}
                      </span>
                    )}
                  </div>
                  {(item.url || item.repoUrl) && (
                    <div className="text-[9pt] mb-0.5">
                      {item.url && (
                        <a
                          href={item.url}
                          className="hover:underline text-blue-800 break-all"
                        >
                          {item.url}
                        </a>
                      )}
                      {item.url && item.repoUrl && " | "}
                      {item.repoUrl && (
                        <a
                          href={item.repoUrl}
                          className="hover:underline text-blue-800 break-all"
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
        )}

        {/* 5. Education */}
        {content.education.length > 0 && (
          <section>
            <h2 className="text-[10pt] font-bold uppercase border-b border-black mb-2">
              Education
            </h2>
            <div className="space-y-2">
              {content.education.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between font-bold text-[10pt]">
                    <span>{item.school}</span>
                    <span>{formatDate(item.endDate)}</span>
                  </div>
                  <div className="text-[10pt]">
                    {item.degree} {item.field && `in ${item.field}`}
                  </div>
                  {item.location && (
                    <div className="text-[10pt] italic">{item.location}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. Skills */}
        {content.skills.length > 0 && (
          <section>
            <h2 className="text-[10pt] font-bold uppercase border-b border-black mb-2">
              Technical Skills
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
        )}

        {/* 7. Certifications (Added) */}
        {content.certifications.length > 0 && (
          <section>
            <h2 className="text-[10pt] font-bold uppercase border-b border-black mb-2">
              Certifications
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
        )}
      </div>
    </div>
  );
}
