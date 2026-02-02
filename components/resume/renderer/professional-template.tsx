"use client";

import { ResumeContent } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";

interface ProfessionalTemplateProps {
  content: ResumeContent;
}

/**
 * Professional Template - Management Standard
 * Order: Header -> Summary -> Experience -> Projects -> Education -> Skills -> Certifications
 */
export function ProfessionalTemplate({ content }: ProfessionalTemplateProps) {
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
          "prose prose-sm max-w-none text-neutral-800 leading-relaxed font-sans",
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
      return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }
    return date;
  };

  return (
    <div
      className="w-full min-h-full bg-white text-neutral-900 p-[40px] font-sans"
      style={{
        fontFamily:
          "'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif",
        fontSize: "10.5pt",
      }}
    >
      {/* 1. Header */}
      <header className="mb-6 flex justify-between items-start border-b-2 border-neutral-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight text-neutral-900 mb-1">
            {profile.firstName} {profile.lastName}
          </h1>
          {profile.headline && (
            <p className="text-[11pt] font-medium text-neutral-600">
              {profile.headline}
            </p>
          )}
        </div>

        <div className="text-[9pt] text-right text-neutral-600 leading-snug">
          {profile.phone && <div>{profile.phone}</div>}
          {profile.email && <div>{profile.email}</div>}
          {profile.location && <div>{profile.location}</div>}
          {profile.linkedin && (
            <div>
              <a href={profile.linkedin} className="hover:underline">
                LinkedIn Profile
              </a>
            </div>
          )}
          {profile.github && (
            <div>
              <a href={profile.github} className="hover:underline">
                GitHub
              </a>
            </div>
          )}
          {profile.website && (
            <div>
              <a href={profile.website} className="hover:underline">
                Portfolio
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="space-y-6">
        {/* 2. Summary */}
        {content.summary && (
          <section>
            <h2 className="text-[11pt] font-bold uppercase text-neutral-800 border-b border-neutral-300 mb-2 pb-0.5">
              Professional Summary
            </h2>
            <HTML html={content.summary} />
          </section>
        )}

        {/* 3. Experience */}
        {content.experience.length > 0 && (
          <section>
            <h2 className="text-[11pt] font-bold uppercase text-neutral-800 border-b border-neutral-300 mb-3 pb-0.5">
              Experience
            </h2>
            <div className="space-y-5">
              {content.experience.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-[11pt] text-neutral-900">
                      {item.title}
                    </h3>
                    <span className="text-[10pt] font-bold text-neutral-600">
                      {formatDate(item.startDate)} –{" "}
                      {item.current ? "Present" : formatDate(item.endDate)}
                    </span>
                  </div>
                  <div className="text-[10.5pt] font-semibold text-neutral-700 italic mb-1">
                    {item.company} | {item.location}
                  </div>
                  <HTML html={item.description} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Projects */}
        {content.projects.length > 0 && (
          <section>
            <h2 className="text-[11pt] font-bold uppercase text-neutral-800 border-b border-neutral-300 mb-3 pb-0.5">
              Projects
            </h2>
            <div className="space-y-4">
              {content.projects.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <div className="font-bold text-[10.5pt] text-neutral-900 flex items-center gap-2">
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
                    {(item.startDate || item.endDate) && (
                      <span className="text-[9pt] font-medium text-neutral-500">
                        {formatDate(item.startDate)} -{" "}
                        {formatDate(item.endDate)}
                      </span>
                    )}
                  </div>
                  <HTML html={item.description} />
                  {item.techStack && item.techStack.length > 0 && (
                    <div className="text-[10pt] mt-0.5 text-neutral-700">
                      <span className="font-bold text-neutral-900">Stack:</span>{" "}
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
            <h2 className="text-[11pt] font-bold uppercase text-neutral-800 border-b border-neutral-300 mb-2 pb-0.5">
              Education
            </h2>
            <div className="space-y-3">
              {content.education.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-[10.5pt] text-neutral-900">
                      {item.school}
                    </div>
                    <div className="text-[10.5pt]">
                      {item.degree} {item.field && `in ${item.field}`}
                    </div>
                  </div>
                  <div className="text-[10pt] font-medium text-neutral-600 text-right">
                    {formatDate(item.endDate)}
                    {item.location && (
                      <div className="text-[9pt]">{item.location}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. Skills */}
        {content.skills.length > 0 && (
          <section>
            <h2 className="text-[11pt] font-bold uppercase text-neutral-800 border-b border-neutral-300 mb-2 pb-0.5">
              Key Skills
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10.5pt]">
              {content.skills.map((group) => (
                <div key={group.id}>
                  <span className="font-bold block text-[9pt] uppercase text-neutral-500 mb-0.5">
                    {group.name}
                  </span>
                  <span>{group.skills.map((s) => s.name).join(", ")}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 7. Certifications */}
        {content.certifications.length > 0 && (
          <section>
            <h2 className="text-[11pt] font-bold uppercase text-neutral-800 border-b border-neutral-300 mb-2 pb-0.5">
              Certifications
            </h2>
            <div className="text-[10.5pt] space-y-1">
              {content.certifications.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div className="font-semibold text-neutral-800">
                    {item.name}{" "}
                    <span className="text-neutral-500 font-normal">
                      - {item.issuer}
                    </span>
                  </div>
                  <div className="text-neutral-600 text-[10pt]">
                    {formatDate(item.date)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
