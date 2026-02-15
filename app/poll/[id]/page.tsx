"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { VotingView } from "@/components/VotingView";
import { ResultsView } from "@/components/ResultsView";
import { ShareLink } from "@/components/ShareLink";
import { useVoterIdentity } from "@/hooks/useVoterIdentity";
import { Loader2 } from "lucide-react";
import type { PollResultsResponse } from "@/lib/types";

export default function PollPage() {
  const { id } = useParams<{ id: string }>();
  const { hasVoted, isChecking, markVoted } = useVoterIdentity(id);
  const [poll, setPoll] = useState<PollResultsResponse | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPoll() {
      try {
        const res = await fetch(`/api/polls/${id}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) return;
        const data: PollResultsResponse = await res.json();
        setPoll(data);
      } catch {
        // Network error
      } finally {
        setIsLoading(false);
      }
    }
    fetchPoll();
  }, [id]);

  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="py-24 space-y-4">
        <span className="text-muted-foreground font-light text-sm tracking-[0.3em] uppercase block">
          Not Found
        </span>
        <h1
          className="font-extrabold leading-[0.95] tracking-tight text-foreground"
          style={{ fontSize: "clamp(1.5rem, 5vw, 2.5rem)" }}
        >
          This poll doesn&apos;t exist.
        </h1>
        <p
          className="text-muted-foreground font-light"
          style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}
        >
          The link may be invalid or the poll has been removed.
        </p>
        <div className="h-px w-16 bg-primary/30" />
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="py-24 space-y-4">
        <span className="text-muted-foreground font-light text-sm tracking-[0.3em] uppercase block">
          Error
        </span>
        <h1
          className="font-extrabold leading-[0.95] tracking-tight text-foreground"
          style={{ fontSize: "clamp(1.5rem, 5vw, 2.5rem)" }}
        >
          Something went wrong.
        </h1>
        <p
          className="text-muted-foreground font-light"
          style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}
        >
          Failed to load the poll. Please try again.
        </p>
      </div>
    );
  }

  const showResults = hasVoted === true;

  return (
    <div className="space-y-[clamp(1.5rem,4vw,2.5rem)]">
      {/* Poll header */}
      <div className="space-y-3">
        <span className="text-muted-foreground font-light text-xs tracking-[0.2em] uppercase block">
          {showResults ? "Results" : "Cast your vote"}
        </span>
        <h1
          className="font-extrabold leading-[0.95] tracking-tight text-foreground"
          style={{ fontSize: "clamp(1.5rem, 5vw, 2.5rem)" }}
        >
          {poll.question}
        </h1>
        <div className="h-px w-16 bg-primary/30" />
      </div>

      {/* Vote or Results */}
      {showResults ? (
        <ResultsView pollId={id} />
      ) : (
        <VotingView
          pollId={id}
          options={poll.options}
          onVoted={markVoted}
        />
      )}

      {/* Share */}
      <ShareLink pollId={id} />
    </div>
  );
}
