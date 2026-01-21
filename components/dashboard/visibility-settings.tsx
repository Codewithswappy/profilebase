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

// Toggle component for consistency
function ToggleItem({
  id,
  label,
  description,
  defaultChecked,
}: {
  id: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-5">
      <div className="space-y-1">
        <Label
          htmlFor={id}
          className="text-sm font-medium text-neutral-900 dark:text-neutral-100 cursor-pointer"
        >
          {label}
        </Label>
        <p className="text-xs text-neutral-500">{description}</p>
      </div>
      <label
        htmlFor={id}
        className="relative inline-flex items-center cursor-pointer"
      >
        <input
          id={id}
          name={id}
          type="checkbox"
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-neutral-300 dark:peer-focus:ring-neutral-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-neutral-900 dark:peer-checked:bg-neutral-100 dark:peer-checked:after:bg-neutral-900"></div>
      </label>
    </div>
  );
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
    const showExperience = formData.get("showExperience") === "on";
    const showProjects = formData.get("showProjects") === "on";
    const showTechStack = formData.get("showTechStack") === "on";
    const showSummary = formData.get("showSummary") === "on";
    const showAchievements = formData.get("showAchievements") === "on";
    const showCertificates = formData.get("showCertificates") === "on";

    const result = await updateProfileSettings({
      showEmail,
      showExperience,
      showProjects,
      showTechStack,
      showSummary,
      showAchievements,
      showCertificates,
    });

    if (result.success) {
      router.refresh();
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-neutral-200 dark:border-neutral-800">
        <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
          Public Visibility
        </p>
      </div>

      <form action={handleSubmit}>
        {/* Toggle Items */}
        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {/* Show Email */}
          <ToggleItem
            id="showEmail"
            label="Show Email Address"
            description="Allow visitors to see your registered email."
            defaultChecked={profileSettings.showEmail}
          />

          {/* Show Experience */}
          <ToggleItem
            id="showExperience"
            label="Show Experience Section"
            description="Display your work experience on your public profile."
            defaultChecked={profileSettings.showExperience ?? true}
          />

          {/* Show Projects */}
          <ToggleItem
            id="showProjects"
            label="Show Projects Section"
            description="Display your projects on your public profile."
            defaultChecked={profileSettings.showProjects ?? true}
          />

          {/* Show Tech Stack */}
          <ToggleItem
            id="showTechStack"
            label="Show Tech Stack"
            description="Display the tech stack marquee on your public profile."
            defaultChecked={profileSettings.showTechStack ?? true}
          />

          {/* Show Summary */}
          <ToggleItem
            id="showSummary"
            label="Show Summary / About"
            description="Display your bio/summary at the bottom of your profile."
            defaultChecked={profileSettings.showSummary ?? true}
          />

          {/* Show Achievements */}
          <ToggleItem
            id="showAchievements"
            label="Show Honors & Awards"
            description="Display your awards, badges, hackathons, and OSS contributions."
            defaultChecked={profileSettings.showAchievements ?? true}
          />

          {/* Show Certificates */}
          <ToggleItem
            id="showCertificates"
            label="Show Certifications"
            description="Display your professional certifications."
            defaultChecked={profileSettings.showCertificates ?? true}
          />
        </div>

        {error && (
          <div className="mx-5 mb-5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-sm text-sm flex items-center gap-2 border border-red-200 dark:border-red-900/50">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end p-5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/30">
          <Button
            type="submit"
            disabled={isLoading}
            variant="outline"
            className="rounded-sm px-6 text-xs h-9 bg-transparent border-neutral-200 dark:border-neutral-800 hover:bg-white dark:hover:bg-neutral-900 shadow-none"
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
