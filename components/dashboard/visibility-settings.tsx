"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfileSettings, FullProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  IconAlertCircle,
  IconLoader2,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import { Switch } from "@/components/ui/switch";

interface VisibilitySettingsProps {
  data: FullProfile;
}

// Toggle component for consistency
function ToggleItem({
  id,
  label,
  description,
  defaultChecked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  defaultChecked: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-5 group hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
      <div className="space-y-1">
        <Label
          htmlFor={id}
          className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-900 dark:text-neutral-100 cursor-pointer flex items-center gap-2"
        >
          {label}
        </Label>
        <p className="text-[11px] text-neutral-500 font-mono leading-relaxed max-w-sm">
          {description}
        </p>
      </div>
      <Switch
        id={id}
        name={id}
        defaultChecked={defaultChecked}
        onCheckedChange={onChange}
      />
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
      <div className="p-3 border-b border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-500 flex items-center gap-2">
          <IconEye className="w-4 h-4" />
          Public Visibility
        </h3>
      </div>

      <form action={handleSubmit}>
        {/* Toggle Items */}
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
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
          <div className="mx-5 mb-5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-sm text-xs font-mono flex items-center gap-2 border border-red-200 dark:border-red-900/50">
            <IconAlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end p-3 border-t border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/30">
          <Button
            type="submit"
            disabled={isLoading}
            variant="outline"
            className="rounded-sm px-6 h-8 text-[10px] uppercase font-mono font-bold bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            {isLoading ? (
              <IconLoader2 className="w-3 h-3 animate-spin mr-2" />
            ) : null}
            {isLoading ? "Saving..." : "Save Visibility Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
