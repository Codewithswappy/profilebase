"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addExperience(data: {
  position: string;
  company: string;
  logo?: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  employmentType?: string;
  skills?: string[];
  description?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    throw new Error("Profile not found");
  }

  const experience = await db.experience.create({
    data: {
      profileId: profile.id,
      ...data,
      skills: data.skills || [],
    },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath(`/${profile.slug}`);
  return experience;
}

export async function updateExperience(
  id: string,
  data: {
    position: string;
    company: string;
    logo?: string;
    location?: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    employmentType?: string;
    skills?: string[];
    description?: string;
  }
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    throw new Error("Profile not found");
  }

  // Verify ownership
  const existingExperience = await db.experience.findUnique({
    where: { id },
  });

  if (!existingExperience || existingExperience.profileId !== profile.id) {
    throw new Error("Experience not found or unauthorized");
  }

  const experience = await db.experience.update({
    where: { id },
    data: {
      ...data,
    },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath(`/${profile.slug}`);
  return experience;
}

export async function deleteExperience(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    throw new Error("Profile not found");
  }

  // Verify ownership
  const existingExperience = await db.experience.findUnique({
    where: { id },
  });

  if (!existingExperience || existingExperience.profileId !== profile.id) {
    throw new Error("Experience not found or unauthorized");
  }

  await db.experience.delete({
    where: { id },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath(`/${profile.slug}`);
}
