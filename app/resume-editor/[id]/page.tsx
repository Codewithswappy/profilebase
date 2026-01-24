import { getResume } from "@/lib/actions/resume";
import { ResumeEditorRoot } from "@/components/resume/resume-editor-root";
import { redirect, notFound } from "next/navigation";

export const metadata = {
  title: "Editor — ProfileBase Resume",
  layout: "fullscreen",
};

export default async function ResumeEditorPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const result = await getResume(params.id);

  if (!result.success) {
    if (result.error === "Unauthorized") redirect("/login");
    return notFound();
  }

  if (!result.data) {
    return notFound();
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-neutral-900">
      <ResumeEditorRoot resume={result.data as any} />
    </div>
  );
}
