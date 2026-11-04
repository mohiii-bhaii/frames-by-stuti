"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { EditHandle, useRegisterSlot } from "@/components/edit-handle";
import { useIsEditing, usePublishedSlides, useSlotImage } from "@/components/site-images-provider";
import { cropStyle, type ImageSlot } from "@/lib/images";

type PhotoSlideshowProps = {
  /** Every slot the slideshow can show, in order. Slots with no photo yet are skipped for visitors. */
  slots: ImageSlot[];
  sizes: string;
  /** Time on each photograph. */
  intervalMs?: number;
  /** How long the crossfade between two photographs takes. */
  fadeMs?: number;
  /**
   * Classes for a frame that the slideshow draws itself (size, shape, overflow).
   * Leave out when the parent already provides the frame.
   */
  frameClassName?: string;
  /** Scroll depth for the photos inside the frame, as for EditableImage. */
  parallax?: number;
  /** Load the first photograph straight away. For slideshows at the top of a page. */
  priority?: boolean;
};

/** The photo on show fades in over the one that was showing, which stays solid underneath until the fade is done. */
type SlideState = "active" | "previous" | "hidden";

function Slide({
  slot,
  sizes,
  first,
  state,
  fadeMs,
}: {
  slot: ImageSlot;
  sizes: string;
  first: boolean;
  state: SlideState;
  fadeMs: number;
}) {
  const image = useSlotImage(slot);
  useRegisterSlot(slot);
  if (!image.src) return null;
  return (
    <Image
      src={image.src}
      alt={state === "active" ? image.alt : ""}
      fill
      sizes={sizes}
      priority={first}
      className={`object-cover ease-in-out ${state === "hidden" ? "opacity-0" : "opacity-100"}`}
      style={{
        ...cropStyle(image),
        zIndex: state === "active" ? 2 : state === "previous" ? 1 : 0,
        // Only the incoming photo fades. The others change instantly, out of sight.
        transition: state === "active" ? `opacity ${fadeMs}ms` : "none",
      }}
    />
  );
}

/**
 * Crossfading photographs that rotate by themselves. Visitors see only the
 * slots that have a real photograph, so it works with one, two or all of them.
 * Photos are added to the page as the slideshow reaches them, so a visitor
 * doesn't download them all up front. Stays still for reduced motion, and
 * while the owner is editing, when every slot is shown with a button to pick
 * which one to replace.
 */
export function PhotoSlideshow({
  slots,
  sizes,
  intervalMs = 2500,
  fadeMs = 900,
  frameClassName,
  parallax,
  priority = false,
}: PhotoSlideshowProps) {
  const editing = useIsEditing();
  const published = usePublishedSlides(slots);
  const shown = editing ? slots : published;
  const [position, setPosition] = useState({ index: 0, reached: 0, previous: -1 });
  const count = shown.length;
  const active = position.index % count;

  useEffect(() => {
    // Hold still while editing, so the photo being replaced stays in view.
    if (editing || count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setPosition((current) => {
        const next = (current.index + 1) % count;
        return { index: next, reached: Math.max(current.reached, next), previous: current.index };
      });
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [count, editing, intervalMs]);

  // Everything up to the next photograph is on the page; the rest waits its turn.
  const mounted = editing ? count : Math.min(count, position.reached + 2);

  const content = (
    <>
      {shown.map((slot, index) =>
        index < mounted ? (
          <Slide
            key={slot}
            slot={slot}
            sizes={sizes}
            first={priority && index === 0}
            state={index === active ? "active" : index === position.previous % count ? "previous" : "hidden"}
            fadeMs={fadeMs}
          />
        ) : null,
      )}
      <EditHandle slot={shown[active]} label={`Replace slide ${active + 1}`} />
      {editing ? (
        <div className="absolute inset-x-0 bottom-3 z-[22] flex flex-wrap justify-center gap-2" role="group" aria-label="Choose a slide to edit">
          {shown.map((slot, index) => (
            <button
              key={slot}
              type="button"
              aria-pressed={index === active}
              onClick={() => setPosition((current) => ({ ...current, index, previous: current.index }))}
              className="min-h-11 min-w-11 rounded-full bg-black/70 px-3 text-sm font-medium text-white aria-pressed:bg-[#2f6fed]"
            >
              {index + 1}
            </button>
          ))}
        </div>
      ) : null}
    </>
  );

  if (!frameClassName) return content;
  return (
    <div className={`relative overflow-hidden ${frameClassName}`} data-parallax={parallax}>
      {content}
    </div>
  );
}
