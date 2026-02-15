import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { VOTER_COOKIE_NAME, VOTER_COOKIE_MAX_AGE } from "@/lib/constants";
import type { CastVoteResponse, ApiError } from "@/lib/types";

/**
 * Generate or read the voter fingerprint from the HTTP-only cookie.
 */
function getOrCreateFingerprint(request: NextRequest): {
  fingerprint: string;
  isNew: boolean;
} {
  const existing = request.cookies.get(VOTER_COOKIE_NAME)?.value;
  if (existing) {
    return { fingerprint: existing, isNew: false };
  }
  return { fingerprint: crypto.randomUUID(), isNew: true };
}

/**
 * Extract the voter's IP address from request headers.
 */
function getVoterIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<CastVoteResponse | ApiError>> {
  try {
    const { id: pollId } = await params;
    const body = await request.json();
    const { optionId } = body;

    // ── Validation ──────────────────────────────────────
    if (!optionId) {
      return NextResponse.json(
        { error: "Option ID is required" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Verify poll exists
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .select("id")
      .eq("id", pollId)
      .single();

    if (pollError || !poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    // Verify option belongs to this poll
    const { data: option, error: optionError } = await supabase
      .from("options")
      .select("id")
      .eq("id", optionId)
      .eq("poll_id", pollId)
      .single();

    if (optionError || !option) {
      return NextResponse.json(
        { error: "Option not found for this poll" },
        { status: 404 }
      );
    }

    // ── Fingerprint + IP ────────────────────────────────
    const { fingerprint, isNew } = getOrCreateFingerprint(request);
    const voterIp = getVoterIp(request);

    // ── Insert vote ─────────────────────────────────────
    const { error: voteError } = await supabase.from("votes").insert({
      poll_id: pollId,
      option_id: optionId,
      voter_fingerprint: fingerprint,
      voter_ip: voterIp,
    });

    if (voteError) {
      // Unique constraint violation → already voted
      if (
        voteError.code === "23505" ||
        voteError.message?.includes("duplicate") ||
        voteError.message?.includes("unique")
      ) {
        return NextResponse.json(
          { error: "You have already voted on this poll" },
          { status: 409 }
        );
      }

      console.error("Failed to insert vote:", voteError);
      return NextResponse.json(
        { error: "Failed to record vote" },
        { status: 500 }
      );
    }

    // ── Response with cookie ────────────────────────────
    const response = NextResponse.json<CastVoteResponse>(
      { success: true, message: "Vote recorded" },
      { status: 201 }
    );

    // Set or refresh the voter_id cookie
    if (isNew) {
      response.cookies.set(VOTER_COOKIE_NAME, fingerprint, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: VOTER_COOKIE_MAX_AGE,
        path: "/",
      });
    }

    return response;
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
