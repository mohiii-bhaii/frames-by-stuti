"use client";

import { useEffect, useId, useRef, useState, type SVGAttributes } from "react";

type WaveTextProps = {
  text: string;
} & Omit<SVGAttributes<SVGSVGElement>, "children">;

/**
 * One soft S-shaped wave across a 1000-unit-wide canvas: it dips on the left, rises to a crest on the
 * right and settles at the end, like a ribbon of handwriting. Both lines follow the same wave.
 */
const WAVE = "M10 40C330 210 600 -120 990 60";
const LINE_GAP = 128;
const SIZE = 98;
/** Share of the wave a line may fill. Glyphs past the end of a text path are not drawn. */
const FILL = 0.93;

/** Quiet clean-up of what was typed: line breaks kept, stray spaces before punctuation removed. */
function toLines(text: string) {
  const tidy = (line: string) => line.replace(/\s+([,.;:!?])/g, "$1").replace(/\s{2,}/g, " ").trim();
  let lines = text.split("\n").map(tidy).filter(Boolean);
  // Typed in capitals? Show it softly in lowercase, as a flowing line of writing. Mixed case is left alone.
  lines = lines.map((line) => (line === line.toUpperCase() ? line.toLowerCase() : line));
  // A long single line breaks after its first comma, so it can be set large on a phone.
  if (lines.length === 1 && lines[0].length > 26) {
    const comma = lines[0].indexOf(",");
    if (comma > 6 && comma < lines[0].length - 6) lines = [lines[0].slice(0, comma + 1), lines[0].slice(comma + 1).trim()];
  }
  return lines.slice(0, 3);
}

/**
 * Live text set along a flowing wave, in a light high-contrast serif. The size is the same on every
 * line and shrinks only as far as needed for the longest line to fit, so edited text always stays
 * fully visible and the letters are never stretched.
 */
export function WaveText({ text, className, ...rest }: WaveTextProps) {
  const id = useId();
  const lines = toLines(text);
  const pathRef = useRef<SVGPathElement>(null);
  const labels = useRef<(SVGTextElement | null)[]>([]);
  const longest = Math.max(1, ...lines.map((line) => line.length));
  const [fit, setFit] = useState(() => Math.min(1, 960 / (longest * SIZE * 0.5)));
  const joined = lines.join("\n");

  useEffect(() => {
    let current = true;
    const measure = () => {
      const path = pathRef.current;
      if (!current || !path) return;
      const widest = Math.max(0, ...labels.current.map((label) => label?.getComputedTextLength() ?? 0));
      if (!widest) return;
      const next = Math.min(1, (path.getTotalLength() * FILL) / (widest / fit));
      if (Math.abs(next - fit) > 0.002) setFit(next);
    };
    measure();
    // The web font arrives after the first paint and changes the widths.
    void document.fonts?.ready.then(measure);
    return () => {
      current = false;
    };
  }, [joined, fit]);

  const height = 350 + (lines.length - 2) * LINE_GAP;
  return (
    <svg viewBox={`0 -90 1000 ${height}`} role="img" aria-label={lines.join(" ")} className={className} {...rest} overflow="visible">
      <defs>
        <path ref={pathRef} id={id} d={WAVE} />
      </defs>
      {lines.map((line, index) => (
        <text
          key={index}
          ref={(node) => {
            labels.current[index] = node;
          }}
          transform={`translate(0 ${index * LINE_GAP})`}
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
      ))}
    </svg>
  );
}
