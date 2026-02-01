import { cn } from "@/lib/utils";
import { IconMail } from "@tabler/icons-react";
import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";

interface ViewfinderButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outline" | "filled";
  children: ReactNode;
  /** Optional icon component to display. Defaults to IconMail */
  icon?: ReactNode;
}

export const ViewfinderButton = forwardRef<
  HTMLButtonElement,
  ViewfinderButtonProps
>(({ className, variant = "outline", children, icon, ...props }, ref) => {
  // Default icon with proper styling
  const defaultIcon = (
    <IconMail
      className={cn(
        "w-4 h-4 transition-transform group-hover:scale-110",
        variant === "filled"
          ? "text-neutral-50 dark:text-white"
          : "text-neutral-950",
      )}
    />
  );
  return (
    <div className="relative inline-flex group perspective-1000 isolate">
      {/* --- Circuit Lines (Background Layer) --- */}
      <div className="absolute inset-0 z-[-1] pointer-events-none overflow-visible">
        {/* Left Lines */}
        <svg
          className="absolute right-full top-1/2 -translate-y-1/2 w-8 h-12 text-neutral-400 dark:text-neutral-500"
          viewBox="0 0 48 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M48 40 H24 L16 32 H0"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M48 24 H32 L24 16 H0"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M48 56 H32 L24 64 H0"
            stroke="currentColor"
            strokeWidth="1"
          />

          {/* Flowing Light Animation */}
          <path
            d="M48 40 H24 L16 32 H0"
            strokeWidth="1"
            strokeDasharray="4 8"
            className="animate-[dash_1s_linear_infinite] opacity-100 stroke-neutral-950 dark:stroke-white"
          />
          <path
            d="M48 24 H32 L24 16 H0"
            strokeWidth="1"
            strokeDasharray="4 8"
            className="animate-[dash_1.5s_linear_infinite] opacity-100 stroke-neutral-950 dark:stroke-white"
          />
          <path
            d="M48 56 H32 L24 64 H0"
            strokeWidth="1"
            strokeDasharray="4 8"
            className="animate-[dash_1.2s_linear_infinite] opacity-100 stroke-neutral-950 dark:stroke-white"
          />
        </svg>

        {/* Right Lines */}
        <svg
          className="absolute left-full top-1/2 -translate-y-1/2 w-8 h-12 text-neutral-400 dark:text-neutral-500"
          viewBox="0 0 48 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 40 H24 L32 32 H48"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M0 24 H16 L24 16 H48"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M0 56 H16 L24 64 H48"
            stroke="currentColor"
            strokeWidth="1"
          />

          {/* Flowing Light Animation */}
          <path
            d="M0 40 H24 L32 32 H48"
            strokeWidth="1"
            strokeDasharray="4 8"
            className="animate-[dash_1s_linear_infinite_reverse] opacity-100 stroke-neutral-950 dark:stroke-white"
          />
          <path
            d="M0 24 H16 L24 16 H48"
            strokeWidth="1"
            strokeDasharray="4 8"
            className="animate-[dash_1.5s_linear_infinite_reverse] opacity-100 stroke-neutral-950 dark:stroke-white"
          />
          <path
            d="M0 56 H16 L24 64 H48"
            strokeWidth="1"
            strokeDasharray="4 8"
            className="animate-[dash_1.2s_linear_infinite_reverse] opacity-100 stroke-neutral-950 dark:stroke-white"
          />
        </svg>

        {/* Bottom Lines */}
        <svg
          className="absolute top-full left-1/2 -translate-x-1/2 w-24 h-12 text-neutral-400 dark:text-neutral-500"
          viewBox="0 0 160 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Central heavy trace */}
          <path
            d="M80 0 V32 L64 48 V96"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M72 0 V24 L56 40 V80"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M88 0 V24 L104 40 V80"
            stroke="currentColor"
            strokeWidth="1"
          />

          {/* Side branches */}
          <path
            d="M48 0 V16 L32 32 V64"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M112 0 V16 L128 32 V64"
            stroke="currentColor"
            strokeWidth="1"
          />

          {/* Flowing Light Animation */}
          <path
            d="M80 0 V32 L64 48 V96"
            strokeWidth="1"
            strokeDasharray="4 8"
            className="animate-[dash_1s_linear_infinite] opacity-100 stroke-neutral-950 dark:stroke-white"
          />
          <path
            d="M72 0 V24 L56 40 V80"
            strokeWidth="1"
            strokeDasharray="4 8"
            className="animate-[dash_1.5s_linear_infinite] opacity-100 stroke-neutral-950 dark:stroke-white"
          />
          <path
            d="M88 0 V24 L104 40 V80"
            strokeWidth="1"
            strokeDasharray="4 8"
            className="animate-[dash_1.2s_linear_infinite] opacity-100 stroke-neutral-950 dark:stroke-white"
          />
        </svg>
      </div>

      <button
        ref={ref}
        className={cn(
          "relative z-10 overflow-hidden px-4 py-2.5 text-base font-medium tracking-wide transition-all duration-300 transform-gpu",
          "active:scale-[0.98] active:translate-y-0.5",
          "shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_4px_8px_-2px_rgba(0,0,0,0.3)]",

          variant === "outline"
            ? ["bg-neutral-900 text-neutral-100", "hover:bg-neutral-800"]
            : [
                // Button Body Neutral Metallic Gradient
                "bg-linear-to-b from-neutral-800 to-neutral-950 border border-neutral-800 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]",
                "text-neutral-50",
              ],
          className,
        )}
        {...props}
      >
        <div className="relative z-10 flex items-center gap-2">
          {children}
          {icon !== undefined ? icon : defaultIcon}
        </div>

        {/* Shine Effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-linear-to-r from-transparent to-white opacity-40 group-hover:animate-shine" />
        </div>
      </button>

      {/* Inject Keyframes for Dash Animation (if not in global css) */}
      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -24;
          }
        }
      `}</style>
    </div>
  );
});

ViewfinderButton.displayName = "ViewfinderButton";
