import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { setInquiryRead } from "@/app/admin/inquiry-actions";
import { textDefaults } from "@/content/texts";
import { requireAdminPage } from "@/lib/auth";
import { isEmailConfigured } from "@/lib/inquiry-email";
import { getPublishedTexts } from "@/lib/site-texts";

export const metadata: Metadata = { title: "Inquiries" };

type Inquiry = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  instagram: string;
  session_type: string;
  referral: string;
  location: string;
  message: string;
  preferred_date: string | null;
  is_read: boolean;
};

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
          Email notifications are off, so new inquiries only appear here. To turn them on, add <code>RESEND_API_KEY</code> and{" "}
          <code>INQUIRY_NOTIFY_EMAIL</code> in Vercel (steps are in the README).
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

  const sessionLabel = (id: string) => {
    if (id === "other") return texts["form.sessionType.other"] ?? textDefaults["form.sessionType.other"];
    return texts[`category.${id}`] ?? textDefaults[`category.${id}`] ?? id;
  };

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
                {inquiry.name}
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
            {[
              ["Phone", inquiry.phone],
              ["Instagram", inquiry.instagram],
              ["Location", inquiry.location],
              ["Preferred date", inquiry.preferred_date ?? ""],
              ["Heard about you via", inquiry.referral],
            ]
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label} className="flex gap-2">
                  <dt className="text-neutral-600">{label}:</dt>
                  <dd className="break-words">{value}</dd>
                </div>
              ))}
          </dl>

          <form action={setInquiryRead} className="mt-3">
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
