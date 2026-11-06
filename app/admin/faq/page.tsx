import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FaqManager } from "@/components/admin/faq-manager";
import { FAQ_COLUMNS, toFaqRecord, type FaqRow } from "@/lib/content-records";
import { requireAdminPage } from "@/lib/auth";

export const metadata: Metadata = { title: "FAQ" };

export default function AdminFaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <Link href="/admin" className="inline-flex min-h-11 items-center text-sm text-neutral-600 underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-2 text-xl font-semibold">FAQ</h1>
      <div className="mt-4">
        <Suspense fallback={<p className="text-neutral-600">Loading…</p>}>
          <Questions />
        </Suspense>
      </div>
    </main>
  );
}

async function Questions() {
  const { supabase } = await requireAdminPage();
  const { data, error } = await supabase.from("faq_items").select(FAQ_COLUMNS).order("sort_order").order("created_at");
  if (error) return <p role="alert" className="text-red-700">Could not load the questions. Please try again.</p>;
  return <FaqManager initial={(data as FaqRow[]).map(toFaqRecord)} />;
}
