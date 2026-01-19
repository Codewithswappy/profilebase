"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateSocials(
  links: {
    platform: string;
    url: string;
    title?: string;
    id?: string;
  }[]
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

  // Use a transaction to update all links
  // We'll delete existing links not in the new list (if we were replacing all),
  // but to be safe and simple: 
  // For this implementation, we will upsert based on ID if present, or create new ones.
  // AND if the user provides a list that replaces the old one, we might want to delete missing ones.
  // HOWEVER, a simpler approach for "Manage Socials" is often "Replace All" or "Individual CRUD".
  // Given the UI is likely a list of inputs, "Replace All / Sync" is easiest.
  
  // Let's implement a "Sync" strategy: Delete all old permissions (or just given platform types) and re-create?
  // No, that changes IDs.
  
  // Better strategy: Input is the comprehensive list of desired links.
  
  await db.$transaction(async (tx) => {
    // 1. Delete links that are not in the new list (if they have IDs)
    const keepIds = links.filter((l) => l.id).map((l) => l.id as string);
    
    await tx.socialLink.deleteMany({
      where: {
        profileId: profile.id,
        id: { notIn: keepIds },
      },
    });

    // 2. Upsert each link
    for (const link of links) {
      if (link.id) {
        await tx.socialLink.update({
          where: { id: link.id },
          data: {
            platform: link.platform,
            url: link.url,
            title: link.title,
          },
        });
      } else {
        await tx.socialLink.create({
          data: {
            profileId: profile.id,
            platform: link.platform,
            url: link.url,
            title: link.title,
          },
        });
      }
    }
  });

  revalidatePath("/dashboard/settings");
  revalidatePath(`/${profile.slug}`);
}
