import { ImageResponse } from "next/og";
import { getPublicProfile } from "@/lib/actions/public";

// Prisma requires Node.js runtime
export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const result = await getPublicProfile(slug);

  if (!result.success || !result.data) {
    return new Response("Not Found", { status: 404 });
  }

  const { profile, skills, profileSettings } = result.data;

  // Logic: If showUnprovenSkills is false, ONLY show proven skills.
  // If true, show top 3 skills regardless (but visually proven ones are nicer,
  // though for OG image simpler is better).
  // Actually, Phase 6 correction said:
  // "If showUnprovenSkills = true → Show top 3 skills (proven first, then unproven)" - Wait, user said "show unproven if no proven"?
  // User said: "Top 3 Skills → First 3 proven skills; show unproven if no proven" was WRONG.
  // Correct rule:
  // If showUnprovenSkills = false: OG image shows only proven skills. If zero proven, show no skills.

  const provenSkills = skills.filter((s) => s.evidenceCount > 0);
  let displaySkills: typeof skills = [];

  if (profileSettings.showUnprovenSkills) {
    // Phase 6 correction: "Top 3 skills (any)"
    // But implicitly, proven ones are more valuable to show.
    // For simplicity and matching "Public Profile" view which likely shows mostly proven:
    // I'll take top 3 from the list. The list is sorted by displayOrder.
    displaySkills = skills.slice(0, 3);
  } else {
    displaySkills = provenSkills.slice(0, 3);
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f172a", // Slate 950
          color: "white",
          fontFamily: "sans-serif",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 60,
              fontWeight: "bold",
              marginBottom: 20,
              background: "linear-gradient(to right, #4ade80, #3b82f6)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {profile.slug}
          </div>

          {profile.headline ? (
            <div
              style={{
                fontSize: 30,
                color: "#94a3b8",
                maxWidth: "800px",
                marginBottom: 40,
              }}
            >
              {profile.headline}
            </div>
          ) : (
            <div style={{ fontSize: 30, color: "#94a3b8", marginBottom: 40 }}>
              SkillDock Profile
            </div>
          )}

          {displaySkills.length > 0 && (
            <div style={{ display: "flex", gap: "20px" }}>
              {displaySkills.map((skill) => (
                <div
                  key={skill.id}
                  style={{
                    padding: "10px 24px",
                    backgroundColor: "#1e293b",
                    borderRadius: "50px",
                    fontSize: 24,
                    border: "1px solid #334155",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {/* Simple circle for bullet */}
                  {skill.evidenceCount > 0 && (
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: "#4ade80",
                        marginRight: 10,
                      }}
                    />
                  )}
                  {skill.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 10,
            opacity: 0.6,
          }}
        >
          <div style={{ fontSize: 20, color: "#cbd5e1" }}>
            Managed via SkillDock
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
