import { SocialLink } from "@prisma/client";
import Link from "next/link";
import { TechIcons } from "@/components/TechIcons";
import { Link as LinkIcon, Globe } from "lucide-react";

interface SocialsSectionProps {
  links: SocialLink[];
}

export function SocialsSection({ links }: SocialsSectionProps) {
  if (!links || links.length === 0) return null;

  // Map platform to TechIcon key
  function getIcon(platform: string) {
    const p = platform.toLowerCase();

    // Exact match first
    if (TechIcons[platform]) return TechIcons[platform];
    if (TechIcons[p]) return TechIcons[p];

    // Mappings for specific names in TechIcons.tsx
    switch (p) {
      case "github":
        return TechIcons["Github"]; // Note capital G in TechIcons
      case "linkedin":
        return TechIcons["Linkiden"]; // Note weird spelling in TechIcons
      case "twitter":
      case "x":
        return TechIcons["Tweeter"]; // Note 'Tweeter' in TechIcons
      case "instagram":
        // Fallback for instagram if not in TechIcons (it's not currently)
        return null;
      default:
        return null;
    }
  }

  function getLabel(link: SocialLink) {
    if (link.title) return link.title;
    const platform = link.platform.toLowerCase();
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  }

  return (
    <div className="inline-flex flex-row flex-wrap items-center  w-fit animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
      {links.map((link) => {
        const iconNode = getIcon(link.platform);
        // Fallback for website/other
        const isWebsite = link.platform.toLowerCase() === "website";
        const label = getLabel(link);

        return (
          <Link
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center px-2.5 py-1.5 rounded-md hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-all"
          >
            <span className="w-4 h-4 flex items-center justify-center text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors shrink-0">
              {iconNode ? (
                iconNode
              ) : isWebsite ? (
                <Globe className="w-3.5 h-3.5 text-black" />
              ) : (
                <LinkIcon className="w-3.5 h-3.5" />
              )}
            </span>
            <span className="hidden sm:inline text-[12px] text-neutral-500 dark:text-neutral-400 font-medium font-mono group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors truncate">
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
