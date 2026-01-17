"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateProfile,
  updateProfileSettings,
  FullProfile,
} from "@/lib/actions/profile";
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
  const [imageUrl, setImageUrl] = useState<string>(profile.image || "");

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const slug = formData.get("slug") as string;
    const headline = formData.get("headline") as string;
    const summary = formData.get("summary") as string;

    const result = await updateProfile({
      slug,
      headline,
      summary,
      image: imageUrl || undefined,
    });

    if (result.success) {
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
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

  return (
    <div className="space-y-6">
      {/* BENTO GRID - Profile Settings */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm overflow-hidden">
        {/* Header Row */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800">
          <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
            Identity & Status
          </p>

          <div className="flex items-center gap-3">
            {/* Public Toggle */}
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-sm px-3 py-1 border border-zinc-100 dark:border-zinc-700/50">
              {profileSettings.isPublic ? (
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-zinc-400" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  profileSettings.isPublic
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-zinc-500",
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
              className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View</span>
            </Link>
          </div>
        </div>

        <form action={handleSubmit}>
          {/* Avatar Row */}
          <div className="flex flex-col md:flex-row gap-6 items-center p-5 border-b border-zinc-200 dark:border-zinc-800">
            {/* Avatar */}
            <div className="relative group">
              <div
                className={cn(
                  "relative w-20 h-20 rounded-sm overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center transition-all duration-500 border border-zinc-200 dark:border-zinc-700",
                  isUploadingImage && "ring-2 ring-indigo-500/30 scale-105",
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
                  <User className="w-8 h-8 text-zinc-300" />
                )}
              </div>
              {imagePreview && !isUploadingImage && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-sm flex items-center justify-center hover:scale-110 transition-transform shadow-lg z-10"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Upload Button */}
            <div className="flex-1 space-y-2 w-full max-w-sm">
              <div className="relative w-max mx-auto md:mx-0">
                <UploadButton
                  endpoint="imageUploader"
                  appearance={{
                    button: cn(
                      "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-sm text-[10px] font-semibold tracking-wide h-8 px-4 w-auto shadow-none transition-all hover:opacity-90",
                      isUploadingImage &&
                        "opacity-80 cursor-wait pointer-events-none",
                    ),
                    allowedContent: "hidden",
                  }}
                  content={{
                    button({ ready }) {
                      if (ready) {
                        return isUploadingImage ? (
                          <span className="flex items-center gap-1.5">
                            Processing...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5" /> Change Photo
                          </span>
                        );
                      }
                      return "Loading...";
                    },
                  }}
                  onUploadBegin={() => setIsUploadingImage(true)}
                  onClientUploadComplete={(res) => {
                    setIsUploadingImage(false);
                    if (res && res[0]) {
                      handleImageUrlChange(res[0].url);
                    }
                  }}
                  onUploadError={(error: Error) => {
                    setIsUploadingImage(false);
                    alert(`ERROR! ${error.message}`);
                  }}
                />
              </div>
              <p className="text-[10px] text-zinc-400 text-center md:text-left">
                JPG, PNG (Max 4MB)
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-5 space-y-5">
            <div className="grid gap-2">
              <Label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Username
              </Label>
              <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950/50 rounded-sm px-3 border border-zinc-200 dark:border-zinc-800 focus-within:border-zinc-300 dark:focus-within:border-zinc-700 transition-colors">
                <span className="text-zinc-400 text-sm font-mono">
                  skilldock.site/
                </span>
                <Input
                  name="slug"
                  defaultValue={profile.slug}
                  required
                  pattern="[a-z0-9-]+"
                  className="border-none shadow-none bg-transparent h-10 px-0 focus-visible:ring-0 font-medium text-zinc-800 dark:text-zinc-200"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Headline
              </Label>
              <Input
                name="headline"
                defaultValue={profile.headline || ""}
                placeholder="e.g. Senior Product Designer"
                className="h-10 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 rounded-sm shadow-none focus-visible:ring-1 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                About You
              </Label>
              <Textarea
                name="summary"
                defaultValue={profile.summary || ""}
                placeholder="Tell your story..."
                rows={5}
                className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 rounded-sm shadow-none focus-visible:ring-1 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700 resize-none p-4"
              />
            </div>
          </div>

          {/* Footer Row */}
          <div className="flex justify-between items-center p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/30">
            <div>
              {success && (
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-sm animate-in fade-in flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Saved
                </span>
              )}
              {error && <span className="text-xs text-red-500">{error}</span>}
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-sm px-8 shadow-none bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 h-9 text-xs font-medium transition-all"
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
