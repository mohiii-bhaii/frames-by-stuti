"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * Tells the header it is on the homepage (see globals.css, [data-page-home]).
 *
 * Next keeps pages you have navigated away from in the document, hidden. A
 * plain marker element would stay behind and make every later page look like
 * the homepage. Effects are switched off while a page is hidden, so the
 * attribute is added when this page is showing and removed when it is not. The
 * server still renders it, so the first paint is right with no flash.
 */
export function HomeMarker() {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const marker = ref.current;
    marker?.setAttribute("data-page-home", "");
    return () => marker?.removeAttribute("data-page-home");
  }, []);
  return <span ref={ref} hidden data-page-home="" />;
}
