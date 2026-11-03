import { getFallbackImage, isLogoSlot, type SlotId, type SlotImage } from "@/lib/images";
import { mediaUrl } from "@/lib/supabase/config";

/** Images keyed by slot. Slots that aren't listed show their placeholder. */
export type ImageMap = Partial<Record<SlotId, SlotImage>>;

/** A saved slot version joined with its media file, as returned by the database. */
export type VersionRow = {
  slot_id: string;
  storage_path: string | null;
  width: number | null;
  height: number | null;
  alt: string;
  focal_x: number;
  focal_y: number;
  zoom: number;
};

export function versionToImage(slot: SlotId, row: VersionRow): SlotImage {
  const fallback = getFallbackImage(slot);
  const focal = { x: row.focal_x, y: row.focal_y };
  if (row.storage_path && row.width && row.height) {
    return { src: mediaUrl(row.storage_path), width: row.width, height: row.height, alt: row.alt, focal, zoom: row.zoom };
  }
  // A version without a file restores the placeholder, or the typeset logo.
  return { ...fallback, alt: row.alt || fallback.alt, focal: isLogoSlot(slot) ? null : focal, zoom: row.zoom };
}

/** Limits for uploads, checked in the browser and again on the server. */
export const ACCEPTED_UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
