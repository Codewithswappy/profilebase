// ============================================
// PLATFORM DETECTION UTILITY
// ============================================
// Detects platform from URLs and provides metadata
// for verification badges and trust scoring.
// ============================================

export interface PlatformInfo {
  platform: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  trustBonus: number;
  description: string;
  isVerifiable: boolean;
}

export interface DetectedPlatform extends PlatformInfo {
  url: string;
  isValid: boolean;
  metadata?: {
    owner?: string;
    repo?: string;
    path?: string;
    type?: "repo" | "file" | "commit" | "pr" | "issue" | "profile" | "package" | "project";
  };
}

// ============================================
// PLATFORM CONFIGURATIONS
// ============================================

const PLATFORMS: {
  pattern: RegExp;
  info: PlatformInfo;
  extractor?: (url: string) => DetectedPlatform["metadata"];
}[] = [
  // GitHub
  {
    pattern: /^https?:\/\/(www\.)?github\.com\//i,
    info: {
      platform: "github",
      label: "GitHub",
      icon: "IconBrandGithub",
      color: "text-neutral-900 dark:text-white",
      bgColor: "bg-neutral-100 dark:bg-neutral-800",
      trustBonus: 25,
      description: "GitHub Repository",
      isVerifiable: true,
    },
    extractor: (url: string) => {
      const match = url.match(/github\.com\/([^\/]+)(?:\/([^\/]+))?(?:\/([^\/]+))?/i);
      if (match) {
        const [, owner, repo, pathType] = match;
        let type: "repo" | "file" | "commit" | "pr" | "issue" | "profile" | "package" | "project" = "profile";
        if (repo) {
          if (pathType === "pull") type = "pr";
          else if (pathType === "issues") type = "issue";
          else if (pathType === "commit") type = "commit";
          else if (pathType === "blob" || pathType === "tree") type = "file";
          else type = "repo";
        }
        return { owner, repo, type };
      }
      return undefined;
    },
  },
  // GitLab
  {
    pattern: /^https?:\/\/(www\.)?gitlab\.com\//i,
    info: {
      platform: "gitlab",
      label: "GitLab",
      icon: "IconBrandGitlab",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      trustBonus: 22,
      description: "GitLab Repository",
      isVerifiable: true,
    },
  },
  // npm
  {
    pattern: /^https?:\/\/(www\.)?npmjs\.com\/package\//i,
    info: {
      platform: "npm",
      label: "npm",
      icon: "IconBrandNpm",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      trustBonus: 20,
      description: "npm Package",
      isVerifiable: true,
    },
    extractor: (url: string) => {
      const match = url.match(/npmjs\.com\/package\/(@?[^\/]+(?:\/[^\/]+)?)/i);
      if (match) {
        return { owner: match[1], type: "package" };
      }
      return undefined;
    },
  },
  // PyPI
  {
    pattern: /^https?:\/\/(www\.)?pypi\.org\/project\//i,
    info: {
      platform: "pypi",
      label: "PyPI",
      icon: "IconBrandPython",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      trustBonus: 20,
      description: "PyPI Package",
      isVerifiable: true,
    },
  },
  // Vercel
  {
    pattern: /^https?:\/\/[^\/]+\.vercel\.app/i,
    info: {
      platform: "vercel",
      label: "Vercel",
      icon: "IconBrandVercel",
      color: "text-black dark:text-white",
      bgColor: "bg-neutral-100 dark:bg-neutral-800",
      trustBonus: 18,
      description: "Vercel Deployment",
      isVerifiable: true,
    },
  },
  // Netlify
  {
    pattern: /^https?:\/\/[^\/]+\.netlify\.app/i,
    info: {
      platform: "netlify",
      label: "Netlify",
      icon: "IconWorld",
      color: "text-teal-600",
      bgColor: "bg-teal-50 dark:bg-teal-900/20",
      trustBonus: 18,
      description: "Netlify Deployment",
      isVerifiable: true,
    },
  },
  // Railway
  {
    pattern: /^https?:\/\/[^\/]+\.railway\.app/i,
    info: {
      platform: "railway",
      label: "Railway",
      icon: "IconTrain",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      trustBonus: 16,
      description: "Railway Deployment",
      isVerifiable: true,
    },
  },
  // Render
  {
    pattern: /^https?:\/\/[^\/]+\.onrender\.com/i,
    info: {
      platform: "render",
      label: "Render",
      icon: "IconServer",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      trustBonus: 16,
      description: "Render Deployment",
      isVerifiable: true,
    },
  },
  // CodeSandbox
  {
    pattern: /^https?:\/\/(www\.)?codesandbox\.io\//i,
    info: {
      platform: "codesandbox",
      label: "CodeSandbox",
      icon: "IconBox",
      color: "text-neutral-700 dark:text-neutral-300",
      bgColor: "bg-neutral-100 dark:bg-neutral-800",
      trustBonus: 15,
      description: "CodeSandbox Project",
      isVerifiable: true,
    },
  },
  // StackBlitz
  {
    pattern: /^https?:\/\/(www\.)?stackblitz\.com\//i,
    info: {
      platform: "stackblitz",
      label: "StackBlitz",
      icon: "IconBolt",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      trustBonus: 15,
      description: "StackBlitz Project",
      isVerifiable: true,
    },
  },
  // CodePen
  {
    pattern: /^https?:\/\/(www\.)?codepen\.io\//i,
    info: {
      platform: "codepen",
      label: "CodePen",
      icon: "IconBrandCodepen",
      color: "text-neutral-800 dark:text-neutral-200",
      bgColor: "bg-neutral-100 dark:bg-neutral-800",
      trustBonus: 12,
      description: "CodePen Demo",
      isVerifiable: true,
    },
  },
  // YouTube
  {
    pattern: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i,
    info: {
      platform: "youtube",
      label: "YouTube",
      icon: "IconBrandYoutube",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      trustBonus: 12,
      description: "YouTube Video",
      isVerifiable: true,
    },
  },
  // LinkedIn
  {
    pattern: /^https?:\/\/(www\.)?linkedin\.com\//i,
    info: {
      platform: "linkedin",
      label: "LinkedIn",
      icon: "IconBrandLinkedin",
      color: "text-blue-700",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      trustBonus: 10,
      description: "LinkedIn",
      isVerifiable: true,
    },
  },
  // Medium
  {
    pattern: /^https?:\/\/(www\.)?medium\.com\//i,
    info: {
      platform: "medium",
      label: "Medium",
      icon: "IconBrandMedium",
      color: "text-neutral-800 dark:text-neutral-200",
      bgColor: "bg-neutral-100 dark:bg-neutral-800",
      trustBonus: 8,
      description: "Medium Article",
      isVerifiable: true,
    },
  },
  // Dev.to
  {
    pattern: /^https?:\/\/(www\.)?dev\.to\//i,
    info: {
      platform: "devto",
      label: "Dev.to",
      icon: "IconCode",
      color: "text-neutral-900 dark:text-white",
      bgColor: "bg-neutral-100 dark:bg-neutral-800",
      trustBonus: 8,
      description: "Dev.to Article",
      isVerifiable: true,
    },
  },
  // Hashnode
  {
    pattern: /^https?:\/\/[^\/]+\.hashnode\.dev\//i,
    info: {
      platform: "hashnode",
      label: "Hashnode",
      icon: "IconHash",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      trustBonus: 8,
      description: "Hashnode Article",
      isVerifiable: true,
    },
  },
  // Figma
  {
    pattern: /^https?:\/\/(www\.)?figma\.com\//i,
    info: {
      platform: "figma",
      label: "Figma",
      icon: "IconBrandFigma",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      trustBonus: 12,
      description: "Figma Design",
      isVerifiable: true,
    },
  },
  // Dribbble
  {
    pattern: /^https?:\/\/(www\.)?dribbble\.com\//i,
    info: {
      platform: "dribbble",
      label: "Dribbble",
      icon: "IconBrandDribbble",
      color: "text-pink-500",
      bgColor: "bg-pink-50 dark:bg-pink-900/20",
      trustBonus: 10,
      description: "Dribbble Shot",
      isVerifiable: true,
    },
  },
  // Behance
  {
    pattern: /^https?:\/\/(www\.)?behance\.net\//i,
    info: {
      platform: "behance",
      label: "Behance",
      icon: "IconBrandBehance",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      trustBonus: 10,
      description: "Behance Project",
      isVerifiable: true,
    },
  },
  // AWS
  {
    pattern: /^https?:\/\/[^\/]+\.amazonaws\.com/i,
    info: {
      platform: "aws",
      label: "AWS",
      icon: "IconBrandAws",
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      trustBonus: 18,
      description: "AWS Deployment",
      isVerifiable: true,
    },
  },
  // Firebase
  {
    pattern: /^https?:\/\/[^\/]+\.web\.app/i,
    info: {
      platform: "firebase",
      label: "Firebase",
      icon: "IconBrandFirebase",
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      trustBonus: 16,
      description: "Firebase Deployment",
      isVerifiable: true,
    },
  },
];

// ============================================
// DETECTION FUNCTIONS
// ============================================

/**
 * Detect platform from a URL
 */
export function detectPlatform(url: string): DetectedPlatform | null {
  if (!url) return null;

  // Validate URL
  try {
    new URL(url);
  } catch {
    return null;
  }

  for (const { pattern, info, extractor } of PLATFORMS) {
    if (pattern.test(url)) {
      const metadata = extractor?.(url);
      return {
        ...info,
        url,
        isValid: true,
        metadata,
      };
    }
  }

  // Generic URL (not a known platform)
  return {
    platform: "website",
    label: "Website",
    icon: "IconLink",
    color: "text-neutral-600 dark:text-neutral-400",
    bgColor: "bg-neutral-100 dark:bg-neutral-800",
    trustBonus: 5,
    description: "External Link",
    isVerifiable: false,
    url,
    isValid: true,
  };
}

/**
 * Check if URL is valid
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return null;
  }
}

/**
 * Get trust bonus for a URL
 */
export function getTrustBonus(url: string): number {
  const platform = detectPlatform(url);
  return platform?.trustBonus ?? 0;
}

/**
 * Format URL for display (shorter version)
 */
export function formatUrlForDisplay(url: string, maxLength: number = 40): string {
  try {
    const parsed = new URL(url);
    let display = parsed.hostname + parsed.pathname;
    
    // Remove trailing slash
    if (display.endsWith("/")) {
      display = display.slice(0, -1);
    }
    
    // Remove www.
    if (display.startsWith("www.")) {
      display = display.slice(4);
    }
    
    // Truncate if too long
    if (display.length > maxLength) {
      return display.slice(0, maxLength - 3) + "...";
    }
    
    return display;
  } catch {
    return url.slice(0, maxLength);
  }
}

/**
 * Auto-suggest a title from URL
 */
export function suggestTitleFromUrl(url: string): string | null {
  const platform = detectPlatform(url);
  
  if (!platform?.metadata) return null;
  
  const { owner, repo, type } = platform.metadata;
  
  if (platform.platform === "github" && repo) {
    // Format repo name: "my-awesome-project" -> "My Awesome Project"
    const formatted = repo
      .replace(/-/g, " ")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    
    if (type === "pr") return `Pull Request in ${formatted}`;
    if (type === "issue") return `Issue in ${formatted}`;
    if (type === "commit") return `Commit in ${formatted}`;
    return formatted;
  }
  
  if (platform.platform === "npm" && owner) {
    return `npm: ${owner}`;
  }
  
  return null;
}

/**
 * Auto-detect content type from input
 */
export function detectInputType(
  input: string
): "url" | "code" | "metric" | "text" {
  // Check if it's a URL
  if (isValidUrl(input)) {
    return "url";
  }
  
  // Check if it looks like code
  const codePatterns = [
    /^(import|export|const|let|var|function|class|interface|type)\s/m,
    /^(def|class|import|from|async|await)\s/m,
    /[{}\[\]();]/,
    /=>/,
    /^\s*(\/\/|#|\/\*)/m,
  ];
  
  if (codePatterns.some((p) => p.test(input))) {
    return "code";
  }
  
  // Check if it looks like a metric
  const metricPatterns = [
    /\d+%/,
    /reduced|improved|increased|decreased|faster|slower/i,
    /\d+x\s/,
    /from\s+\d+\s+to\s+\d+/i,
  ];
  
  if (metricPatterns.some((p) => p.test(input))) {
    return "metric";
  }
  
  return "text";
}

/**
 * Get all supported platforms
 */
export function getSupportedPlatforms(): PlatformInfo[] {
  return PLATFORMS.map(p => p.info);
}

export default detectPlatform;
