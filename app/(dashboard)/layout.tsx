import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

// Force dynamic rendering for all dashboard routes (uses auth/headers)
export const dynamic = "force-dynamic";

import { getMyProfile } from "@/lib/actions/profile";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await getMyProfile();

  // If user is authenticated but has no profile, force them to onboarding
  // We check session inside getMyProfile, but if error is auth, we might want to let middleware handle it
  // But if success is true and data is null, it means no profile.
  if (result.success && !result.data) {
    redirect("/onboarding");
  }
  return (
    <div className="fixed inset-0 flex bg-neutral-50 dark:bg-background overflow-hidden">
      {/* Sidebar for desktop */}
      <div className="hidden md:block h-full shrink-0">
        <DashboardSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="md:hidden h-16 border-b bg-card flex items-center px-4 justify-between">
          <MobileSidebar />
          <div className="h-8">
            <img
              src="/logo/blackLogo.png"
              alt="SkillDock"
              className="h-full w-auto object-contain block dark:hidden"
            />
            <img
              src="/logo/lightLogo.png"
              alt="SkillDock"
              className="h-full w-auto object-contain hidden dark:block"
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
