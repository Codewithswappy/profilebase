/**
 * Simple in-memory rate limiter for API routes
 * 
 * Note: This is per-instance. In a serverless environment with multiple
 * instances, consider using Upstash Redis for distributed rate limiting.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  
  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Check if a request should be rate limited
 * 
 * @param identifier - Unique identifier (usually IP address or user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result with success status and metadata
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { limit: 60, windowSeconds: 60 }
): RateLimitResult {
  cleanupExpiredEntries();
  
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const key = identifier;
  
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    // First request or window expired - create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetInSeconds: config.windowSeconds,
    };
  }
  
  // Window still active
  if (entry.count >= config.limit) {
    // Rate limit exceeded
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetInSeconds: Math.ceil((entry.resetTime - now) / 1000),
    };
  }
  
  // Increment count
  entry.count++;
  
  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    resetInSeconds: Math.ceil((entry.resetTime - now) / 1000),
  };
}

/**
 * Get client IP from request headers
 * Works with Vercel, Cloudflare, and direct connections
 */
export function getClientIp(request: Request): string {
  // Vercel
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  
  // Cloudflare
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  // Real IP header (nginx, etc.)
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  
  // Fallback
  return "unknown";
}
