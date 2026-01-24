import { getResumes, ResumeData } from "@/lib/actions/resume";
import { getMyProfile } from "@/lib/actions/profile";
import { ResumeList } from "@/components/dashboard/resume-list";

export const metadata = {
  title: "Resumes — ProfileBase",
};

export default async function ResumeDashboardPage() {
  const [resumesResult, profileResult] = await Promise.all([
    getResumes(),
    getMyProfile(),
  ]);

  if (!profileResult.success || !profileResult.data) {
    return <div>Error loading profile. Please refresh.</div>;
  }

  const {
    profile,
    experiences,
    projects,
    socialLinks,
    achievements,
    certificates,
  } = profileResult.data;

  // Transform profile data for Resume Seed
  // Note: Providing reasonable defaults if data is missing
  const seedData: ResumeData = {
    userName: profile.user?.name || "Your Name",
    email: profile.user?.email || "email@example.com",
    profile: {
      headline: profile.headline || "Professional Headline",
      summary: profile.summary || "",
      location: profile.location || "",
    },
    experiences: experiences || [],
    projects: projects || [],
    education: [],
    skillsString: "React, TypeScript, Node.js",
    socialLinks: socialLinks || [],
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <ResumeList
        initialResumes={resumesResult.success ? resumesResult.data : []}
        profileData={seedData}
      />
    </div>
  );
}
