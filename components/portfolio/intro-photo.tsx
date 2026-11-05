"use client";

import { Photo } from "@/components/photo";
import { useIsEditing, useRealSlots } from "@/components/site-images-provider";

const slots = ["portfolio-hero" as const];

/** One small photograph above the galleries. Hidden from visitors until a real photo is published. */
export function IntroPhoto() {
  const editing = useIsEditing();
  const real = useRealSlots(slots);
  if (!editing && real.length === 0) return null;
  return (
    <div data-reveal="up" className="mx-auto mb-12 w-[min(78vw,460px)] md:mb-16">
      <Photo slot="portfolio-hero" className="aspect-[3/2] w-full rounded-[18px]" sizes="460px" />
    </div>
  );
}
