"use client";

import { useEffect, useId, useRef, useState, type SVGAttributes } from "react";

type WaveTextProps = {
  text: string;
} & Omit<SVGAttributes<SVGSVGElement>, "children">;

/**
 * One soft S-shaped wave across a 1000-unit-wide canvas: it dips on the left, rises to a crest on the
 * right and settles at the end, like a ribbon of handwriting. 
 */
const WAVE = "M10 40C330 210 600 -120 990 60";
const SIZE = 98;
/** Share of the wave a line may fill. Glyphs past the end of a text path are not drawn. */
const FILL = 0.93;

/** Quiet clean-up of what was typed: one line, stray spaces before punctuation removed. */
function toLine(text: string) {
  const line = text.replace(/\s*\n\s*/g, " ").replace(/\s+([,.;:!?])/g, "$1").replace(/\s{2,}/g, " ").trim();
  // Typed in capitals? Show it softly in lowercase, as a flowing line of writing. Mixed case is left alone.
  return line === line.toUpperCase() ? line.toLowerCase() : line;
}

/**
 * Live text set on one line along a flowing wave, in a light high-contrast serif. The size shrinks only as far as needed for the line to fit, so edited text always stays
 * fully visible and the letters are never stretched.
 */
export function WaveText({ text, className, ...rest }: WaveTextProps) {
  const id = useId();
  const line = toLine(text);
  const pathRef = useRef<SVGPathElement>(null);
  const label = useRef<SVGTextElement>(null);
  const [fit, setFit] = useState(() => Math.min(1, 960 / (Math.max(1, line.length) * SIZE * 0.5)));

  useEffect(() => {
    let current = true;
    const measure = () => {
      const path = pathRef.current;
      if (!current || !path) return;
      const width = label.current?.getComputedTextLength() ?? 0;
      if (!width) return;
      const next = Math.min(1, (path.getTotalLength() * FILL) / (width / fit));
      if (Math.abs(next - fit) > 0.002) setFit(next);
    };
    measure();
    // The web font arrives after the first paint and changes the widths.
    void document.fonts?.ready.then(measure);
    return () => {
      current = false;
    };
  }, [line, fit]);

  return (
    <svg viewBox="0 -62 1000 215" role="img" aria-label={line} className={className} {...rest} overflow="visible">
      <defs>
        <path ref={pathRef} id={id} d={WAVE} />
      </defs>
      <text
        ref={label}
        fill="currentColor"
        fontFamily="var(--font-fraunces), var(--font-display), serif"
        fontWeight={340}
        fontSize={SIZE * fit}
        style={{ letterSpacing: "-0.005em", fontVariationSettings: '"opsz" 144' }}
        textAnchor="middle"
      >
        <textPath href={`#${id}`} startOffset="50%">
          {line}
        </textPath>
      </text>
    </svg>
  );
}
