// ──────────────────────────────────────────────
// PollRoom — Input Validation Utilities
// ──────────────────────────────────────────────

/** UUID v4 format regex */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Maximum length for a poll question */
export const MAX_QUESTION_LENGTH = 500;

/** Maximum length for a poll option */
export const MAX_OPTION_LENGTH = 200;

/**
 * Validate that a string is a valid UUID v4 format.
 */
export function isValidUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

/**
 * Extract the client IP address from request headers.
 * Falls back to "unknown" if no IP can be determined.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Validate that the request Content-Type is application/json.
 */
export function isJsonContentType(request: Request): boolean {
  const contentType = request.headers.get("content-type");
  return contentType?.includes("application/json") ?? false;
}
