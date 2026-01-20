"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addAchievement(data: {
  title: string;
  subtitle?: string;
  date?: Date;
  description: string[];
  url?: string;
  type?: string;
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

  const achievement = await db.achievement.create({
    data: {
      profileId: profile.id,
      ...data,
    },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath(`/${profile.slug}`);
  return achievement;
}

export async function updateAchievement(
  id: string,
  data: {
    title: string;
    subtitle?: string;
    date?: Date;
    description: string[];
    url?: string;
    type?: string;
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
  const existing = await db.achievement.findUnique({
    where: { id },
  });

  if (!existing || existing.profileId !== profile.id) {
    throw new Error("Achievement not found or unauthorized");
  }

  const achievement = await db.achievement.update({
    where: { id },
    data: {
      ...data,
    },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath(`/${profile.slug}`);
  return achievement;
}

export async function deleteAchievement(id: string) {
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
  const existing = await db.achievement.findUnique({
    where: { id },
  });

  if (!existing || existing.profileId !== profile.id) {
    throw new Error("Achievement not found or unauthorized");
  }

  await db.achievement.delete({
    where: { id },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath(`/${profile.slug}`);
}
