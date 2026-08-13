import { supabaseAnon } from "@/lib/supabase";

/**
 * Inserts a new anonymous question into the Supabase database.
 * Uses dedicated supabaseAnon client (persistSession: false) so student
 * submissions execute as 'anon' even if a moderator is logged into the same browser.
 * Note: Uses a write-only INSERT operation without .select() because
 * anonymous student clients are not granted SELECT permission under RLS.
 */
export async function createQuestion(content: string): Promise<{ error: Error | null }> {
  const trimmed = content.trim();

  const { error } = await supabaseAnon
    .from("questions")
    .insert({ content: trimmed });

  if (error) {
    console.error("Supabase question submission error:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return { error: new Error(error.message) };
  }

  return { error: null };
}
