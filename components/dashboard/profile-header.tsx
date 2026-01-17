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
        <h1 className="text-3xl font-light tracking-tight text-zinc-900 dark:text-zinc-100">
          Dashboard
        </h1>
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <span className="font-medium text-zinc-900 dark:text-zinc-200">
            {profile.slug}
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span className="truncate max-w-md text-zinc-500 font-light">
            {profile.headline || "Ready to build your portfolio"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isPublic && (
          <Link
            href={`/${profile.slug}`}
            target="_blank"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-9 px-3 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors",
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
            "h-9 rounded-md transition-all border-none bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-none",
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
