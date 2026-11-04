"use client";

import { createContext, use, useMemo, type ReactNode } from "react";
import type { ImageMap } from "@/lib/cms";
import { editorStore, useEditorStore } from "@/lib/editor-store";
import { getFallbackImage, type ImageSlot, type SlotId, type SlotImage } from "@/lib/images";

const PublishedImages = createContext<ImageMap>({});

/** Shares the published photographs with every image on the page. */
export function SiteImagesProvider({ images, children }: { images: ImageMap; children: ReactNode }) {
  return <PublishedImages value={images}>{children}</PublishedImages>;
}

/**
 * What a slot should show right now: the editor's working copy while editing,
 * otherwise the published photo, otherwise the placeholder.
 */
export function useSlotImage(slot: SlotId): SlotImage {
  const published = use(PublishedImages)[slot];
  const editing = useEditorStore((current) => (current.active ? current.display[slot] : undefined));
  return editing ?? published ?? getFallbackImage(slot);
}

export function useIsEditing() {
  return useEditorStore((current) => current.active && current.mode === "edit");
}

export { editorStore };

/**
 * The slots of a slideshow that have a real photograph published. A slideshow
 * works with one, two or all of its photos: empty spots are simply skipped, and
 * if none has a photo yet the first slot shows its placeholder.
 */
export function usePublishedSlides(slots: ImageSlot[]): ImageSlot[] {
  const published = use(PublishedImages);
  // While the owner previews, drafts count as well, so Preview shows what Publish would.
  const drafts = useEditorStore((current) => (current.active ? current.display : null));
  return useMemo(() => {
    const real = slots.filter((slot) => {
      const src = (drafts?.[slot] ?? published[slot])?.src;
      return Boolean(src) && !src!.startsWith("/images/");
    });
    return real.length > 0 ? real : slots.slice(0, 1);
  }, [published, drafts, slots]);
}
