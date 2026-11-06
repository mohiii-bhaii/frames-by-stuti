"use client";

import { useEffect, useLayoutEffect, useRef, useState, type HTMLAttributes } from "react";

type SplitHeadingProps = {
  text: string;
  /** Classes for the heading itself: colour, the large size and the line height. */
  className?: string;
} & Omit<HTMLAttributes<HTMLHeadingElement>, "className" | "children">;

/** Before the real widths are measured (and on the server): wide spacing that is already close. */
const GUESS_SPACING = 1.1;

/** The text as a small first line and a large last word. A line break the owner typed decides the split; otherwise it splits before the last word. */
function split(text: string) {
  const clean = text.trim().replace(/[ \t]+/g, " ");
  const breakAt = clean.indexOf("\n");
  if (breakAt > 0) return { lead: clean.slice(0, breakAt).trim(), main: clean.slice(breakAt + 1).replace(/\s*\n\s*/g, " ").trim() };
  const space = clean.lastIndexOf(" ");
  if (space < 0) return { lead: "", main: clean };
  return { lead: clean.slice(0, space), main: clean.slice(space + 1) };
}

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * A two-line heading: a small first line ("MEET YOUR") with airy letter spacing over a large last word
 * ("PHOTOGRAPHER"). The spacing is measured so the small line is exactly as wide as the large one,
 * whatever the font, size or words, and both lines are centred.
 */
export function SplitHeading({ text, className = "", ...rest }: SplitHeadingProps) {
  const { lead, main } = split(text);
  const leadRef = useRef<HTMLSpanElement>(null);
  const mainRef = useRef<HTMLSpanElement>(null);
  const [spacing, setSpacing] = useState(GUESS_SPACING);

  useIsoLayoutEffect(() => {
    const measure = () => {
      const small = leadRef.current;
      const large = mainRef.current;
      if (!small || !large || lead.length < 2) return;
      const font = parseFloat(getComputedStyle(small).fontSize);
      if (!font) return;
      // Width with no extra spacing: the width now, less the spacing after every letter (the last one included).
      const natural = small.getBoundingClientRect().width - lead.length * spacing * font;
      const next = (large.getBoundingClientRect().width - natural) / ((lead.length - 1) * font);
      if (Number.isFinite(next) && next > 0 && Math.abs(next - spacing) > 0.004) setSpacing(next);
    };
    measure();
    void document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [lead, main, spacing]);

  return (
    <h2 {...rest} className={`text-center ${className}`.trim()}>
      {lead ? (
        <span className="block text-[0.5em] leading-none">
          {/* The last letter's spacing is pulled back so the line is centred on its letters, not on the gap after them. */}
          <span ref={leadRef} className="inline-block whitespace-nowrap" style={{ letterSpacing: `${spacing}em`, marginRight: `${-spacing}em` }}>
            {lead}
          </span>
        </span>
      ) : null}
      <span className={`block ${lead ? "mt-[0.28em]" : ""}`}>
        <span ref={mainRef} className="inline-block whitespace-nowrap" style={{ letterSpacing: "0.02em", marginRight: "-0.02em" }}>
          {main}
        </span>
      </span>
    </h2>
  );
}
