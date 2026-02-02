import { z } from "zod";

// ============================================
// AUTH SCHEMAS
// ============================================

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ============================================
// PROFILE SCHEMAS
// ============================================

export const SlugSchema = z
  .string()
  .min(3, "Slug must be at least 3 characters")
  .max(50, "Slug must be at most 50 characters")
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "Slug must be lowercase alphanumeric with hyphens"
  );

export const CreateProfileSchema = z.object({
  slug: SlugSchema,
  headline: z.string().max(100, "Headline must be at most 100 characters").optional(),
  location: z.string().max(100, "Location must be at most 100 characters").optional(),
  profession: z.string().max(100, "Profession must be at most 100 characters").optional(),
  summary: z.string().max(2000, "Summary must be at most 2000 characters").optional(),
});

export const UpdateProfileSchema = z.object({
  slug: SlugSchema.optional(),
  headline: z.string().max(100, "Headline must be at most 100 characters").optional(),
  location: z.string().max(100, "Location must be at most 100 characters").optional(),
  profession: z.string().max(100, "Profession must be at most 100 characters").optional(),
  summary: z.string().max(2000, "Summary must be at most 2000 characters").optional(),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
  coverImage: z.string().url("Invalid cover image URL").optional().or(z.literal("")),
  ctaMessage: z.string().max(200, "Message must be at most 200 characters").optional().or(z.literal("")),
  meetingUrl: z.string().url("Invalid meeting URL").optional().or(z.literal("")),
});

export const UpdateProfileSettingsSchema = z.object({
  isPublic: z.boolean().optional(),
  showEmail: z.boolean().optional(),
  showExperience: z.boolean().optional(),
  showProjects: z.boolean().optional(),
  showTechStack: z.boolean().optional(),
  showSummary: z.boolean().optional(),
  showAchievements: z.boolean().optional(),
  showCertificates: z.boolean().optional(),
  showContact: z.boolean().optional(),
  showGithubHeatmap: z.boolean().optional(),
});

// ============================================
// PROJECT SCHEMAS
// ============================================

export const CreateProjectSchema = z.object({
  title: z
    .string()
    .min(1, "Project title is required")
    .max(100, "Project title must be at most 100 characters"),
  description: z.string().max(2000).optional(),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  repoUrl: z.string().url("Invalid repository URL").optional().or(z.literal("")),
  demoUrl: z.string().url("Invalid demo URL").optional().or(z.literal("")),
  thumbnail: z.string().url("Invalid thumbnail URL").optional().or(z.literal("")),
  techStack: z.array(z.string()).optional(),
  role: z.string().max(100).optional(),
  highlights: z.array(z.string()).optional(),
  keyFeatures: z.array(z.string()).optional(),
  problem: z.string().optional(),
  solution: z.string().optional(),
  impact: z.string().optional(),
  futurePlans: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: z.enum(["planning", "in_progress", "complete", "archived"]).optional(),
  isFeatured: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

export const UpdateProjectSchema = z.object({
  projectId: z.string().cuid(),
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(2000).optional(),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  repoUrl: z.string().url("Invalid repository URL").optional().or(z.literal("")),
  demoUrl: z.string().url("Invalid demo URL").optional().or(z.literal("")),
  thumbnail: z.string().url("Invalid thumbnail URL").optional().or(z.literal("")),
  techStack: z.array(z.string()).optional(),
  role: z.string().max(100).optional(),
  highlights: z.array(z.string()).optional(),
  keyFeatures: z.array(z.string()).optional(),
  problem: z.string().optional(),
  solution: z.string().optional(),
  impact: z.string().optional(),
  futurePlans: z.string().optional(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  status: z.enum(["planning", "in_progress", "complete", "archived"]).optional(),
  isFeatured: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

export const ReorderProjectsSchema = z.object({
  projectIds: z.array(z.string().cuid()),
});

export const DeleteProjectSchema = z.object({
  projectId: z.string().cuid(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateProfileInput = z.infer<typeof CreateProfileSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type UpdateProfileSettingsInput = z.infer<typeof UpdateProfileSettingsSchema>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type ReorderProjectsInput = z.infer<typeof ReorderProjectsSchema>;
export type DeleteProjectInput = z.infer<typeof DeleteProjectSchema>;

