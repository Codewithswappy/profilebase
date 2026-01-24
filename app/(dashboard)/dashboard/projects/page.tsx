import { getMyProfile } from "@/lib/actions/profile";
import { ProjectsManager } from "@/components/dashboard/projects/projects-manager";

export const metadata = {
  title: "Projects Manager — ProfileBase",
};

export default async function ProjectsPage() {
  const result = await getMyProfile();

  if (!result.success) {
    return <div>Error loading profile</div>;
  }

  const data = result.data;

  if (!data) {
    return (
      <div>
        Profile not found. Please go to dashboard overview to create one.
      </div>
    );
  }

  return <ProjectsManager data={data} />;
}
