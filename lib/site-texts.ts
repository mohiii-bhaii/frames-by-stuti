import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { isTextKey } from "@/content/texts";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/server";

export const SITE_TEXTS_TAG = "site-texts";

/** Published text by key. Anything missing falls back to the original wording. */
export type TextMap = Record<string, string>;

/**
 * Published website text for the public site. Cached with the pages;
 * publishing from the editor expires the tag. Drafts are never read here.
 */
export async function getPublishedTexts(): Promise<TextMap> {
  "use cache";
  cacheTag(SITE_TEXTS_TAG);
  if (!isSupabaseConfigured) return {};

  const { data, error } = await createPublicClient().rpc("get_published_texts");
  if (error) {
    // Keep the site up with the original wording, and try again soon.
    console.error("Could not load published text:", error.message);
    cacheLife("minutes");
    return {};
  }
  cacheLife("max");

  const texts: TextMap = {};
  for (const row of (data ?? []) as { key: string; value: string }[]) {
    if (isTextKey(row.key)) texts[row.key] = row.value;
  }
  return texts;
}
