"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addCertificate(data: {
  name: string;
  issuer: string;
  date: Date;
  url?: string;
  credentialId?: string;
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

  const certificate = await db.certificate.create({
    data: {
      profileId: profile.id,
      ...data,
    },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath(`/${profile.slug}`);
  return certificate;
}

export async function updateCertificate(
  id: string,
  data: {
    name: string;
    issuer: string;
    date: Date;
    url?: string;
    credentialId?: string;
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

  const existing = await db.certificate.findUnique({
    where: { id },
  });

  if (!existing) {
     return { success: false, error: "Certificate not found" }; // Or just throw specific err
  }
  
  if (existing.profileId !== profile.id) {
    throw new Error("Unauthorized");
  }

  const certificate = await db.certificate.update({
    where: { id },
    data: {
      ...data,
    },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath(`/${profile.slug}`);
  return certificate;
}

export async function deleteCertificate(id: string) {
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

  const existing = await db.certificate.findUnique({
    where: { id },
  });

  // Idempotent delete: if it's already gone, we're good.
  if (!existing) {
      revalidatePath("/dashboard/settings");
      revalidatePath(`/${profile.slug}`);
      return; 
  }

  if (existing.profileId !== profile.id) {
    throw new Error("Unauthorized");
  }

  await db.certificate.delete({
    where: { id },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath(`/${profile.slug}`);
}
