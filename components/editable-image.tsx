"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { EditHandle } from "@/components/edit-handle";
import { useSlotImage } from "@/components/site-images-provider";
import { cropStyle, type SlotId } from "@/lib/images";
import { altFor } from "@/lib/seo-alt";

export type EditableImageProps = {
  slot: SlotId;
  /** Classes for the wrapper, which sets the size and shape of the crop. */
  className?: string;
  /** Extra styles for the wrapper, for example an aspect ratio. */
  style?: CSSProperties;
  /** Classes added to the image itself, for example a hover zoom. */
  imageClassName?: string;
  /** Browser layout width hint, for example "(min-width: 64rem) 40vw, 90vw". */
  sizes?: string;
  priority?: boolean;
  /** CSS object-position for the crop, used until a focal point is chosen in the editor. */
  position?: string;
  decorative?: boolean;
  /** Scroll depth: how far the photo drifts inside its frame, as a share of its height (about 0.05 to 0.12). */
  parallax?: number;
  /** With parallax, the photo also eases in gently as it scrolls past. */
  zoom?: boolean;
  /** Reveal style as the photo scrolls into view, for example "mask". */
  reveal?: string;
};

/**
 * A cropped, responsive photograph for one permanent image slot. Shows the
 * published photo (or its placeholder) and, for admins in edit mode, a
 * Replace button. The wrapper keeps every class the layout gives it, so
 * arches, ovals, borders and aspect ratios are unchanged.
 */
export function EditableImage({
  slot,
  className = "",
  style,
  imageClassName = "",
  sizes = "100vw",
  priority = false,
  position,
  decorative = false,
  parallax,
  zoom,
  reveal,
}: EditableImageProps) {
  const image = useSlotImage(slot);
  // `fill` images need a positioned parent, unless the caller already sets one.
  const positioning = /(^|\s)absolute(\s|$)/.test(className) ? "" : "relative";
  return (
    <div
      className={`${positioning} overflow-hidden ${className}`}
      style={style}
      data-parallax={parallax}
      data-zoom={(parallax && zoom) || undefined}
      data-reveal={reveal}
    >
      {image.src ? (
        <Image quality={85}
          src={image.src}
          alt={decorative ? "" : altFor(slot, image.alt)}
          fill
          sizes={sizes}
          priority={priority}
          className={`object-cover ${imageClassName}`.trim()}
          style={cropStyle(image, position)}
        />
      ) : null}
      <EditHandle slot={slot} defaultPosition={position} />
    </div>
  );
}
