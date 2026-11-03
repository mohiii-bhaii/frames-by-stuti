"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useEditorStore } from "@/lib/editor-store";

gsap.registerPlugin(ScrollTrigger);
// Mobile address bars resize the viewport while scrolling. Ignoring that
// stops every trigger recalculating mid-scroll.
ScrollTrigger.config({ ignoreMobileResize: true });

/**
 * Scroll-linked depth for the whole site, driven by data attributes so the
 * page sections stay server components:
 *
 *   data-parallax="0.08"  a photo frame: its image drifts inside the frame by up to 8% of its height
 *   data-zoom             with data-parallax: the image also eases in as it scrolls past
 *   data-speed="0.2"      a foreground element: it moves faster (+) or slower (-) than the page
 *
 * GSAP only animates CSS variables. The stylesheet maps them onto the
 * `translate` and `scale` properties, which compose with the crop and zoom an
 * admin sets in the editor instead of overwriting them. Nothing pins or
 * hijacks scrolling, and it all switches off for reduced motion and while
 * photos are being edited, so the crop preview stays exact.
 *
 * Render it as the last element of a page, not in the layout. Its effect then
 * runs only once that page has hydrated, so React never sees the styles it
 * writes as a mismatch.
 */
export function ScrollMotion() {
  const pathname = usePathname();
  const editing = useEditorStore((current) => current.active && current.mode === "edit");

  useEffect(() => {
    if (editing) return;
    const media = gsap.matchMedia();
    setUp(media);
    return () => media.revert();
  }, [pathname, editing]);

  return null;
}

/** Connects every [data-parallax] and [data-speed] element on the page to the scroll position. */
function setUp(media: gsap.MatchMedia) {
  media.add("(prefers-reduced-motion: no-preference)", () => {
    const firstScreen = (element: Element) => element.getBoundingClientRect().top + window.scrollY < window.innerHeight;

    gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((frame) => {
      const amount = Number(frame.dataset.parallax) || 0.08;
      const zoom = frame.hasAttribute("data-zoom");
      // Large enough that the drifting image never shows the frame's edge.
      const cover = 1 + amount * 2 + 0.01;
      // A frame already on screen at load starts still and drifts as it leaves.
      const atTop = firstScreen(frame);
      gsap.set(frame, { "--parallax-scale": cover });
      gsap.fromTo(
        frame,
        {
          "--parallax-y": `${atTop ? 0 : -amount * 100}%`,
          ...(zoom ? { "--parallax-scale": atTop ? cover : cover + 0.08 } : {}),
        },
        {
          "--parallax-y": `${amount * 100}%`,
          ...(zoom ? { "--parallax-scale": atTop ? cover + 0.08 : cover } : {}),
          ease: "none",
          scrollTrigger: { trigger: frame, start: atTop ? "top top" : "top bottom", end: "bottom top", scrub: 0.6 },
        },
      );
    });

    gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((element) => {
      const speed = Number(element.dataset.speed) || 0;
      const distance = speed * 200;
      const atTop = firstScreen(element);
      gsap.fromTo(
        element,
        { "--speed-y": `${atTop ? 0 : distance}px` },
        {
          "--speed-y": `${-distance}px`,
          ease: "none",
          scrollTrigger: { trigger: element, start: atTop ? "top top" : "top bottom", end: "bottom top", scrub: 0.6 },
        },
      );
    });

    // Web fonts can still change the page height after load.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  });
}
