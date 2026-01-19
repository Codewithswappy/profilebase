
import { db } from "../lib/db";

async function main() {
  try {
    const profile = await db.profile.findUnique({
      where: { slug: "heyyswap" },
      select: { id: true, slug: true, coverImage: true, image: true }
    });
    console.log("DEBUG_PROFILE:", JSON.stringify(profile, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
