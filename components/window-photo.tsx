"use client";

import { Photo } from "@/components/photo";
import { useIsEditing } from "@/components/site-images-provider";
import type { ImageSlot } from "@/lib/images";

/**
 * A photograph that stays still while the page scrolls past it, like a window onto the picture.
 * It must sit inside a section that clips it (see .window-section in globals.css): the photo is
 * drawn at the size of the screen, and the section shows only the part of it that is in view.
 * Unlike background-attachment: fixed, this works on iPhones, in Safari and in in-app browsers.
 *
 * While editing, the photo sits inside its section like any other so its Replace button and
 * crop preview match what is shown; visitors who prefer reduced motion get that too.
 */
export function WindowPhoto({ slot, sizes = "100vw" }: { slot: ImageSlot; sizes?: string }) {
  const editing = useIsEditing();
  return (
    <div className="window-photo" data-editing={editing || undefined}>
      <Photo slot={slot} className="h-full w-full" sizes={sizes} />
    </div>
  );
}
