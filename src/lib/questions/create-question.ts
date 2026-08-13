import { supabase } from "@/lib/supabase";

/**
 * Inserts a new anonymous question into the Supabase database.
 * Note: Uses a write-only INSERT operation without .select() because
 * anonymous student clients are not granted SELECT permission under RLS.
 */
export async function createQuestion(content: string): Promise<{ error: Error | null }> {
  const trimmed = content.trim();

  const { error } = await supabase
    .from("questions")
    .insert({ content: trimmed });

  if (error) {
    return { error: new Error(error.message) };
  }

  return { error: null };
}
