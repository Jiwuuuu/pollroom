import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  RATE_LIMIT_CREATE_POLL,
  RATE_LIMIT_VOTE,
  RATE_LIMIT_READ,
} from "@/lib/rate-limit";

// ── Helpers ─────────────────────────────────────

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

// ── Proxy ───────────────────────────────────────

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const method = request.method;

  // Only rate-limit API routes
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const ip = getClientIp(request);

  // Choose rate limit config based on route + method
  let config = RATE_LIMIT_READ;
  let bucket = `read:${ip}`;

  if (pathname === "/api/polls" && method === "POST") {
    config = RATE_LIMIT_CREATE_POLL;
    bucket = `create:${ip}`;
  } else if (pathname.endsWith("/vote") && method === "POST") {
    config = RATE_LIMIT_VOTE;
    bucket = `vote:${ip}`;
  }

  const result = checkRateLimit(bucket, config);

  if (!result.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(result.retryAfterSeconds ?? 60),
          "X-RateLimit-Limit": String(config.maxRequests),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // Attach rate-limit headers to the response
  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(config.maxRequests));
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));

  return response;
}

// Only run middleware on API routes
export const config = {
  matcher: "/api/:path*",
};
