"use server";

import {
  inquiryFields,
  validateInquiry,
  type InquiryState,
  type InquiryValues,
} from "@/lib/inquiry";

/**
 * Validates an inquiry and forwards it as JSON to CONTACT_WEBHOOK_URL, which
 * can point at a form service, automation tool or CRM. Until that is set, the
 * visitor is told plainly to use email, so no inquiry is silently lost.
 */
export async function submitInquiry(
  _previous: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  // Hidden from people. Pretend success so bots don't retry.
  if (formData.get("company")) return { status: "sent" };

  const values = Object.fromEntries(
    inquiryFields.map((field) => {
      const value = formData.get(field);
      return [field, typeof value === "string" ? value : ""];
    }),
  ) as InquiryValues;

  const errors = validateInquiry(values);
  if (Object.keys(errors).length > 0) return { status: "invalid", errors };

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (!webhook) return { status: "undelivered" };

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
      signal: AbortSignal.timeout(10_000),
    });
    return response.ok ? { status: "sent" } : { status: "undelivered" };
  } catch {
    return { status: "undelivered" };
  }
}
