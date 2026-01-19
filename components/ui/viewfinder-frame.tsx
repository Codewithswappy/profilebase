import { cn } from "@/lib/utils";

interface ViewfinderFrameProps {
  children: React.ReactNode;
  className?: string;
  background?: React.ReactNode;
}

export function ViewfinderFrame({
  children,
  className,
  background,
}: ViewfinderFrameProps) {
  return (
    <div className={cn("relative p-2 md:p-2", className)}>
      {/* Frame Container */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Background Content (Banners, etc) */}
        {background && <div className="absolute inset-0 z-0">{background}</div>}

        {/* SVG Overlay */}
        <svg
          className="absolute inset-0 w-full h-full text-neutral-900 dark:text-neutral-100"
          width="100%"
          height="100%"
        >
          {/* Dashed Border - Rect covering whole area */}
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="opacity-40"
          />

          {/* Corners using nested SVGs for absolute positioning without scaling */}

          {/* Top Left */}
          <svg x="0" y="0" className="overflow-visible">
            <path
              d="M 1 16 V 1 H 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-neutral-400 dark:text-neutral-400"
            />
          </svg>

          {/* Top Right */}
          <svg x="100%" y="0" className="overflow-visible">
            <path
              d="M -1 16 V 1 H -16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-neutral-400 dark:text-neutral-400"
            />
          </svg>

          {/* Bottom Left */}
          <svg x="0" y="100%" className="overflow-visible">
            <path
              d="M 1 -16 V -1 H 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-neutral-400 dark:text-neutral-400"
            />
          </svg>

          {/* Bottom Right */}
          <svg x="100%" y="100%" className="overflow-visible">
            <path
              d="M -1 -16 V -1 H -16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-neutral-400 dark:text-neutral-400"
            />
          </svg>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
