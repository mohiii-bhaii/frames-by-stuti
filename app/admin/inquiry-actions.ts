"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/auth";
import type { InquiryValues } from "@/lib/inquiry";
import { notifyOwnerByEmail } from "@/lib/inquiry-email";
import { getPublishedTexts } from "@/lib/site-texts";

/** Marks an inquiry as read (or unread again). Only the signed-in owner can do this. */
export async function setInquiryRead(formData: FormData) {
  const { supabase } = await requireAdminAction();
  const id = String(formData.get("id") ?? "");
  const read = formData.get("read") === "true";
  if (!/^[0-9a-f-]{36}$/.test(id)) return;
  const { error } = await supabase.from("inquiries").update({ is_read: read }).eq("id", id);
  if (error) console.error("Could not update the inquiry:", error.message);
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
}

/**
 * Sends the notification email for an inquiry again, after it failed or was never set up.
 * Safe to click repeatedly: the inquiry is "claimed" first so only one send can run at a time,
 * an inquiry that was already emailed is never claimed, and the email carries the same
 * Idempotency-Key as the first attempt, so Resend will not deliver a second copy.
 */
export async function resendInquiryEmail(formData: FormData) {
  const { supabase } = await requireAdminAction();
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) return;

  const staleBefore = new Date(Date.now() - 5 * 60_000).toISOString();
  const { data: claimed, error } = await supabase
    .from("inquiries")
    .update({ email_status: "pending", email_error: "", email_attempted_at: new Date().toISOString() })
    .eq("id", id)
    // Only failed or never-sent ones; "pending" counts only if it has been stuck for a while.
    .or(`email_status.in.(failed,not_configured),and(email_status.eq.pending,created_at.lt.${staleBefore})`)
    .select("*")
    .maybeSingle();
  if (error || !claimed) {
    if (error) console.error("Could not start sending the notification again:", error.message);
    revalidatePath("/admin/inquiries");
    return;
  }

  const values: InquiryValues = {
    firstName: claimed.first_name || claimed.name || "",
    lastName: claimed.last_name || "",
    phone: claimed.phone || "",
    email: claimed.email || "",
    sessionType: claimed.session_type || "",
    dueDate: claimed.due_date || claimed.preferred_date || "",
    locationPreference: claimed.location_preference || "",
    location: claimed.location || "",
    preferredDays: claimed.preferred_days || [],
    message: claimed.message || "",
    referral: claimed.referral || "",
  };
  const outcome = await notifyOwnerByEmail(values, await getPublishedTexts(), { idempotencyKey: `inquiry-${id}` });
  const { error: saveError } = await supabase
    .from("inquiries")
    .update({ email_status: outcome.status, email_error: outcome.error.slice(0, 500), email_attempted_at: new Date().toISOString() })
    .eq("id", id);
  if (saveError) console.error("Could not record the notification result:", saveError.message);
  revalidatePath("/admin/inquiries");
}
