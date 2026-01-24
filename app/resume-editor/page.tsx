import { getMyProfile } from "@/lib/actions/profile";
import { ResumeBuilder } from "@/components/dashboard/resume-builder";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Editor — ProfileBase Resume",
  layout: "fullscreen",
};

export default async function ResumeEditorPage() {
  const result = await getMyProfile();

  if (!result.success || !result.data) {
    redirect("/login");
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-white">
      <ResumeBuilder initialData={result.data} />
    </div>
  );
}
