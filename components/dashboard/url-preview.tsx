"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  IconBrandGithub,
  IconStar,
  IconGitFork,
  IconCode,
  IconExternalLink,
  IconLoader2,
  IconAlertCircle,
  IconWorld,
} from "@tabler/icons-react";
import Image from "next/image";

// ============================================
// TYPES
// ============================================

interface URLPreviewData {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  url: string;
  // GitHub-specific
  github?: {
    owner: string;
    repo: string;
    stars: number;
    forks: number;
    language: string;
    languageColor: string;
    description: string;
  };
}

interface URLPreviewProps {
  url: string;
  onTitleSuggested?: (title: string) => void;
  onMetadataLoaded?: (data: URLPreviewData) => void;
  className?: string;
  compact?: boolean;
}

// ============================================
// GITHUB LANGUAGE COLORS
// ============================================

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  "C++": "#f34b7d",
  C: "#555555",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Vue: "#41b883",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Shell: "#89e051",
  Dockerfile: "#384d54",
};

// ============================================
// URL PREVIEW COMPONENT
// ============================================

export function URLPreview({
  url,
  onTitleSuggested,
  onMetadataLoaded,
  className,
  compact = false,
}: URLPreviewProps) {
  const [data, setData] = useState<URLPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if URL is GitHub
  const isGitHub = /^https?:\/\/(www\.)?github\.com\//i.test(url);

  // Extract GitHub repo info
  const extractGitHubInfo = useCallback((url: string) => {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/i);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
    }
    return null;
  }, []);

  // Fetch GitHub repo data
  const fetchGitHubData = useCallback(async (owner: string, repo: string) => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        },
      );

      if (!response.ok) throw new Error("GitHub API error");

      const repoData = await response.json();

      return {
        owner,
        repo,
        stars: repoData.stargazers_count || 0,
        forks: repoData.forks_count || 0,
        language: repoData.language || "Unknown",
        languageColor: LANGUAGE_COLORS[repoData.language] || "#6b7280",
        description: repoData.description || "",
      };
    } catch {
      return null;
    }
  }, []);

  // Fetch OG metadata (client-side via cors-anywhere or direct if same-origin)
  const fetchOGMetadata = useCallback(async (url: string) => {
    try {
      // For client-side, we'll use a simple approach with allorigins proxy
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) return null;

      const data = await response.json();
      const html = data.contents;

      // Parse OG tags from HTML
      const getMetaContent = (property: string): string | undefined => {
        const match =
          html.match(
            new RegExp(
              `<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`,
              "i",
            ),
          ) ||
          html.match(
            new RegExp(
              `<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`,
              "i",
            ),
          );
        return match?.[1];
      };

      const getMetaName = (name: string): string | undefined => {
        const match =
          html.match(
            new RegExp(
              `<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']+)["']`,
              "i",
            ),
          ) ||
          html.match(
            new RegExp(
              `<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${name}["']`,
              "i",
            ),
          );
        return match?.[1];
      };

      const getTitle = (): string | undefined => {
        const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        return match?.[1];
      };

      return {
        title: getMetaContent("og:title") || getMetaName("title") || getTitle(),
        description:
          getMetaContent("og:description") || getMetaName("description"),
        image: getMetaContent("og:image"),
        siteName: getMetaContent("og:site_name"),
      };
    } catch {
      return null;
    }
  }, []);

  // Main fetch effect
  useEffect(() => {
    if (!url) {
      setData(null);
      setError(null);
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      setData(null);
      setError(null);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (isGitHub) {
          const githubInfo = extractGitHubInfo(url);
          if (githubInfo) {
            const githubData = await fetchGitHubData(
              githubInfo.owner,
              githubInfo.repo,
            );

            if (githubData) {
              const previewData: URLPreviewData = {
                url,
                title: githubData.repo,
                description: githubData.description,
                github: githubData,
              };
              setData(previewData);
              onTitleSuggested?.(
                githubData.repo
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase()),
              );
              onMetadataLoaded?.(previewData);
            } else {
              setError("Could not fetch repository data");
            }
          }
        } else {
          // Fetch OG metadata for non-GitHub URLs
          const ogData = await fetchOGMetadata(url);
          if (ogData) {
            const previewData: URLPreviewData = {
              url,
              ...ogData,
            };
            setData(previewData);
            if (ogData.title) {
              onTitleSuggested?.(ogData.title);
            }
            onMetadataLoaded?.(previewData);
          } else {
            // Just show URL domain as fallback
            const domain = new URL(url).hostname;
            setData({
              url,
              title: domain,
              siteName: domain,
            });
          }
        }
      } catch (err) {
        setError("Failed to fetch preview");
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the fetch
    const timer = setTimeout(fetchData, 500);
    return () => clearTimeout(timer);
  }, [
    url,
    isGitHub,
    extractGitHubInfo,
    fetchGitHubData,
    fetchOGMetadata,
    onTitleSuggested,
    onMetadataLoaded,
  ]);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800",
          className,
        )}
      >
        <IconLoader2 className="w-4 h-4 animate-spin text-neutral-400" />
        <span className="text-xs text-neutral-500">Fetching preview...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50",
          className,
        )}
      >
        <IconAlertCircle className="w-4 h-4 text-amber-500" />
        <span className="text-xs text-amber-600 dark:text-amber-400">
          {error}
        </span>
      </div>
    );
  }

  // No data
  if (!data) return null;

  // GitHub Preview
  if (data.github) {
    return (
      <div
        className={cn(
          "rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden",
          className,
        )}
      >
        <div className={cn("p-3", compact ? "space-y-1.5" : "p-4 space-y-2")}>
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <IconBrandGithub className="w-4 h-4 text-neutral-700 dark:text-neutral-300 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-neutral-500">
                    {data.github.owner}
                  </span>
                  <span className="text-neutral-300 dark:text-neutral-600">
                    /
                  </span>
                  <span
                    className={cn(
                      "font-medium text-neutral-900 dark:text-neutral-100 truncate",
                      compact ? "text-xs" : "text-sm",
                    )}
                  >
                    {data.github.repo}
                  </span>
                </div>
              </div>
            </div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors shrink-0"
            >
              <IconExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Description */}
          {data.github.description && (
            <p
              className={cn(
                "text-neutral-600 dark:text-neutral-400 line-clamp-2",
                compact ? "text-[11px]" : "text-xs",
              )}
            >
              {data.github.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            {/* Language */}
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: data.github.languageColor }}
              />
              <span>{data.github.language}</span>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1">
              <IconStar className="w-3.5 h-3.5" />
              <span>{data.github.stars.toLocaleString()}</span>
            </div>

            {/* Forks */}
            <div className="flex items-center gap-1">
              <IconGitFork className="w-3.5 h-3.5" />
              <span>{data.github.forks.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Generic OG Preview
  return (
    <div
      className={cn(
        "rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden",
        data.image && !compact ? "flex" : "",
        className,
      )}
    >
      {/* Image */}
      {data.image && !compact && (
        <div className="relative w-24 h-24 shrink-0 bg-neutral-100 dark:bg-neutral-800">
          <Image
            src={data.image || ""}
            alt={data.title || "Preview"}
            fill
            className="object-cover"
            sizes="96px"
            unoptimized
          />
        </div>
      )}

      <div
        className={cn(
          "p-3 flex-1 min-w-0",
          compact ? "space-y-1" : "space-y-1.5",
        )}
      >
        {/* Site name */}
        {data.siteName && (
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 uppercase tracking-wider">
            <IconWorld className="w-3 h-3" />
            <span>{data.siteName}</span>
          </div>
        )}

        {/* Title */}
        {data.title && (
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                "font-medium text-neutral-900 dark:text-neutral-100 line-clamp-1",
                compact ? "text-xs" : "text-sm",
              )}
            >
              {data.title}
            </h4>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors shrink-0"
            >
              <IconExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Description */}
        {data.description && (
          <p
            className={cn(
              "text-neutral-500 dark:text-neutral-400 line-clamp-2",
              compact ? "text-[10px]" : "text-xs",
            )}
          >
            {data.description}
          </p>
        )}
      </div>
    </div>
  );
}

export default URLPreview;
