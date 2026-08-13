import { supabaseAnon } from "@/lib/supabase";
import {
  containsProfanity,
  isDuplicateSubmission,
  checkRateLimit,
  recordSuccessfulSubmission,
} from "@/lib/safety";

/**
 * Inserts a new anonymous question into the Supabase database.
 * Executes safety pipeline: normalization -> length validation -> rate limit -> profanity -> duplicate check -> DB INSERT.
 * Uses dedicated supabaseAnon client (persistSession: false) to guarantee submissions execute as 'anon'.
 */
export async function createQuestion(content: string): Promise<{ error: Error | null }> {
  const trimmed = content.trim();

  // 1. Validation: Empty check
  if (!trimmed) {
    return { error: new Error("Please enter a question.") };
  }

  // 2. Validation: Length boundaries (3 <= length <= 500)
  if (trimmed.length < 3) {
    return { error: new Error("Your question must be at least 3 characters.") };
  }
  if (trimmed.length > 500) {
    return { error: new Error("Your question must be 500 characters or less.") };
  }

  // 3. Safety: Rate limit check (max 1 submission per 10 seconds)
  const rateLimit = checkRateLimit(10);
  if (!rateLimit.allowed) {
    return { error: new Error("Please wait before submitting another question.") };
  }

  // 4. Safety: Profanity check
  if (containsProfanity(trimmed)) {
    return { error: new Error("Please keep questions respectful.") };
  }

  // 5. Safety: Duplicate detection check (60s window)
  if (isDuplicateSubmission(trimmed, 60)) {
    return { error: new Error("This question was already submitted.") };
  }

  // 6. Database INSERT using anonymous client
  const { error } = await supabaseAnon
    .from("questions")
    .insert({ content: trimmed });

  if (error) {
    console.error("Supabase question submission error:", error.message || error);
    return { error: new Error("Unable to submit your question right now. Please try again.") };
  }

  // Record submission timestamp for client rate limiter
  recordSuccessfulSubmission();

  return { error: null };
}
