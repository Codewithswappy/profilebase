import { z } from "zod";

export const ResumeProfileSchema = z.object({
  firstName: z.string().default("Your"),
  lastName: z.string().default("Name"),
  email: z.string().optional().or(z.literal("")),
  phone: z.string().optional(),
  location: z.string().optional(),
  headline: z.string().optional(),
  website: z.string().optional().or(z.literal("")),
  linkedin: z.string().optional(),
  github: z.string().optional(),
});

export const ResumeExperienceSchema = z.object({
  id: z.string(),
  title: z.string().default(""),
  company: z.string().default(""),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(), // "Present" if null/empty
  current: z.boolean().default(false),
  description: z.string().optional(), // HTML content
});

export const ResumeProjectSchema = z.object({
  id: z.string(),
  title: z.string().default(""),
  subtitle: z.string().nullish(),
  url: z.string().nullish().or(z.literal("")),
  repoUrl: z.string().nullish().or(z.literal("")),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
  description: z.string().nullish(), // HTML content
  techStack: z.array(z.string()).default([]),
});

export const ResumeEducationSchema = z.object({
  id: z.string(),
  school: z.string().default(""),
  degree: z.string().optional(),
  field: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
});

export const ResumeSkillSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  level: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]).optional(),
});

export const ResumeSkillGroupSchema = z.object({
  id: z.string(),
  name: z.string().default("Skills"),
  skills: z.array(ResumeSkillSchema).default([]),
});

export const ResumeCertificationSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  issuer: z.string().optional(),
  date: z.string().optional(),
  url: z.string().nullish().or(z.literal("")),
});

export const ResumeCustomItemSchema = z.object({
  id: z.string(),
  title: z.string().default(""),
  subtitle: z.string().optional(),
  location: z.string().optional(),
  date: z.string().optional(),
  url: z.string().optional().or(z.literal("")),
  description: z.string().optional(),
});

export const ResumeCustomSectionSchema = z.object({
  id: z.string(),
  name: z.string().default("New Section"),
  layout: z.enum(["list", "grid"]).default("list"),
  icon: z.string().optional(),
  items: z.array(ResumeCustomItemSchema).default([]),
});

// The core JSON structure stored in DB
export const ResumeContentSchema = z.object({
  profile: ResumeProfileSchema.default({ firstName: "", lastName: "" }),
  summary: z.string().optional(), // Rich text
  experience: z.array(ResumeExperienceSchema).default([]),
  projects: z.array(ResumeProjectSchema).default([]),
  education: z.array(ResumeEducationSchema).default([]),
  skills: z.array(ResumeSkillGroupSchema).default([]),
  certifications: z.array(ResumeCertificationSchema).default([]),
  customSections: z.array(ResumeCustomSectionSchema).default([]),
  
  // Layout/Ordering configuration
  sectionOrder: z.array(z.string()).default([
    "summary",
    "experience",
    "projects",
    "skills",
    "education",
    "certifications"
  ]),

  // Customization Settings
  settings: z.object({
    themeColor: z.string().default("#000000"),
    font: z.string().default("Inter"),
    sectionTitles: z.record(z.string(), z.string()).default({}), 
  }).default({
    themeColor: "#000000",
    font: "Inter",
    sectionTitles: {}
  }),
});

export type ResumeContent = z.infer<typeof ResumeContentSchema>;
export type ResumeProfile = z.infer<typeof ResumeProfileSchema>;
export type ResumeExperience = z.infer<typeof ResumeExperienceSchema>;
export type ResumeProject = z.infer<typeof ResumeProjectSchema>;
export type ResumeEducation = z.infer<typeof ResumeEducationSchema>;
export type ResumeSkillGroup = z.infer<typeof ResumeSkillGroupSchema>;
export type ResumeCustomSection = z.infer<typeof ResumeCustomSectionSchema>;
export type ResumeCustomItem = z.infer<typeof ResumeCustomItemSchema>;
