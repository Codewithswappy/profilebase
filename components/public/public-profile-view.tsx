"use client";

import { useEffect, useRef, useState } from "react";
import { User } from "lucide-react";
import Image from "next/image";
import { PublicProfileData } from "@/lib/actions/public";
import { Project } from "@prisma/client";
import { ExperienceSection } from "@/components/profile/experience-section";
import { SocialsSection } from "@/components/profile/socials-section";
import { TechIcons } from "@/components/TechIcons";
import { ProjectCard } from "@/components/public/project-card";
import { ViewfinderFrame } from "@/components/ui/viewfinder-frame";
import { ViewfinderButton } from "@/components/ui/viewfinder-button";
import { AchievementsSection } from "@/components/public/achievements-section";
import { CertificatesSection } from "@/components/public/certificates-section";
import { ProjectDetailsDialog } from "@/components/public/project-details-dialog";
import { ResumeView } from "@/components/public/resume-view";
import { AnimatePresence, motion } from "motion/react";
import { Icon3dRotate, IconArcheryArrow, IconArchive, IconCurlyLoop, IconFoldUp, IconInfinity, IconRotate, IconRotate360, IconRotate3d } from "@tabler/icons-react";

// Props definition

interface PublicProfileViewProps {
  data: PublicProfileData;
}

// Get all unique tech from projects
function getAllTech(projects: Project[]): string[] {
  const allTech = new Set<string>();
  projects.forEach((p) => {
    if (p.techStack) {
      p.techStack.forEach((t: string) => allTech.add(t));
    }
  });
  return Array.from(allTech);
}

// Helper to get tech icon (case-insensitive)
function getTechIcon(techName: string) {
  // Find matching key in TechIcons (case-insensitive)
  const iconKey = Object.keys(TechIcons).find(
    (key) => key.toLowerCase() === techName.toLowerCase(),
  );
  return iconKey ? TechIcons[iconKey] : null;
}

// Generate unique session ID
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function PublicProfileView({ data }: PublicProfileViewProps) {
  const { profile, projects, userName, profileSettings } = data;
  const sessionIdRef = useRef<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showResume, setShowResume] = useState(false);

  // Real-time presence tracking
  useEffect(() => {
    // Generate session ID on mount
    if (!sessionIdRef.current) {
      sessionIdRef.current = generateSessionId();
    }
    const sessionId = sessionIdRef.current;
    const profileId = profile.id;

    // Send heartbeat to register presence
    const sendHeartbeat = async () => {
      try {
        await fetch("/api/analytics/online", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId, sessionId }),
        });
      } catch (e) {
        // Silently fail
      }
    };

    // Initial heartbeat
    sendHeartbeat();

    // Heartbeat every 10 seconds
    const interval = setInterval(sendHeartbeat, 10000);

    // Cleanup on unmount
    const handleUnload = () => {
      // Use sendBeacon for reliability on page unload
      navigator.sendBeacon(
        `/api/analytics/online?profileId=${profileId}&sessionId=${sessionId}`,
        "",
      );
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleUnload);
      // Also try to remove session on unmount
      fetch(
        `/api/analytics/online?profileId=${profileId}&sessionId=${sessionId}`,
        {
          method: "DELETE",
        },
      ).catch(() => {});
    };
  }, [profile.id]);

  const allTech = getAllTech(projects);
  const displayName = userName || profile.slug;

  // Section visibility with defaults
  const showExperience = profileSettings.showExperience ?? true;
  const showProjects = profileSettings.showProjects ?? true;
  const showTechStack = profileSettings.showTechStack ?? true;
  const showSummary = profileSettings.showSummary ?? true;

  // Duplicate tech stack for smooth marquee
  const marqueeTech = [...allTech, ...allTech, ...allTech, ...allTech];

  // Handle project interaction tracking
  const handleProjectInteraction = async (projectId: string) => {
    try {
      await fetch("/api/analytics/interaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: profile.slug,
          type: "project",
          itemId: projectId,
        }),
      });
    } catch (e) {
      // Silently fail
    }
  };

  return (
    <div className="relative min-h-screen bg-neutral-950 overflow-hidden perspective-1000">
      <AnimatePresence mode="wait" initial={false}>
        {!showResume ? (
          <motion.div
            key="profile"
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="w-full min-h-screen bg-white dark:bg-neutral-950 backface-hidden"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* <ViewfinderFrame className="max-w-3xl mx-auto"> */}
            <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black">
              <div className="max-w-3xl mx-auto border border-dashed border-neutral-200 dark:border-neutral-800">
                {/* --- COVER IMAGE --- */}
                <div className="w-full h-[120px] md:h-[160px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-neutral-900/10 dark:bg-neutral-900/30 pointer-events-none"></div>
                  {profile.coverImage ? (
                    <img
                      src={profile.coverImage}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-neutral-300 to-neutral-500 dark:from-neutral-700 dark:to-neutral-900" />
                  )}
                </div>

                {/* --- HEADER SECTION (Below cover) --- */}
                <div className="px-4 md:px-6 py-4">
                  {/* Avatar + Name/Headline Row */}
                  <div className="flex items-center gap-4 -mt-12 md:-mt-14">
                    {/* Avatar - overlaps cover image */}
                    <div className="shrink-0 relative z-20">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-white dark:bg-neutral-800  border-4 border-white dark:border-neutral-950 ring-1 ring-black/5 dark:ring-white/10">
                        {profile.image ? (
                          <Image
                            src={profile.image}
                            alt={displayName}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400 dark:text-neutral-600 bg-neutral-50 dark:bg-neutral-800">
                            <User className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Name & Headline - Right of Avatar */}
                    <div className="min-w-0 pt-10 md:pt-12">
                      <h1 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                        {displayName}
                      </h1>
                      <p className="text-sm md:text-base text-neutral-500 dark:text-neutral-400 font-medium">
                        {profile.headline || "Developer"}
                      </p>
                      {profile.location && (
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-3 h-3"
                          >
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {profile.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Socials + Buttons Row */}
                  <div className="flex items-center justify-between pt-4">
                    {/* Socials */}
                    <div className="flex flex-wrap items-center ">
                      <SocialsSection links={data.socialLinks} />

                      {/* Email Display */}
                      {profileSettings.showEmail && data.email && (
                        <a
                          href={`mailto:${data.email}`}
                          className="flex items-center px-2.5 py-1.5 gap-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
                        >
                          <div className="w-4 h-4 flex items-center justify-center group-hover:text-neutral-900 dark:group-hover:text-neutral-100">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-neutral-600 dark:text-neutral-400"
                            >
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                              <polyline points="22,6 12,13 2,6" />
                            </svg>
                          </div>
                          <span className="text-xs hidden md:block font-mono font-medium text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors">
                            Email
                          </span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Resume & Contact Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-8">
                    <button
                     
                      className="cursor-pointer flex pr-4 items-center gap-1 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg"
                      onClick={() => setShowResume(true)}
                    >
                     <span className="bg-neutral-300 dark:bg-neutral-700 px-3 py-2 rounded-lg shadow-sm shadow-black/10  text-neutral-900 dark:text-neutral-100 font-medium">Resume</span>
                      <IconFoldUp className="w-5 h-5" />
                    </button>

                    {profileSettings.showEmail && data.email ? (
                      <a href={`mailto:${data.email}`}>
                        <ViewfinderButton
                          variant="filled"
                          className="cursor-pointer rounded-lg px-6"
                        >
                          Contact
                        </ViewfinderButton>
                      </a>
                    ) : (
                      <ViewfinderButton
                        variant="filled"
                        className="cursor-pointer rounded-none opacity-50 "
                        title="Contact info hidden"
                      >
                        Contact
                      </ViewfinderButton>
                    )}
                  </div>

                  {/* Dotted Line Divider */}
                  <div className="flex justify-center pt-6">
                    <svg width="100%" height="2" className="overflow-visible">
                      <line
                        x1="0"
                        y1="1"
                        x2="100%"
                        y2="1"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        className="text-neutral-300 dark:text-neutral-700"
                      />
                    </svg>
                  </div>
                </div>

                {/* --- MAIN CONTENT --- */}
                <div className="px-4 md:px-6 pt-8 space-y-10 bg-white dark:bg-neutral-950">
                  {/* --- EXPERIENCE --- */}
                  {showExperience && (
                    <div className="space-y-6">
                      <h2 className="font-bold font-mono text-neutral-400 dark:text-neutral-600 tracking-tight uppercase text-md">
                        // Experience
                      </h2>
                      <ExperienceSection experiences={data.experiences} />
                      {data.experiences && data.experiences.length === 0 && (
                        <div className="py-8 text-center text-sm text-neutral-500 font-mono">
                          No experience recorded.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dotted Line Divider */}
                  <div className="flex justify-center pt-6">
                    <svg width="100%" height="2" className="overflow-visible">
                      <line
                        x1="0"
                        y1="1"
                        x2="100%"
                        y2="1"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        className="text-neutral-300 dark:text-neutral-700"
                      />
                    </svg>
                  </div>

                  {showProjects && (
                    <div className="relative px-0 md:px-6">
                      {/* Corner Boxes */}
                      {/* <div className="absolute -top-5 -left-5 w-5 h-5 border border-dashed border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-950" />
                <div className="absolute -top-5 -right-5 w-5 h-5 border border-dashed border-neutral-400 dark:border-neutral-600 bg-white dark:bg-neutral-950" />
                <div className="absolute -bottom-5 -left-5 w-5 h-5 border border-dashed border-neutral-400 dark:border-neutral-600 bg-white dark:bg-neutral-950" />
                <div className="absolute -bottom-5 -right-5 w-5 h-5 border border-dashed border-neutral-400 dark:border-neutral-600 bg-white dark:bg-neutral-950" /> */}
                      <div className="flex items-center justify-between md:justify-start gap-4">
                        <h2 className="font-bold font-mono text-neutral-400 dark:text-neutral-600 tracking-tight uppercase text-md">
                          // Projects
                        </h2>
                      </div>
                      <div className="w-full flex items-center md:justify-end justify-start py-10">
                        <p className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-800 dark:text-neutral-200 leading-tight md:max-w-2/5 ">
                          Here are some of my{" "}
                          <span className="text-neutral-400 dark:text-neutral-600">
                            Selected Work
                          </span>
                        </p>
                      </div>

                      {/* Projects */}
                      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto ">
                        {projects.length === 0 ? (
                          <div className="py-8 text-center text-sm text-neutral-500 font-mono">
                            No projects initialized.
                          </div>
                        ) : (
                          projects.map((project) => (
                            <ProjectCard
                              key={project.id}
                              project={project}
                              onInteraction={() =>
                                handleProjectInteraction(project.id)
                              }
                              onClick={() => setSelectedProject(project)}
                            />
                          ))
                        )}
                      </div>

                      {projects.length > 4 && (
                        <div className="text-center pt-2">
                          <button className="text-xs font-mono font-medium text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                            [LOAD MORE . . .]
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dotted Line Divider */}
                  <div className="flex justify-center pt-6">
                    <svg width="100%" height="2" className="overflow-visible">
                      <line
                        x1="0"
                        y1="1"
                        x2="100%"
                        y2="1"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        className="text-neutral-300 dark:text-neutral-700"
                      />
                    </svg>
                  </div>

                  {/* --- TECH STACK MARQUEE --- */}
                  {showTechStack && allTech.length > 0 && (
                    <div className="">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-md font-semibold text-neutral-400 dark:text-neutral-600 font-mono tracking-tight uppercase">
                          // Tech Stack
                        </span>
                        {/* <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800 ml-4 border-b border-dashed border-neutral-300 dark:border-neutral-700/30"></div> */}
                      </div>

                      <div className="relative w-full mt-4 overflow-visible">
                        <div className="relative flex overflow-x-hidden w-full">
                          {/* Left Fade Mask */}
                          <div className="absolute left-0 top-0 bottom-0 w-20 z-20 bg-gradient-to-r from-white dark:from-neutral-950 to-transparent pointer-events-none"></div>
                          {/* Right Fade Mask */}
                          <div className="absolute right-0 top-0 bottom-0 w-20 z-20 bg-gradient-to-l from-white dark:from-neutral-950 to-transparent pointer-events-none"></div>

                          <div className="flex animate-marquee whitespace-nowrap gap-12 py-4">
                            {marqueeTech.map((tech, index) => {
                              const Icon = getTechIcon(tech);
                              return (
                                <div
                                  key={`${tech}-${index}`}
                                  className="flex-shrink-0 group relative"
                                >
                                  <div
                                    className="flex items-center justify-center p-1 transition-all duration-300 cursor-pointer text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 scale-[1.5] hover:scale-[1.8] grayscale hover:grayscale-0 opacity-70 hover:opacity-100"
                                    title={tech}
                                  >
                                    {Icon}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dotted Line Divider */}
                  <div className="flex justify-center pt-6">
                    <svg width="100%" height="2" className="overflow-visible">
                      <line
                        x1="0"
                        y1="1"
                        x2="100%"
                        y2="1"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        className="text-neutral-300 dark:text-neutral-700"
                      />
                    </svg>
                  </div>

                  {/* --- ACHIEVEMENTS --- */}
                  <div className="px-0 md:px-6">
                    <AchievementsSection
                      achievements={data.achievements}
                      showAchievements={data.profileSettings.showAchievements}
                    />
                  </div>

                  {/* Dotted Line Divider */}
                  <div className="flex justify-center pt-6">
                    <svg width="100%" height="2" className="overflow-visible">
                      <line
                        x1="0"
                        y1="1"
                        x2="100%"
                        y2="1"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        className="text-neutral-300 dark:text-neutral-700"
                      />
                    </svg>
                  </div>

                  {/* --- CERTIFICATES --- */}
                  {data.profileSettings.showCertificates !== false &&
                    data.certificates &&
                    data.certificates.length > 0 && (
                      <div className="px-0 md:px-6">
                        <CertificatesSection certificates={data.certificates} />
                      </div>
                    )}

                  {/* Dotted Line Divider */}
                  <div className="flex justify-center pt-6">
                    <svg width="100%" height="2" className="overflow-visible">
                      <line
                        x1="0"
                        y1="1"
                        x2="100%"
                        y2="1"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        className="text-neutral-300 dark:text-neutral-700"
                      />
                    </svg>
                  </div>

                  {/* Summary (About) */}
                  {showSummary && profile.summary && (
                    <div className="flex flex-col gap-4  text-center pb-10 pt-0 px-0 md:px-6">
                      <div className="flex items-center justify-between">
                        <h2 className="font-bold font-mono text-neutral-400 dark:text-neutral-600 tracking-tight uppercase text-md">
                          // About me
                        </h2>
                      </div>
                      <p className="text-sm text-left text-neutral-500 dark:text-neutral-400 leading-relaxed">
                        {profile.summary}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="resume"
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-50 w-full h-full bg-neutral-950"
          >
            <ResumeView data={data} onClose={() => setShowResume(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <ProjectDetailsDialog
        project={selectedProject}
        open={!!selectedProject}
        onOpenChange={(open) => !open && setSelectedProject(null)}
      />
    </div>
  );
}
