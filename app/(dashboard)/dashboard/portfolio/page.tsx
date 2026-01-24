import { getMyProfile } from "@/lib/actions/profile";
import { PortfolioManager } from "@/components/dashboard/portfolio/portfolio-manager";

export const metadata = {
  title: "Portfolio Manager — ProfileBase",
};

export default async function PortfolioPage() {
  const result = await getMyProfile();

  if (!result.success) {
    return <div>Error loading profile</div>;
  }

  const data = result.data;

  // If no profile, we should redirect to dashboard which handles the wizard
  // For now simple check
  if (!data) {
    return (
      <div>
        Profile not found. Please go to dashboard overview to create one.
      </div>
    );
  }

  return <PortfolioManager data={data} />;
}
