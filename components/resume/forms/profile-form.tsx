"use client";

import { useResumeStore } from "@/stores/resume-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResumeTips } from "../resume-tips";
import { IconCheck, IconAlertCircle } from "@tabler/icons-react";
import { useMemo } from "react";

export function ProfileForm() {
  const { content, updateProfile } = useResumeStore();
  const { profile } = content;

  // Calculate completeness
  const completeness = useMemo(() => {
    const required = [
      { field: "firstName", label: "First Name", value: profile.firstName },
      { field: "lastName", label: "Last Name", value: profile.lastName },
      { field: "email", label: "Email", value: profile.email },
      { field: "phone", label: "Phone", value: profile.phone },
      { field: "location", label: "Location", value: profile.location },
    ];
    const optional = [
      { field: "headline", label: "Headline", value: profile.headline },
      { field: "linkedin", label: "LinkedIn", value: profile.linkedin },
      { field: "github", label: "GitHub", value: profile.github },
      { field: "website", label: "Website", value: profile.website },
    ];

    const requiredFilled = required.filter(
      (f) => f.value && f.value.trim() !== "",
    ).length;
    const optionalFilled = optional.filter(
      (f) => f.value && f.value.trim() !== "",
    ).length;

    return {
      requiredFilled,
      requiredTotal: required.length,
      optionalFilled,
      optionalTotal: optional.length,
      missingRequired: required
        .filter((f) => !f.value || f.value.trim() === "")
        .map((f) => f.label),
    };
  }, [profile]);

  const isComplete = completeness.requiredFilled === completeness.requiredTotal;

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h2 className="text-lg font-bold mb-1 text-neutral-900 dark:text-neutral-100">
          Personal Information
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Essential contact information for recruiters. Complete all required
          fields.
        </p>
      </div>

      {/* Tips */}
      <ResumeTips section="profile" />

      {/* Completeness Indicator */}
      <div
        className={`flex items-center justify-between p-3 rounded-lg border ${
          isComplete
            ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
            : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
        }`}
      >
        <div className="flex items-center gap-2">
          {isComplete ? (
            <IconCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <IconAlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          )}
          <span
            className={`text-xs font-medium ${
              isComplete
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-amber-700 dark:text-amber-400"
            }`}
          >
            {isComplete
              ? "All required fields complete"
              : `Missing: ${completeness.missingRequired.join(", ")}`}
          </span>
        </div>
        <span
          className={`text-xs ${
            isComplete
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-amber-600 dark:text-amber-400"
          }`}
        >
          {completeness.requiredFilled}/{completeness.requiredTotal} required
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-neutral-500 dark:text-neutral-400 uppercase flex items-center gap-1">
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input
            value={profile.firstName}
            onChange={(e) => updateProfile({ firstName: e.target.value })}
            placeholder="John"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-neutral-500 dark:text-neutral-400 uppercase flex items-center gap-1">
            Last Name <span className="text-red-500">*</span>
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
          placeholder="e.g., Senior Software Engineer | React & Node.js Expert"
        />
        <p className="text-[10px] text-neutral-400">
          A concise title that appears below your name
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-neutral-500 dark:text-neutral-400 uppercase flex items-center gap-1">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            type="email"
            value={profile.email || ""}
            onChange={(e) => updateProfile({ email: e.target.value })}
            placeholder="john.doe@email.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-neutral-500 dark:text-neutral-400 uppercase flex items-center gap-1">
            Phone <span className="text-red-500">*</span>
          </Label>
          <Input
            type="tel"
            value={profile.phone || ""}
            onChange={(e) => updateProfile({ phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-neutral-500 dark:text-neutral-400 uppercase flex items-center gap-1">
            Location <span className="text-red-500">*</span>
          </Label>
          <Input
            value={profile.location || ""}
            onChange={(e) => updateProfile({ location: e.target.value })}
            placeholder="San Francisco, CA"
          />
          <p className="text-[10px] text-neutral-400">
            City and state/country only (for privacy)
          </p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-neutral-500 dark:text-neutral-400 uppercase">
            Website / Portfolio
          </Label>
          <Input
            type="url"
            value={profile.website || ""}
            onChange={(e) => updateProfile({ website: e.target.value })}
            placeholder="https://johndoe.dev"
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
          <p className="text-[10px] text-neutral-400">
            Customize your LinkedIn URL
          </p>
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

      {/* Optional fields hint */}
      {completeness.optionalFilled < completeness.optionalTotal && (
        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 text-center pt-2">
          💡 Adding LinkedIn, GitHub, or a portfolio can increase recruiter
          response rates
        </p>
      )}
    </div>
  );
}
