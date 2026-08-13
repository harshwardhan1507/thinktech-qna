import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

/**
 * Signs in a moderator using email & password via Supabase Auth.
 */
export async function signInModerator(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { session: null, user: null, error: new Error(error.message) };
  }

  // Verify that the signed in user possesses app_metadata.role = 'moderator'
  const isModerator = data.session?.user?.app_metadata?.role === "moderator";

  if (!isModerator) {
    // Sign out immediately if user is not authorized as a moderator
    await supabase.auth.signOut();
    return {
      session: null,
      user: null,
      error: new Error("Unauthorized: Account does not have moderator privileges."),
    };
  }

  return { session: data.session, user: data.user, error: null };
}

/**
 * Signs out the active moderator.
 */
export async function signOutModerator() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: new Error(error.message) };
  }
  return { error: null };
}

/**
 * Helper to check if a session possesses the 'moderator' role in app_metadata.
 */
export function isModeratorSession(session: Session | null): boolean {
  if (!session || !session.user) return false;
  return session.user.app_metadata?.role === "moderator";
}
