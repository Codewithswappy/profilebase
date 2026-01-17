"use client";

import { useEffect, useRef } from "react";
import { trackVisit, trackDuration } from "@/lib/analytics";

interface AnalyticsTrackerProps {
  slug: string;
}

// Device detection based on viewport width
function getDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

// Get referrer (or "direct" if none)
function getReferrer(): string {
  if (typeof document === "undefined") return "direct";
  return document.referrer || "direct";
}

export function AnalyticsTracker({ slug }: AnalyticsTrackerProps) {
  const hasLoggedVisit = useRef(false);

  // 1. Log Visit on Mount with device/referrer
  useEffect(() => {
    if (!hasLoggedVisit.current) {
      const deviceType = getDeviceType();
      const referrer = getReferrer();
      trackVisit(slug, { deviceType, referrer });
      hasLoggedVisit.current = true;
    }
  }, [slug]);

  // 2. Track Duration (Heartbeat every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      // Only track if tab is visible
      if (document.visibilityState === "visible") {
        trackDuration(slug, 10);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [slug]);

  return null; // Invisible component
}
