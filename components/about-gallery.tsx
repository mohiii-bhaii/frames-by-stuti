"use client";

import type { CSSProperties } from "react";
import { T } from "@/components/editable-text";
import { Photo } from "@/components/photo";
import { useIsEditing, useRealSlots } from "@/components/site-images-provider";
import type { ImageSlot } from "@/lib/images";

export type GalleryItem = { slot: ImageSlot; shape: "portrait" | "landscape" };

/**
 * A few personal photographs. Visitors see only the spots that have a real
 * photograph published, centred, so one, two or five photos all look complete.
 * With none published the whole section stays hidden. While editing, every
 * spot is shown so photos can be added; "Go back to the original placeholder"
 * on a photo removes it from the page again.
 */
export function AboutGallery({ items }: { items: GalleryItem[] }) {
  const editing = useIsEditing();
  const real = useRealSlots(items.map((item) => item.slot));
  const shown = editing ? items : items.filter((item) => real.includes(item.slot));
  if (shown.length === 0) return null;

  return (
    <section className="paper relative overflow-x-clip">
      <div className="mx-auto max-w-[1100px] px-6 pb-16 pt-4 lg:px-[70px] lg:pb-[104px]">
        <T as="h2" id="about.gallery.heading" data-reveal="title" className="script text-center text-[36px] text-terracotta lg:text-[50px]" />
        <ul className="mt-10 flex flex-wrap items-end justify-center gap-4 md:mt-14 md:gap-6 lg:gap-8">
          {shown.map((item, index) => (
            <li
              key={item.slot}
              data-reveal="up"
              style={{ "--reveal-delay": `${(index % 3) * 0.12}s` } as CSSProperties}
              className={item.shape === "portrait" ? "w-[calc(50%-8px)] md:w-[28%] lg:w-[270px]" : "w-full md:w-[46%] lg:w-[440px]"}
            >
              <Photo
                slot={item.slot}
                className={`w-full rounded-[28px] ${item.shape === "portrait" ? "aspect-[4/5]" : "aspect-[3/2]"}`}
                sizes={item.shape === "portrait" ? "(min-width: 64rem) 270px, 50vw" : "(min-width: 64rem) 440px, 92vw"}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
