"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfileSettings, FullProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";

interface VisibilitySettingsProps {
  data: FullProfile;
}

export function VisibilitySettings({ data }: VisibilitySettingsProps) {
  const router = useRouter();
  const { profileSettings } = data;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const showEmail = formData.get("showEmail") === "on";
    const showUnprovenSkills = formData.get("showUnprovenSkills") === "on";

    const result = await updateProfileSettings({
      showEmail,
      showUnprovenSkills,
    });

    if (result.success) {
      router.refresh();
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-zinc-200 dark:border-zinc-800">
        <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
          Public Visibility
        </p>
      </div>

      <form action={handleSubmit}>
        {/* Toggle Items */}
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {/* Show Email */}
          <div className="flex items-center justify-between p-5">
            <div className="space-y-1">
              <Label
                htmlFor="showEmail"
                className="text-sm font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer"
              >
                Show Email Address
              </Label>
              <p className="text-xs text-zinc-500">
                Allow visitors to see your registered email.
              </p>
            </div>
            <label
              htmlFor="showEmail"
              className="relative inline-flex items-center cursor-pointer"
            >
              <input
                id="showEmail"
                name="showEmail"
                type="checkbox"
                defaultChecked={profileSettings.showEmail}
                className="peer sr-only"
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-zinc-300 dark:peer-focus:ring-zinc-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-zinc-900 dark:peer-checked:bg-zinc-100"></div>
            </label>
          </div>

          {/* Show Unverified Skills */}
          <div className="flex items-center justify-between p-5">
            <div className="space-y-1">
              <Label
                htmlFor="showUnprovenSkills"
                className="text-sm font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer"
              >
                Show Unverified Skills
              </Label>
              <p className="text-xs text-zinc-500">
                Display skills that don't have proof yet.
              </p>
            </div>
            <label
              htmlFor="showUnprovenSkills"
              className="relative inline-flex items-center cursor-pointer"
            >
              <input
                id="showUnprovenSkills"
                name="showUnprovenSkills"
                type="checkbox"
                defaultChecked={profileSettings.showUnprovenSkills}
                className="peer sr-only"
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-zinc-300 dark:peer-focus:ring-zinc-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-zinc-900 dark:peer-checked:bg-zinc-100"></div>
            </label>
          </div>
        </div>

        {error && (
          <div className="mx-5 mb-5 bg-red-50 text-red-600 p-3 rounded-sm text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/30">
          <Button
            type="submit"
            disabled={isLoading}
            variant="outline"
            className="rounded-sm px-6 text-xs h-9 bg-transparent border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 shadow-none"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin mr-2" />
            ) : null}
            {isLoading ? "Saving..." : "Save Visibility"}
          </Button>
        </div>
      </form>
    </div>
  );
}
