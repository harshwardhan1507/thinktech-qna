/**
 * Duplicate question detection module for ThinkTech Q&A.
 * Checks normalized content against a rolling memory window (default 60s).
 * Note: Used for immediate client/API UX feedback.
 */

interface RecentSubmission {
  normalized: string;
  timestamp: number;
}

const recentSubmissions: RecentSubmission[] = [];

export function normalizeQuestionText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function isDuplicateSubmission(text: string, windowSeconds = 60): boolean {
  const normalized = normalizeQuestionText(text);
  const now = Date.now();
  const cutoff = now - windowSeconds * 1000;

  // Prune expired submissions
  for (let i = recentSubmissions.length - 1; i >= 0; i--) {
    if (recentSubmissions[i].timestamp < cutoff) {
      recentSubmissions.splice(i, 1);
    }
  }

  // Check if normalized matches any recent submission
  const match = recentSubmissions.some((item) => item.normalized === normalized);

  if (!match) {
    recentSubmissions.push({ normalized, timestamp: now });
  }

  return match;
}

export function clearDuplicateHistory(): void {
  recentSubmissions.length = 0;
}
