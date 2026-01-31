import { trackInteraction } from "@/lib/analytics";
import { rateLimit, getClientIp } from "@/lib/utils/rate-limit";
import { NextRequest, NextResponse } from "next/server";

// Rate limit: 60 requests per minute per IP
const RATE_LIMIT_CONFIG = { limit: 60, windowSeconds: 60 };

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const clientIp = getClientIp(req);
    const rateLimitResult = rateLimit(`interaction:${clientIp}`, RATE_LIMIT_CONFIG);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(rateLimitResult.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateLimitResult.resetInSeconds),
            "Retry-After": String(rateLimitResult.resetInSeconds),
          }
        }
      );
    }

    const { slug, type, itemId } = await req.json();

    if (!slug || !type || !itemId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await trackInteraction(slug, type, itemId);

    return NextResponse.json(
      { success: true },
      {
        headers: {
          "X-RateLimit-Limit": String(rateLimitResult.limit),
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": String(rateLimitResult.resetInSeconds),
        }
      }
    );
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

