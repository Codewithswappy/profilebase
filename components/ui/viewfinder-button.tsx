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
  const isOutline = variant === "outline";

  return (
    <button
      ref={ref}
      className={cn(
        "relative px-4 py-2 text-sm font-medium font-mono transition-all duration-300 group ease-out",
        "active:scale-95 active:duration-150 outline-none focus-visible:ring-2 focus-visible:ring-neutral-400",
        isOutline
          ? "text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50"
          : "text-white dark:text-neutral-900 bg-neutral-900 dark:bg-white hover:bg-white dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white shadow-sm hover:shadow-md",
        className,
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>

      {/* Viewfinder corners SVG */}
      <svg
        className={cn(
          "absolute inset-0 w-full h-full pointer-events-none transition-all duration-300 ease-out",
          isOutline
            ? "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 group-hover:scale-[1.03]"
            : "text-white dark:text-neutral-900 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:scale-95",
        )}
      >
        {/* Dashed Border - Rect covering whole area */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 4"
          className={cn(
            "transition-opacity duration-300",
            isOutline
              ? "opacity-50 group-hover:opacity-100"
              : "opacity-40 group-hover:opacity-100",
          )}
        />

        {/* Top Left */}
        <svg x="0" y="0" className="overflow-visible">
          <path
            d="M 1 6 V 1 H 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        {/* Top Right */}
        <svg x="100%" y="0" className="overflow-visible">
          <path
            d="M -1 6 V 1 H -6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        {/* Bottom Left */}
        <svg x="0" y="100%" className="overflow-visible">
          <path
            d="M 1 -6 V -1 H 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        {/* Bottom Right */}
        <svg x="100%" y="100%" className="overflow-visible">
          <path
            d="M -1 -6 V -1 H -6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </svg>
    </button>
  );
});

ViewfinderButton.displayName = "ViewfinderButton";
