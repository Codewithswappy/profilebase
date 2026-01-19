"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateProfile,
  updateProfileSettings,
  FullProfile,
} from "@/lib/actions/profile";
import { updateSocials } from "@/lib/actions/socials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  User,
  X,
  ImageIcon,
  Loader2,
  Globe,
  Eye,
  Lock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { UploadButton } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

interface ProfileEditorProps {
  data: FullProfile;
}

export function ProfileEditor({ data }: ProfileEditorProps) {
  const router = useRouter();
  const { profile, profileSettings } = data;
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    profile.image || null,
  );

  // We keep imageUrl state for form submission, updated by upload success
  // We keep imageUrl state for form submission, updated by upload success
  const [imageUrl, setImageUrl] = useState<string>(profile.image || "");
  const [coverImageUrl, setCoverImageUrl] = useState<string>(
    profile.coverImage || "",
  );
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    profile.coverImage || null,
  );
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    setUploadError(null);
    setSuccess(false);

    const slug = formData.get("slug") as string;
    const headline = formData.get("headline") as string;
    const summary = formData.get("summary") as string;

    // Extract social links
    const socialLinks = [
      { platform: "github", url: formData.get("social_github") as string },
      { platform: "linkedin", url: formData.get("social_linkedin") as string },
      { platform: "twitter", url: formData.get("social_twitter") as string },
      {
        platform: "instagram",
        url: formData.get("social_instagram") as string,
      },
      { platform: "website", url: formData.get("social_website") as string },
    ].filter((link) => link.url && link.url.trim() !== "");

    // Update profile
    const result = await updateProfile({
      slug,
      headline,
      summary,
      image: imageUrl,
      coverImage: coverImageUrl,
    });

    if (result.success) {
      // Update socials if profile update succeeded
      // We don't block on this, but maybe we should awaiting it to show error if it fails
      try {
        await updateSocials(socialLinks);
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        console.error(err);
        setError("Profile saved, but failed to save social links");
      }
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  }

  // Handle Public/Private Toggle
  async function handleVisibilityToggle(checked: boolean) {
    const result = await updateProfileSettings({
      isPublic: checked,
    });
    if (result.success) {
      router.refresh();
    }
  }

  function handleImageUrlChange(url: string) {
    setImageUrl(url);
    setImagePreview(url);
  }

  function handleRemoveImage() {
    setImageUrl("");
    setImagePreview(null);
  }

  function handleCoverImageUrlChange(url: string) {
    setCoverImageUrl(url);
    setCoverImagePreview(url);
  }

  function handleRemoveCoverImage() {
    setCoverImageUrl("");
    setCoverImagePreview(null);
  }

  return (
    <div className="space-y-6">
      {/* BENTO GRID - Profile Settings */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden">
        {/* Header Row */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800">
          <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
            Identity & Status
          </p>

          <div className="flex items-center gap-3">
            {/* Public Toggle */}
            <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-sm px-3 py-1 border border-neutral-100 dark:border-neutral-700/50">
              {profileSettings.isPublic ? (
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-neutral-400" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  profileSettings.isPublic
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-neutral-500",
                )}
              >
                {profileSettings.isPublic ? "Public" : "Private"}
              </span>
              <Switch
                checked={profileSettings.isPublic}
                onCheckedChange={handleVisibilityToggle}
                className="scale-75 ml-1"
              />
            </div>

            {/* View Link */}
            <Link
              href={`/${profile.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View</span>
            </Link>
          </div>
        </div>

        <form action={handleSubmit}>
          {/* Cover & Avatar Section */}
          <div className="relative border-b border-neutral-200 dark:border-neutral-800">
            {/* Cover Image Area */}
            {/* Cover Image Area */}
            <div className="relative w-full h-32 md:h-48 bg-neutral-50 dark:bg-neutral-950/30 group overflow-hidden">
              {/* Grid pattern for empty state */}
              {!coverImagePreview && (
                <div className="absolute inset-0 opacity-[0.03] pattern-grid-lg" />
              )}

              {coverImagePreview ? (
                <img
                  src={coverImagePreview}
                  alt="Cover"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : null}

              {/* Cover Actions - Always visible when empty, visible on hover when filled */}
              <div
                className={cn(
                  "absolute inset-0 flex flex-col items-center justify-center gap-2 transition-all duration-200",
                  coverImagePreview
                    ? "opacity-0 group-hover:opacity-100 bg-black/10 backdrop-blur-[2px]"
                    : "opacity-100",
                )}
              >
                <div className="flex gap-2">
                  {/* Remove Button (Only if filled) */}
                  {coverImagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveCoverImage}
                      className="h-8 px-3 bg-white/90 dark:bg-neutral-900/90 text-red-500 hover:text-red-600 hover:bg-white dark:hover:bg-neutral-900 text-[10px] font-semibold rounded-sm shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}

                  {/* Upload/Change Button */}
                  <div className="relative">
                    <UploadButton
                      endpoint="imageUploader"
                      appearance={{
                        button: cn(
                          "text-[10px] font-semibold h-8 px-4 rounded-sm shadow-sm transition-all flex items-center gap-1.5 !text-neutral-900 dark:!text-neutral-100",
                          coverImagePreview
                            ? "bg-white/95 dark:bg-neutral-900/95 hover:bg-white dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-700"
                            : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700/50",
                        ),
                        allowedContent: "hidden",
                      }}
                      content={{
                        button({ ready }) {
                          if (!ready) return "Loading...";
                          return (
                            <span className="flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5" />
                              {isUploadingCover
                                ? "Uploading..."
                                : coverImagePreview
                                  ? "Change Cover"
                                  : "Add Cover Image"}
                            </span>
                          );
                        },
                      }}
                      onUploadBegin={() => {
                        setIsUploadingCover(true);
                        setUploadError(null);
                      }}
                      onClientUploadComplete={(res) => {
                        setIsUploadingCover(false);
                        if (res && res[0]) {
                          handleCoverImageUrlChange(res[0].url);
                        }
                      }}
                      onUploadError={(error: Error) => {
                        setIsUploadingCover(false);
                        let msg = error.message;
                        if (msg.includes("File size"))
                          msg = "Image too large (max 4MB)";
                        else if (msg.includes("Invalid file type"))
                          msg = "Unsupported file type";
                        setUploadError(msg);
                      }}
                    />
                  </div>
                </div>

                {/* Shared Upload Error (visible on hover or if no cover) */}
                {uploadError && !isUploadingImage && (
                  <div className="px-3 py-1 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-300 text-[10px] font-medium rounded-full shadow-sm animate-in fade-in slide-in-from-bottom-2">
                    {uploadError}
                  </div>
                )}
              </div>
            </div>

            {/* Avatar Row (Overlapping) */}
            <div className="flex px-5 pb-5 -mt-10 relative z-10 pointer-events-none">
              <div className="pointer-events-auto flex flex-col gap-2">
                <div className="flex items-end gap-4">
                  {/* Avatar */}
                  <div className="relative group">
                    <div
                      className={cn(
                        "relative w-20 h-20 rounded-sm overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center transition-all duration-500 border-4 border-white dark:border-neutral-900 shadow-sm",
                        isUploadingImage && "ring-2 ring-indigo-500/30",
                      )}
                    >
                      {isUploadingImage && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in">
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                      )}
                      {imagePreview ? (
                        <Image
                          src={imagePreview}
                          alt="Profile preview"
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-neutral-300" />
                      )}
                    </div>
                    {/* Avatar Upload Trigger */}
                    <div className="absolute -bottom-2 -right-2 flex gap-1">
                      {imagePreview && !isUploadingImage && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shadow-sm border border-white dark:border-neutral-900"
                          title="Remove avatar"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}

                      <div className="w-6 h-6 overflow-hidden relative rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-sm border border-white dark:border-neutral-900 flex items-center justify-center cursor-pointer">
                        <UploadButton
                          endpoint="imageUploader"
                          appearance={{
                            button:
                              "w-full h-full bg-transparent opacity-0 absolute inset-0 z-10 cursor-pointer", // Invisible overlay
                            allowedContent: "hidden",
                            container: "w-full h-full absolute inset-0",
                          }}
                          onUploadBegin={() => {
                            setIsUploadingImage(true);
                            setUploadError(null);
                          }}
                          onClientUploadComplete={(res) => {
                            setIsUploadingImage(false);
                            if (res && res[0]) {
                              handleImageUrlChange(res[0].url);
                            }
                          }}
                          onUploadError={(error: Error) => {
                            setIsUploadingImage(false);
                            let msg = error.message;
                            if (msg.includes("File size"))
                              msg = "Image too large (max 4MB)";
                            else if (msg.includes("Invalid file type"))
                              msg = "Unsupported file type";
                            setUploadError(msg);
                          }}
                        />
                        <ImageIcon className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upload Error Message */}
                {uploadError && (
                  <div className="animate-in fade-in slide-in-from-top-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-md flex items-center gap-1.5 max-w-[200px]">
                    <AlertCircle className="w-3 h-3 text-red-600 dark:text-red-400 shrink-0" />
                    <p className="text-[10px] font-medium text-red-600 dark:text-red-400 leading-tight">
                      {uploadError}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex-1 ml-4 pt-10 pointer-events-auto">
                <p className="text-xs text-neutral-500">
                  Recommended: Square for avatar, 1200x480 for cover (max 4MB).
                </p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-5 space-y-5">
            <div className="grid gap-2">
              <Label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                Username
              </Label>
              <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-950/50 rounded-sm px-3 border border-neutral-200 dark:border-neutral-800 focus-within:border-neutral-300 dark:focus-within:border-neutral-700 transition-colors">
                <span className="text-neutral-400 text-sm font-mono">
                  skilldock.site/
                </span>
                <Input
                  name="slug"
                  defaultValue={profile.slug}
                  required
                  className="border-none shadow-none bg-transparent h-10 px-0 focus-visible:ring-0 font-medium text-neutral-800 dark:text-neutral-200"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                Headline
              </Label>
              <Input
                name="headline"
                defaultValue={profile.headline || ""}
                placeholder="e.g. Senior Product Designer"
                className="h-10 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50 rounded-sm shadow-none focus-visible:ring-1 focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-700"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                About You
              </Label>
              <Textarea
                name="summary"
                defaultValue={profile.summary || ""}
                placeholder="Tell your story..."
                rows={5}
                className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50 rounded-sm shadow-none focus-visible:ring-1 focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-700 resize-none p-4"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="p-5 border-t border-neutral-200 dark:border-neutral-800 space-y-5">
            <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
              Social Links
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[11px] uppercase text-neutral-400">
                  GitHub
                </Label>
                <Input
                  name="social_github"
                  defaultValue={
                    data.socialLinks?.find((l) => l.platform === "github")
                      ?.url ?? ""
                  }
                  placeholder="https://github.com/..."
                  className="h-9 bg-neutral-50 dark:bg-neutral-950/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] uppercase text-neutral-400">
                  LinkedIn
                </Label>
                <Input
                  name="social_linkedin"
                  defaultValue={
                    data.socialLinks?.find((l) => l.platform === "linkedin")
                      ?.url ?? ""
                  }
                  placeholder="https://linkedin.com/in/..."
                  className="h-9 bg-neutral-50 dark:bg-neutral-950/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] uppercase text-neutral-400">
                  X (Twitter)
                </Label>
                <Input
                  name="social_twitter"
                  defaultValue={
                    data.socialLinks?.find((l) => l.platform === "twitter")
                      ?.url ?? ""
                  }
                  placeholder="https://x.com/..."
                  className="h-9 bg-neutral-50 dark:bg-neutral-950/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] uppercase text-neutral-400">
                  Instagram
                </Label>
                <Input
                  name="social_instagram"
                  defaultValue={
                    data.socialLinks?.find((l) => l.platform === "instagram")
                      ?.url ?? ""
                  }
                  placeholder="https://instagram.com/..."
                  className="h-9 bg-neutral-50 dark:bg-neutral-950/50"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-[11px] uppercase text-neutral-400">
                  Website / Portfolio
                </Label>
                <Input
                  name="social_website"
                  defaultValue={
                    data.socialLinks?.find((l) => l.platform === "website")
                      ?.url ?? ""
                  }
                  placeholder="https://..."
                  className="h-9 bg-neutral-50 dark:bg-neutral-950/50"
                />
              </div>
            </div>

            {/* Custom Links could be added here, but keeping it simple for now as requested by user "give fields in profile page" which implies simpler fixed fields often, but let's stick to standard first. 
                If they want custom, I should add a dynamic list.
                For now, let's stick to these core 5.
            */}
          </div>

          {/* Footer Row */}
          <div className="flex justify-between items-center p-5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/30">
            <div>
              {success && (
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-sm animate-in fade-in flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>{" "}
                  Saved
                </span>
              )}
              {error && <span className="text-xs text-red-500">{error}</span>}
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-sm px-8 shadow-none bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 h-9 text-xs font-medium transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
