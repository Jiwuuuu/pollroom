import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isValidUUID } from "@/lib/validation";
import type { PollResultsResponse, ApiError } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<PollResultsResponse | ApiError>> {
  try {
    const { id } = await params;

    // ── UUID format validation ──────────────────────────
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid poll ID format" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // ── Fetch poll ──────────────────────────────────────
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .select("id, question, created_at")
      .eq("id", id)
      .single();

    if (pollError || !poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    // ── Fetch options ───────────────────────────────────
    const { data: options, error: optionsError } = await supabase
      .from("options")
      .select("id, text")
      .eq("poll_id", id);

    if (optionsError || !options) {
      return NextResponse.json(
        { error: "Failed to fetch poll options" },
        { status: 500 }
      );
    }

    // ── Count votes per option ──────────────────────────
    const { data: votes, error: votesError } = await supabase
      .from("votes")
      .select("option_id")
      .eq("poll_id", id);

    if (votesError) {
      return NextResponse.json(
        { error: "Failed to fetch votes" },
        { status: 500 }
      );
    }

    // Build vote count map
    const voteCounts = new Map<string, number>();
    for (const vote of votes ?? []) {
      voteCounts.set(vote.option_id, (voteCounts.get(vote.option_id) ?? 0) + 1);
    }

    const totalVotes = votes?.length ?? 0;

    // ── Response ────────────────────────────────────────
    const response: PollResultsResponse = {
      id: poll.id,
      question: poll.question,
      created_at: poll.created_at,
      options: options.map((o) => ({
        id: o.id,
        text: o.text,
        votes: voteCounts.get(o.id) ?? 0,
      })),
      totalVotes,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
