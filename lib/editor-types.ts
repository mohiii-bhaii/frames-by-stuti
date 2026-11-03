import type { SlotId, SlotImage } from "@/lib/images";

/** A photo in the media library. */
export type MediaItem = {
  id: string;
  filename: string;
  url: string;
  width: number;
  height: number;
  sizeBytes: number;
  createdAt: string;
};

/** One state of a slot: which file it uses (null for the placeholder) and how it is shown. */
export type SlotValue = { mediaId: string | null; image: SlotImage };

export type SlotState = {
  published: SlotValue | null;
  draft: SlotValue | null;
  /** True when an earlier published version exists to restore. */
  hasPrevious: boolean;
};

/** A piece of text: what is live, and any saved draft. null means the original wording. */
export type TextState = {
  published: string | null;
  draft: { value: string | null } | null;
};

export type EditorSnapshot = {
  email: string;
  slots: Partial<Record<SlotId, SlotState>>;
  texts: Record<string, TextState>;
};

/** What the editor sends to save a text draft. null goes back to the original wording. */
export type TextDraftInput = { key: string; value: string | null };

/** What the editor sends to save a draft. Everything is re-validated on the server. */
export type DraftInput = {
  slot: SlotId;
  mediaId: string | null;
  alt: string;
  focalX: number;
  focalY: number;
  zoom: number;
};

export type NewMedia = {
  storagePath: string;
  filename: string;
  mimeType: string;
  width: number;
  height: number;
  sizeBytes: number;
};

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string; signedOut?: boolean };
