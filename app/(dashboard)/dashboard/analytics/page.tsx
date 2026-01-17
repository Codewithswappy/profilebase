import { getMyProfile } from "@/lib/actions/profile";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export const metadata = {
  title: "Analytics — SkillDock",
};

export default async function AnalyticsPage() {
  const result = await getMyProfile();

  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center text-zinc-500">
        Analytics unavailable. Please ensure you have a profile.
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] space-y-8 animate-in fade-in duration-500">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-zinc-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] opacity-50 pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-6">
        <AnalyticsDashboard profileId={result.data.profile.id} />
      </div>
    </div>
  );
}
