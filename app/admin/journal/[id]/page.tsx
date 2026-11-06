import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PostEditor } from "@/components/admin/post-editor";
import { POST_COLUMNS, toPostRecord, type MediaJoin, type PostRow } from "@/lib/content-records";
import { requireAdminPage } from "@/lib/auth";

export const metadata: Metadata = { title: "Edit article" };

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="mx-auto max-w-4xl px-5 py-8">
      <Link href="/admin/journal" className="inline-flex min-h-11 items-center text-sm text-neutral-600 underline">
        ← All articles
      </Link>
      <Suspense fallback={<p className="mt-4 text-neutral-600">Loading…</p>}>
        <Editor params={params} />
      </Suspense>
    </main>
  );
}

async function Editor({ params }: { params: Promise<{ id: string }> }) {
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
  return <PostEditor initial={toPostRecord(row, draftMedia)} />;
}
