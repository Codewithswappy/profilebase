import { notFound } from "next/navigation";
import { getPublicProfile } from "@/lib/actions/public";
import { PublicProfileView } from "@/components/public/public-profile-view";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicProfile(slug);

  if (!result.success || !result.data) {
    return { title: "Profile Not Found — SkillProof" };
  }

  const { profile } = result.data;

  return {
    title: `${profile.slug} — SkillProof`,
    description:
      profile.headline || `View ${profile.slug}'s proven skills on SkillProof.`,
    openGraph: {
      title: `${profile.slug} — SkillProof`,
      description: profile.headline || "Proof over claims.",
      images: [`/api/og/${slug}`],
      type: "profile",
    },
  };
}

import { AnalyticsTracker } from "@/components/analytics/analytics-tracker";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getPublicProfile(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AnalyticsTracker slug={slug} />
      <PublicProfileView data={result.data} />
    </div>
  );
}
