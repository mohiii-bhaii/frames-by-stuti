"use server";

import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { pricingPaths } from "@/content/pricing";
import { getAdminSession } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSessionClient } from "@/lib/supabase/server";

export type LoginState = { error?: string; email?: string };

const sitePaths = new Set(["/", "/about", "/portfolio", "/services", "/contact", ...pricingPaths]);

export async function signIn(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!isSupabaseConfigured) return { email, error: "The editor isn't connected to Supabase yet. See README." };
  if (!email || !password) return { email, error: "Enter your email address and password." };

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { email, error: "That email address and password don't match. Please try again." };

  // Signing in isn't enough: the account must also be on the admin allowlist.
  if (!(await getAdminSession())) {
    await supabase.auth.signOut();
    return { email, error: "This account isn't allowed to edit the website." };
  }
  redirect("/admin");
}

export async function signOut() {
  (await draftMode()).disable();
  if (isSupabaseConfigured) await (await createSessionClient()).auth.signOut();
  redirect("/admin/login");
}

/** Turns on edit mode for this browser and opens the chosen page of the real site. */
export async function openEditor(formData: FormData) {
  if (!(await getAdminSession())) redirect("/admin/login");
  const requested = String(formData.get("path") ?? "/");
  (await draftMode()).enable();
  redirect(sitePaths.has(requested) ? requested : "/");
}

/** Leaves edit mode. The site then looks exactly as visitors see it. */
export async function closeEditor() {
  (await draftMode()).disable();
  redirect("/admin");
}
