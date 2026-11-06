"use client";

import { useEffect, useId, useRef, useState, type SVGAttributes } from "react";

type PathTextProps = {
  text: string;
  /** The path the text follows, in the viewBox's units. */
  d: string;
  viewBox: string;
  /** Largest font size in viewBox units. It shrinks, never grows, to fit the path. */
  size: number;
  uppercase?: boolean;
  letterSpacing?: string;
  /** Optical size axis of the display font: higher is thinner, finer and narrower. */
  opticalSize?: number;
} & Omit<SVGAttributes<SVGSVGElement>, "children" | "d">;

/** Share of the path the text may fill. Glyphs past the end of a text path are not drawn. */
const FILL = 0.95;

/**
 * Live text set along any curve with an SVG textPath, in the site's display serif, centred on the
 * path. The size shrinks only as far as the longest wording needs, so edited text always stays
 * fully visible and the letters are never stretched.
 */
export function PathText({ text, d, viewBox, size, uppercase = false, letterSpacing = "0.01em", opticalSize, className, ...rest }: PathTextProps) {
  const id = useId();
  const shown = (uppercase ? text.toUpperCase() : text).replace(/\s*\n\s*/g, " ").trim();
  const pathRef = useRef<SVGPathElement>(null);
  const labelRef = useRef<SVGTextElement>(null);
  const [fit, setFit] = useState(() => Math.min(1, 1150 / (Math.max(1, shown.length) * size * 0.66)));

  useEffect(() => {
    let current = true;
    const measure = () => {
      const path = pathRef.current;
      const width = labelRef.current?.getComputedTextLength() ?? 0;
      if (!current || !path || !width) return;
      const next = Math.min(1, (path.getTotalLength() * FILL) / (width / fit));
      if (Math.abs(next - fit) > 0.002) setFit(next);
    };
    measure();
    // The web font arrives after the first paint and changes the widths.
    void document.fonts?.ready.then(measure);
    return () => {
      current = false;
    };
  }, [shown, fit]);

  return (
    <svg viewBox={viewBox} role="img" aria-label={shown} className={className} {...rest} overflow="visible">
      <defs>
        <path ref={pathRef} id={id} d={d} fill="none" />
      </defs>
      <text ref={labelRef} fill="currentColor" fontFamily="var(--font-display)" fontSize={size * fit} style={{ letterSpacing, fontVariationSettings: opticalSize ? `"opsz" ${opticalSize}` : undefined }} textAnchor="middle">
        <textPath href={`#${id}`} startOffset="50%">
          {shown}
        </textPath>
      </text>
    </svg>
  );
}
