import { getMyProfile } from "@/lib/actions/profile";
import { getAnalytics } from "@/lib/analytics";
import { CreateProfileWizard } from "@/components/dashboard/create-profile-wizard";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { MagicLinkInput } from "@/components/dashboard/magic-link-input";

export const metadata = {
  title: "Dashboard — SkillDock",
  description: "Manage your SkillDock profile",
};

export default async function DashboardPage() {
  const result = await getMyProfile();

  if (!result.success) {
    return (
      <div className="p-4 text-red-500">
        Error loading profile: {result.error}
      </div>
    );
  }

  const data = result.data;

  // Layout handles redirect if !data, but strict typing might need this check still.
  // We can just return null or empty if layout hasn't redirected yet (edge case).
  if (!data) return null;

  // Fetch quick analytics for overview (7 days)
  const analytics = await getAnalytics(data.profile.id, 7);

  return (
    <div className="min-h-[calc(100vh-4rem)] space-y-6 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-6">
        <MagicLinkInput />
        <DashboardOverview data={data} analytics={analytics} />
      </div>
    </div>
  );
}
