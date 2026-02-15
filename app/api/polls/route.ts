import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MIN_OPTIONS, MAX_OPTIONS, BASE_URL } from "@/lib/constants";
import type { CreatePollRequest, CreatePollResponse, ApiError } from "@/lib/types";

export async function POST(request: NextRequest): Promise<NextResponse<CreatePollResponse | ApiError>> {
  try {
    const body: CreatePollRequest = await request.json();
    const { question, options } = body;

    // ── Validation ──────────────────────────────────────
    const trimmedQuestion = question?.trim();
    if (!trimmedQuestion) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const trimmedOptions = options
      ?.map((o: string) => o.trim())
      .filter(Boolean);

    if (!trimmedOptions || trimmedOptions.length < MIN_OPTIONS) {
      return NextResponse.json(
        { error: `At least ${MIN_OPTIONS} options are required` },
        { status: 400 }
      );
    }

    if (trimmedOptions.length > MAX_OPTIONS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_OPTIONS} options allowed` },
        { status: 400 }
      );
    }

    // Check duplicates (case-insensitive)
    const uniqueOptions = new Set(trimmedOptions.map((o: string) => o.toLowerCase()));
    if (uniqueOptions.size !== trimmedOptions.length) {
      return NextResponse.json(
        { error: "Duplicate options are not allowed" },
        { status: 400 }
      );
    }

    // ── Insert poll ─────────────────────────────────────
    const supabase = createServerSupabaseClient();

    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .insert({ question: trimmedQuestion })
      .select("id, question")
      .single();

    if (pollError || !poll) {
      console.error("Failed to create poll:", pollError);
      return NextResponse.json(
        { error: "Failed to create poll" },
        { status: 500 }
      );
    }

    // ── Insert options ──────────────────────────────────
    const optionRows = trimmedOptions.map((text: string) => ({
      poll_id: poll.id,
      text,
    }));

    const { data: insertedOptions, error: optionsError } = await supabase
      .from("options")
      .insert(optionRows)
      .select("id, text");

    if (optionsError || !insertedOptions) {
      console.error("Failed to create options:", optionsError);
      return NextResponse.json(
        { error: "Failed to create poll options" },
        { status: 500 }
      );
    }

    // ── Response ────────────────────────────────────────
    const response: CreatePollResponse = {
      id: poll.id,
      question: poll.question,
      options: insertedOptions.map((o) => ({ id: o.id, text: o.text })),
      shareUrl: `${BASE_URL}/poll/${poll.id}`,
    };

    return NextResponse.json(response, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
