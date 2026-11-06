"use client";

import { useEffect, useId, useRef, useState, type SVGAttributes } from "react";

type PathTextProps = {
  text: string;
  /** The path the text follows, in the viewBox's units. It may run a little past the curve the text should fill (see fitD). */
  d: string;
  /** The stretch of curve the text is sized to fill. Defaults to all of d. Extra length in d beyond it is spare room, so that a browser that sets the text a little wider still draws every letter. */
  fitD?: string;
  viewBox: string;
  /** Largest font size in viewBox units. It shrinks, never grows, to fit the path. */
  size: number;
  uppercase?: boolean;
  letterSpacing?: string;
  /** Optical size axis of the display font: higher is thinner, finer and narrower. */
  opticalSize?: number;
  /** Keeps the drawn letters at least this many px inside both edges of the screen, shrinking the text if needed. */
  edgePadding?: number;
} & Omit<SVGAttributes<SVGSVGElement>, "children" | "d">;

/** Share of the curve the text may fill. Glyphs past the end of a text path are not drawn, so leave some room. */
const FILL = 0.93;
/**
 * A deliberately generous width per character, in ems, for the site's display capitals. Browsers differ in how
 * they report a text path's length (some report it before the web font has loaded), so the size is never allowed
 * to exceed what this estimate says fits, whatever was measured.
 */
const CHAR_EM = 0.64;

/**
 * Live text set along any curve with an SVG textPath, in the site's display serif, centred on the
 * path. The size shrinks only as far as the longest wording needs, so edited text always stays
 * fully visible and the letters are never stretched.
 */
export function PathText({ text, d, fitD, viewBox, size, uppercase = false, letterSpacing = "0.01em", opticalSize, edgePadding = 0, className, ...rest }: PathTextProps) {
  const id = useId();
  const shown = (uppercase ? text.toUpperCase() : text).replace(/\s*\n\s*/g, " ").trim();
  const fitRef = useRef<SVGPathElement>(null);
  const labelRef = useRef<SVGTextElement>(null);
  const [fit, setFit] = useState(() => Math.min(1, 1000 / (Math.max(1, shown.length) * size * CHAR_EM)));

  useEffect(() => {
    let current = true;
    const measure = () => {
      const path = fitRef.current;
      const label = labelRef.current;
      if (!current || !path || !label) return;
      const room = path.getTotalLength() * FILL;
      // Never larger than the estimate allows...
      let next = Math.min(1, room / (Math.max(1, shown.length) * size * CHAR_EM));
      // ...and smaller still if the browser says the text is wider than that.
      const width = label.getComputedTextLength();
      if (width > 0) next = Math.min(next, room / (width / fit));
      // The letters tilt along the curve, so the first and last stand a little outside the path's ends.
      // Measure where they really are and shrink the text until they clear the screen edges.
      const box = label.getBoundingClientRect();
      if (edgePadding > 0 && box.width > 0) {
        const over = Math.max(edgePadding - box.left, box.right - (window.innerWidth - edgePadding));
        if (over > 0) next = Math.min(next, fit * Math.max(0.5, 1 - (over / box.width) * 1.1));
      }
      if (Math.abs(next - fit) > 0.002) setFit(next);
    };
    measure();
    // The web font can arrive after the first paint and change the widths, and some browsers report
    // fonts as ready before they are used, so measure again as things settle.
    void document.fonts?.ready.then(measure);
    document.fonts?.addEventListener?.("loadingdone", measure);
    window.addEventListener("load", measure);
    window.addEventListener("resize", measure);
    const timers = [250, 800, 2000].map((ms) => window.setTimeout(measure, ms));
    return () => {
      current = false;
      document.fonts?.removeEventListener?.("loadingdone", measure);
      window.removeEventListener("load", measure);
      window.removeEventListener("resize", measure);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [shown, fit, size, edgePadding]);

  return (
    <svg viewBox={viewBox} role="img" aria-label={shown} className={className} {...rest} overflow="visible">
      <defs>
        <path ref={fitRef} d={fitD ?? d} fill="none" />
        <path id={id} d={d} fill="none" />
      </defs>
      <text ref={labelRef} fill="currentColor" fontFamily="var(--font-display)" fontSize={size * fit} style={{ letterSpacing, fontVariationSettings: opticalSize ? `"opsz" ${opticalSize}` : undefined }} textAnchor="middle">
        <textPath href={`#${id}`} startOffset="50%">
          {shown}
        </textPath>
      </text>
    </svg>
  );
}
