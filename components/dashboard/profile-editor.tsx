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
  IconAlertCircle,
  IconMapPin,
  IconUser,
  IconX,
  IconPhoto,
  IconLoader2,
  IconWorld,
  IconEye,
  IconLock,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconBrandInstagram,
  IconLink,
  IconDeviceFloppy,
  IconTrash,
  IconCheck,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { UploadButton } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { ExperienceForm } from "@/components/dashboard/forms/experience-form";
import { AchievementsForm } from "@/components/dashboard/forms/achievements-form";
import { CertificatesForm } from "@/components/dashboard/forms/certificates-form";
import { VisibilitySettings } from "@/components/dashboard/visibility-settings";

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
    const location = formData.get("location") as string;
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
      location,
      summary,
      image: imageUrl,
      coverImage: coverImageUrl,
    });

    if (result.success) {
      // Update socials
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
      {/* Introduction / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dashed border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
            PROFILE SETTINGS
          </h1>
          <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest">
            Manage your public identity
          </p>
        </div>

        {/* Visibility Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 rounded-sm px-3 py-1.5 border border-dashed border-neutral-200 dark:border-neutral-800">
            {profileSettings.isPublic ? (
              <IconWorld className="w-4 h-4 text-emerald-500" />
            ) : (
              <IconLock className="w-4 h-4 text-neutral-400" />
            )}
            <span
              className={cn(
                "text-xs font-mono font-medium uppercase",
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

          <Link href={`/${profile.slug}`} target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-dashed border-neutral-300 dark:border-neutral-700 font-mono text-xs uppercase tracking-wider"
            >
              <IconEye className="w-3.5 h-3.5 mr-2" />
              View Live
            </Button>
          </Link>
        </div>
      </div>

      <form action={handleSubmit}>
        <div className="grid grid-cols-1 gap-8">
          {/* Left Column: Visual Identity */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden">
              <div className="p-3 border-b border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-500">
                  Visual Assets
                </h3>
              </div>

              {/* Cover Image */}
              <div className="relative h-32 w-full bg-neutral-100 dark:bg-neutral-900 group">
                {!coverImagePreview && (
                  <div className="absolute inset-0 flex items-center justify-center text-neutral-300 dark:text-neutral-700">
                    <div className="text-center">
                      <IconPhoto className="w-8 h-8 mx-auto opacity-50 mb-1" />
                      <span className="text-[10px] uppercase font-mono tracking-widest block">
                        No Cover
                      </span>
                    </div>
                  </div>
                )}

                {coverImagePreview && (
                  <img
                    src={coverImagePreview}
                    alt="Cover"
                    className="w-full h-full object-cover transition-opacity group-hover:opacity-40"
                  />
                )}

                <div className="absolute inset-0 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity gap-2 bg-neutral-900/40 backdrop-blur-[1px]">
                  <div className="relative">
                    <UploadButton
                      endpoint="imageUploader"
                      appearance={{
                        button: cn(
                          "h-8 px-3 text-[10px] font-mono uppercase font-bold bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-sm shadow-sm transition-transform active:scale-95 flex items-center gap-2",
                        ),
                        allowedContent: "hidden",
                      }}
                      content={{
                        button({ ready }) {
                          if (!ready) return "Loading...";
                          return (
                            <>
                              <IconPhoto className="w-3.5 h-3.5" />{" "}
                              {coverImagePreview ? "CHANGE" : "UPLOAD"}
                            </>
                          );
                        },
                      }}
                      onUploadBegin={() => {
                        setIsUploadingCover(true);
                        setUploadError(null);
                      }}
                      onClientUploadComplete={(res) => {
                        setIsUploadingCover(false);
                        if (res && res[0])
                          handleCoverImageUrlChange(res[0].url);
                      }}
                      onUploadError={(error: Error) => {
                        setIsUploadingCover(false);
                        setUploadError(error.message);
                      }}
                    />
                  </div>
                  {coverImagePreview && (
                    <Button
                      type="button"
                      onClick={handleRemoveCoverImage}
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0 rounded-sm shadow-sm"
                    >
                      <IconTrash className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
                {isUploadingCover && (
                  <div className="absolute inset-0 bg-neutral-900/50 flex items-center justify-center z-20">
                    <IconLoader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
              </div>

              {/* Avatar - Negative Margin overlap */}
              <div className="px-4 pb-4 -mt-10 relative z-10 pointer-events-none">
                <div className="pointer-events-auto inline-block relative group">
                  <div
                    className={cn(
                      "w-20 h-20 rounded-sm border-4 border-white dark:border-neutral-900 bg-neutral-200 dark:bg-neutral-800 overflow-hidden relative shadow-sm",
                      isUploadingImage &&
                        "ring-2 ring-neutral-900 dark:ring-neutral-100",
                    )}
                  >
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Avatar"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover opacity-90 md:opacity-100 md:group-hover:opacity-50 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <IconUser className="w-8 h-8" />
                      </div>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-black/20 md:bg-transparent">
                      <div className="relative w-full h-full cursor-pointer flex items-center justify-center">
                        <UploadButton
                          endpoint="imageUploader"
                          appearance={{
                            button:
                              "absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10",
                            allowedContent: "hidden",
                            container: "absolute inset-0 w-full h-full",
                          }}
                          onUploadBegin={() => {
                            setIsUploadingImage(true);
                            setUploadError(null);
                          }}
                          onClientUploadComplete={(res) => {
                            setIsUploadingImage(false);
                            if (res && res[0]) handleImageUrlChange(res[0].url);
                          }}
                          onUploadError={(error: Error) => {
                            setIsUploadingImage(false);
                            setUploadError(error.message);
                          }}
                        />
                        <IconPhoto className="w-5 h-5 text-white drop-shadow-md" />
                      </div>
                    </div>

                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                        <IconLoader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-20"
                    >
                      <IconX className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {uploadError && (
                <div className="px-4 pb-4">
                  <div className="text-[10px] text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded-sm border border-red-100 dark:border-red-900 flex items-center gap-2">
                    <IconAlertCircle className="w-3 h-3 shrink-0" />
                    {uploadError}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm">
              <div className="p-3 border-b border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-500">
                  Core Information
                </h3>
              </div>
              <div className="p-5 space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-mono uppercase text-neutral-500">
                    Username / Slug
                  </Label>
                  <div className="flex rounded-sm shadow-sm ring-1 ring-inset ring-neutral-300 dark:ring-neutral-700 focus-within:ring-2 focus-within:ring-inset focus-within:ring-neutral-900 dark:focus-within:ring-neutral-100 bg-neutral-50 dark:bg-neutral-950">
                    <span className="flex select-none items-center pl-3 text-neutral-400 font-mono text-xs">
                      ProfileBase.site/
                    </span>
                    <input
                      type="text"
                      name="slug"
                      defaultValue={profile.slug}
                      className="flex-1 border-0 bg-transparent py-2 pl-1 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-0 sm:text-xs font-mono font-medium"
                      placeholder="username"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-mono uppercase text-neutral-500">
                    Professional Headline
                  </Label>
                  <Input
                    name="headline"
                    defaultValue={profile.headline || ""}
                    placeholder="e.g. Full Stack Engineer & UI Enthusiast"
                    className="font-mono text-xs bg-neutral-50 dark:bg-neutral-950/50 border-neutral-300 dark:border-neutral-700 h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-mono uppercase text-neutral-500">
                    Location
                  </Label>
                  <div className="relative">
                    <IconMapPin className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                    <Input
                      name="location"
                      defaultValue={(profile as any).location || ""}
                      placeholder="e.g. Mumbai, India"
                      className="font-mono text-xs bg-neutral-50 dark:bg-neutral-950/50 border-neutral-300 dark:border-neutral-700 h-9 pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-mono uppercase text-neutral-500">
                    About / Bio
                  </Label>
                  <Textarea
                    name="summary"
                    defaultValue={profile.summary || ""}
                    rows={5}
                    placeholder="Briefly describe your background, interests, and what you're currently working on."
                    className="font-mono text-xs bg-neutral-50 dark:bg-neutral-950/50 border-neutral-300 dark:border-neutral-700 resize-none p-3 leading-relaxed"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm">
              <div className="p-3 border-b border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-500">
                  Social Connections
                </h3>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    key: "social_github",
                    icon: IconBrandGithub,
                    label: "GitHub",
                    placeholder: "github.com/username",
                    platform: "github",
                  },
                  {
                    key: "social_linkedin",
                    icon: IconBrandLinkedin,
                    label: "LinkedIn",
                    placeholder: "linkedin.com/in/username",
                    platform: "linkedin",
                  },
                  {
                    key: "social_twitter",
                    icon: IconBrandTwitter,
                    label: "X / Twitter",
                    placeholder: "x.com/username",
                    platform: "twitter",
                  },
                  {
                    key: "social_instagram",
                    icon: IconBrandInstagram,
                    label: "Instagram",
                    placeholder: "instagram.com/username",
                    platform: "instagram",
                  },
                  {
                    key: "social_website",
                    icon: IconLink,
                    label: "Website",
                    placeholder: "your-portfolio.com",
                    platform: "website",
                    full: true,
                  },
                ].map((social) => (
                  <div
                    key={social.key}
                    className={cn(
                      "space-y-1.5",
                      social.full && "md:col-span-2",
                    )}
                  >
                    <Label className="text-[10px] font-mono uppercase text-neutral-500 flex items-center gap-1.5">
                      <social.icon className="w-3 h-3" /> {social.label}
                    </Label>
                    <Input
                      name={social.key}
                      defaultValue={
                        data.socialLinks?.find(
                          (l) => l.platform === social.platform,
                        )?.url ?? ""
                      }
                      placeholder={social.placeholder}
                      className="font-mono text-xs bg-neutral-50 dark:bg-neutral-950/50 border-neutral-300 dark:border-neutral-700 h-9"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-6 flex items-center justify-end gap-4 pt-6 border-t border-dashed border-neutral-200 dark:border-neutral-800">
          {success && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 animate-in fade-in slide-in-from-right-4">
              <IconCheck className="w-4 h-4" />
              <span className="text-xs font-mono font-medium uppercase tracking-wide">
                Saved Successfully
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-500 animate-in fade-in">
              <IconAlertCircle className="w-4 h-4" />
              <span className="text-xs font-mono font-medium">{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black hover:opacity-90 transition-opacity rounded-sm h-10 px-6 font-mono text-xs uppercase tracking-widest font-bold"
          >
            {isLoading ? (
              <IconLoader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <IconDeviceFloppy className="w-4 h-4 mr-2" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Additional Profile Sections */}
      <div className="space-y-8 pt-8 border-t border-dashed border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono mb-4">
            CAREER & ACHIEVEMENTS
          </h2>

          <div className="space-y-6">
            <ExperienceForm initialData={data.experiences} />
            <AchievementsForm initialData={data.achievements} />
            <CertificatesForm initialData={data.certificates} />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono mb-4">
            VISIBILITY CONTROLS
          </h2>
          <VisibilitySettings data={data} />
        </div>
      </div>
    </div>
  );
}
