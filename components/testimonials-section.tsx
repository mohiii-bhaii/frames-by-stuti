"use client";

import type { ReactNode } from "react";
import { useIsEditingText, useTexts } from "@/components/site-texts-provider";
import { TestimonialSlider } from "@/components/testimonial-slider";
import { TESTIMONIAL_SLOTS } from "@/content/site";
import { validTestimonials } from "@/lib/testimonials";

const slotNumbers = Array.from({ length: TESTIMONIAL_SLOTS }, (_, index) => index + 1);
const keys = slotNumbers.flatMap((n) => [`testimonial.${n}.quote`, `testimonial.${n}.author`]);

/**
 * The testimonials band: the slider beside a photograph. Visitors see it only
 * while at least one testimonial has both a real review and a client name; with
 * none, nothing of it is drawn at all (no band, photo, arrows or spacing), so
 * the sections around it simply meet. While editing, it is always shown, with
 * every slot, so testimonials can be added, changed or removed. In Preview it
 * behaves as it will on the public site.
 */
export function TestimonialsSection({ photo, large = false, reverse = false }: { photo: ReactNode; large?: boolean; reverse?: boolean }) {
  const editing = useIsEditingText();
  const flat = useTexts(keys);
  const items = slotNumbers.map((_, index) => ({ quote: flat[index * 2], author: flat[index * 2 + 1] }));
  const valid = validTestimonials(items);
  if (!editing && valid.length === 0) return null;

  return (
    <section className="paper grid md:grid-cols-2">
      <div className={`flex items-center justify-center px-6 md:py-10 lg:h-[660px] ${reverse ? "order-2 py-12 md:order-1" : "py-14"}`}>
        <TestimonialSlider large={large} slots={editing ? slotNumbers : valid} />
      </div>
      <div className={reverse ? "order-1 md:order-2" : undefined}>{photo}</div>
    </section>
  );
}
