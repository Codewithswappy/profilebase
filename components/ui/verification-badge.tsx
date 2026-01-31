"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface VerificationBadgeProps {
  className?: string;
  size?: number;
}

export function VerificationBadge({
  className,
  size = 24,
}: VerificationBadgeProps) {
  return (
    <motion.div
      className={cn(
        "inline-flex items-center justify-center relative select-none",
        className,
      )}
      title="Verified"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Outer Glow Halo - Gold/Electrical */}
      <motion.div
        className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl"
        animate={{
          scale: [0.8, 1.1, 0.8],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 overflow-visible"
      >
        <defs>
          <linearGradient id="premium-gold" x1="4" y1="4" x2="28" y2="28">
            <stop offset="0%" stopColor="#FCD34D" /> {/* amber-300 */}
            <stop offset="40%" stopColor="#F59E0B" /> {/* amber-500 */}
            <stop offset="100%" stopColor="#D97706" /> {/* amber-600 */}
          </linearGradient>

          <radialGradient
            id="seal-black"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(16 16) rotate(90) scale(16)"
          >
            <stop stopColor="#27272a" /> {/* neutral-800 */}
            <stop offset="1" stopColor="#09090b" /> {/* neutral-950 */}
          </radialGradient>

          <filter id="bolt-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="1" result="coloredBlur" />
            <feComposite in="coloredBlur" in2="SourceGraphic" operator="over" />
          </filter>
        </defs>

        {/* Badge Background - Sharp Geometric Starburst */}
        {/* A 12-point sharp star shape for a 'Badge' look */}
        <motion.path
          d="M16 2.5L18.4 6.6L23 5.8L23.8 10.4L28.2 11.6L27 16L28.2 20.4L23.8 21.6L23 26.2L18.4 25.4L16 29.5L13.6 25.4L9 26.2L8.2 21.6L3.8 20.4L5 16L3.8 11.6L8.2 10.4L9 5.8L13.6 6.6L16 2.5Z"
          fill="url(#seal-black)"
          stroke="#404040"
          strokeWidth="0.8"
          className="drop-shadow-xl"
          initial={{ rotate: 0 }}
        />

        {/* --- The Lightning Bolt Assembly --- */}

        {/* 1. Underlying Energy Arcs (Thunder branching) */}
        <motion.path
          d="M22 2L24 5L23 7M11 30L9 27L10 25"
          stroke="url(#premium-gold)"
          strokeWidth="0.5"
          fill="none"
          initial={{ opacity: 0, pathLength: 0 }}
          animate={{ opacity: [0, 1, 0], pathLength: [0, 1, 0] }}
          transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 1.5 }}
        />

        {/* 2. Main Bolt Shape - 3D Bevel Base (Darker Gold) */}
        <motion.path
          d="M22 2L18 11H23L11 30L15 15H10L22 2Z"
          fill="#B45309" // Darker base for 3D depth
          stroke="none"
        />

        {/* 3. Main Bolt Face - Gradient Gold */}
        <motion.path
          d="M21.5 2.5L17.8 10.8L18 11H22.5L11.5 29L15.2 15.2L15 15H10.5L21.5 2.5Z" // Slightly inset
          fill="url(#premium-gold)"
          filter="url(#bolt-glow)"
          stroke="none"
          initial={{ opacity: 1 }}
          animate={{
            filter: [
              "url(#bolt-glow) brightness(1)",
              "url(#bolt-glow) brightness(1.3)",
              "url(#bolt-glow) brightness(1)",
            ],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatDelay: 0.5,
            ease: "easeInOut",
          }}
        />

        {/* 4. Highlight/Reflection on Edge (White) */}
        <motion.path
          d="M21.5 2.5L17.8 10.8M10.5 15L15.2 15.2"
          stroke="white"
          strokeWidth="0.5"
          strokeOpacity="0.8"
          strokeLinecap="round"
        />

        {/* 5. Crack Texture Overlay */}
        <path
          d="M19 6L17 8M13 25L14 22M15 16L13.5 18"
          stroke="#78350F" // Dark brown/gold
          strokeWidth="0.5"
          opacity="0.6"
        />

        {/* Real Lightning Sparks - Jagged Shards */}
        <motion.path
          d="M25 8L24 9.5L26 10"
          stroke="url(#premium-gold)"
          strokeWidth="0.8"
          fill="none"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
          transition={{
            duration: 0.4,
            repeat: Infinity,
            repeatDelay: 2,
            delay: 0.2,
          }}
        />
        <motion.path
          d="M8 24L9 22.5L7 22"
          stroke="url(#premium-gold)"
          strokeWidth="0.8"
          fill="none"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
          transition={{
            duration: 0.4,
            repeat: Infinity,
            repeatDelay: 2.5,
            delay: 0.4,
          }}
        />
      </svg>
    </motion.div>
  );
}
