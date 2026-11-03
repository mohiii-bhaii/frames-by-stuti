"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { EditHandle } from "@/components/edit-handle";
import { useSlotImage } from "@/components/site-images-provider";
import type { LogoSlot } from "@/lib/images";

/**
 * Shows an uploaded logo image when one is published, otherwise the typeset
 * logo passed as children. Admins can replace it in edit mode.
 */
export function EditableLogo({ slot, className, children }: { slot: LogoSlot; className: string; children: ReactNode }) {
  const image = useSlotImage(slot);
  return (
    <>
      {image.src ? (
        <Image src={image.src} alt="" width={image.width} height={image.height} sizes="400px" className={className} />
      ) : (
        children
      )}
      <EditHandle slot={slot} label="Replace logo" />
    </>
  );
}
