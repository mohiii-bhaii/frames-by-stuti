import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { resendInquiryEmail, setInquiryRead } from "@/app/admin/inquiry-actions";
import { textDefaults } from "@/content/texts";
import { requireAdminPage } from "@/lib/auth";
import { isEmailConfigured, missingEmailSettings } from "@/lib/inquiry-email";
import { getPublishedTexts } from "@/lib/site-texts";

export const metadata: Metadata = { title: "Inquiries" };

type Inquiry = {
  id: string;
  created_at: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  instagram: string;
  session_type: string;
  due_date: string | null;
  location_preference: string;
  location: string;
  preferred_days: string[];
  referral: string;
  message: string;
  preferred_date: string | null;
  is_read: boolean;
  email_status: "pending" | "sent" | "failed" | "not_configured";
  email_error: string;
};

const emailBadge = {
  sent: { label: "Notification email sent", className: "bg-emerald-50 text-emerald-900" },
  failed: { label: "Notification email failed", className: "bg-red-50 text-red-900" },
  not_configured: { label: "No notification email (not set up)", className: "bg-amber-50 text-amber-900" },
  pending: { label: "Notification not recorded", className: "bg-neutral-100 text-neutral-800" },
} as const;

const locationLabels: Record<string, string> = { Other: "Other / not sure yet" };

export default function InquiriesPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <Link href="/admin" className="inline-flex min-h-11 items-center text-sm text-neutral-600 underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-2 text-xl font-semibold">Inquiries</h1>
      <p className="mt-1 text-sm text-neutral-600">Messages sent from the Contact page. Only you can see these.</p>
      {isEmailConfigured() ? (
        <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
          Email notifications are on. You get an email for each new inquiry, and you can reply to it directly.
        </p>
      ) : (
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Email notifications are off, so new inquiries only appear here. Still missing in Vercel:{" "}
          {missingEmailSettings().map((name, index) => (
            <span key={name}>
              {index > 0 ? " and " : ""}
              <code>{name}</code>
            </span>
          ))}{" "}
          (steps are in the README).
        </p>
      )}
      <div className="mt-6">
        <Suspense fallback={<p className="text-neutral-600">Loading…</p>}>
          <InquiryList />
        </Suspense>
      </div>
    </main>
  );
}

const when = new Intl.DateTimeFormat("en-CA", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Toronto",
});

async function InquiryList() {
  const { supabase } = await requireAdminPage();
  const [{ data, error }, texts] = await Promise.all([
    supabase.from("inquiries").select("*").order("created_at", { ascending: false }).limit(200),
    getPublishedTexts(),
  ]);
  if (error) return <p role="alert" className="text-red-700">Could not load inquiries. Please try again.</p>;

  const sessionLabel = (id: string) => texts[`form.session.${id}`] ?? textDefaults[`form.session.${id}`] ?? id;

  const inquiries = data as Inquiry[];
  if (inquiries.length === 0) {
    return <p className="rounded-2xl bg-white p-5 text-neutral-700 shadow-sm">No inquiries yet. New ones will appear here.</p>;
  }

  return (
    <ul className="space-y-3">
      {inquiries.map((inquiry) => (
        <li key={inquiry.id} className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="flex items-center gap-2 text-base font-semibold">
                {inquiry.first_name ? `${inquiry.first_name} ${inquiry.last_name}`.trim() : inquiry.name}
                {inquiry.is_read ? null : (
                  <span className="rounded-full bg-[#2f6fed] px-2 py-0.5 text-xs font-medium text-white">New</span>
                )}
              </p>
              <a href={`mailto:${inquiry.email}`} className="text-sm text-[#2f6fed] underline">
                {inquiry.email}
              </a>
            </div>
            <div className="text-right text-sm text-neutral-600">
              <p>{when.format(new Date(inquiry.created_at))}</p>
              <p className="mt-1 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-800">
                {sessionLabel(inquiry.session_type)}
              </p>
            </div>
          </div>

          {inquiry.message ? <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed">{inquiry.message}</p> : null}

          <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            {(
              [
                ["Phone", inquiry.phone, inquiry.phone ? `tel:${inquiry.phone.replace(/[^\d+]/g, "")}` : ""],
                ["Due date", inquiry.due_date ?? "", ""],
                ["Location preference", locationLabels[inquiry.location_preference] ?? inquiry.location_preference, ""],
                ["City or area", inquiry.location, ""],
                ["Days that work best", (inquiry.preferred_days ?? []).join(", "), ""],
                ["Heard about you via", inquiry.referral, ""],
                // Older inquiries, from before the long form.
                ["Instagram", inquiry.instagram, ""],
                ["Preferred date", inquiry.preferred_date ?? "", ""],
              ] as [string, string, string][]
            )
              .filter(([, value]) => value)
              .map(([label, value, link]) => (
                <div key={label} className="flex gap-2">
                  <dt className="shrink-0 text-neutral-600">{label}:</dt>
                  <dd className="break-words">
                    {link ? (
                      <a href={link} className="text-[#2f6fed] underline">
                        {value}
                      </a>
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              ))}
          </dl>

          <p className={`mt-3 inline-block rounded-lg px-2.5 py-1 text-xs font-medium ${emailBadge[inquiry.email_status ?? "pending"].className}`}>
            {emailBadge[inquiry.email_status ?? "pending"].label}
            {inquiry.email_status === "failed" || inquiry.email_status === "not_configured" ? `: ${inquiry.email_error}` : ""}
          </p>

          {(inquiry.email_status === "failed" || inquiry.email_status === "not_configured") && isEmailConfigured() ? (
            <form action={resendInquiryEmail} className="mt-3 block">
              <input type="hidden" name="id" value={inquiry.id} />
              <button type="submit" className="min-h-11 rounded-lg bg-[#2f6fed] px-3 text-sm font-medium text-white">
                Send notification email again
              </button>
            </form>
          ) : null}

          <form action={setInquiryRead} className="mt-3 block">
            <input type="hidden" name="id" value={inquiry.id} />
            <input type="hidden" name="read" value={inquiry.is_read ? "false" : "true"} />
            <button type="submit" className="min-h-11 rounded-lg border border-neutral-300 px-3 text-sm">
              {inquiry.is_read ? "Mark as unread" : "Mark as read"}
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}
