import { supabase } from "@/lib/supabase";
import type { DisplayedQuestion } from "@/types";
import type { ActionResult } from "@/lib/questions";

/**
 * Public display data access helper.
 * Calls public.get_displayed_question() RPC in PostgreSQL.
 * Returns only the active displayed question (if present) or null.
 * Safe for anonymous public execution.
 */
export async function getDisplayedQuestion(): Promise<ActionResult<DisplayedQuestion | null>> {
  if (process.env.NODE_ENV === "development") {
    console.debug("[DISPLAY API] RPC get_displayed_question executing", {
      timestamp: Date.now(),
    });
  }

  const { data, error } = await supabase.rpc("get_displayed_question");

  if (error) {
    return {
      success: false,
      code: "DATABASE_ERROR",
      message: "Unable to load the current question. Please refresh this display.",
      data: null,
    };
  }

  return {
    success: true,
    code: "SUCCESS",
    message: "Displayed question loaded successfully.",
    data: (data as DisplayedQuestion | null) || null,
  };
}
