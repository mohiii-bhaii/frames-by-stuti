import "server-only";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSessionClient } from "@/lib/supabase/server";

export type Admin = { id: string; email: string };

/**
 * The data access layer for editing. Verifies the session's JWT with Supabase
 * and checks the admin allowlist in the database. Returns null for anyone else.
 */
export async function getAdminSession() {
  if (!isSupabaseConfigured) return null;
  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) return null;

  const { data: isAdmin, error: allowlistError } = await supabase.rpc("is_admin");
  if (allowlistError || isAdmin !== true) return null;

  const admin: Admin = { id: claims.sub, email: typeof claims.email === "string" ? claims.email : "" };
  return { admin, supabase };
}

/** For admin pages: sends anyone who isn't an allowlisted admin to the login page. */
export async function requireAdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export class NotAuthorisedError extends Error {
  constructor() {
    super("Your session has ended. Please log in again.");
  }
}

/** For Server Actions: every action re-checks the session rather than trusting the page. */
export async function requireAdminAction() {
  const session = await getAdminSession();
  if (!session) throw new NotAuthorisedError();
  return session;
}
