import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MediaLibrary } from "@/components/editor/media-library";
import { requireAdminPage } from "@/lib/auth";

export const metadata: Metadata = { title: "Media library" };

export default function MediaPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      <Link href="/admin" className="inline-flex min-h-11 items-center text-sm text-neutral-600 underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-2 text-xl font-semibold">Media library</h1>
      <div className="mt-6">
        <Suspense fallback={<p className="text-neutral-600">Loading…</p>}>
          <AdminOnly />
        </Suspense>
      </div>
    </main>
  );
}

async function AdminOnly() {
  await requireAdminPage();
  return <MediaLibrary />;
}
