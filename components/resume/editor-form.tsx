"use client";

import { useResumeStore } from "@/stores/resume-store";
import { ProfileForm } from "./forms/profile-form";
import { SummaryForm } from "./forms/summary-form";
import { ExperienceForm } from "./forms/experience-form";
import { ProjectsForm } from "./forms/projects-form";
import { SkillsForm } from "./forms/skills-form";
import { EducationForm } from "./forms/education-form";
import { CertificationsForm } from "./forms/certifications-form";

export function ResumeEditorForm() {
  const { activeSection } = useResumeStore();

  switch (activeSection) {
    case "profile":
      return <ProfileForm />;
    case "summary":
      return <SummaryForm />;
    case "experience":
      return <ExperienceForm />;
    case "projects":
      return <ProjectsForm />;
    case "skills":
      return <SkillsForm />;
    case "education":
      return <EducationForm />;
    case "certifications":
      return <CertificationsForm />;
    default:
      return (
        <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
          Select a section from the sidebar to edit.
        </div>
      );
  }
}
