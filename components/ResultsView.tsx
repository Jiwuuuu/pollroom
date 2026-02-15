"use client";

import { PollOption } from "@/components/PollOption";
import { useRealtimeResults } from "@/hooks/useRealtimeResults";
import { Loader2, Wifi, WifiOff } from "lucide-react";

interface ResultsViewProps {
  pollId: string;
}

export function ResultsView({ pollId }: ResultsViewProps) {
  const { options, totalVotes, isConnected, isLoading } =
    useRealtimeResults(pollId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-[clamp(1rem,3vw,1.5rem)]">
      <div className="space-y-2">
        {options.map((option) => {
          const percentage =
            totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          return (
            <PollOption
              key={option.id}
              text={option.text}
              votes={option.votes}
              percentage={percentage}
              showResults
            />
          );
        })}
      </div>

      <div className="h-px w-full bg-border" />

      <div className="flex items-center justify-between">
        <span className="text-muted-foreground font-light text-xs tracking-wide">
          {totalVotes} {totalVotes === 1 ? "vote" : "votes"} total
        </span>
        <span className="flex items-center gap-1.5">
          {isConnected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-muted-foreground font-light text-xs tracking-wide">Live</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 text-yellow-500" />
              <span className="text-muted-foreground font-light text-xs tracking-wide">
                Reconnecting...
              </span>
            </>
          )}
        </span>
      </div>
    </div>
  );
}
