"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { PublicProfileData } from "@/lib/actions/public";
import { Project } from "@prisma/client";
import { ExperienceSection } from "@/components/profile/experience-section";
import { SocialsSection } from "@/components/profile/socials-section";
import { TechIcons } from "@/components/TechIcons";
import { ProjectCard } from "@/components/public/project-card";
import { cn } from "@/lib/utils";

import { ViewfinderButton } from "@/components/ui/viewfinder-button";
import { VerificationBadge } from "@/components/ui/verification-badge";
import { AchievementsSection } from "@/components/public/achievements-section";
import { CertificatesSection } from "@/components/public/certificates-section";
import { ProjectDetailsDialog } from "@/components/public/project-details-dialog";
import { ResumeView } from "@/components/public/resume-view";
import { GithubHeatmap } from "./GithubHeatmap";
import { AnimatePresence, motion } from "motion/react";
import {
  IconArrowUpRight,
  IconChevronDown,
  IconFoldUp,
  IconUser,
} from "@tabler/icons-react";

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
// Helper to get tech icon (case-insensitive)
function getTechIcon(techName: string) {
  // 1. Try local TechIcons map first (for custom designed icons)
  const iconKey = Object.keys(TechIcons).find(
    (key) => key.toLowerCase() === techName.toLowerCase(),
  );

  if (iconKey) {
    return TechIcons[iconKey];
  }

  // 2. Fallback to Simple Icons CDN
  // We need to normalize the name: 'C++' -> 'cplusplus', 'Node.js' -> 'nodedotjs', etc.
  // Simple normalization for common cases
  let slug = techName
    .toLowerCase()
    .replace(/\+/g, "plus")
    .replace(/\./g, "dot")
    .replace(/\s/g, "");

  return (
    <img
      src={`https://cdn.simpleicons.org/${slug}/000000`}
      onError={(e) => {
        // If CDN fails, hide image so text fallback shows (parent handles this check theoretically,
        // but parent checks "if (Icon)". Since this IS an element, parent sees it as true.
        // We need a way to tell parent "image failed".
        // Actually, for the Marquee, we can just hide this img and let the text stay?
        // The parent logic was: {Icon ? Icon : Text}.
        // If we return an <img>, Icon is truthy.
        // So we style this img to hide on error.
        (e.target as HTMLImageElement).style.display = "none";
        // We can't easily swap to text state from here without component state.
        // A better approach is to make this a proper component.
      }}
      alt={techName}
      className="w-[14px] h-[14px] dark:invert"
    />
  );
}

// Generate unique session ID
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

import { useTheme } from "next-themes";
import { Navbar } from "../landing/navbar";

// ... existing imports

export function PublicProfileView({ data }: PublicProfileViewProps) {
  const {
    profile,
    projects,
    userName,
    profileSettings,
    experiences,
    achievements,
    certificates,
    socialLinks,
  } = data;
  const sessionIdRef = useRef<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showResume, setShowResume] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionTheme, setTransitionTheme] = useState<string | undefined>(
    undefined,
  );
  const [visibleProjects, setVisibleProjects] = useState(4);

  // Verification Logic
  const isVerified =
    experiences.length > 0 &&
    projects.length > 0 &&
    !!profile.headline &&
    !!profile.summary &&
    certificates.length > 0 &&
    achievements.length > 0 &&
    socialLinks.length >= 3;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = () => {
    // Lock the current theme for the overlay color
    setTransitionTheme(theme);

    // Play sound immediately
    playCutSound();

    setIsTransitioning(true);

    // Wait for overlay to fully cover (fast entry)
    setTimeout(() => {
      setTheme(theme === "dark" ? "light" : "dark");

      // longer delay before opening to ensure theme switch is done and suspense is built
      setTimeout(() => {
        setIsTransitioning(false);
      }, 400);
    }, 400);
  };

  // Play "Scissors Cut" sound
  const playCutSound = () => {
    try {
      const audio = new Audio("/sound/paper-cut.mp3");
      audio.volume = 0.6; // Slightly adjusted volume
      audio.play().catch((e) => console.error("Audio play failed", e));
    } catch (e) {
      console.error("Audio construction failed", e);
    }
  };

  // Extract GitHub username from social links
  const githubLink = data.socialLinks.find(
    (link) =>
      link.platform.toLowerCase() === "github" ||
      link.url.toLowerCase().includes("github.com"),
  );

  // Parse username from URL: https://github.com/username or github.com/username
  // Remove trailing slashes, split by '/', take last segment
  const githubUsername = githubLink
    ? githubLink.url.replace(/\/+$/, "").split("/").pop()
    : null;

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
  const showAchievements =
    (profileSettings.showAchievements ?? true) && achievements.length > 0;
  const showCertificates =
    (profileSettings.showCertificates ?? true) && certificates.length > 0;
  const showContact = profileSettings.showContact !== false;
  const showGithubHeatmap = profileSettings.showGithubHeatmap !== false;

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
      <AnimatePresence mode="wait" initial={true}>
        {!showResume ? (
          <motion.div
            key="profile"
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{
              opacity: 1,
              scale: 1,
              filter: isTransitioning ? "blur(12px)" : "blur(0px)",
            }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="w-full min-h-screen bg-white dark:bg-neutral-950 backface-hidden"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* <ViewfinderFrame className="max-w-3xl mx-auto"> */}
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black p-1">
              <div
                id="home"
                className="max-w-3xl mx-auto bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-2xl shadow-neutral-200/50 dark:shadow-none border-dashed overflow-hidden relative"
              >
                <Navbar />
                {/* --- COVER IMAGE --- */}
                <div className="w-full h-[120px] md:h-[180px] relative overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                  <div className="absolute inset-0 bg-neutral-900/10 dark:bg-neutral-900/30 z-10 pointer-events-none mix-blend-overlay"></div>

                  {/* Grid Pattern Overlay */}
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-10 pointer-events-none mix-blend-soft-light"></div>

                  {profile.coverImage ? (
                    <Image
                      src={profile.coverImage!}
                      alt="Cover"
                      fill
                      priority
                      className="object-cover"
                      sizes="100vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-neutral-200 to-neutral-400 dark:from-neutral-800 dark:to-neutral-900" />
                  )}

                  {/* Decorative Tech Lines */}
                  <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-neutral-500/50 to-transparent z-20" />
                </div>

                {/* --- HEADER SECTION (Below cover) --- */}
                <motion.div
                  className="px-4 md:px-6 py-4"
                  initial="initial"
                  animate="animate"
                  variants={stagger}
                >
                  {/* Avatar + Name/Headline Row */}
                  <motion.div
                    variants={fadeIn}
                    className="flex items-center justify-between -mt-12 md:-mt-14"
                  >
                    {/* Avatar - overlaps cover image */}
                    <div className="shrink-0 relative z-20 mb-4">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 20,
                        }}
                        whileHover={{
                          scale: 1.05,
                          rotate: 2,
                        }}
                        className="w-20 h-20 md:w-20 md:h-20 rounded-full overflow-hidden bg-white dark:bg-neutral-800  border-4 border-white dark:border-neutral-950 ring-1 ring-black/5 dark:ring-white/10"
                      >
                        {profile.image ? (
                          <Image
                            src={profile.image}
                            alt={displayName}
                            width={96}
                            height={96}
                            loading="lazy"
                            sizes="96px"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400 dark:text-neutral-600 bg-neutral-50 dark:bg-neutral-800">
                            <IconUser className="w-8 h-8" />
                          </div>
                        )}
                      </motion.div>
                    </div>

                    {/* Socials - Right of Avatar (Swapped) */}
                    <div className=" flex flex-wrap items-center justify-end pt-8">
                      <SocialsSection
                        links={data.socialLinks}
                        email={profileSettings.showEmail ? data.email : null}
                      />

                      {/* Theme Toggle Button */}
                      <div className="flex items-center border-l-2 border-neutral-200 dark:border-neutral-800 pl-2 ml-4">
                        <motion.button
                          onClick={handleThemeToggle}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9, rotate: 180 }}
                          className=" transition-colors text-neutral-600 dark:text-neutral-400 relative overflow-hidden group"
                          aria-label="Toggle theme"
                        >
                          <motion.svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-[18px] h-[18px]"
                            animate={{ rotate: theme === "dark" ? 180 : 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                          >
                            <path
                              stroke="none"
                              d="M0 0h24v24H0z"
                              fill="none"
                            ></path>
                            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                            <path d="M12 3l0 18"></path>
                            <path d="M12 9l4.65 -4.65"></path>
                            <path d="M12 14.3l7.37 -7.37"></path>
                            <path d="M12 19.6l8.85 -8.85"></path>
                          </motion.svg>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Socials + Buttons Row */}
                  <motion.div
                    variants={fadeIn}
                    className="flex items-center justify-between"
                  >
                    {/* Name & Headline (Swapped) */}
                    <div className="flex flex-col min-w-0">
                      <h1 className="text-xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 text-balance leading-tight flex items-center gap-1">
                        {displayName}
                        {isVerified && (
                          <VerificationBadge size={25} className="shrink-0" />
                        )}
                      </h1>
                      <p className="text-sm md:text-base text-neutral-500 dark:text-neutral-400 font-medium">
                        {profile.headline || "Developer"}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-6 text-xs text-neutral-400 dark:text-neutral-500">
                        {(profile as any).profession && (
                          <motion.div
                            className="flex items-center gap-1.5 group/bag cursor-default"
                            whileHover="hover"
                            initial="initial"
                            animate="animate"
                            viewport={{ once: true }}
                            variants={{
                              initial: { opacity: 0, x: -10 },
                              animate: {
                                opacity: 1,
                                x: 0,
                                transition: { delay: 0.1 },
                              },
                            }}
                          >
                            <motion.svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-3.5 h-3.5 text-neutral-400 group-hover/bag:text-amber-500 transition-colors duration-300"
                              variants={{
                                hover: {
                                  rotate: [0, -10, 10, -5, 5, 0],
                                  transition: {
                                    duration: 0.5,
                                    ease: "easeInOut",
                                  },
                                },
                              }}
                            >
                              <rect
                                width="18"
                                height="13"
                                x="3"
                                y="8"
                                rx="2"
                                ry="2"
                              />
                              <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <path d="M8 11h8" className="opacity-50" />
                              <path d="M3 13h18" className="opacity-30" />
                            </motion.svg>
                            <span className="group-hover/bag:text-neutral-600 dark:group-hover/bag:text-neutral-300 transition-colors duration-300">
                              {(profile as any).profession}
                            </span>
                          </motion.div>
                        )}
                        {profile.location && (
                          <motion.div
                            className="flex items-center gap-1.5 group/pin cursor-default"
                            whileHover="hover"
                            initial="initial"
                            animate="animate"
                            viewport={{ once: true }}
                            variants={{
                              initial: { opacity: 0, x: -10 },
                              animate: {
                                opacity: 1,
                                x: 0,
                                transition: { delay: 0.2 },
                              },
                            }}
                          >
                            <motion.svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-3.5 h-3.5 text-neutral-400 group-hover/pin:text-rose-500 transition-colors duration-300"
                              variants={{
                                hover: {
                                  y: [0, -4, 0],
                                  filter: [
                                    "drop-shadow(0 0 0px rgba(0,0,0,0))",
                                    "drop-shadow(0 4px 4px rgba(0,0,0,0.1))",
                                    "drop-shadow(0 0 0px rgba(0,0,0,0))",
                                  ],
                                  transition: {
                                    duration: 0.8,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                  },
                                },
                              }}
                            >
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                              <motion.circle
                                cx="12"
                                cy="10"
                                r="3"
                                variants={{
                                  hover: {
                                    scale: [1, 1.2, 1],
                                    transition: {
                                      duration: 0.8,
                                      repeat: Infinity,
                                    },
                                  },
                                }}
                              />
                            </motion.svg>
                            <span className="group-hover/pin:text-neutral-600 dark:group-hover/pin:text-neutral-300 transition-colors duration-300">
                              {profile.location}
                            </span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Integrated Action Set - Optimized Stacking */}
                  <motion.div
                    variants={fadeIn}
                    className="flex items-center justify-end gap-6 pt-10 group/button-set relative isolate"
                  >
                    {/* Resume Section */}
                    <div className="relative">
                      {/* Left Side Lines - Matching Contact style & Symmetric Flow */}
                      {/* <svg
                        className="absolute hidden md:block right-full top-1/2 -translate-y-1/2 w-8 h-12 text-neutral-400 dark:text-neutral-500 pointer-events-none overflow-visible z-[-1]"
                        viewBox="0 0 48 80"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      > */}
                      {/* Static Background Lines */}
                      {/* <path
                          d="M48 40 H24 L16 32 H0"
                          stroke="currentColor"
                          strokeWidth="1"
                          className="opacity-30"
                        />
                        <path
                          d="M48 24 H32 L24 16 H0"
                          stroke="currentColor"
                          strokeWidth="1"
                          className="opacity-30"
                        />
                        <path
                          d="M48 56 H32 L24 64 H0"
                          stroke="currentColor"
                          strokeWidth="1"
                          className="opacity-30"
                        /> */}

                      {/* Flowing Data Streams - Persistent Right-to-Left */}
                      {/* {[
                          "M48 40 H24 L16 32 H0",
                          "M48 24 H32 L24 16 H0",
                          "M48 56 H32 L24 64 H0",
                        ].map((path, i) => (
                          <motion.path
                            key={i}
                            d={path}
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeDasharray="4 8"
                            animate={{ strokeDashoffset: [24, 0] }}
                            transition={{
                              duration: 1.2 + i * 0.3,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="stroke-neutral-950 dark:stroke-white"
                          />
                        ))}
                      </svg> */}

                      {/* Connecting Lines (Circuitry) - Behind Buttons */}
                      {/* <svg
                        className="absolute left-full top-1/2 -translate-y-1/2 w-8 h-12 text-neutral-400 dark:text-neutral-500 pointer-events-none overflow-visible z-[-1]"
                        viewBox="0 0 48 80"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      > */}
                      {/* Static Background Lines */}
                      {/* We mirror the contact paths so they merge perfectly */}
                      {/* <path
                          d="M48 40 H24 L16 32 H0"
                          stroke="currentColor"
                          strokeWidth="1"
                          className="opacity-30"
                        />
                        <path
                          d="M48 24 H32 L24 16 H0"
                          stroke="currentColor"
                          strokeWidth="1"
                          className="opacity-30"
                        />
                        <path
                          d="M48 56 H32 L24 64 H0"
                          stroke="currentColor"
                          strokeWidth="1"
                          className="opacity-30"
                        /> */}

                      {/* Flowing Data Streams - Persistent Right-to-Left */}
                      {/* {[
                          "M48 40 H24 L16 32 H0",
                          "M48 24 H32 L24 16 H0",
                          "M48 56 H32 L24 64 H0",
                        ].map((path, i) => (
                          <motion.path
                            key={i}
                            d={path}
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeDasharray="4 8"
                            animate={{ strokeDashoffset: [24, 0] }}
                            transition={{
                              duration: 1.2 + i * 0.3,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="stroke-neutral-950 dark:stroke-white"
                          />
                        ))}
                      </svg> */}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowResume(true)}
                        className="relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-linear-to-b from-neutral-50 to-neutral-300 dark:from-neutral-200 dark:to-neutral-500 shadow-[0_4px_10px_-2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,1)] dark:shadow-[0_4px_10px_-2px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] border border-neutral-300 dark:border-neutral-700 overflow-hidden cursor-pointer group/resume"
                      >
                        {/* Technical Stitching */}
                        <div className="absolute inset-[3px] rounded-lg border border-dashed border-neutral-400 dark:border-neutral-600 pointer-events-none" />

                        <span className="relative z-10 text-sm font-bold tracking-tight text-neutral-800 dark:text-neutral-800 uppercase font-mono">
                          Resume
                        </span>
                        <div className="relative z-10 flex items-center justify-center w-5 h-5 rounded-sm">
                          <IconFoldUp className="w-4 h-4 text-neutral-700 dark:text-neutral-800 transform transition-transform group-hover/resume:-translate-y-0.5" />
                        </div>

                        {/* Scanline Hover Effect */}
                        <motion.div
                          className="absolute inset-0 w-px h-full bg-linear-to-b from-transparent via-neutral-900/40 dark:via-white/40 to-transparent pointer-events-none z-20"
                          initial={{ left: "100%" }}
                          whileHover={{
                            left: ["100%", "0%"],
                            transition: {
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "linear",
                            },
                          }}
                        />

                        {/* Background Activation Glow */}
                        <div className="absolute inset-0 bg-neutral-900/5 dark:bg-white/5 opacity-0 group-hover/resume:opacity-100 transition-opacity duration-300" />
                      </motion.button>
                    </div>

                    {/* Contact Button */}
                    <div className="relative">
                      {profileSettings.showEmail && data.email ? (
                        <a href={`mailto:${data.email}`}>
                          <ViewfinderButton
                            variant="filled"
                            className="cursor-pointer rounded-lg bg-neutral-950 dark:bg-neutral-900 hover:shadow-[0_0_20px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all"
                          >
                            <span className="text-sm font-bold tracking-tight uppercase font-mono">
                              Contact
                            </span>
                          </ViewfinderButton>
                        </a>
                      ) : (
                        <ViewfinderButton
                          variant="filled"
                          className="opacity-10 rounded-lg cursor-not-allowed"
                          title="Contact info hidden"
                        >
                          <span className="text-sm font-bold tracking-tight uppercase font-mono">
                            Contact
                          </span>
                        </ViewfinderButton>
                      )}
                    </div>
                  </motion.div>

                  {/* GitHub Heatmap - Render if username exists and visibility is enabled */}
                  {githubUsername && showGithubHeatmap && (
                    <>
                      <div className="pt-10">
                        <GithubHeatmap
                          username={githubUsername}
                          className="scale-100 origin-center"
                        />
                      </div>
                      {/* Dotted Line Divider - only show after heatmap */}
                      <div className="w-full h-px bg-linear-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent my-4 opacity-60" />
                    </>
                  )}
                </motion.div>

                {/* --- MAIN CONTENT --- */}
                <div className="px-4 md:px-6 pt-8 space-y-10 bg-white dark:bg-neutral-950">
                  {/* --- EXPERIENCE --- */}
                  {showExperience && (
                    <div
                      id="experience"
                      className="space-y-6 relative scroll-mt-24"
                    >
                      {/* Section Header */}
                      <div className="flex items-center justify-between md:justify-start gap-4 mb-6">
                        <h2 className="font-mono text-xs font-bold text-neutral-500 dark:text-neutral-500 tracking-wider uppercase flex items-center gap-2">
                          // Experience
                        </h2>
                      </div>
                      <ExperienceSection experiences={data.experiences} />
                      {data.experiences && data.experiences.length === 0 && (
                        <div className="py-8 text-center text-sm text-neutral-500 font-mono">
                          No experience recorded.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Minimal Divider - only show if experience OR projects visible */}
                  {(showExperience || showProjects) && (
                    <div className="w-full h-px bg-linear-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent my-8 opacity-60" />
                  )}

                  {showProjects && (
                    <div id="works" className="space-y-6 relative scroll-mt-24">
                      <div className="flex items-center justify-between md:justify-start gap-4 mb-6">
                        <h2 className="font-mono text-xs font-bold text-neutral-500 dark:text-neutral-500 tracking-wider uppercase flex items-center gap-2">
                          // Selected Work
                        </h2>
                      </div>

                      <div className="relative pl-8 md:pl-10">
                        {/* Unique Tech Node Line */}
                        <div className="absolute left-[11px] top-[4px] bottom-0 w-px bg-neutral-200 dark:bg-neutral-800">
                          {/* Top "Target" Node */}
                          <div className="absolute -top-[5px] -left-[3.5px] w-2 h-2 border border-neutral-400 dark:border-neutral-600 bg-white dark:bg-neutral-950 rotate-45 shadow-sm z-10" />
                          <div className="absolute top-[15px] -left-[1.5px] w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />

                          {/* Bottom Gradient Fade Out */}
                          <div className="absolute bottom-0 left-0 w-full h-24 bg-linear-to-t from-white via-white/50 to-transparent dark:from-neutral-950 dark:via-neutral-950/50" />
                        </div>

                        {/* Projects Grid */}
                        <motion.div
                          layout
                          className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 pt-1"
                        >
                          <AnimatePresence>
                            {projects.length === 0 ? (
                              <div className="col-span-1 md:col-span-2 py-8 text-center text-sm text-neutral-500 font-mono">
                                No projects initialized.
                              </div>
                            ) : (
                              projects
                                .slice(0, visibleProjects)
                                .map((project, index) => (
                                  <motion.div
                                    layout
                                    key={project.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{
                                      duration: 0.3,
                                      delay: (index % 4) * 0.1,
                                    }}
                                    whileHover={{
                                      y: -5,
                                      transition: { duration: 0.2, delay: 0 },
                                    }}
                                  >
                                    <ProjectCard
                                      project={project}
                                      onInteraction={() =>
                                        handleProjectInteraction(project.id)
                                      }
                                      onClick={() =>
                                        setSelectedProject(project)
                                      }
                                    />
                                  </motion.div>
                                ))
                            )}
                          </AnimatePresence>
                        </motion.div>

                        {projects.length > 4 && (
                          <div className="text-center flex items-center justify-center pt-8">
                            <motion.button
                              onClick={() =>
                                setVisibleProjects((prev) =>
                                  prev === projects.length
                                    ? 4
                                    : projects.length,
                                )
                              }
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              className="w-1/2 py-3 flex items-center justify-center gap-2 border-y border-dashed border-neutral-200 dark:border-neutral-800 text-xs font-mono uppercase tracking-tight text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-all group"
                            >
                              {visibleProjects === projects.length
                                ? "Show Less"
                                : "Load All Work"}
                              <IconChevronDown
                                className={cn(
                                  "w-3.5 h-3.5 transition-transform duration-300",
                                  visibleProjects === projects.length &&
                                    "rotate-180",
                                )}
                              />
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Minimal Divider - only show if projects visible AND (techStack OR achievements) visible */}
                  {showProjects &&
                    (showTechStack ||
                      showAchievements ||
                      showCertificates ||
                      showSummary) && (
                      <div className="w-full h-px bg-linear-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent my-8 opacity-60" />
                    )}

                  {/* --- TECH STACK MARQUEE --- */}
                  {showTechStack && allTech.length > 0 && (
                    <div className="mb-0">
                      <div className="flex items-center justify-between md:justify-start gap-4">
                        <h2 className="font-mono text-xs font-bold text-neutral-500 dark:text-neutral-500 tracking-wider uppercase flex items-center gap-2">
                          // Tech Stack
                        </h2>
                      </div>

                      <motion.div
                        className="relative w-full mt-4 overflow-visible"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="relative flex overflow-x-hidden w-full">
                          {/* Left Fade Mask */}
                          <div className="absolute left-0 top-0 bottom-0 w-24 z-20 bg-linear-to-r from-white dark:from-neutral-950 to-transparent pointer-events-none"></div>
                          {/* Right Fade Mask */}
                          <div className="absolute right-0 top-0 bottom-0 w-24 z-20 bg-linear-to-l from-white dark:from-neutral-950 to-transparent pointer-events-none"></div>

                          <div className="flex animate-marquee whitespace-nowrap gap-8 py-4 group">
                            {marqueeTech.map((tech, index) => {
                              const Icon = getTechIcon(tech);
                              return (
                                <div
                                  key={`${tech}-${index}`}
                                  className="flex-shrink-0 relative transition-all duration-300 group-hover:blur-[2px] group-hover:opacity-40 hover:blur-none! hover:opacity-100! hover:scale-110! z-10"
                                >
                                  <div
                                    className="flex items-center justify-center p-2 px-6 border-[0.5px] border-dashed border-neutral-300 dark:border-neutral-700 transition-all duration-300 cursor-pointer text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 scale-[1.6] bg-white dark:bg-neutral-950 grayscale hover:grayscale-0"
                                    title={tech}
                                  >
                                    {Icon ? (
                                      Icon
                                    ) : (
                                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest">
                                        {tech}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* Minimal Divider - only show if techStack visible AND achievements visible */}
                  {showTechStack &&
                    allTech.length > 0 &&
                    (showAchievements || showCertificates || showSummary) && (
                      <div className="w-full h-px bg-linear-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent my-8 opacity-60" />
                    )}

                  {/* --- ACHIEVEMENTS --- */}
                  <div id="achievements" className="scroll-mt-24">
                    <AchievementsSection
                      achievements={data.achievements}
                      showAchievements={data.profileSettings.showAchievements}
                    />
                  </div>

                  {/* Minimal Divider - only show if achievements visible AND (certificates OR summary) visible */}
                  {showAchievements && (showCertificates || showSummary) && (
                    <div className="w-full h-px bg-linear-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent my-8 opacity-60" />
                  )}

                  {/* --- CERTIFICATES --- */}
                  {data.profileSettings.showCertificates !== false &&
                    data.certificates &&
                    data.certificates.length > 0 && (
                      <div className="">
                        <CertificatesSection certificates={data.certificates} />
                      </div>
                    )}

                  {/* Minimal Divider - only show if certificates visible AND summary visible */}
                  {showCertificates && showSummary && (
                    <div className="w-full h-px bg-linear-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent my-8 opacity-60" />
                  )}

                  {/* Summary (About) */}
                  {showSummary && profile.summary && (
                    <div className="space-y-6 ">
                      <div className="flex items-center justify-between md:justify-start gap-4 mb-6">
                        <h2 className="font-mono text-xs font-bold text-neutral-500 dark:text-neutral-500 tracking-wider uppercase flex items-center gap-2">
                          // About Me
                        </h2>
                      </div>

                      <div className="relative">
                        {/* Leaf Node Connector: L-Shape from top to text */}
                        <div className="absolute left-0 top-[-6px] h-[30px] w-px bg-neutral-200 dark:bg-neutral-800" />
                        <div className="absolute left-0 top-[23px] w-[20px] h-px bg-neutral-200 dark:bg-neutral-800" />

                        {/* Terminal Square Node at end of connector */}
                        <div className="absolute left-[15px] top-[20px] w-1.5 h-1.5 bg-neutral-200 dark:bg-neutral-800" />

                        <div className="relative pl-6 md:pl-8">
                          <div className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans text-left border-l-2 border-neutral-100 dark:border-neutral-800 pl-2 py-1">
                            {profile.summary}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Minimal Divider - only show if summary visible AND contact visible */}
                  {showSummary && showContact && (
                    <div className="w-full h-px bg-linear-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent my-8 opacity-60" />
                  )}

                  {/* --- CTA SECTION --- */}
                  {data.profileSettings.showContact !== false && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="pb-16  pt-8 text-center space-y-8 max-w-2xl mx-auto relative group"
                    >
                      {/* Unique Tech Node Border Decoration */}
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Top Left Corner */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-l border-t border-neutral-300 dark:border-neutral-700" />
                        <div className="absolute -top-[3px] -left-[3px] w-1.5 h-1.5 bg-neutral-800 dark:bg-neutral-200" />

                        {/* Top Right Corner */}
                        <div className="absolute top-0 right-0 w-4 h-4 border-r border-t border-neutral-300 dark:border-neutral-700" />

                        {/* Bottom Right Corner */}
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-r border-b border-neutral-300 dark:border-neutral-700" />
                        <div className="absolute -bottom-[3px] -right-[3px] w-1.5 h-1.5 bg-neutral-800 dark:bg-neutral-200" />

                        {/* Bottom Left Corner */}
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-l border-b border-neutral-300 dark:border-neutral-700" />

                        {/* Horizontal Fading Lines */}
                        <div className="absolute top-0 left-6 right-6 h-px bg-linear-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent" />
                        <div className="absolute bottom-0 left-6 right-6 h-px bg-linear-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent" />
                      </div>
                      {/* Decorative Background Blur */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-neutral-100/50 via-transparent to-transparent dark:from-neutral-900/20 opacity-50 pointer-events-none" />

                      <h2 className="relative text-md md:text-2xl font-semibold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-neutral-800 to-neutral-500 dark:from-neutral-100 dark:to-neutral-500 max-w-lg mx-auto leading-tight">
                        &ldquo;
                        {profile.ctaMessage ||
                          "Heyy, If you made it this far, let's chat."}
                        &rdquo;
                      </h2>

                      {/* CTA Section Container with Node Lines */}
                      <div className="relative flex justify-center ">
                        {/* Decorative Node Lines Removed */}

                        {/* CTA Button with Avatar */}
                        <motion.div
                          className="relative z-10 p-px rounded-full bg-linear-to-b from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-900 group overflow-hidden"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* Animated Border Gradient - Pure Black in Light, Pure White in Dark */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[500%] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#000000_50%,transparent_100%)] dark:bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#ffffff_50%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-[spin_4s_linear_infinite]" />

                          <a
                            href={
                              (profile as any).meetingUrl ||
                              (data.email ? `mailto:${data.email}` : "#")
                            }
                            target={
                              (profile as any).meetingUrl ? "_blank" : undefined
                            }
                            rel={
                              (profile as any).meetingUrl
                                ? "noopener noreferrer"
                                : undefined
                            }
                            className="relative flex items-center gap-3 bg-white dark:bg-neutral-950 px-1.5 pl-1.5 pr-6 py-1.5 rounded-full border-[0.5px] border-neutral-200 dark:border-neutral-800 group-hover:border-transparent transition-colors duration-300 overflow-hidden"
                          >
                            {/* Shimmer Effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-neutral-100/50 dark:via-neutral-800/50 to-transparent z-0 pointer-events-none" />

                            {/* Subtle Inner Pattern */}
                            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat rounded-full" />
                            <div
                              className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1] pointer-events-none rounded-full"
                              style={{
                                backgroundImage:
                                  "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
                                backgroundSize: "12px 12px",
                              }}
                            />

                            {/* Node Connectors (Top/Bottom/Left/Right) - On the EDGE of the button */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-neutral-50 dark:bg-neutral-950 rounded-full border border-neutral-300 dark:border-neutral-700 z-20 group-hover:border-neutral-500 dark:group-hover:border-neutral-400 transition-colors shadow-sm" />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 bg-neutral-50 dark:bg-neutral-950 rounded-full border border-neutral-300 dark:border-neutral-700 z-20 group-hover:border-neutral-500 dark:group-hover:border-neutral-400 transition-colors shadow-sm" />
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-neutral-50 dark:bg-neutral-950 rounded-full border border-neutral-300 dark:border-neutral-700 z-20 group-hover:border-neutral-500 dark:group-hover:border-neutral-400 transition-colors shadow-sm" />
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-1.5 h-1.5 bg-neutral-50 dark:bg-neutral-950 rounded-full border border-neutral-300 dark:border-neutral-700 z-20 group-hover:border-neutral-500 dark:group-hover:border-neutral-400 transition-colors shadow-sm" />

                            {/* Avatar Container */}
                            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden bg-neutral-100 ring-2 ring-neutral-100 dark:ring-neutral-900 group-hover:ring-neutral-200 dark:group-hover:ring-neutral-700 transition-all flex items-center justify-center shrink-0 relative z-10 shadow-inner">
                              {profile.image ? (
                                <Image
                                  src={profile.image}
                                  alt={displayName}
                                  width={36}
                                  height={36}
                                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                                />
                              ) : (
                                <IconUser className="w-4 h-4 text-neutral-400" />
                              )}
                            </div>

                            {/* Text Content */}
                            <div className="flex flex-col items-start relative z-10 gap-0.5">
                              <span className="font-bold text-xs md:text-sm text-neutral-800 dark:text-neutral-200 leading-none group-hover:text-black dark:group-hover:text-white transition-colors">
                                Book a Free Call
                              </span>
                              {/* Smooth Reveal Subtitle */}
                              <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out">
                                <span className="text-[9px] text-neutral-500 font-mono tracking-tight overflow-hidden flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                  {(profile as any).meetingUrl
                                    ? "Schedule meeting"
                                    : "Send me an email"}
                                  <span className="opacity-0 group-hover:opacity-100 transition-opacity delay-200">
                                    <IconArrowUpRight size={10} />
                                  </span>
                                </span>
                              </div>
                            </div>
                          </a>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {/* --- FOOTER --- */}
                  <footer className="border-t border-dashed border-neutral-200 dark:border-neutral-800 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-neutral-400 dark:text-neutral-600 text-[10px] font-mono uppercase tracking-wider">
                    <div>
                      &copy; {new Date().getFullYear()} {displayName}. All
                      Rights Reserved.
                    </div>
                    <div className="flex items-center gap-4 opacity-70 hover:opacity-100 transition-opacity">
                      <SocialsSection
                        links={data.socialLinks}
                        className="scale-70 origin-center md:origin-right gap-4"
                      />
                    </div>
                  </footer>
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

      {/* Transition Overlay - Zig Zag Paper Cut */}
      <AnimatePresence>
        {isTransitioning && (
          <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
            {/* Bottom-Left Half */}
            <motion.div
              initial={{ x: 0, y: 0 }}
              exit={{ x: "-60%", y: "60%" }} // Increased distance for drama
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} // Slower
              style={{
                clipPath: `polygon(
                    0% 0%, 
                    4% 8%, 8% 4%, 12% 16%, 16% 12%, 20% 24%, 24% 20%, 28% 32%, 32% 28%, 36% 40%, 40% 36%, 44% 48%, 48% 44%, 52% 56%, 56% 52%, 60% 64%, 64% 60%, 68% 72%, 72% 68%, 76% 80%, 80% 76%, 84% 88%, 88% 84%, 92% 96%, 96% 92%, 100% 100%,
                    0% 100%
                  )`,
              }}
              className={cn(
                "absolute inset-0 w-full h-full drop-shadow-2xl",
                (transitionTheme || theme) === "light"
                  ? "bg-white"
                  : "bg-neutral-950",
              )}
            ></motion.div>

            {/* Top-Right Half */}
            <motion.div
              initial={{ x: 0, y: 0 }}
              exit={{ x: "60%", y: "-60%" }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              style={{
                clipPath: `polygon(
                    0% 0%, 
                    4% 8%, 8% 4%, 12% 16%, 16% 12%, 20% 24%, 24% 20%, 28% 32%, 32% 28%, 36% 40%, 40% 36%, 44% 48%, 48% 44%, 52% 56%, 56% 52%, 60% 64%, 64% 60%, 68% 72%, 72% 68%, 76% 80%, 80% 76%, 84% 88%, 88% 84%, 92% 96%, 96% 92%, 100% 100%,
                    100% 0%
                  )`,
              }}
              className={cn(
                "absolute inset-0 w-full h-full drop-shadow-2xl",
                (transitionTheme || theme) === "light"
                  ? "bg-white"
                  : "bg-neutral-950",
              )}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
