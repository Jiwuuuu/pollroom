"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import type { OptionWithVotes, PollResultsResponse } from "@/lib/types";

/** How often to poll when Realtime is not connected (ms) */
const POLL_INTERVAL_MS = 3_000;

interface UseRealtimeResultsReturn {
  options: OptionWithVotes[];
  totalVotes: number;
  isConnected: boolean;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

/**
 * Subscribes to Supabase Realtime INSERT events on the votes table
 * for a specific poll, and re-fetches results whenever a new vote arrives.
 *
 * Falls back to periodic polling when the Realtime WebSocket is not connected.
 */
export function useRealtimeResults(pollId: string): UseRealtimeResultsReturn {
  const [options, setOptions] = useState<OptionWithVotes[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const connectedRef = useRef(false);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch(`/api/polls/${pollId}`);
      if (!res.ok) return;
      const data: PollResultsResponse = await res.json();
      setOptions(data.options);
      setTotalVotes(data.totalVotes);
    } catch {
      // Network error — will retry on next event or poll cycle
    }
  }, [pollId]);

  // Initial fetch
  useEffect(() => {
    setIsLoading(true);
    refetch().finally(() => setIsLoading(false));
  }, [refetch]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`poll-${pollId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "votes",
          filter: `poll_id=eq.${pollId}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe((status) => {
        const connected = status === "SUBSCRIBED";
        connectedRef.current = connected;
        setIsConnected(connected);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pollId, refetch]);

  // Polling fallback: when Realtime is not connected, poll periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (!connectedRef.current) {
        refetch();
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [refetch]);

  return { options, totalVotes, isConnected, isLoading, refetch };
}
