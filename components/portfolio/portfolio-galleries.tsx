"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { EditableImage } from "@/components/editable-image";
import { T } from "@/components/editable-text";
import { useIsEditing, useRealSlots, useSlotImage } from "@/components/site-images-provider";
import type { PortfolioCategory } from "@/content/portfolio";
import { getImage, type ImageSlot } from "@/lib/images";

const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** One photograph in a row: full height, its own proportions, never cropped or stretched. */
function Tile({ slot, editing, onOpen }: { slot: ImageSlot; editing: boolean; onOpen: () => void }) {
  const image = useSlotImage(slot);
  const { width, height } = image.width && image.height ? image : getImage(slot);
  const ratio = width / height;
  const sizes = `(min-width: 64rem) ${Math.round(440 * ratio)}px, (min-width: 48rem) ${Math.round(380 * ratio)}px, ${Math.round(260 * ratio)}px`;
  return (
    <li
      className="shrink-0 snap-start"
      // The row height, but never so tall that a wide photograph is wider than the screen.
      style={{ aspectRatio: `${width} / ${height}`, height: `min(var(--row-h), calc((100vw - 2rem) / ${ratio}))` }}
    >
      <button
        type="button"
        // In edit mode a tap edits the photo (its Replace button); it must not open the viewer.
        onClick={editing ? undefined : onOpen}
        aria-label={image.alt ? `View larger: ${image.alt}` : "View photograph larger"}
        className={`group block h-full w-full overflow-hidden rounded-[6px] ${editing ? "cursor-default" : "cursor-zoom-in"}`}
      >
        <EditableImage
          slot={slot}
          className="h-full w-full"
          imageClassName="transition-[scale,filter] duration-[1.2s] ease-[var(--ease-soft)] group-hover:scale-[1.03] group-hover:brightness-[1.03]"
          sizes={sizes}
        />
      </button>
    </li>
  );
}

function Arrow({ direction, onClick }: { direction: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "left" ? "Scroll photographs left" : "Scroll photographs right"}
      className={`absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream/85 text-espresso shadow-[0_6px_18px_-8px_rgb(53_48_38/0.5)] transition-[background-color,opacity] duration-500 hover:bg-cream md:h-12 md:w-12 ${
        direction === "left" ? "left-2 md:left-4" : "right-2 md:right-4"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.500" aria-hidden="true">
        <path d={direction === "left" ? "M15 4l-8 8 8 8" : "M9 4l8 8-8 8"} />
      </svg>
    </button>
  );
}

function LightboxPhoto({ slot }: { slot: ImageSlot }) {
  const image = useSlotImage(slot);
  if (!image.src) return null;
  return (
    <Image key={image.src} src={image.src} alt={image.alt} fill sizes="100vw" className="animate-[fade-in_0.3s_ease] object-contain p-2 md:px-20" />
  );
}

/** One category: a centred heading over a horizontally scrolling row, with its own full-screen viewer. */
function Row({ category, shown, editing }: { category: PortfolioCategory; shown: ImageSlot[]; editing: boolean }) {
  const scroller = useRef<HTMLUListElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const dragged = useRef(false);
  const swipe = useRef<number | null>(null);

  const update = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [update, shown.length]);

  const scrollBy = (direction: 1 | -1) => {
    const el = scroller.current;
    el?.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  // Mouse dragging. Touch and trackpads already scroll the row natively.
  const onPointerDown = (event: ReactPointerEvent<HTMLUListElement>) => {
    const el = scroller.current;
    if (!el || event.pointerType !== "mouse" || event.button !== 0) return;
    const startX = event.clientX;
    const startLeft = el.scrollLeft;
    dragged.current = false;
    el.style.scrollSnapType = "none";
    const move = (e: PointerEvent) => {
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 5) dragged.current = true;
      el.scrollLeft = startLeft - dx;
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      el.style.scrollSnapType = "";
      // A drag must not count as a click on the photo under the pointer.
      window.setTimeout(() => (dragged.current = false), 0);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const openAt = (index: number) => {
    if (dragged.current) return;
    setOpen(index);
  };
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (delta: number) => setOpen((index) => (index === null ? index : (index + delta + shown.length) % shown.length)),
    [shown.length],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open !== null && !dialog.open) dialog.showModal();
    if (open === null && dialog.open) dialog.close();
  }, [open]);

  const activeSlot = open !== null ? shown[open] : null;
  const active = useSlotImage(activeSlot ?? shown[0]);

  return (
    <section aria-label={category.title}>
      <div className="relative mx-auto mb-6 flex min-h-[64px] items-center justify-center px-6 md:mb-8 md:min-h-[96px]">
        <span
          aria-hidden="true"
          className="script pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[72px] leading-none text-terracotta/15 md:text-[112px]"
        >
          {category.word}
        </span>
        <T
          as="h2"
          id={`portfolio.${category.id}.title`}
          className="display relative pl-[0.4em] text-center text-[20px] uppercase tracking-[0.4em] text-espresso md:text-[26px]"
        />
      </div>

      <div className="relative">
        <ul
          ref={scroller}
          onPointerDown={onPointerDown}
          // Dragging with a mouse scrolls the row; it must not start dragging the image itself.
          onDragStart={(event) => event.preventDefault()}
          className="no-scrollbar flex snap-x snap-proximity select-none gap-1 overflow-x-auto overscroll-x-contain px-4 [--row-h:260px] [scroll-padding-inline:1rem] md:px-6 md:[scroll-padding-inline:1.5rem] md:[--row-h:380px] lg:[--row-h:440px] [&>li:first-child]:ml-auto [&>li:last-child]:mr-auto"
        >
          {shown.map((slot, index) => (
            <Tile key={slot} slot={slot} editing={editing} onOpen={() => openAt(index)} />
          ))}
        </ul>
        {canLeft ? <Arrow direction="left" onClick={() => scrollBy(-1)} /> : null}
        {canRight ? <Arrow direction="right" onClick={() => scrollBy(1)} /> : null}
      </div>

      <dialog
        ref={dialogRef}
        aria-label={`${category.title} photograph viewer`}
        className="lightbox"
        onClose={() => {
          if (open !== null) close();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") step(1);
          if (event.key === "ArrowLeft") step(-1);
        }}
      >
        {activeSlot ? (
          <div className="flex h-full flex-col text-cream">
            <div className="flex items-center justify-between px-4 py-2">
              <p className="eyebrow text-[12px]">
                {category.title} &middot; {(open ?? 0) + 1} of {shown.length}
              </p>
              <button type="button" autoFocus onClick={close} aria-label="Close viewer" className="flex h-11 w-11 items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" aria-hidden="true">
                  <path d="M3 3l18 18M21 3L3 21" />
                </svg>
              </button>
            </div>
            <div
              className="relative min-h-0 flex-1 touch-pan-y"
              onPointerDown={(event) => {
                if (event.pointerType === "touch") swipe.current = event.clientX;
              }}
              onPointerUp={(event) => {
                if (swipe.current === null) return;
                const dx = event.clientX - swipe.current;
                swipe.current = null;
                if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
              }}
            >
              <LightboxPhoto slot={activeSlot} />
              {shown.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Previous photograph"
                    className="absolute left-1 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-espresso/60 md:left-4"
                  >
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.500" aria-hidden="true">
                      <path d="M15 4l-8 8 8 8" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Next photograph"
                    className="absolute right-1 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-espresso/60 md:right-4"
                  >
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.500" aria-hidden="true">
                      <path d="M9 4l8 8-8 8" />
                    </svg>
                  </button>
                </>
              ) : null}
            </div>
            {active.alt ? <p className="px-6 pb-4 pt-2 text-center text-[14px]">{active.alt}</p> : null}
          </div>
        ) : null}
      </dialog>
    </section>
  );
}

/**
 * All the Portfolio rows. Visitors see only photographs that are published;
 * a category with none is hidden, and so is the whole list if nothing is
 * published yet. While editing, every spot is shown so photos can be added.
 */
export function PortfolioGalleries({ categories }: { categories: PortfolioCategory[] }) {
  const editing = useIsEditing();
  const real = useRealSlots(categories.flatMap((category) => category.slots));
  const rows = categories
    .map((category) => ({ category, shown: editing ? category.slots : category.slots.filter((slot) => real.includes(slot)) }))
    .filter((row) => row.shown.length > 0);

  if (rows.length === 0) {
    return <T as="p" id="portfolio.empty" className="mx-auto max-w-[480px] px-6 py-16 text-center text-[16px] text-walnut" />;
  }
  return (
    <div className="space-y-14 md:space-y-20">
      {rows.map(({ category, shown }) => (
        <Row key={category.id} category={category} shown={shown} editing={editing} />
      ))}
    </div>
  );
}
