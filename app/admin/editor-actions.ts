"use server";

import { updateTag } from "next/cache";
import { NotAuthorisedError, requireAdminAction } from "@/lib/auth";
import { ACCEPTED_UPLOAD_TYPES, MAX_UPLOAD_BYTES, versionToImage, type VersionRow } from "@/lib/cms";
import { isTextKey, MAX_TEXT_LENGTH, optionalTextKeys } from "@/content/texts";
import type {
  ActionResult,
  DraftInput,
  EditorSnapshot,
  MediaItem,
  NewMedia,
  SlotState,
  SlotValue,
  TextDraftInput,
  TextState,
} from "@/lib/editor-types";
import { isSlotId, type SlotId } from "@/lib/images";
import { MEDIA_BUCKET, mediaUrl } from "@/lib/supabase/config";
import { SITE_IMAGES_TAG } from "@/lib/site-images";
import { SITE_TEXTS_TAG } from "@/lib/site-texts";

type Supabase = Awaited<ReturnType<typeof requireAdminAction>>["supabase"];

const VERSION_FIELDS = "id, media_id, alt, focal_x, focal_y, zoom, media:photo_files(storage_path, width, height)";

type VersionWithMedia = {
  id: string;
  media_id: string | null;
  alt: string;
  focal_x: number;
  focal_y: number;
  zoom: number;
  media: { storage_path: string; width: number; height: number } | null;
};

type MediaRow = {
  id: string;
  storage_path: string;
  filename: string;
  width: number;
  height: number;
  size_bytes: number;
  created_at: string;
};

/** Runs an action for a verified admin and turns failures into a message the editor can show. */
async function run<T>(task: (supabase: Supabase) => Promise<T>): Promise<ActionResult<T>> {
  try {
    const { supabase } = await requireAdminAction();
    return { ok: true, data: await task(supabase) };
  } catch (error) {
    if (error instanceof NotAuthorisedError) return { ok: false, error: error.message, signedOut: true };
    console.error("Editor action failed:", error);
    return { ok: false, error: error instanceof Error ? error.message : "Something went wrong. Please try again." };
  }
}

function fail(message: string, cause?: { message: string } | null): never {
  if (cause) console.error(message, cause.message);
  throw new Error(message);
}

function toValue(slot: SlotId, version: VersionWithMedia | null): SlotValue | null {
  if (!version) return null;
  const row: VersionRow = {
    slot_id: slot,
    storage_path: version.media?.storage_path ?? null,
    width: version.media?.width ?? null,
    height: version.media?.height ?? null,
    alt: version.alt,
    focal_x: version.focal_x,
    focal_y: version.focal_y,
    zoom: version.zoom,
  };
  return { mediaId: version.media_id, image: versionToImage(slot, row) };
}

function toMediaItem(row: MediaRow): MediaItem {
  return {
    id: row.id,
    filename: row.filename,
    url: mediaUrl(row.storage_path),
    width: row.width,
    height: row.height,
    sizeBytes: row.size_bytes,
    createdAt: row.created_at,
  };
}

const clamp = (value: number, min: number, max: number) =>
  Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;

/** Everything the editor needs on load: drafts and published photos for every slot. */
export async function getEditorSnapshot(): Promise<ActionResult<EditorSnapshot>> {
  return run(async (supabase) => {
    const { data: claims } = await supabase.auth.getClaims();
    const email = typeof claims?.claims.email === "string" ? claims.claims.email : "";

    const [slotsResult, historyResult, textsResult] = await Promise.all([
      supabase
        .from("image_slots")
        .select(
          `slot_id, published_version_id,
           draft:image_versions!image_slots_draft_version_id_fkey(${VERSION_FIELDS}),
           published:image_versions!image_slots_published_version_id_fkey(${VERSION_FIELDS})`,
        ),
      supabase.from("image_versions").select("slot_id, id").not("published_at", "is", null).limit(5000),
      supabase.from("site_texts").select("key, published_value, draft_value, has_draft").limit(2000),
    ]);
    if (slotsResult.error) fail("Could not load the saved photos.", slotsResult.error);
    if (historyResult.error) fail("Could not load the photo history.", historyResult.error);
    if (textsResult.error) fail("Could not load the saved text.", textsResult.error);

    const publishedCount = new Map<string, number>();
    for (const row of historyResult.data) publishedCount.set(row.slot_id, (publishedCount.get(row.slot_id) ?? 0) + 1);

    const slots: EditorSnapshot["slots"] = {};
    for (const row of slotsResult.data as unknown as {
      slot_id: string;
      draft: VersionWithMedia | null;
      published: VersionWithMedia | null;
    }[]) {
      if (!isSlotId(row.slot_id)) continue;
      const state: SlotState = {
        draft: toValue(row.slot_id, row.draft),
        published: toValue(row.slot_id, row.published),
        hasPrevious: (publishedCount.get(row.slot_id) ?? 0) > (row.published ? 1 : 0),
      };
      slots[row.slot_id] = state;
    }

    const texts: EditorSnapshot["texts"] = {};
    for (const row of textsResult.data) {
      if (!isTextKey(row.key)) continue;
      const state: TextState = {
        published: row.published_value,
        draft: row.has_draft ? { value: row.draft_value } : null,
      };
      texts[row.key] = state;
    }
    return { email, slots, texts };
  });
}

/** Checks one text edit. Returns the cleaned value, or throws a message the editor can show. */
function cleanText(input: TextDraftInput): string | null {
  if (!isTextKey(input?.key)) fail("Unknown piece of text.");
  if (input.value === null) return null;
  const value = String(input.value).replace(/\r\n?/g, "\n").trim();
  if (value.length > MAX_TEXT_LENGTH) fail(`That text is too long. Keep it under ${MAX_TEXT_LENGTH} characters.`);
  if (value === "" && !optionalTextKeys.has(input.key)) {
    fail("This text can't be empty. Use the original wording instead.");
  }
  return value;
}

/** Saves each text edit as a draft. Published text is untouched until Publish. */
export async function saveTextDrafts(inputs: TextDraftInput[]): Promise<ActionResult<Record<string, string | null>>> {
  return run(async (supabase) => {
    if (!Array.isArray(inputs) || inputs.length === 0) return {};
    if (inputs.length > 300) fail("Too many changes at once. Save in smaller batches.");

    const saved: Record<string, string | null> = {};
    const now = new Date().toISOString();
    const rows = inputs.map((input) => {
      const value = cleanText(input);
      saved[input.key] = value;
      return { key: input.key, draft_value: value, has_draft: true, updated_at: now };
    });
    // Only the draft columns are sent, so a row's published text is never overwritten here.
    const { error } = await supabase.from("site_texts").upsert(rows, { onConflict: "key" });
    if (error) fail("Could not save the text draft.", error);
    return saved;
  });
}

/** Drops a text's saved draft, so it goes back to what is live. */
export async function discardTextDraft(key: string): Promise<ActionResult<null>> {
  return run(async (supabase) => {
    if (!isTextKey(key)) fail("Unknown piece of text.");
    const { error } = await supabase
      .from("site_texts")
      .update({ draft_value: null, has_draft: false, updated_at: new Date().toISOString() })
      .eq("key", key);
    if (error) fail("Could not discard the draft.", error);
    return null;
  });
}

/** Saves each edit as a new draft version. Published photos are untouched until Publish. */
export async function saveDrafts(inputs: DraftInput[]): Promise<ActionResult<Partial<Record<SlotId, SlotValue>>>> {
  return run(async (supabase) => {
    if (!Array.isArray(inputs) || inputs.length === 0) return {};
    if (inputs.length > 100) fail("Too many changes at once. Save in smaller batches.");

    const saved: Partial<Record<SlotId, SlotValue>> = {};
    for (const input of inputs) {
      if (!isSlotId(input?.slot)) fail("Unknown photo slot.");
      const mediaId = input.mediaId === null ? null : String(input.mediaId);
      if (mediaId !== null && !/^[0-9a-f-]{36}$/.test(mediaId)) fail("Unknown photo.");

      const { data: version, error } = await supabase
        .from("image_versions")
        .insert({
          slot_id: input.slot,
          media_id: mediaId,
          alt: String(input.alt ?? "").trim().slice(0, 500),
          focal_x: clamp(Number(input.focalX), 0, 100),
          focal_y: clamp(Number(input.focalY), 0, 100),
          zoom: clamp(Number(input.zoom), 1, 4),
        })
        .select(VERSION_FIELDS)
        .single();
      if (error) fail("Could not save the draft.", error);

      const { error: slotError } = await supabase
        .from("image_slots")
        .upsert({ slot_id: input.slot, draft_version_id: version.id, updated_at: new Date().toISOString() });
      if (slotError) fail("Could not save the draft.", slotError);

      saved[input.slot] = toValue(input.slot, version as unknown as VersionWithMedia) ?? undefined;
    }
    return saved;
  });
}

/** Drops a slot's saved draft, so it goes back to the published photo. */
export async function discardDraft(slot: SlotId): Promise<ActionResult<null>> {
  return run(async (supabase) => {
    if (!isSlotId(slot)) fail("Unknown photo slot.");
    const { error } = await supabase
      .from("image_slots")
      .update({ draft_version_id: null, updated_at: new Date().toISOString() })
      .eq("slot_id", slot);
    if (error) fail("Could not discard the draft.", error);
    return null;
  });
}

/** Makes every saved photo and text draft live, then refreshes the public pages. */
export async function publishDrafts(): Promise<ActionResult<{ photos: SlotId[]; texts: string[] }>> {
  return run(async (supabase) => {
    const [photos, texts] = await Promise.all([
      supabase.rpc("publish_image_drafts"),
      supabase.rpc("publish_text_drafts"),
    ]);
    if (photos.error) fail("Publishing failed. Nothing was changed on the live site.", photos.error);
    if (texts.error) fail("Publishing the text failed. The photos were published; please try again.", texts.error);
    updateTag(SITE_IMAGES_TAG);
    updateTag(SITE_TEXTS_TAG);
    return {
      photos: ((photos.data ?? []) as string[]).filter(isSlotId),
      texts: (texts.data ?? []) as string[],
    };
  });
}

/** Creates a draft from the photo that was live before the current one. Publish to make it live. */
export async function restorePrevious(slot: SlotId): Promise<ActionResult<SlotValue>> {
  return run(async (supabase) => {
    if (!isSlotId(slot)) fail("Unknown photo slot.");
    const { data: current } = await supabase
      .from("image_slots")
      .select("published_version_id")
      .eq("slot_id", slot)
      .maybeSingle();

    let query = supabase
      .from("image_versions")
      .select("media_id, alt, focal_x, focal_y, zoom")
      .eq("slot_id", slot)
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .limit(1);
    if (current?.published_version_id) query = query.neq("id", current.published_version_id);
    const { data: previous, error } = await query.maybeSingle();
    if (error) fail("Could not find the previous photo.", error);
    if (!previous) fail("There is no earlier published photo for this spot.");

    const result = await saveDrafts([
      { slot, mediaId: previous.media_id, alt: previous.alt, focalX: previous.focal_x, focalY: previous.focal_y, zoom: previous.zoom },
    ]);
    if (!result.ok) fail(result.error);
    const value = result.data[slot];
    if (!value) fail("Could not restore the previous photo.");
    return value;
  });
}

/** The media library, newest first, optionally filtered by file name. */
export async function listMedia(search = "", offset = 0): Promise<ActionResult<{ items: MediaItem[]; more: boolean }>> {
  return run(async (supabase) => {
    const pageSize = 48;
    let query = supabase
      .from("photo_files")
      .select("id, storage_path, filename, width, height, size_bytes, created_at")
      .order("created_at", { ascending: false })
      .range(Math.max(0, offset), Math.max(0, offset) + pageSize);
    const term = String(search).trim().slice(0, 100).replace(/[\\%_]/g, (character) => `\\${character}`);
    if (term) query = query.ilike("filename", `%${term}%`);
    const { data, error } = await query;
    if (error) fail("Could not load the media library.", error);
    return { items: data.slice(0, pageSize).map(toMediaItem), more: data.length > pageSize };
  });
}

/** Records a file the browser has just uploaded to Storage, after checking it is really there. */
export async function registerMedia(input: NewMedia): Promise<ActionResult<MediaItem>> {
  return run(async (supabase) => {
    const storagePath = String(input?.storagePath ?? "");
    if (!/^uploads\/[0-9a-f-]{36}\/[A-Za-z0-9._-]{1,120}$/.test(storagePath)) fail("Invalid upload location.");
    if (!(ACCEPTED_UPLOAD_TYPES as readonly string[]).includes(input.mimeType)) fail("Unsupported image type.");
    const width = Math.round(Number(input.width));
    const height = Math.round(Number(input.height));
    const sizeBytes = Math.round(Number(input.sizeBytes));
    if (!(width > 0 && height > 0 && width <= 20000 && height <= 20000)) fail("Invalid image dimensions.");
    if (!(sizeBytes > 0 && sizeBytes <= MAX_UPLOAD_BYTES)) fail("Invalid file size.");

    const { data: exists, error: existsError } = await supabase.storage.from(MEDIA_BUCKET).exists(storagePath);
    if (existsError || !exists) fail("The upload didn't finish. Please try again.", existsError);

    const filename = String(input.filename ?? "photo").trim().slice(0, 255) || "photo";
    const { data, error } = await supabase
      .from("photo_files")
      .insert({ storage_path: storagePath, filename, mime_type: input.mimeType, width, height, size_bytes: sizeBytes })
      .select("id, storage_path, filename, width, height, size_bytes, created_at")
      .single();
    if (error) fail("Could not add the photo to the library.", error);
    return toMediaItem(data);
  });
}
