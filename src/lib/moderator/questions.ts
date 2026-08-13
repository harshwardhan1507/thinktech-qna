import { supabase } from "@/lib/supabase";
import type { Question } from "@/types";

/**
 * Fetches all questions from Supabase database ordered chronologically by created_at ASC.
 * Requires authenticated session with app_metadata.role = 'moderator'.
 */
export async function fetchModeratorQuestions(): Promise<{
  data: Question[] | null;
  error: Error | null;
}> {
  const { data, error } = await supabase
    .from("questions")
    .select("id, content, status, created_at, displayed_at, answered_at, dismissed_at")
    .order("created_at", { ascending: true });

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: data as Question[], error: null };
}

/**
 * Updates a pending question to 'displayed' status.
 * Conditional update enforces status = 'pending'.
 */
export async function showQuestion(id: string): Promise<{ error: Error | null }> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("questions")
    .update({
      status: "displayed",
      displayed_at: now,
    })
    .eq("id", id)
    .eq("status", "pending")
    .select();

  if (error) {
    return { error: new Error(error.message) };
  }

  if (!data || data.length === 0) {
    return {
      error: new Error(
        "Unable to display question. Another question may already be displayed or this question's status changed."
      ),
    };
  }

  return { error: null };
}

/**
 * Updates a pending question to 'dismissed' status.
 * Conditional update enforces status = 'pending'.
 */
export async function dismissQuestion(id: string): Promise<{ error: Error | null }> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("questions")
    .update({
      status: "dismissed",
      dismissed_at: now,
    })
    .eq("id", id)
    .eq("status", "pending")
    .select();

  if (error) {
    return { error: new Error(error.message) };
  }

  if (!data || data.length === 0) {
    return {
      error: new Error("Unable to dismiss question. The question state may have changed."),
    };
  }

  return { error: null };
}

/**
 * Updates the currently displayed question to 'answered' status.
 * Conditional update enforces status = 'displayed'.
 */
export async function answerQuestion(id: string): Promise<{ error: Error | null }> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("questions")
    .update({
      status: "answered",
      answered_at: now,
    })
    .eq("id", id)
    .eq("status", "displayed")
    .select();

  if (error) {
    return { error: new Error(error.message) };
  }

  if (!data || data.length === 0) {
    return {
      error: new Error("Unable to mark question as answered. Question is no longer displayed."),
    };
  }

  return { error: null };
}

/**
 * Sequential Next Question operation:
 * 1. Answers the currently displayed question (if present).
 * 2. Displays the oldest pending question (if present).
 */
export async function nextQuestion(
  currentDisplayedId?: string,
  oldestPendingId?: string
): Promise<{ error: Error | null }> {
  if (currentDisplayedId) {
    const answerRes = await answerQuestion(currentDisplayedId);
    if (answerRes.error) {
      return { error: answerRes.error };
    }
  }

  if (oldestPendingId) {
    const showRes = await showQuestion(oldestPendingId);
    if (showRes.error) {
      return {
        error: new Error(
          `Current question was marked answered, but displaying next question failed: ${showRes.error.message}`
        ),
      };
    }
  }

  return { error: null };
}
