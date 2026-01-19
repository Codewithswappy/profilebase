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

  const { profile, projects, profileCompleteness } = result.data;

  // Get top 3 projects to display
  const displayProjects = projects.slice(0, 3);

  // Get all tech from projects
  const allTech = [...new Set(projects.flatMap((p) => p.techStack || []))];

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
          backgroundColor: "#0f172a",
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
              Developer Portfolio
            </div>
          )}

          {displayProjects.length > 0 && (
            <div style={{ display: "flex", gap: "20px" }}>
              {displayProjects.map((project) => (
                <div
                  key={project.id}
                  style={{
                    padding: "10px 24px",
                    backgroundColor: "#1e293b",
                    borderRadius: "12px",
                    fontSize: 22,
                    border: "1px solid #334155",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {project.title}
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: 30,
              marginTop: 40,
              fontSize: 18,
              color: "#64748b",
            }}
          >
            <span>{profileCompleteness.projectCount} Projects</span>
            <span>•</span>
            <span>{allTech.length} Technologies</span>
          </div>
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
            SkillProof Portfolio
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
