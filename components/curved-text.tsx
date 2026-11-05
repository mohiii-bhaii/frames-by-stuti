"use client";

import { useEffect, useId, useRef, useState, type SVGAttributes } from "react";

type CurvedTextProps = {
  text: string;
  className?: string;
  /** How far the arc rises, as a share of the width. */
  rise?: number;
  /** The largest text size, in viewBox units where the width is 1000. Longer text shrinks to fit. */
  size?: number;
  uppercase?: boolean;
  italic?: boolean;
  /**
   * Shows text that was typed in capitals as a sentence ("Creating timeless images, to last a lifetime"),
   * and tidies stray spaces and line breaks. The words are unchanged. Text with its own mixed case is left alone.
   */
  softCase?: boolean;
} & Omit<SVGAttributes<SVGSVGElement>, "className" | "children">;

function toSoftCase(text: string) {
  const tidy = text.replace(/\s*\n\s*/g, " ").replace(/\s+([,.;:!?])/g, "$1").replace(/\s{2,}/g, " ").trim();
  if (tidy !== tidy.toUpperCase()) return tidy;
  const lower = tidy.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/** Share of the arc the text may fill. Glyphs past the end of a text path are not drawn, so stay inside it. */
const FILL = 0.95;

/**
 * Live text set along a gentle arc. The text keeps the size it is given until
 * it would run past the ends of the arc, then it shrinks just enough to fit.
 * That way an edited, longer sentence is always fully visible, at any width,
 * and the arc, font and spacing stay exactly as designed.
 */
export function CurvedText({
  text,
  className,
  rise = 0.07,
  size = 94,
  uppercase = false,
  italic = true,
  softCase = false,
  ...rest
}: CurvedTextProps) {
  const id = useId();
  const pathRef = useRef<SVGPathElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const shown = uppercase ? text.toUpperCase() : softCase ? toSoftCase(text) : text;

  const height = 1000 * rise + size * 1.5;
  const baseline = height - size * 0.45;
  const control = baseline - 1000 * rise * 2;

  // Until the real width is measured (and on the server), estimate it from the
  // character count, so even the first paint is close and nothing jumps.
  const guess = Math.min(1, 940 / (shown.length * size * (uppercase ? 0.62 : 0.42)));
  const [fit, setFit] = useState(guess);

  useEffect(() => {
    let current = true;
    const measure = () => {
      const label = textRef.current;
      const path = pathRef.current;
      if (!current || !label || !path) return;
      const length = label.getComputedTextLength();
      if (!length) return;
      // Width grows in step with the font size, so the full-size width follows from the current one.
      const natural = length / fit;
      const next = Math.min(1, (path.getTotalLength() * FILL) / natural);
      if (Math.abs(next - fit) > 0.002) setFit(next);
    };
    measure();
    // The web font arrives after the first paint and changes the width.
    void document.fonts?.ready.then(measure);
    return () => {
      current = false;
    };
  }, [shown, size, rise, fit]);

  return (
    <svg viewBox={`0 0 1000 ${height}`} role="img" aria-label={text} className={className} {...rest}>
      <path ref={pathRef} id={id} d={`M10 ${baseline}Q500 ${control} 990 ${baseline}`} fill="none" />
      <text
        ref={textRef}
        fill="currentColor"
        fontFamily="var(--font-display)"
        fontSize={size * fit}
        fontStyle={italic ? "italic" : "normal"}
        // In em, so the spacing scales with the size like the letters do.
        style={{ letterSpacing: uppercase ? "0.0106em" : "-0.016em" }}
        textAnchor="middle"
      >
        <textPath href={`#${id}`} startOffset="50%">
          {shown}
        </textPath>
      </text>
    </svg>
  );
}
