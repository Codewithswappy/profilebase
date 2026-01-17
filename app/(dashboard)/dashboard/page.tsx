import { getMyProfile } from "@/lib/actions/profile";
import { CreateProfileWizard } from "@/components/dashboard/create-profile-wizard";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { MagicLinkInput } from "@/components/dashboard/magic-link-input";

export const metadata = {
  title: "Dashboard — SkillProof",
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

  if (!data) {
    return <CreateProfileWizard />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] space-y-6 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-6">
        <MagicLinkInput />
        <DashboardOverview data={data} />
      </div>
    </div>
  );
}
