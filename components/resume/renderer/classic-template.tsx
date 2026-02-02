"use client";

import { ResumeContent } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";

interface ClassicTemplateProps {
  content: ResumeContent;
}

/**
 * Classic Template - Strict Professional
 * Fixed Order: Header -> Summary -> Experience -> Projects -> Education -> Skills -> Certifications
 */
export function ClassicTemplate({ content }: ClassicTemplateProps) {
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

  return (
    <div
      className="w-full min-h-full bg-white text-black p-[40px] font-serif"
      style={{
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: "11pt",
      }}
    >
      {/* 1. Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-wide text-black mb-1">
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
              <a href={profile.linkedin} className="hover:underline">
                LinkedIn
              </a>
              {(profile.website || profile.github) && <span> • </span>}
            </>
          )}
          {profile.github && (
            <>
              <a href={profile.github} className="hover:underline">
                GitHub
              </a>
              {profile.website && <span> • </span>}
            </>
          )}
          {profile.website && (
            <a href={profile.website} className="hover:underline">
              Portfolio
            </a>
          )}
        </div>
      </header>

      <div className="space-y-5">
        {/* 2. Summary */}
        {content.summary && (
          <section>
            <h2 className="text-[10pt] font-bold uppercase tracking-widest text-black mb-2 border-b border-gray-300 pb-1">
              Professional Profile
            </h2>
            <HTML html={content.summary} className="text-justify" />
          </section>
        )}

        {/* 3. Work Experience */}
        {content.experience.length > 0 && (
          <section>
            <h2 className="text-[10pt] font-bold uppercase tracking-widest text-black mb-3 border-b border-gray-300 pb-1">
              Work Experience
            </h2>
            <div className="space-y-4">
              {content.experience.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-bold text-[11pt] uppercase text-black">
                      {item.title}
                    </span>
                    <span className="font-bold text-[10pt] text-black">
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
        )}

        {/* 4. Projects (Moved up) */}
        {content.projects.length > 0 && (
          <section>
            <h2 className="text-[10pt] font-bold uppercase tracking-widest text-black mb-3 border-b border-gray-300 pb-1">
              Projects
            </h2>
            <div className="space-y-3">
              {content.projects.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between items-baseline font-bold mb-0.5">
                    <div className="flex items-center gap-2">
                      <span>{item.title}</span>
                      {(item.url || item.repoUrl) && (
                        <span className="text-[9pt] font-normal text-gray-700">
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
                      <span className="text-[10pt] font-normal">
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
        )}

        {/* 5. Education */}
        {content.education.length > 0 && (
          <section>
            <h2 className="text-[10pt] font-bold uppercase tracking-widest text-black mb-3 border-b border-gray-300 pb-1">
              Education
            </h2>
            <div className="space-y-2">
              {content.education.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-baseline"
                >
                  <div>
                    <span className="font-bold text-[11pt] text-black">
                      {item.degree}
                      {item.field && <span> in {item.field}</span>}
                    </span>
                    <div className="text-[11pt] text-black italic">
                      {item.school}, {item.location}
                    </div>
                  </div>
                  <div className="text-[10pt] font-bold text-black shrink-0">
                    {formatDate(item.endDate)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. Skills */}
        {content.skills.length > 0 && (
          <section>
            <h2 className="text-[10pt] font-bold uppercase tracking-widest text-black mb-2 border-b border-gray-300 pb-1">
              Skills
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
        )}

        {/* 7. Certifications */}
        {content.certifications.length > 0 && (
          <section>
            <h2 className="text-[10pt] font-bold uppercase tracking-widest text-black mb-2 border-b border-gray-300 pb-1">
              Certifications
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
        )}
      </div>
    </div>
  );
}
