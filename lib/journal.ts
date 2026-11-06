import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { isSupabaseConfigured, mediaUrl } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/server";

export const FAQ_TAG = "faq";
export const JOURNAL_TAG = "journal";

export type PublishedFaq = {
  id: string;
  question: string;
  answer: string;
  category: string;
  showOnHome: boolean;
};

export type PostImage = { url: string; width: number; height: number; alt: string };

export type PublishedPostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  featured: boolean;
  publishedAt: string | null;
  image: PostImage | null;
};

export type PublishedPost = PublishedPostSummary & {
  body: string;
  seoTitle: string;
  seoDescription: string;
  updatedAt: string | null;
};

type FaqRow = { id: string; question: string; answer: string; category: string; show_on_home: boolean };
type PostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  is_featured: boolean;
  published_at: string | null;
  featured_path: string | null;
  featured_width: number | null;
  featured_height: number | null;
  featured_alt: string;
};
type PostFullRow = PostRow & { body: string; seo_title: string; seo_description: string; updated_at: string | null };

function toSummary(row: PostRow): PublishedPostSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    featured: row.is_featured,
    publishedAt: row.published_at,
    image:
      row.featured_path && row.featured_width && row.featured_height
        ? { url: mediaUrl(row.featured_path), width: row.featured_width, height: row.featured_height, alt: row.featured_alt }
        : null,
  };
}

/** Published FAQ questions, in the owner's order. Drafts and unpublished questions are never returned. */
export async function getPublishedFaqs(): Promise<PublishedFaq[]> {
  "use cache";
  cacheTag(FAQ_TAG);
  if (!isSupabaseConfigured) return [];
  const { data, error } = await createPublicClient().rpc("get_published_faqs");
  if (error) {
    console.error("Could not load FAQs:", error.message);
    cacheLife("minutes");
    return [];
  }
  cacheLife("max");
  return ((data ?? []) as FaqRow[]).map((row) => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category,
    showOnHome: row.show_on_home,
  }));
}

/** Published articles, newest first (without their body text). */
export async function getPublishedPosts(): Promise<PublishedPostSummary[]> {
  "use cache";
  cacheTag(JOURNAL_TAG);
  if (!isSupabaseConfigured) return [];
  const { data, error } = await createPublicClient().rpc("get_published_posts");
  if (error) {
    console.error("Could not load Journal articles:", error.message);
    cacheLife("minutes");
    return [];
  }
  cacheLife("max");
  return ((data ?? []) as PostRow[]).map(toSummary);
}

/** One published article with its body, or null when there is no such published article. */
export async function getPublishedPost(slug: string): Promise<PublishedPost | null> {
  "use cache";
  cacheTag(JOURNAL_TAG);
  if (!isSupabaseConfigured || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return null;
  const { data, error } = await createPublicClient().rpc("get_published_post", { p_slug: slug });
  if (error) {
    console.error("Could not load a Journal article:", error.message);
    cacheLife("minutes");
    return null;
  }
  cacheLife("max");
  const row = ((data ?? []) as PostFullRow[])[0];
  if (!row) return null;
  return { ...toSummary(row), body: row.body, seoTitle: row.seo_title, seoDescription: row.seo_description, updatedAt: row.updated_at };
}
