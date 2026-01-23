"use client";

import { useResumeStore } from "@/stores/resume-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm() {
  const { content, updateProfile } = useResumeStore();
  const { profile } = content;

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h2 className="text-lg font-bold mb-1 text-neutral-900 dark:text-neutral-100">
          Personal Information
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          This is how recruiters will contact you.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-neutral-500 dark:text-neutral-400 uppercase">
            First Name
          </Label>
          <Input
            value={profile.firstName}
            onChange={(e) => updateProfile({ firstName: e.target.value })}
            placeholder="John"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-neutral-500 dark:text-neutral-400 uppercase">
            Last Name
          </Label>
          <Input
            value={profile.lastName}
            onChange={(e) => updateProfile({ lastName: e.target.value })}
            placeholder="Doe"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-neutral-500 dark:text-neutral-400 uppercase">
          Professional Headline
        </Label>
        <Input
          value={profile.headline || ""}
          onChange={(e) => updateProfile({ headline: e.target.value })}
          placeholder="Senior Software Engineer"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-neutral-500 dark:text-neutral-400 uppercase">
            Email
          </Label>
          <Input
            value={profile.email || ""}
            onChange={(e) => updateProfile({ email: e.target.value })}
            placeholder="john@example.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-neutral-500 dark:text-neutral-400 uppercase">
            Phone
          </Label>
          <Input
            value={profile.phone || ""}
            onChange={(e) => updateProfile({ phone: e.target.value })}
            placeholder="+1 (555) 000-0000"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-neutral-500 dark:text-neutral-400 uppercase">
            Location
          </Label>
          <Input
            value={profile.location || ""}
            onChange={(e) => updateProfile({ location: e.target.value })}
            placeholder="San Francisco, CA"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-neutral-500 dark:text-neutral-400 uppercase">
            Website / Portfolio
          </Label>
          <Input
            value={profile.website || ""}
            onChange={(e) => updateProfile({ website: e.target.value })}
            placeholder="https://johndoe.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-neutral-500 dark:text-neutral-400 uppercase">
            LinkedIn
          </Label>
          <Input
            value={profile.linkedin || ""}
            onChange={(e) => updateProfile({ linkedin: e.target.value })}
            placeholder="linkedin.com/in/johndoe"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-neutral-500 dark:text-neutral-400 uppercase">
            GitHub
          </Label>
          <Input
            value={profile.github || ""}
            onChange={(e) => updateProfile({ github: e.target.value })}
            placeholder="github.com/johndoe"
          />
        </div>
      </div>
    </div>
  );
}
