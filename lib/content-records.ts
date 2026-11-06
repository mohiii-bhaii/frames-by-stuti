import { mediaUrl } from "@/lib/supabase/config";
import type { FaqCategory, JournalCategory } from "@/content/journal";
import type { ContentStatus, FaqFields, FaqRecord, PostFields, PostRecord } from "@/lib/content-types";

/** Turns database rows into the records the owner's screens use. (Kept out of the actions file, which may only export actions.) */

export const FAQ_COLUMNS = "id, status, sort_order, question, answer, category, show_on_home, draft, published_at";

export type FaqRow = {
  id: string;
  status: ContentStatus;
  sort_order: number;
  question: string;
  answer: string;
  category: FaqCategory;
  show_on_home: boolean;
  draft: Partial<{ question: string; answer: string; category: FaqCategory; show_on_home: boolean }> | null;
  published_at: string | null;
};

export function toFaqRecord(row: FaqRow): FaqRecord {
  const live: FaqFields = { question: row.question, answer: row.answer, category: row.category, showOnHome: row.show_on_home };
  return {
    id: row.id,
    status: row.status,
    sortOrder: row.sort_order,
    live,
    draft: row.draft
      ? {
          question: row.draft.question ?? live.question,
          answer: row.draft.answer ?? live.answer,
          category: row.draft.category ?? live.category,
          showOnHome: row.draft.show_on_home ?? live.showOnHome,
        }
      : null,
    publishedAt: row.published_at,
  };
}

export const POST_COLUMNS =
  "id, status, is_featured, slug, title, excerpt, body, category, featured_media_id, featured_alt, seo_title, seo_description, published_at, draft, updated_at, media:photo_files(id, storage_path, width, height)";

type PostDraftJson = {
  slug?: string;
  title?: string;
  excerpt?: string;
  body?: string;
  category?: JournalCategory;
  featured_media_id?: string | null;
  featured_alt?: string;
  seo_title?: string;
  seo_description?: string;
  published_at?: string | null;
};

export type MediaJoin = { id: string; storage_path: string; width: number; height: number } | null;

export type PostRow = {
  id: string;
  status: ContentStatus;
  is_featured: boolean;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: JournalCategory;
  featured_media_id: string | null;
  featured_alt: string;
  seo_title: string;
  seo_description: string;
  published_at: string | null;
  draft: PostDraftJson | null;
  updated_at: string;
  media: MediaJoin;
};

const dateOnly = (value: string | null) => (value ? new Date(value).toISOString().slice(0, 10) : "");

export function toPostRecord(row: PostRow, draftMedia: MediaJoin = null): PostRecord {
  const live: PostFields = {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    category: row.category,
    mediaId: row.featured_media_id,
    featuredAlt: row.featured_alt,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    publishedOn: dateOnly(row.published_at),
  };
  const d = row.draft;
  const draft: PostFields | null = d
    ? {
        slug: d.slug ?? live.slug,
        title: d.title ?? live.title,
        excerpt: d.excerpt ?? live.excerpt,
        body: d.body ?? live.body,
        category: d.category ?? live.category,
        mediaId: "featured_media_id" in d ? (d.featured_media_id ?? null) : live.mediaId,
        featuredAlt: d.featured_alt ?? live.featuredAlt,
        seoTitle: d.seo_title ?? live.seoTitle,
        seoDescription: d.seo_description ?? live.seoDescription,
        publishedOn: d.published_at ? dateOnly(d.published_at) : live.publishedOn,
      }
    : null;
  const media = (d && "featured_media_id" in d ? draftMedia : row.media) ?? null;
  return {
    id: row.id,
    status: row.status,
    isFeatured: row.is_featured,
    live,
    draft,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    media: media ? { id: media.id, url: mediaUrl(media.storage_path), width: media.width, height: media.height } : null,
  };
}

