/**
 * Isolated profanity filtering module for ThinkTech Q&A.
 * Provides lightweight blocklist checking without blocking normal technical terminology.
 */

// Isolated blocklist of obvious inappropriate terms
const PROFANITY_BLOCKLIST = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "bastard",
  "crap",
  "dick",
  "pussy",
  "whore",
  "slut",
  "nigger",
  "faggot",
];

export function containsProfanity(text: string): boolean {
  if (!text) return false;

  // Normalize: lowercased, strip non-alphanumeric except spaces
  const normalized = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = normalized.split(" ");

  return words.some((word) => PROFANITY_BLOCKLIST.includes(word));
}
