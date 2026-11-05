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

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export const INQUIRY_SUBJECT = "New Photography Inquiry — Frames by Stuti";

export function buildInquiryEmail(values: InquiryValues, texts: TextMap, env: Record<string, string | undefined> = process.env) {
  const sessionKey = `form.session.${values.sessionType}`;
  const session = texts[sessionKey] ?? textDefaults[sessionKey] ?? values.sessionType;
  const name = oneLine(`${values.firstName} ${values.lastName}`);
  const email = oneLine(values.email, 254);
  // Rows the visitor left blank are dropped.
  const rows: [string, string][] = (
    [
      ["Name", name],
      ["Email", email],
      ["Phone", oneLine(values.phone, 40)],
      ["Session type", session],
      ["Due date", oneLine(values.dueDate, 10)],
      ["Location preference", oneLine(values.locationPreference, 20)],
      ["City or area", oneLine(values.location)],
      ["Days that work best", values.preferredDays.map((day) => oneLine(day, 20)).join(", ")],
      ["Heard about you via", oneLine(values.referral, 40)],
    ] as [string, string][]
  ).filter(([, value]) => value);
  const message = values.message.trim();

  const text = [
    `New inquiry from ${name}`,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    `Message:\n${message}`,
    "",
    "Reply to this email to answer them directly. All inquiries are also in your dashboard at /admin/inquiries.",
  ].join("\n");

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#ebe6db;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ebe6db;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#faf7f1;border-radius:6px;">
<tr><td style="padding:28px 32px 8px;font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#874122;">Frames by Stuti</td></tr>
<tr><td style="padding:0 32px 8px;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.25;color:#353026;">New photography inquiry</td></tr>
<tr><td style="padding:0 32px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#5e452f;">${escapeHtml(name)} sent a message through your website.</td></tr>
<tr><td style="padding:0 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #dcc3ae;">
${rows
  .map(
    ([label, value]) =>
      `<tr><td valign="top" style="padding:10px 12px 10px 0;border-bottom:1px solid #eadfd2;width:38%;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#777763;">${escapeHtml(label)}</td><td valign="top" style="padding:10px 0;border-bottom:1px solid #eadfd2;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#353026;">${
        label === "Email" ? `<a href="mailto:${escapeHtml(value)}" style="color:#874122;">${escapeHtml(value)}</a>` : escapeHtml(value)
      }</td></tr>`,
  )
  .join("\n")}
</table></td></tr>
<tr><td style="padding:20px 32px 4px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#777763;">Message</td></tr>
<tr><td style="padding:0 32px 24px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#353026;white-space:pre-wrap;">${escapeHtml(message)}</td></tr>
<tr><td style="padding:16px 32px 28px;border-top:1px solid #dcc3ae;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#777763;">Reply to this email to answer ${escapeHtml(values.firstName.trim() || "them")} directly. Every inquiry is also saved in your dashboard at /admin/inquiries.</td></tr>
</table>
</td></tr></table>
</body></html>`;

  return {
    from: env.INQUIRY_FROM_EMAIL?.trim() || DEFAULT_FROM,
    to: [env.INQUIRY_NOTIFY_EMAIL!.trim()],
    // Replying goes to the customer, not back to the website.
    reply_to: email,
    subject: INQUIRY_SUBJECT,
    text,
    html,
  };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function sendInquiryEmail(
  values: InquiryValues,
  texts: TextMap,
  {
    env = process.env,
    fetcher = fetch,
    idempotencyKey,
    retryDelayMs = 800,
  }: { env?: Record<string, string | undefined>; fetcher?: typeof fetch; idempotencyKey?: string; retryDelayMs?: number } = {},
) {
  if (!isEmailConfigured(env)) return { sent: false as const, reason: "not configured" };
  const body = JSON.stringify(buildInquiryEmail(values, texts, env));
  // The same key on every attempt means Resend sends the email at most once, even if an
  // attempt's answer was lost on the way back (it remembers keys for 24 hours).
  const headers: Record<string, string> = { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" };
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;

  let lastError: Error = new Error("Resend could not be reached");
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await sleep(retryDelayMs * attempt);
    let response: Response;
    try {
      response = await fetcher(env.RESEND_API_URL || DEFAULT_ENDPOINT, { method: "POST", headers, body, signal: AbortSignal.timeout(10_000) });
    } catch (error) {
      // A network error or timeout: try again.
      lastError = error instanceof Error ? error : new Error(String(error));
      continue;
    }
    if (response.ok) {
      // Resend answers with the id it gave the email, which is what to quote if anything needs tracing.
      const answer = (await response.json().catch(() => ({}))) as { id?: unknown };
      return { sent: true as const, id: typeof answer.id === "string" ? answer.id : "" };
    }
    // Resend explains itself, for example an unverified sender or a wrong recipient.
    lastError = new Error(`Resend refused the notification (${response.status}): ${(await response.text()).slice(0, 300)}`);
    // Only a hiccup on their side or a rate limit is worth trying again; a refusal will not change.
    if (response.status < 500 && response.status !== 429 && response.status !== 409) break;
  }
  throw lastError;
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
  options: { env?: Record<string, string | undefined>; fetcher?: typeof fetch; idempotencyKey?: string; retryDelayMs?: number } = {},
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
