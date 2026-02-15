"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PollOption } from "@/components/PollOption";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { OptionWithVotes, ApiError } from "@/lib/types";

interface VotingViewProps {
  pollId: string;
  options: OptionWithVotes[];
  onVoted: () => void;
}

export function VotingView({ pollId, options, onVoted }: VotingViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async () => {
    if (!selectedId) {
      toast.error("Please select an option.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId: selectedId }),
      });

      if (res.status === 409) {
        toast.error("You have already voted on this poll.");
        onVoted();
        return;
      }

      if (!res.ok) {
        const err: ApiError = await res.json();
        toast.error(err.error || "Failed to submit vote.");
        return;
      }

      toast.success("Vote recorded!");
      onVoted();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-[clamp(1rem,3vw,1.5rem)]">
      <div className="space-y-2">
        {options.map((option) => (
          <PollOption
            key={option.id}
            text={option.text}
            isSelected={selectedId === option.id}
            onClick={() => setSelectedId(option.id)}
            disabled={isSubmitting}
          />
        ))}
      </div>

      <Button
        onClick={handleVote}
        disabled={!selectedId || isSubmitting}
        className="w-full h-12 font-extrabold tracking-wide uppercase text-sm"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          "Vote"
        )}
      </Button>
    </div>
  );
}
