import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { NewPostButton } from "@/components/admin/new-post-button";
import { journalCategoryLabel } from "@/content/journal";
import { requireAdminPage } from "@/lib/auth";

export const metadata: Metadata = { title: "The Journal" };

const STATUS = {
  draft: { label: "Draft", className: "bg-neutral-100 text-neutral-800" },
  published: { label: "Live", className: "bg-emerald-50 text-emerald-900" },
  unpublished: { label: "Taken down", className: "bg-amber-50 text-amber-900" },
} as const;

export default function AdminJournalPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <Link href="/admin" className="inline-flex min-h-11 items-center text-sm text-neutral-600 underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-2 text-xl font-semibold">The Journal</h1>
      <p className="mt-1 text-sm text-neutral-700">Articles stay private until you press Publish. Open one to write, add photos, preview and publish it.</p>
      <div className="mt-4">
        <NewPostButton />
      </div>
      <div className="mt-6">
        <Suspense fallback={<p className="text-neutral-600">Loading…</p>}>
          <Posts />
        </Suspense>
      </div>
    </main>
  );
}

async function Posts() {
  const { supabase } = await requireAdminPage();
  const { data, error } = await supabase
    .from("journal_posts")
    .select("id, status, is_featured, slug, title, category, published_at, draft, created_at")
    .order("created_at", { ascending: false });
  if (error) return <p role="alert" className="text-red-700">Could not load the articles. Please try again.</p>;
  if (!data || data.length === 0) return <p className="rounded-2xl bg-white p-5 text-neutral-700 shadow-sm">No articles yet. Write the first one.</p>;
  return (
    <ul className="space-y-3">
      {data.map((post) => {
        const draftTitle = typeof post.draft?.title === "string" ? post.draft.title : null;
        const title = (draftTitle ?? post.title) || "Untitled article";
        const status = STATUS[post.status as keyof typeof STATUS];
        return (
          <li key={post.id}>
            <Link href={`/admin/journal/${post.id}`} className="block rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>{status.label}</span>
                {post.status === "published" && post.draft ? <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-900">Unpublished changes</span> : null}
                {post.is_featured ? <span className="rounded-full bg-[#ca8060]/20 px-2.5 py-0.5 text-xs font-medium text-[#874122]">Featured</span> : null}
                <span className="text-xs text-neutral-600">{journalCategoryLabel(post.category)}</span>
              </div>
              <p className="mt-2 text-base font-semibold">{title}</p>
              <p className="mt-0.5 text-xs text-neutral-600">/blog/{(typeof post.draft?.slug === "string" ? post.draft.slug : post.slug) as string}</p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
