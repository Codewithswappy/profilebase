"use client";

import { FullProfile } from "@/lib/actions/profile";
import { cn } from "@/lib/utils";
import { Link } from "next-view-transitions";
import { IconArrowRight, IconLock, IconTrophy } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import { VerificationBadge } from "@/components/ui/verification-badge";

interface ProfileCompletionWidgetProps {
  data: FullProfile;
}

export function ProfileCompletionWidget({
  data,
}: ProfileCompletionWidgetProps) {
  const {
    profile,
    projects,
    experiences,
    achievements,
    certificates,
    socialLinks,
  } = data;

  const steps = [
    {
      id: "headline",
      label: "Headline",
      completed: !!profile.headline,
      href: "/dashboard/profile",
    },
    {
      id: "summary",
      label: "Summary",
      completed: !!profile.summary,
      href: "/dashboard/profile",
    },
    {
      id: "project",
      label: "Project",
      completed: projects.length > 0,
      href: "/dashboard/projects",
    },
    {
      id: "experience",
      label: "Role",
      completed: experiences.length > 0,
      href: "/dashboard/profile",
    },
    {
      id: "achievement",
      label: "Achievement",
      completed: achievements.length > 0,
      href: "/dashboard/profile",
    },
    {
      id: "certificate",
      label: "Certificate",
      completed: certificates.length > 0,
      href: "/dashboard/profile",
    },
    {
      id: "socials",
      label: "Socials",
      completed: socialLinks.length >= 3,
      href: "/dashboard/profile",
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const progress = Math.round((completedCount / steps.length) * 100);
  const isComplete = progress === 100;
  const nextStep = steps.find((s) => !s.completed);

  // SVG Progress Ring Constants
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="group relative overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 transition-all duration-300">
      {/* Header - Matches Screenshot */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-900 bg-neutral-50/20 dark:bg-neutral-900/10">
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          <h3 className="text-[11px] font-bold font-mono uppercase tracking-[0.3em] text-neutral-400 dark:text-neutral-500">
            Verification
          </h3>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-base font-bold text-neutral-900 dark:text-neutral-100">
            {progress}
          </span>
          <span className="font-mono text-[10px] text-neutral-400">%</span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-6">
          {/* Visual Progress Gauge */}
          <div className="relative h-16 w-16 flex items-center justify-center shrink-0">
            <svg className="absolute inset-0 h-full w-full -rotate-90 transform overflow-visible">
              <circle
                cx="32"
                cy="32"
                r="30"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                className="text-neutral-50 dark:text-neutral-900/50"
              />
              <motion.circle
                cx="32"
                cy="32"
                r="30"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray={2 * Math.PI * 30}
                initial={{ strokeDashoffset: 2 * Math.PI * 30 }}
                animate={{
                  strokeDashoffset:
                    2 * Math.PI * 30 - (progress / 100) * (2 * Math.PI * 30),
                }}
                transition={{ duration: 1.5, ease: "circOut" }}
                strokeLinecap="round"
                fill="none"
                className={cn(
                  "transition-colors duration-700",
                  isComplete
                    ? "text-lime-500"
                    : "text-neutral-900 dark:text-white",
                )}
              />
            </svg>

            <div
              className={cn(
                "relative z-10 transition-all duration-700 transform flex items-center justify-center",
                !isComplete && "grayscale opacity-40 scale-90",
              )}
            >
              <VerificationBadge size={40} />
              {!isComplete && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-full p-1.5 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <IconLock className="h-3.5 w-3.5 text-neutral-900 dark:text-neutral-100" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status/Action Area */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {isComplete ? (
                <motion.div
                  key="verified"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-0.5"
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="h-2 w-2 rounded-full bg-lime-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    />
                    <span className="text-xs font-bold font-mono tracking-[0.2em] text-lime-600 dark:text-lime-400">
                      VERIFIED
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 font-mono">
                    Profile registration complete
                  </p>
                </motion.div>
              ) : (
                nextStep && (
                  <motion.div
                    key="next-up"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-3"
                  >
                    <Link
                      href={nextStep.href}
                      className="group/link flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold font-mono uppercase tracking-[0.25em] text-neutral-400">
                          Up Next
                        </p>
                        <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100 group-hover/link:underline decoration-neutral-300 underline-offset-4 decoration-2">
                          {nextStep.label}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full border border-neutral-100 dark:border-neutral-900 flex items-center justify-center transition-all shadow-sm">
                        <IconArrowRight className="h-5 w-5 text-neutral-300 transition-transform group-hover/link:translate-x-0.5 group-hover/link:text-neutral-900 dark:group-hover/link:text-white" />
                      </div>
                    </Link>
                    <p className="text-[9px] font-bold font-mono uppercase tracking-widest text-neutral-400/80">
                      Complete profile to unlock badge
                    </p>
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
          {/* High-end bottom accent line */}
      <div
        className={cn(
          "h-[2px] w-full transition-all duration-1000",
          isComplete
            ? "bg-lime-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            : "bg-neutral-100 dark:bg-neutral-900",
        )}
      />
    </div>
   
  );
}
