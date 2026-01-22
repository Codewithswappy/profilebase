import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ViewfinderButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outline" | "filled";
  children: React.ReactNode;
}

export const ViewfinderButton = forwardRef<
  HTMLButtonElement,
  ViewfinderButtonProps
>(({ className, variant = "outline", children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative overflow-hidden rounded-full px-4 py-3 text-sm font-semibold tracking-wide transition-all duration-300 ease-out",
        "active:scale-[0.98] active:translate-y-0.5",

        variant === "outline"
          ? [
              "bg-transparent",
              "text-neutral-900 dark:text-neutral-100",
              "border-2 border-neutral-200 dark:border-neutral-800",
              "hover:bg-neutral-100 dark:hover:bg-neutral-800",
            ]
          : [
              // Filled / "Get Paymint" style - 3D Effect
              "text-white shadow-xl",
              // Main Gradient: Lighter top -> Darker bottom
              "bg-linear-to-b from-neutral-700 via-neutral-800 to-neutral-900",
              // Dark mode: Deep, rich dark metallic aesthetic instead of white
              "dark:from-neutral-800 dark:via-neutral-900 dark:to-neutral-950 dark:text-neutral-100",

              // Borders & Highlights
              // 1. subtle border
              "border border-neutral-700/50 dark:border-neutral-700/50",

              // 2. High-contrast top inner bevel + Soft bottom shadow
              "shadow-[inset_0px_1px_1px_0px_rgba(255,255,255,0.35),0px_6px_10px_-2px_rgba(0,0,0,0.4)]",
              "dark:shadow-[inset_0px_1px_1px_0px_rgba(255,255,255,0.15),0px_6px_15px_-2px_rgba(0,0,0,0.6)]",

              "hover:brightness-110",
            ],
        className,
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-md">
        {children}
      </span>

      {/* 3D Glassy Effect Layers */}

      {/* 1. Metallic Rim / Bevel */}
      <div className="absolute inset-0 rounded-lg border border-white/20 dark:border-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] pointer-events-none" />

      {/* 2. Top Gloss Highlight (The "Glass" reflection) */}
      <div className="absolute inset-x-4 top-0 h-[40%] bg-linear-to-b from-white/20 to-transparent rounded-full opacity-60 pointer-events-none" />

      {/* 3. Bottom Corner SVG Pattern */}
      <div className="absolute bottom-0 right-0 w-24 h-full pointer-events-none opacity-20 dark:opacity-10 mix-blend-overlay overflow-hidden rounded-r-full">
        <svg
          className="absolute bottom-[-10px] right-[-10px] w-full h-full text-white transform rotate-12"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 100 L100 0 M20 100 L100 20 M40 100 L100 40 M60 100 L100 60 M80 100 L100 80"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* 4. Creative Liquid/Glow (Subtle internal movement) */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none mix-blend-overlay">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      </div>

      {/* 5. Glowing Beam (Retained but refined) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-linear-to-r from-transparent via-white/50 to-transparent shadow-[0_0_12px_2px_rgba(255,255,255,0.3)] opacity-0 group-hover:opacity-100 transition-all duration-500" />
    </button>
  );
});

ViewfinderButton.displayName = "ViewfinderButton";
