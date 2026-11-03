import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { versionToImage, type ImageMap, type VersionRow } from "@/lib/cms";
import { isSlotId } from "@/lib/images";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/server";

export const SITE_IMAGES_TAG = "site-images";

/**
 * Published photographs for the public site. Cached and prerendered with the
 * pages; publishing from the editor expires the tag so the next visit is fresh.
 * Drafts are never read here.
 */
export async function getPublishedImages(): Promise<ImageMap> {
  "use cache";
  cacheTag(SITE_IMAGES_TAG);
  if (!isSupabaseConfigured) return {};

  const { data, error } = await createPublicClient().rpc("get_published_images");
  if (error) {
    // Keep the site up with placeholders, and try again soon.
    console.error("Could not load published images:", error.message);
    cacheLife("minutes");
    return {};
  }
  cacheLife("max");

  const images: ImageMap = {};
  for (const row of (data ?? []) as VersionRow[]) {
    if (isSlotId(row.slot_id)) images[row.slot_id] = versionToImage(row.slot_id, row);
  }
  return images;
}
