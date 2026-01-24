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
    <div className="fixed inset-0 flex bg-white dark:bg-neutral-950 overflow-hidden font-sans">
      {/* Background Patterns */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-[50vh] bg-gradient-to-t from-white dark:from-neutral-950 to-transparent" />
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden md:block h-full shrink-0 relative z-10">
        <DashboardSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <header className="md:hidden h-16 border-b bg-card flex items-center px-4 justify-between">
          <MobileSidebar />
          <div className="h-8">
            <img
              src="/logo/newLogo.png"
              alt="ProfileBase"
              className="h-full w-auto object-contain block dark:hidden"
            />
            <img
              src="/logo/newlogodarkMode.png"
              alt="ProfileBase"
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
