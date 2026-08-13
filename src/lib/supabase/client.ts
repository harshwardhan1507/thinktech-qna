import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const isValidUrl = rawUrl.startsWith("http://") || rawUrl.startsWith("https://");

const supabaseUrl = isValidUrl ? rawUrl : "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

/**
 * Standard Supabase client instance with default session persistence (for /moderator auth & dashboard).
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Dedicated anonymous-only Supabase client instance (for /ask student submissions).
 * Configured with persistSession: false and isolated storageKey to guarantee submissions execute
 * under the 'anon' role without triggering multiple GoTrueClient warnings or inheriting moderator auth.
 */
export const supabaseAnon = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: "sb-anon-client-storage",
  },
});
