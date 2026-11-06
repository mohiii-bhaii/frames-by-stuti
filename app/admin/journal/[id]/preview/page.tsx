import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleView } from "@/components/journal/article-view";
import { POST_COLUMNS, toPostRecord, type MediaJoin, type PostRow } from "@/lib/content-records";
import { requireAdminPage } from "@/lib/auth";
import { getPublishedTexts } from "@/lib/site-texts";

export const metadata: Metadata = { title: "Article preview", robots: { index: false, follow: false } };

export default function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="p-6 text-neutral-600">Loading…</p>}>
      <Preview params={params} />
    </Suspense>
  );
}

async function Preview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdminPage();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await supabase.from("journal_posts").select(POST_COLUMNS).eq("id", id).maybeSingle();
  if (!data) notFound();
  const row = data as unknown as PostRow;
  let draftMedia: MediaJoin = null;
  const draftMediaId = row.draft && "featured_media_id" in row.draft ? row.draft.featured_media_id : undefined;
  if (draftMediaId) {
    const found = await supabase.from("photo_files").select("id, storage_path, width, height").eq("id", draftMediaId).maybeSingle();
    draftMedia = (found.data as MediaJoin) ?? null;
  }
  const record = toPostRecord(row, draftMedia);
  const fields = record.draft ?? record.live;
  const texts = await getPublishedTexts();
  return (
    <div className="bg-cream text-espresso">
      <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-2 bg-[#353026] px-4 py-2 text-sm text-cream">
        <span>Preview: this is how the article will look. Visitors cannot see it until you publish.</span>
        <Link href={`/admin/journal/${id}`} className="inline-flex min-h-11 items-center underline">
          ← Back to editing
        </Link>
      </div>
      <div className="pt-6">
        <ArticleView
          article={{
            title: fields.title || "Untitled article",
            category: fields.category,
            publishedAt: fields.publishedOn ? `${fields.publishedOn}T12:00:00Z` : null,
            body: fields.body,
            image: record.media ? { ...record.media, alt: fields.featuredAlt } : null,
          }}
          texts={texts}
        />
      </div>
    </div>
  );
}
