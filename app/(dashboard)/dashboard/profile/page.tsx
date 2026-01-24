import { getMyProfile } from "@/lib/actions/profile";
import { ProfileEditor } from "@/components/dashboard/profile-editor";

export const metadata = {
  title: "Profile Settings — ProfileBase",
};

export default async function ProfilePage() {
  const result = await getMyProfile();

  if (!result.success || !result.data) {
    return <div>Error loading profile</div>;
  }

  const data = result.data;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <ProfileEditor data={data} />
    </div>
  );
}
