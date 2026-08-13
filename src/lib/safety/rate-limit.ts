/**
 * Rate limiting module for anonymous student question submissions.
 * Limits submissions to max 1 per 10 seconds per client instance.
 * Note: Client-side rate limiting provides immediate UX feedback.
 * Backend RLS and PostgreSQL triggers protect database integrity.
 */

let lastSubmissionTimestamp = 0;

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function checkRateLimit(minIntervalSeconds = 10): RateLimitResult {
  const now = Date.now();
  const elapsedSeconds = (now - lastSubmissionTimestamp) / 1000;

  if (lastSubmissionTimestamp > 0 && elapsedSeconds < minIntervalSeconds) {
    const retryAfterSeconds = Math.ceil(minIntervalSeconds - elapsedSeconds);
    return {
      allowed: false,
      retryAfterSeconds,
    };
  }

  return {
    allowed: true,
    retryAfterSeconds: 0,
  };
}

export function recordSuccessfulSubmission(): void {
  lastSubmissionTimestamp = Date.now();
}

export function resetRateLimit(): void {
  lastSubmissionTimestamp = 0;
}
