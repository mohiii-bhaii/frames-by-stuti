"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { EditableImage } from "@/components/editable-image";
import { T } from "@/components/editable-text";
import { useSlotImage } from "@/components/site-images-provider";
import { useText } from "@/components/site-texts-provider";
import { categories, type CategoryId } from "@/content/site";
import { getImage, type ImageSlot } from "@/lib/images";

export type GalleryItem = { slot: ImageSlot; category: CategoryId };

type Filter = CategoryId | "all";

const isFilter = (value: string): value is Filter =>
  value === "all" || categories.some((category) => category.id === value);

function GalleryTile({ slot, onOpen }: { slot: ImageSlot; onOpen: (trigger: HTMLElement) => void }) {
  const image = useSlotImage(slot);
  // Tiles keep the placeholder's proportions, so replacing a photo never reflows the gallery.
  const { width, height } = getImage(slot);
  return (
    <button
      type="button"
      onClick={(event) => onOpen(event.currentTarget)}
      aria-label={`View larger: ${image.alt}`}
      className="group block w-full cursor-zoom-in overflow-hidden rounded-[10px]"
    >
      <EditableImage
        slot={slot}
        className="w-full"
        style={{ aspectRatio: `${width} / ${height}` }}
        imageClassName="transition-[scale,filter] duration-[1.2s] ease-[var(--ease-soft)] group-hover:scale-[1.05] group-hover:brightness-[1.04]"
        decorative
        sizes="(min-width: 64rem) 420px, (min-width: 48rem) 33vw, 50vw"
      />
    </button>
  );
}

function LightboxImage({ slot }: { slot: ImageSlot }) {
  const image = useSlotImage(slot);
  if (!image.src) return null;
  return (
    <Image key={image.src} src={image.src} alt={image.alt} fill sizes="100vw" className="animate-[fade-in_0.3s_ease] object-contain p-2 md:px-20" />
  );
}

export function PortfolioGallery({ items }: { items: GalleryItem[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [activeSlot, setActiveSlot] = useState<ImageSlot | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Home page session cards link here as /portfolio#family and so on.
  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.slice(1);
      if (!isFilter(hash)) return;
      setFilter(hash);
      filtersRef.current?.scrollIntoView({ block: "start" });
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const visible = filter === "all" ? items : items.filter((item) => item.category === filter);
  const activeIndex = visible.findIndex((item) => item.slot === activeSlot);
  const active = activeIndex >= 0 ? visible[activeIndex] : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (active && !dialog.open) dialog.showModal();
    if (!active && dialog.open) dialog.close();
  }, [active]);

  const step = useCallback(
    (delta: number) => {
      setActiveSlot((slot) => {
        const index = visible.findIndex((item) => item.slot === slot);
        if (index < 0) return slot;
        return visible[(index + delta + visible.length) % visible.length].slot;
      });
    },
    [visible],
  );

  const close = () => {
    setActiveSlot(null);
    triggerRef.current?.focus();
  };

  const activeCategory = useText(`category.${active?.category ?? categories[0].id}`);

  return (
    <>
      <div
        ref={filtersRef}
        role="group"
        aria-label="Filter photographs by session type"
        className="flex scroll-mt-6 flex-wrap justify-center gap-x-6 gap-y-3 px-4"
      >
        {[{ id: "all" as const, label: "All" }, ...categories].map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={filter === option.id}
            onClick={() => setFilter(option.id)}
            className="eyebrow min-h-11 border-b border-transparent px-1 text-[13px] text-walnut transition-colors duration-500 hover:text-rust aria-pressed:border-rust aria-pressed:text-rust lg:text-[14px]"
          >
            <T id={option.id === "all" ? "portfolio.filterAll" : `category.${option.id}`} />
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {visible.length} photographs
      </p>

      <ul className="mx-auto mt-10 max-w-[1320px] columns-2 gap-2 px-2 md:columns-3 md:gap-4 md:px-6 lg:mt-14">
        {visible.map((item, index) => (
          <li
            key={item.slot}
            className="mb-2 break-inside-avoid animate-[rise_0.9s_var(--ease-soft)_both] md:mb-4"
            style={{ animationDelay: `${Math.min(index, 12) * 0.05}s` }}
          >
            <GalleryTile
              slot={item.slot}
              onOpen={(trigger) => {
                triggerRef.current = trigger;
                setActiveSlot(item.slot);
              }}
            />
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label="Photograph viewer"
        className="lightbox"
        onClose={() => {
          if (activeSlot) close();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") step(1);
          if (event.key === "ArrowLeft") step(-1);
        }}
      >
        {active ? (
          <div className="flex h-full flex-col text-cream">
            <div className="flex items-center justify-between px-4 py-2">
              <p className="eyebrow text-[12px]">
                {activeCategory} &middot; {activeIndex + 1} of {visible.length}
              </p>
              <button
                type="button"
                autoFocus
                onClick={close}
                aria-label="Close viewer"
                className="flex h-11 w-11 items-center justify-center"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" aria-hidden="true">
                  <path d="M3 3l18 18M21 3L3 21" />
                </svg>
              </button>
            </div>
            <div className="relative min-h-0 flex-1">
              <LightboxImage slot={active.slot} />
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
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
