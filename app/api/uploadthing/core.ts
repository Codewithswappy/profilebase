import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth"; // Assuming you have auth setup here

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // Debugging: Check for Env Vars
      if (!process.env.UPLOADTHING_SECRET) {
        console.error("❌ MISSING UPLOADTHING_SECRET in .env");
      }
      if (!process.env.UPLOADTHING_APP_ID) {
        console.error("❌ MISSING UPLOADTHING_APP_ID in .env");
      }

      const session = await auth();
      console.log("📂 UploadThing Middleware - Session:", session?.user?.email || "None");

      if (!session || !session.user) throw new Error("Unauthorized");

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      // Upload complete callback

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
