// ──────────────────────────────────────────────
// PollRoom — Shared TypeScript Interfaces
// ──────────────────────────────────────────────

/** Database row: polls table */
export interface Poll {
  id: string;
  question: string;
  created_at: string;
}

/** Database row: options table */
export interface PollOption {
  id: string;
  poll_id: string;
  text: string;
}

/** Database row: votes table */
export interface Vote {
  id: string;
  poll_id: string;
  option_id: string;
  voter_fingerprint: string;
  voter_ip: string | null;
  created_at: string;
}

/** Option with aggregated vote count (used in API responses) */
export interface OptionWithVotes {
  id: string;
  text: string;
  votes: number;
}

/** POST /api/polls — request body */
export interface CreatePollRequest {
  question: string;
  options: string[];
}

/** POST /api/polls — response body */
export interface CreatePollResponse {
  id: string;
  question: string;
  options: { id: string; text: string }[];
  shareUrl: string;
}

/** GET /api/polls/[id] — response body */
export interface PollResultsResponse {
  id: string;
  question: string;
  created_at: string;
  options: OptionWithVotes[];
  totalVotes: number;
}

/** POST /api/polls/[id]/vote — request body */
export interface CastVoteRequest {
  optionId: string;
  fingerprint: string;
}

/** POST /api/polls/[id]/vote — response body */
export interface CastVoteResponse {
  success: boolean;
  message: string;
}

/** Standard API error response */
export interface ApiError {
  error: string;
}
