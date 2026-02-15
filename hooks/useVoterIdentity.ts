"use client";

import { useEffect, useState } from "react";
import { VOTER_COOKIE_NAME } from "@/lib/constants";

/**
 * Reads the voter_id from the HTTP-only cookie.
 * Since HTTP-only cookies are not accessible via JS, this hook
 * calls a lightweight endpoint or checks if the cookie was set
 * by observing whether the user has already voted.
 *
 * For now, the fingerprint is managed server-side via cookies.
 * This hook provides a client-side "hasVoted" check per poll.
 */
export function useVoterIdentity(pollId: string) {
  const [hasVoted, setHasVoted] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check localStorage for a client-side record of voting
    const votedPolls = getVotedPolls();
    const voted = votedPolls.includes(pollId);
    setHasVoted(voted);
    setIsChecking(false);
  }, [pollId]);

  /** Mark this poll as voted in localStorage */
  const markVoted = () => {
    const votedPolls = getVotedPolls();
    if (!votedPolls.includes(pollId)) {
      votedPolls.push(pollId);
      localStorage.setItem(VOTER_COOKIE_NAME, JSON.stringify(votedPolls));
    }
    setHasVoted(true);
  };

  return { hasVoted, isChecking, markVoted };
}

function getVotedPolls(): string[] {
  try {
    const raw = localStorage.getItem(VOTER_COOKIE_NAME);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}
