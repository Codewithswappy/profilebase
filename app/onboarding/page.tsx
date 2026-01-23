import { CreateProfileWizard } from "@/components/dashboard/create-profile-wizard";
import { getMyProfile } from "@/lib/actions/profile";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const result = await getMyProfile();

  // If user already has a profile, redirect to dashboard
  if (result.success && result.data) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-2xl">
        <CreateProfileWizard />
      </div>
    </div>
  );
}
