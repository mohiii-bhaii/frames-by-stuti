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
const DEFAULT_ENDPOINT = "https://api.resend.com/emails";

/** One line, no control characters, so a visitor's words can't add email headers. */
const oneLine = (value: string, max = 120) => value.replace(/[\r\n\u0000-\u001f]+/g, " ").trim().slice(0, max);

export function isEmailConfigured(env: Record<string, string | undefined> = process.env) {
  return missingEmailSettings(env).length === 0;
}

/** The names (never the values) of the settings that are still needed for notifications. */
export function missingEmailSettings(env: Record<string, string | undefined> = process.env) {
  return ["RESEND_API_KEY", "INQUIRY_NOTIFY_EMAIL"].filter((name) => !env[name]?.trim());
}

export function buildInquiryEmail(values: InquiryValues, texts: TextMap, env: Record<string, string | undefined> = process.env) {
  const sessionKey = `form.session.${values.sessionType}`;
  const session = texts[sessionKey] ?? textDefaults[sessionKey] ?? values.sessionType;
  const name = oneLine(`${values.firstName} ${values.lastName}`);
  // Lines the visitor left blank are null and dropped; "" is a deliberate blank line.
  const optional = (label: string, value: string, max = 120) => (value.trim() ? `${label}: ${oneLine(value, max)}` : null);
  const lines: (string | null)[] = [
    `New inquiry from ${name}`,
    "",
    `Session type: ${session}`,
    optional("Due date", values.dueDate, 10),
    `Phone: ${oneLine(values.phone, 40)}`,
    `Email: ${oneLine(values.email, 254)}`,
    optional("Location preference", values.locationPreference, 20),
    optional("City or area", values.location),
    `Days that work best: ${values.preferredDays.join(", ")}`,
    optional("Heard about you via", values.referral, 40),
    "",
    `Message:\n${values.message.trim()}`,
    "",
    "Reply to this email to answer them directly. All inquiries are also in your dashboard at /admin/inquiries.",
  ];

  return {
    from: env.INQUIRY_FROM_EMAIL || DEFAULT_FROM,
    to: [env.INQUIRY_NOTIFY_EMAIL!],
    // Replying goes to the customer, not back to the website.
    reply_to: oneLine(values.email, 254),
    subject: `New inquiry: ${oneLine(name, 60)} (${session})`,
    text: lines.filter((line): line is string => line !== null).join("\n"),
  };
}

export async function sendInquiryEmail(
  values: InquiryValues,
  texts: TextMap,
  { env = process.env, fetcher = fetch }: { env?: Record<string, string | undefined>; fetcher?: typeof fetch } = {},
) {
  if (!isEmailConfigured(env)) return { sent: false as const, reason: "not configured" };
  const response = await fetcher(env.RESEND_API_URL || DEFAULT_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(buildInquiryEmail(values, texts, env)),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    // Resend explains itself, for example an unverified sender or a wrong recipient.
    throw new Error(`Resend refused the notification (${response.status}): ${(await response.text()).slice(0, 300)}`);
  }
  // Resend answers with the id it gave the email, which is what to quote if anything needs tracing.
  const body = (await response.json().catch(() => ({}))) as { id?: unknown };
  return { sent: true as const, id: typeof body.id === "string" ? body.id : "" };
}

export type EmailOutcome = { status: "sent" | "failed" | "not_configured"; error: string };

/** Anything safe to store or log: one short line, with the API key removed if it ever appears. */
function safeMessage(error: unknown, env: Record<string, string | undefined>) {
  let message = error instanceof Error ? error.message : String(error);
  const key = env.RESEND_API_KEY?.trim();
  if (key) message = message.split(key).join("[hidden]");
  return oneLine(message, 480);
}

/**
 * Sends the owner's notification and says what happened, never throwing and
 * never staying silent: a missing setup or a refusal is logged on the server
 * (visible in Vercel's logs) and returned so it can be recorded with the inquiry.
 */
export async function notifyOwnerByEmail(
  values: InquiryValues,
  texts: TextMap,
  options: { env?: Record<string, string | undefined>; fetcher?: typeof fetch } = {},
): Promise<EmailOutcome> {
  const env = options.env ?? process.env;
  const missing = missingEmailSettings(env);
  if (missing.length > 0) {
    const detail = `${missing.join(" and ")} ${missing.length > 1 ? "are" : "is"} not set in Vercel`;
    console.error(`Inquiry saved, but NO notification email was sent: ${detail}.`);
    return { status: "not_configured", error: detail };
  }
  try {
    const result = await sendInquiryEmail(values, texts, options);
    if (result.sent) console.info(`Inquiry notification accepted by Resend${result.id ? ` (email id ${result.id})` : ""}.`);
    return { status: "sent", error: "" };
  } catch (error) {
    const message = safeMessage(error, env);
    console.error(`Inquiry saved, but the notification email FAILED: ${message}`);
    return { status: "failed", error: message };
  }
}
