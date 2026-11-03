"use client";

import { createContext, use, type ReactNode } from "react";
import type { ImageMap } from "@/lib/cms";
import { editorStore, useEditorStore } from "@/lib/editor-store";
import { getFallbackImage, type SlotId, type SlotImage } from "@/lib/images";

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
