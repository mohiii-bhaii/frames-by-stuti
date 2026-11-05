"use server";

import {
  dueDateSessions,
  validateInquiry,
  weekdays,
  type InquiryState,
  type InquiryValues,
} from "@/lib/inquiry";
import { notifyOwnerByEmail } from "@/lib/inquiry-email";
import { getPublishedTexts } from "@/lib/site-texts";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/server";

/** A form filled in faster than a person can is a bot. */
const MIN_FILL_MS = 2500;

/**
 * Validates an inquiry and stores it in Supabase, where only the signed-in
 * owner can read it. It is then emailed to the owner (see lib/inquiry-email.ts;
 * the result, including "not set up", is recorded with the inquiry), and forwarded as JSON to
 * CONTACT_WEBHOOK_URL if that is set. The inquiry counts as received once it
 * is saved, whatever happens after.
 */
export async function submitInquiry(
  _previous: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  // Hidden from people. Pretend success so bots don't retry.
  if (formData.get("company")) return { status: "sent" };
  const startedAt = Number(formData.get("startedAt"));
  if (startedAt && Date.now() - startedAt < MIN_FILL_MS) return { status: "sent" };

  const text = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  const days = formData.getAll("preferredDays").filter((day): day is string => typeof day === "string");
  const values: InquiryValues = {
    firstName: text("firstName"),
    lastName: text("lastName"),
    phone: text("phone"),
    email: text("email"),
    sessionType: text("sessionType"),
    // Only newborn and maternity sessions have a due date.
    dueDate: dueDateSessions.includes(text("sessionType")) ? text("dueDate") : "",
    locationPreference: text("locationPreference"),
    location: text("location"),
    // In week order, each day once.
    preferredDays: weekdays.filter((day) => days.includes(day)),
    message: text("message"),
    referral: text("referral"),
  };
  // Sent by the form so a repeat of the same submission can be recognised.
  const token = /^[0-9a-f-]{36}$/i.test(text("token")) ? text("token") : null;

  const errors = validateInquiry(values);
  if (Object.keys(errors).length > 0) return { status: "invalid", errors };

  if (!isSupabaseConfigured) {
    return { status: "error", message: "The inquiry form isn't connected yet. Please email me directly instead." };
  }

  const supabase = createPublicClient();
  const { data: savedId, error } = await supabase.rpc("submit_inquiry", {
    p_token: token,
    p_first_name: values.firstName,
    p_last_name: values.lastName,
    p_phone: values.phone,
    p_email: values.email,
    p_session_type: values.sessionType,
    p_due_date: values.dueDate || null,
    p_location_preference: values.locationPreference,
    p_location: values.location,
    p_preferred_days: values.preferredDays,
    p_message: values.message,
    p_referral: values.referral,
  });
  if (error) {
    console.error("Could not save inquiry:", error.message);
    // The database words its own limits for people, for example "Too many inquiries right now".
    return {
      status: "error",
      message: error.code === "P0001" ? error.message : "Sorry, your inquiry couldn't be sent. Please try again, or email me directly.",
    };
  }

  // The database returns nothing for a repeat of a submission it already saved. Say thanks, but don't notify twice.
  if (!savedId) return { status: "sent" };

  // The inquiry is saved, so the visitor is told thanks whatever happens next. The email is attempted,
  // logged loudly if it cannot be sent, and its result is recorded with the inquiry (see the dashboard).
  const emailOutcome = await notifyOwnerByEmail(values, await getPublishedTexts(), { idempotencyKey: `inquiry-${savedId}` });
  const { error: recordError } = await supabase.rpc("record_inquiry_email", {
    p_id: savedId,
    p_token: token,
    p_status: emailOutcome.status,
    p_error: emailOutcome.error,
  });
  if (recordError) console.error("Could not record the email status for the inquiry:", recordError.message);

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        signal: AbortSignal.timeout(10_000),
      });
    } catch (webhookError) {
      // The inquiry is already saved, so a failed notification must not fail the visit.
      console.error("Inquiry notification failed:", webhookError);
    }
  }
  return { status: "sent" };
}
