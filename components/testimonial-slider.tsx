"use client";

import { useState } from "react";
import { T } from "@/components/editable-text";
import { ApertureBloom } from "@/components/line-art";

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 30 12"
      className={`w-7 ${direction === "left" ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.200"
      aria-hidden="true"
    >
      <path d="M0 6h29M23 1l6 5-6 5" />
    </svg>
  );
}

/**
 * `slots` are the testimonial numbers to show. With one there are no arrows;
 * with two or more the arrows move between them.
 */
export function TestimonialSlider({ large = false, slots }: { large?: boolean; slots: number[] }) {
  const [index, setIndex] = useState(0);
  const count = slots.length;
  if (count === 0) return null;
  const current = slots[index % count];
  const go = (step: number) => setIndex((value) => (value + step + count) % count);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Client testimonials"
      className="flex max-w-[432px] flex-col items-center text-center"
    >
      <figure key={current} aria-live="polite" className="animate-[fade-in_0.5s_ease]">
        <T
          as="blockquote"
          id={`testimonial.${current}.quote`}
          emptyLabel="Click to add a testimonial (the review)"
          className={large ? "text-[20px] leading-[1.5] lg:text-[24px]" : "text-[15px] leading-[1.6] lg:text-[13px]"}
        />
        <figcaption className={`mt-2 ${large ? "text-[20px] lg:text-[24px]" : "text-[15px] lg:text-[13px]"}`}>
          &ndash;<T id={`testimonial.${current}.author`} emptyLabel="Click to add the client's name" />
        </figcaption>
      </figure>
      <div className="mt-5 flex items-center gap-[22px] text-walnut">
        {count > 1 ? (
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous testimonial"
            className="flex h-11 w-11 items-center justify-center transition-opacity duration-500 hover:opacity-60"
          >
            <Arrow direction="left" />
          </button>
        ) : null}
        <ApertureBloom className="h-9 w-9" />
        {count > 1 ? (
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next testimonial"
            className="flex h-11 w-11 items-center justify-center transition-opacity duration-500 hover:opacity-60"
          >
            <Arrow direction="right" />
          </button>
        ) : null}
      </div>
    </section>
  );
}
