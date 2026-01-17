import { z } from "zod";

// ============================================
// ENUMS
// ============================================

export const EvidenceTypeSchema = z.enum([
  "SCREENSHOT",
  "LINK",
  "CODE_SNIPPET",
  "DESCRIPTION",
  "METRIC",
]);

export const SkillCategorySchema = z.enum([
  "LANGUAGE",
  "FRAMEWORK",
  "TOOL",
  "DATABASE",
  "CONCEPT",
  "SOFT_SKILL",
  "OTHER",
]);

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
  summary: z.string().max(2000, "Summary must be at most 2000 characters").optional(),
});

export const UpdateProfileSchema = z.object({
  slug: SlugSchema.optional(),
  headline: z.string().max(100, "Headline must be at most 100 characters").optional(),
  summary: z.string().max(2000, "Summary must be at most 2000 characters").optional(),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
});

export const UpdateProfileSettingsSchema = z.object({
  isPublic: z.boolean().optional(),
  showEmail: z.boolean().optional(),
  showUnprovenSkills: z.boolean().optional(),
});

// ============================================
// SKILL SCHEMAS
// ============================================

export const CreateSkillSchema = z.object({
  name: z
    .string()
    .min(1, "Skill name is required")
    .max(50, "Skill name must be at most 50 characters"),
  category: SkillCategorySchema.optional(),
});

export const UpdateSkillSchema = z.object({
  skillId: z.string().cuid(),
  name: z.string().min(1).max(50).optional(),
  category: SkillCategorySchema.optional(),
});

export const ReorderSkillsSchema = z.object({
  skillIds: z.array(z.string().cuid()),
});

export const DeleteSkillSchema = z.object({
  skillId: z.string().cuid(),
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
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const UpdateProjectSchema = z.object({
  projectId: z.string().cuid(),
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(2000).optional(),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
});

export const ReorderProjectsSchema = z.object({
  projectIds: z.array(z.string().cuid()),
});

export const DeleteProjectSchema = z.object({
  projectId: z.string().cuid(),
});

// ============================================
// EVIDENCE SCHEMAS
// ============================================

export const CreateEvidenceSchema = z.object({
  skillIds: z.array(z.string().cuid()).min(1, "At least one skill is required"),
  projectId: z.string().cuid(),
  title: z
    .string()
    .min(1, "Evidence title is required")
    .max(150, "Evidence title must be at most 150 characters"),
  type: EvidenceTypeSchema.optional(),
  content: z.string().max(20000).optional(),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export const UpdateEvidenceSchema = z.object({
  evidenceId: z.string().cuid(),
  title: z.string().min(1).max(150).optional(),
  type: EvidenceTypeSchema.optional(),
  content: z.string().max(20000).optional(),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  skillIds: z.array(z.string().cuid()).optional(),
});

export const DeleteEvidenceSchema = z.object({
  evidenceId: z.string().cuid(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateProfileInput = z.infer<typeof CreateProfileSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type UpdateProfileSettingsInput = z.infer<typeof UpdateProfileSettingsSchema>;
export type CreateSkillInput = z.infer<typeof CreateSkillSchema>;
export type UpdateSkillInput = z.infer<typeof UpdateSkillSchema>;
export type ReorderSkillsInput = z.infer<typeof ReorderSkillsSchema>;
export type DeleteSkillInput = z.infer<typeof DeleteSkillSchema>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type ReorderProjectsInput = z.infer<typeof ReorderProjectsSchema>;
export type DeleteProjectInput = z.infer<typeof DeleteProjectSchema>;
export type CreateEvidenceInput = z.infer<typeof CreateEvidenceSchema>;
export type UpdateEvidenceInput = z.infer<typeof UpdateEvidenceSchema>;
export type DeleteEvidenceInput = z.infer<typeof DeleteEvidenceSchema>;
export type EvidenceType = z.infer<typeof EvidenceTypeSchema>;
export type SkillCategory = z.infer<typeof SkillCategorySchema>;
