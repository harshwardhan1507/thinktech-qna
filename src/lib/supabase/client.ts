import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const isValidUrl = rawUrl.startsWith("http://") || rawUrl.startsWith("https://");

const supabaseUrl = isValidUrl ? rawUrl : "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
