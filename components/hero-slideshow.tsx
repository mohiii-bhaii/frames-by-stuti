"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { EditHandle, useRegisterSlot } from "@/components/edit-handle";
import { useIsEditing, useSlotImage } from "@/components/site-images-provider";
import { cropStyle, type ImageSlot } from "@/lib/images";

const INTERVAL_MS = 5000;

function Slide({ slot, sizes, first, visible }: { slot: ImageSlot; sizes: string; first: boolean; visible: boolean }) {
  const image = useSlotImage(slot);
  useRegisterSlot(slot);
  if (!image.src) return null;
  return (
    <Image
      src={image.src}
      alt={visible ? image.alt : ""}
      fill
      sizes={sizes}
      priority={first}
      className={`object-cover transition-opacity duration-[1200ms] ${visible ? "opacity-100" : "opacity-0"}`}
      style={cropStyle(image)}
    />
  );
}

/** Crossfading hero photographs. Stays on the first image for reduced motion. */
export function HeroSlideshow({ slots, sizes }: { slots: ImageSlot[]; sizes: string }) {
  const [active, setActive] = useState(0);
  const editing = useIsEditing();

  useEffect(() => {
    // Hold still while editing, so the photo being replaced stays in view.
    if (editing || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slots.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [slots.length, editing]);

  return (
    <>
      {slots.map((slot, index) => (
        <Slide key={slot} slot={slot} sizes={sizes} first={index === 0} visible={index === active} />
      ))}
      <EditHandle slot={slots[active]} label={`Replace slide ${active + 1}`} />
      {editing ? (
        <div className="absolute inset-x-0 bottom-3 z-[22] flex justify-center gap-2" role="group" aria-label="Choose a slide to edit">
          {slots.map((slot, index) => (
            <button
              key={slot}
              type="button"
              aria-pressed={index === active}
              onClick={() => setActive(index)}
              className="min-h-11 min-w-11 rounded-full bg-black/70 px-3 text-sm font-medium text-white aria-pressed:bg-[#2f6fed]"
            >
              {index + 1}
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}
