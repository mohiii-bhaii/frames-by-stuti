"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { EditableImage } from "@/components/editable-image";
import { T } from "@/components/editable-text";
import { useIsEditing, useRealSlots, useSlotImage } from "@/components/site-images-provider";
import type { PortfolioCategory } from "@/content/portfolio";
import { getImage, type ImageSlot } from "@/lib/images";

/** After a visitor touches a row, it stays still this long before moving again. */
const RESUME_AFTER_MS = 3000;
/** A row only loops if its photographs are at least this much wider than the screen, so no photograph is ever seen twice at once. */
const LOOP_MARGIN = 60;

const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** One photograph in a row: full height, its own proportions, never cropped or stretched. */
function Tile({ slot, editing, onOpen, clone = false }: { slot: ImageSlot; editing: boolean; onOpen: () => void; clone?: boolean }) {
  const image = useSlotImage(slot);
  const { width, height } = image.width && image.height ? image : getImage(slot);
  const ratio = width / height;
  const sizes = `(min-width: 64rem) ${Math.round(440 * ratio)}px, (min-width: 48rem) ${Math.round(380 * ratio)}px, ${Math.round(260 * ratio)}px`;
  return (
    <li
      // The repeated copy that makes the loop seamless: invisible to assistive technology and not interactive.
      {...(clone ? { "data-clone": "", "aria-hidden": true, inert: true } : null)}
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
    <Image quality={85} key={image.src} src={image.src} alt={image.alt} fill sizes="100vw" className="animate-[fade-in_0.3s_ease] object-contain p-2 md:px-20" />
  );
}

/** One category: a centred heading over a horizontally scrolling row, with its own full-screen viewer. */
function Row({ category, shown, editing, index }: { category: PortfolioCategory; shown: ImageSlot[]; editing: boolean; index: number }) {
  const scroller = useRef<HTMLUListElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const dragged = useRef(false);
  const swipe = useRef<number | null>(null);
  // How the row moves by itself: "loop" repeats the photos seamlessly, "drift" slowly goes to the end and back, "none" stays still.
  const [auto, setAuto] = useState<"none" | "loop" | "drift">("none");
  const [layoutKey, setLayoutKey] = useState(0);
  const openRef = useRef<number | null>(null);
  // Until this time, the visitor is in charge and the row does not move by itself.
  const userUntil = useRef(0);
  const pauseForVisitor = useCallback(() => {
    userUntil.current = performance.now() + RESUME_AFTER_MS;
  }, []);

  const update = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    if (el.querySelector("[data-clone]")) {
      // A looping row has no start or end.
      setCanLeft(true);
      setCanRight(true);
      return;
    }
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
  }, [update, shown.length, auto]);

  const scrollBy = (direction: 1 | -1) => {
    const el = scroller.current;
    pauseForVisitor();
    el?.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  // Mouse dragging. Touch and trackpads already scroll the row natively.
  const onPointerDown = (event: ReactPointerEvent<HTMLUListElement>) => {
    const el = scroller.current;
    if (!el || event.pointerType !== "mouse" || event.button !== 0) return;
    pauseForVisitor();
    const startX = event.clientX;
    const startLeft = el.scrollLeft;
    dragged.current = false;
    el.style.scrollSnapType = "none";
    const move = (e: PointerEvent) => {
      const dx = e.clientX - startX;
      pauseForVisitor();
      if (Math.abs(dx) > 5) dragged.current = true;
      el.scrollLeft = startLeft - dx;
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      el.style.scrollSnapType = "";
      pauseForVisitor();
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
    openRef.current = open;
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open !== null && !dialog.open) dialog.showModal();
    if (open === null && dialog.open) dialog.close();
  }, [open]);

  // Decide how the row moves, from how wide its photographs are against the screen.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const recheck = () => setLayoutKey((key) => key + 1);
    reduced.addEventListener("change", recheck);
    const observer = new ResizeObserver(recheck);
    observer.observe(el);
    return () => {
      reduced.removeEventListener("change", recheck);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let desired: "none" | "loop" | "drift" = "none";
    if (!editing && !reduced && shown.length >= 2) {
      const style = getComputedStyle(el);
      const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const gap = parseFloat(style.columnGap) || 0;
      const first = el.querySelector("li");
      const clone = el.querySelector<HTMLElement>("li[data-clone]");
      // The width of one full set of photographs, measured the same way with or without the copy.
      const setWidth = clone && first ? clone.offsetLeft - first.offsetLeft : el.scrollWidth - padding + gap;
      const visible = el.clientWidth;
      if (shown.length >= 3 && setWidth > visible + LOOP_MARGIN) desired = "loop";
      else if (clone ? setWidth > visible + 4 : el.scrollWidth - visible > 4) desired = "drift";
    }
    if (desired !== auto) setAuto(desired);
  }, [shown.length, editing, layoutKey, auto]);

  // The movement itself. Runs only while the row is on screen, the tab is showing and nobody is using the row.
  useEffect(() => {
    const el = scroller.current;
    if (!el || auto === "none") return;
    const first = el.querySelector("li");
    const clone = el.querySelector<HTMLElement>("li[data-clone]");
    const setWidth = auto === "loop" && clone && first ? clone.offsetLeft - first.offsetLeft : 0;
    if (auto === "loop" && setWidth <= 0) return; // the copy has not been drawn yet; this effect runs again when it is
    const visible = el.clientWidth;
    // About 30 seconds for the whole set, kept gentle for short and very long rows.
    const pace = auto === "loop" ? Math.min(60, Math.max(15, setWidth / 30)) : Math.min(40, Math.max(15, (el.scrollWidth - visible) / 12));
    // Each row starts at its own place, so the rows never move in step with each other.
    let pos = auto === "loop" ? setWidth + setWidth * ((index * 0.37) % 1) : el.scrollLeft;
    let lastSet = pos;
    let direction = 1;
    let holdUntil = 0;
    let onScreen = false;
    let last = performance.now();
    let frame = 0;

    const wrap = (x: number) => {
      if (auto !== "loop") return x;
      const end = 2 * setWidth - visible - 10;
      if (x >= end) return x - setWidth;
      if (x <= 10) return x + setWidth;
      return x;
    };
    const apply = (x: number) => {
      pos = wrap(x);
      lastSet = pos;
      el.scrollLeft = pos;
    };
    apply(pos);

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min(now - last, 100);
      last = now;
      if (!onScreen || document.hidden || openRef.current !== null || now < userUntil.current || now < holdUntil) return;
      if (auto === "loop") {
        apply(pos + (pace * dt) / 1000);
        return;
      }
      const max = el.scrollWidth - el.clientWidth;
      const next = pos + direction * ((pace * dt) / 1000);
      if (next >= max || next <= 0) {
        pos = Math.min(max, Math.max(0, next));
        direction = -direction;
        holdUntil = now + 2000;
      } else {
        pos = next;
      }
      lastSet = pos;
      el.scrollLeft = pos;
    };

    // Movement we did not make (a swipe, its momentum, a wheel, a drag) hands control to the visitor.
    const onScroll = () => {
      if (Math.abs(el.scrollLeft - lastSet) > 1.5) {
        pauseForVisitor();
        pos = auto === "loop" ? wrap(el.scrollLeft) : el.scrollLeft;
        if (pos !== el.scrollLeft && auto === "loop") el.scrollLeft = pos;
        lastSet = pos;
      }
    };
    const intersection = new IntersectionObserver(([entry]) => (onScreen = entry.isIntersecting), { threshold: 0.05 });
    intersection.observe(el);
    const interact = () => pauseForVisitor();
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("touchstart", interact, { passive: true });
    el.addEventListener("wheel", interact, { passive: true });
    el.addEventListener("keydown", interact);
    el.addEventListener("focusin", interact);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      intersection.disconnect();
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("touchstart", interact);
      el.removeEventListener("wheel", interact);
      el.removeEventListener("keydown", interact);
      el.removeEventListener("focusin", interact);
    };
  }, [auto, shown.length, index, pauseForVisitor]);

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
          className={`no-scrollbar flex ${auto === "none" ? "snap-x snap-proximity" : ""} select-none gap-1 overflow-x-auto overscroll-x-contain px-4 [--row-h:260px] [scroll-padding-inline:1rem] md:px-6 md:[scroll-padding-inline:1.5rem] md:[--row-h:380px] lg:[--row-h:440px] [&>li:first-child]:ml-auto [&>li:last-child]:mr-auto`}
        >
          {shown.map((slot, index) => (
            <Tile key={slot} slot={slot} editing={editing} onOpen={() => openAt(index)} />
          ))}
          {auto === "loop" ? shown.map((slot) => <Tile key={`clone-${slot}`} slot={slot} editing={false} onOpen={() => {}} clone />) : null}
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
 * All the Galleries rows. Visitors see only photographs that are published;
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
      {rows.map(({ category, shown }, index) => (
        <Row key={category.id} category={category} shown={shown} editing={editing} index={index} />
      ))}
    </div>
  );
}
