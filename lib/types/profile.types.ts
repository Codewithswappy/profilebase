// Profile-related types

import { Profile, ProfileSettings, Skill, Project, Evidence } from "@prisma/client";

/**
 * Complete profile data including all related entities
 * Used in dashboard and profile management
 */
export type FullProfile = {
  profile: Profile;
  profileSettings: ProfileSettings;
  skills: (Skill & { evidenceCount: number })[];
  projects: (Project & { evidenceCount: number })[];
  evidence: Evidence[];
};

/**
 * Minimal profile data for public views
 */
export type PublicProfile = {
  id: string;
  slug: string;
  headline: string | null;
  summary: string | null;
  image: string | null;
  name: string | null;
  email: string | null;
};
