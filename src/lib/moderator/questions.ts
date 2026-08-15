import { supabase } from "@/lib/supabase";
import type { Question } from "@/types";
import { isValidTransition, type ActionResult } from "@/lib/questions";

/**
 * Fetches all questions from Supabase database ordered chronologically by created_at ASC.
 * Requires authenticated session with app_metadata.role = 'moderator'.
 */
export async function fetchModeratorQuestions(): Promise<ActionResult<Question[]>> {
  const { data, error } = await supabase
    .from("questions")
    .select("id, content, status, created_at, displayed_at, answered_at, dismissed_at")
    .order("created_at", { ascending: true });

  if (error) {
    return {
      success: false,
      code: "DATABASE_ERROR",
      message: `Failed to load questions: ${error.message}`,
    };
  }

  return {
    success: true,
    code: "SUCCESS",
    message: "Questions loaded successfully.",
    data: data as Question[],
  };
}

/**
 * Updates a pending question to 'displayed' status.
 * State machine check: pending -> displayed
 * Conditional update enforces status = 'pending'.
 */
export async function showQuestion(id: string): Promise<ActionResult> {
  if (!isValidTransition("pending", "displayed")) {
    return {
      success: false,
      code: "STALE_STATE",
      message: "Invalid status transition: pending -> displayed is not permitted.",
    };
  }

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
    if (error.code === "23505") {
      return {
        success: false,
        code: "CONFLICT",
        message: "Another question is currently displayed on stage.",
      };
    }
    return {
      success: false,
      code: "DATABASE_ERROR",
      message: error.message,
    };
  }

  if (!data || data.length === 0) {
    return {
      success: false,
      code: "STALE_STATE",
      message: "This question has already been handled or is no longer pending.",
    };
  }

  return {
    success: true,
    code: "SUCCESS",
    message: "Question is now displayed on stage.",
  };
}

/**
 * Atomic Show Question Now operation:
 * Invokes public.show_question_now(question_id) RPC in PostgreSQL with row locking.
 * Atomically marks current displayed question as answered (if present) and target pending question as displayed.
 */
export async function showQuestionNow(id: string): Promise<ActionResult> {
  const { data, error } = await supabase.rpc("show_question_now", {
    question_id: id,
  });

  if (error) {
    return {
      success: false,
      code: "DATABASE_ERROR",
      message: `Show question now failed: ${error.message}`,
    };
  }

  const result = data as {
    status?: "success" | "not_found" | "stale_state";
    displayed_question_id?: string | null;
    answered_question_id?: string | null;
  } | null;

  if (result?.status === "not_found") {
    return {
      success: false,
      code: "NOT_FOUND",
      message: "This question could not be found.",
    };
  }

  if (result?.status === "stale_state") {
    return {
      success: false,
      code: "STALE_STATE",
      message: "This question has already been updated. Refreshing the queue...",
    };
  }

  return {
    success: true,
    code: "SUCCESS",
    message: "Question is now displayed on stage.",
  };
}

/**
 * Updates a pending question to 'dismissed' status.
 * State machine check: pending -> dismissed
 * Conditional update enforces status = 'pending'.
 */
export async function dismissQuestion(id: string): Promise<ActionResult> {
  if (!isValidTransition("pending", "dismissed")) {
    return {
      success: false,
      code: "STALE_STATE",
      message: "Invalid status transition: pending -> dismissed is not permitted.",
    };
  }

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
    return {
      success: false,
      code: "DATABASE_ERROR",
      message: error.message,
    };
  }

  if (!data || data.length === 0) {
    return {
      success: false,
      code: "STALE_STATE",
      message: "This question is no longer pending.",
    };
  }

  return {
    success: true,
    code: "SUCCESS",
    message: "Question dismissed.",
  };
}

/**
 * Updates the currently displayed question to 'answered' status.
 * State machine check: displayed -> answered
 * Conditional update enforces status = 'displayed'.
 */
export async function answerQuestion(id: string): Promise<ActionResult> {
  if (!isValidTransition("displayed", "answered")) {
    return {
      success: false,
      code: "STALE_STATE",
      message: "Invalid status transition: displayed -> answered is not permitted.",
    };
  }

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
    return {
      success: false,
      code: "DATABASE_ERROR",
      message: error.message,
    };
  }

  if (!data || data.length === 0) {
    return {
      success: false,
      code: "STALE_STATE",
      message: "This question is no longer displayed on stage.",
    };
  }

  return {
    success: true,
    code: "SUCCESS",
    message: "Question marked as answered.",
  };
}

/**
 * Atomic Next Question operation:
 * Invokes public.next_question() RPC in PostgreSQL with row locking and transaction safety.
 */
export async function nextQuestion(): Promise<ActionResult> {
  const { data, error } = await supabase.rpc("next_question");

  if (error) {
    return {
      success: false,
      code: "DATABASE_ERROR",
      message: `Next question failed: ${error.message}`,
    };
  }

  const result = data as {
    status?: string;
    displayed_question_id?: string | null;
    answered_question_id?: string | null;
  } | null;

  if (result?.status === "no_pending") {
    return {
      success: true,
      code: "NO_PENDING",
      message: "Current question answered. No pending questions remain in queue.",
    };
  }

  return {
    success: true,
    code: "SUCCESS",
    message: "Advanced to next question.",
  };
}
