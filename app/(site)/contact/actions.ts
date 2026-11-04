"use server";

import {
  inquiryFields,
  isoDate,
  validateInquiry,
  type InquiryState,
  type InquiryValues,
} from "@/lib/inquiry";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/server";

/** A form filled in faster than a person can is a bot. */
const MIN_FILL_MS = 2500;

/**
 * Validates an inquiry and stores it in Supabase, where only the signed-in
 * owner can read it. If CONTACT_WEBHOOK_URL is set, the inquiry is also
 * forwarded there as JSON (for example to an email or automation service), but
 * the visitor's inquiry counts as received once it is saved.
 */
export async function submitInquiry(
  _previous: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  // Hidden from people. Pretend success so bots don't retry.
  if (formData.get("company")) return { status: "sent" };
  const startedAt = Number(formData.get("startedAt"));
  if (startedAt && Date.now() - startedAt < MIN_FILL_MS) return { status: "sent" };

  const values = Object.fromEntries(
    inquiryFields.map((field) => {
      const value = formData.get(field);
      return [field, typeof value === "string" ? value : ""];
    }),
  ) as InquiryValues;

  // A day of slack so the visitor's own time zone never rejects "today".
  const errors = validateInquiry(values, isoDate(new Date(Date.now() - 24 * 60 * 60 * 1000)));
  if (Object.keys(errors).length > 0) return { status: "invalid", errors };

  if (!isSupabaseConfigured) {
    return { status: "error", message: "The inquiry form isn't connected yet. Please email me directly instead." };
  }

  const { error } = await createPublicClient().rpc("submit_inquiry", {
    p_name: values.name,
    p_email: values.email,
    p_phone: values.phone,
    p_instagram: values.instagram,
    p_session_type: values.sessionType,
    p_referral: values.referral,
    p_location: values.location,
    p_message: values.message,
    p_preferred_date: values.preferredDate || null,
  });
  if (error) {
    console.error("Could not save inquiry:", error.message);
    // The database words its own limits for people, for example "Too many inquiries right now".
    return {
      status: "error",
      message: error.code === "P0001" ? error.message : "Sorry, your inquiry couldn't be sent. Please try again, or email me directly.",
    };
  }

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
