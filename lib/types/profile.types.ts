// Profile-related types (Portfolio Architecture)

import { Profile, ProfileSettings, Project, Experience, SocialLink, Achievement, Certificate } from "@prisma/client";

/**
 * Complete profile data including all related entities
 * Used in dashboard and profile management
 */
export type FullProfile = {
  profile: Profile;
  profileSettings: ProfileSettings;
  projects: Project[];
  experiences: Experience[];
  socialLinks: SocialLink[];
  achievements: Achievement[];
  certificates: Certificate[];
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
