import "server-only";
import { textDefaults } from "@/content/texts";
import type { InquiryValues } from "@/lib/inquiry";
import type { TextMap } from "@/lib/site-texts";

/**
 * Emails the owner a copy of each new inquiry, through Resend (resend.com).
 * Turned on by two environment variables:
 *
 *   RESEND_API_KEY         an API key from Resend
 *   INQUIRY_NOTIFY_EMAIL   where to send the notifications
 *   INQUIRY_FROM_EMAIL     optional sender. Defaults to Resend's test sender,
 *                          which can only deliver to the email address the
 *                          Resend account was created with.
 *
 * Without the first two, nothing is sent. A failure here never affects the
 * visitor: the inquiry is already saved before this runs.
 */
const DEFAULT_FROM = "Frames by Stuti <onboarding@resend.dev>";

/** One line, no control characters, so a visitor's words can't add email headers. */
const oneLine = (value: string, max = 120) => value.replace(/[\r\n\u0000-\u001f]+/g, " ").trim().slice(0, max);

export function isEmailConfigured(env: Record<string, string | undefined> = process.env) {
  return Boolean(env.RESEND_API_KEY && env.INQUIRY_NOTIFY_EMAIL);
}

export function buildInquiryEmail(values: InquiryValues, texts: TextMap, env: Record<string, string | undefined> = process.env) {
  const sessionKey = values.sessionType === "other" ? "form.sessionType.other" : `category.${values.sessionType}`;
  const session = texts[sessionKey] ?? textDefaults[sessionKey] ?? values.sessionType;
  // Lines the visitor left blank are null and dropped; "" is a deliberate blank line.
  const optional = (label: string, value: string, max = 120) => (value.trim() ? `${label}: ${oneLine(value, max)}` : null);
  const lines: (string | null)[] = [
    `New inquiry from ${oneLine(values.name)}`,
    "",
    `Session type: ${session}`,
    `Email: ${oneLine(values.email, 254)}`,
    optional("Phone", values.phone, 40),
    optional("Instagram", values.instagram, 60),
    optional("Location", values.location),
    optional("Preferred date", values.preferredDate, 10),
    optional("Heard about you via", values.referral, 40),
    "",
    values.message.trim() ? `Message:\n${values.message.trim()}` : "(No message)",
    "",
    "Reply to this email to answer them directly. All inquiries are also in your dashboard at /admin/inquiries.",
  ];

  return {
    from: env.INQUIRY_FROM_EMAIL || DEFAULT_FROM,
    to: [env.INQUIRY_NOTIFY_EMAIL!],
    // Replying goes to the customer, not back to the website.
    reply_to: oneLine(values.email, 254),
    subject: `New inquiry: ${oneLine(values.name, 60)} (${session})`,
    text: lines.filter((line): line is string => line !== null).join("\n"),
  };
}

export async function sendInquiryEmail(
  values: InquiryValues,
  texts: TextMap,
  { env = process.env, fetcher = fetch }: { env?: Record<string, string | undefined>; fetcher?: typeof fetch } = {},
) {
  if (!isEmailConfigured(env)) return { sent: false as const, reason: "not configured" };
  const response = await fetcher("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(buildInquiryEmail(values, texts, env)),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    // Resend explains itself, for example an unverified sender or a wrong recipient.
    throw new Error(`Resend refused the notification (${response.status}): ${(await response.text()).slice(0, 300)}`);
  }
  return { sent: true as const };
}
