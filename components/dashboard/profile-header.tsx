"use client";

import { useState } from "react";
import Link from "next/link";
import { FullProfile, toggleProfileVisibility } from "@/lib/actions/profile";
import { Button, buttonVariants } from "@/components/ui/button";
import { Globe, Lock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileHeaderProps {
  data: FullProfile;
}

export function ProfileHeader({ data }: ProfileHeaderProps) {
  const { profile, profileSettings } = data;
  const [isPublic, setIsPublic] = useState(profileSettings.isPublic);
  const [isLoading, setIsLoading] = useState(false);

  async function handleToggle() {
    setIsLoading(true);
    const newStatus = !isPublic;
    setIsPublic(newStatus);
    const result = await toggleProfileVisibility(newStatus);
    if (!result.success) {
      setIsPublic(!newStatus);
    }
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-light tracking-tight text-neutral-900 dark:text-neutral-100">
          Dashboard
        </h1>
        <div className="flex items-center gap-3 text-sm text-neutral-500">
          <span className="font-medium text-neutral-900 dark:text-neutral-200">
            {profile.slug}
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">•</span>
          <span className="truncate max-w-md text-neutral-500 font-light">
            {profile.headline || "Ready to build your portfolio"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isPublic && (
          <Link
            href={`/${profile.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-9 px-3 rounded-md text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors",
            )}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Public
          </Link>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleToggle}
          disabled={isLoading}
          className={cn(
            "h-9 rounded-md transition-all border-none bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-none",
            isPublic &&
              "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30",
          )}
        >
          {isPublic ? (
            <>
              <Globe className="w-3.5 h-3.5 mr-2" />
              Public
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 mr-2" />
              Private
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
