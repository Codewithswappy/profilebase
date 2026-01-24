"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconBrandGithub, IconStarFilled } from "@tabler/icons-react";

interface GithubStarButtonProps {
  repoUrl?: string; // e.g., "facebook/react"
  initialStars?: number;
  className?: string;
}

export const GithubStarButton = ({
  repoUrl = "https://github.com/Codewithswappy/Profilebase",
  initialStars = 120,
  className,
}: GithubStarButtonProps) => {
  const [stars, setStars] = useState(initialStars);
  const [starred, setStarred] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mixAnimation, setMixAnimation] = useState(false);
  const [showPlusOne, setShowPlusOne] = useState(false); // New state for +1

  // Fetch real stars
  useEffect(() => {
    if (!repoUrl) return;
    const fetchStars = async () => {
      try {
        let repoPath = repoUrl;
        if (repoUrl.startsWith("https://github.com/")) {
          repoPath = repoUrl.replace("https://github.com/", "");
        }
        const res = await fetch(`https://api.github.com/repos/${repoPath}`);
        if (res.ok) {
          const data = await res.json();
          setStars(data.stargazers_count);
        }
      } catch (error) {
        console.error("Failed to fetch Github stars:", error);
      }
    };
    fetchStars();
  }, [repoUrl]);

  const handleClick = () => {
    if (starred) {
      setStarred(false);
      setStars((prev) => prev - 1);
    } else {
      setMixAnimation(true);

      // Impact timing
      setTimeout(() => {
        setStarred(true);
        setStars((prev) => prev + 1);
        setShowPlusOne(true); // Trigger +1
        setMixAnimation(false);

        // Hide +1 after animation
        setTimeout(() => setShowPlusOne(false), 1000);
      }, 500);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={
        mixAnimation
          ? {
              scale: [1, 0.95, 1],
              boxShadow: "0 0 20px rgba(250, 204, 21, 0.4)",
            }
          : {
              scale: 1,
              boxShadow: isHovered
                ? "0 4px 12px rgba(0,0,0,0.1)"
                : "0 1px 2px rgba(0,0,0,0.05)",
            }
      }
      className={cn(
        "group relative flex items-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full h-12 pl-2 pr-5 cursor-pointer max-w-fit mx-auto select-none",
        className,
      )}
    >
      {/* Projectile Star (The "Shoot" effect) */}
      {mixAnimation && (
        <motion.div
          initial={{ x: 10, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: 80,
            y: -4,
            rotate: 360,
            scale: 0.5,
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute left-2 z-50 pointer-events-none"
        >
          <IconStarFilled className="w-6 h-6 text-yellow-400 drop-shadow-md" />
        </motion.div>
      )}

      {/* Left Text Zone */}
      <div className="flex items-center gap-2 px-2 transition-all duration-300">
        <div className="relative w-8 h-8 flex items-center justify-center">
          {/* Persistent Star */}
          <motion.div
            animate={
              starred
                ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }
                : { rotateY: 180 }
            }
            transition={
              starred
                ? { duration: 0.4 }
                : { duration: 4, repeat: Infinity, ease: "linear" }
            }
          >
            <IconStarFilled
              className={cn(
                "w-6 h-6 drop-shadow-sm transition-colors duration-300",
                starred
                  ? "text-yellow-400"
                  : "text-neutral-300 group-hover:text-yellow-400",
              )}
            />
          </motion.div>
        </div>

        <span
          className={cn(
            "text-base font-bold transition-all duration-300 min-w-[3.5rem] text-left",
            starred
              ? "text-neutral-900 dark:text-white"
              : "text-neutral-600 dark:text-neutral-400",
          )}
        >
          {starred ? "Starred" : "Star"}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800 mx-2" />

      {/* Right Count Zone */}
      <div className="relative min-w-[30px] h-full flex items-center justify-center">
        {/* The Floating +1 */}
        <AnimatePresence>
          {showPlusOne && (
            <motion.div
              initial={{ y: 0, opacity: 0, scale: 0.5 }}
              animate={{ y: -25, opacity: 1, scale: 1.2 }}
              exit={{ y: -35, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute -top-1 right-0 left-0 mx-auto text-yellow-500 font-extrabold text-sm pointer-events-none z-20"
            >
              +1
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          <motion.span
            key={stars}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className={cn(
              "text-lg font-bold tabular-nums",
              starred
                ? "text-yellow-500"
                : "text-neutral-500 dark:text-neutral-400",
            )}
          >
            {stars}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Background Glow when starred */}
      <div
        className={cn(
          "absolute inset-0 rounded-full bg-yellow-400/5 transition-opacity duration-500 pointer-events-none",
          starred ? "opacity-100" : "opacity-0",
        )}
      />
    </motion.button>
  );
};
