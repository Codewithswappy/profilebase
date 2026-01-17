import { getMyProfile } from "@/lib/actions/profile";
import { ProfileEditor } from "@/components/dashboard/profile-editor";
import { VisibilitySettings } from "@/components/dashboard/visibility-settings";

export const metadata = {
  title: "Profile Settings — SkillDock",
};

export default async function ProfilePage() {
  const result = await getMyProfile();

  if (!result.success || !result.data) {
    return <div>Error loading profile</div>;
  }

  const data = result.data;

  return (
    <div className="min-h-screen max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-2 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Profile Settings
        </h1>
      </div>

      <div className="space-y-6">
        <ProfileEditor data={data} />
        <VisibilitySettings data={data} />
      </div>
    </div>
  );
}
