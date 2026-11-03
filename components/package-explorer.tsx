"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { T } from "@/components/editable-text";
import { categories, packageDetails, type CategoryId } from "@/content/site";
import { ApertureBloom } from "@/components/line-art";
import { Photo } from "@/components/photo";

/** Four oval session pickers that open matching pricing details below. */
export function PackageExplorer() {
  const [selected, setSelected] = useState<CategoryId | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const details = selected ? packageDetails[selected] : null;

  const choose = (id: CategoryId) => {
    const next = selected === id ? null : id;
    setSelected(next);
    if (next) {
      window.setTimeout(() => panelRef.current?.scrollIntoView({ block: "nearest" }), 60);
    }
  };

  return (
    <>
      <ul className="mx-auto mt-10 grid max-w-[360px] grid-cols-1 gap-10 px-10 md:max-w-[1240px] md:grid-cols-4 md:gap-4 md:px-4 lg:mt-[76px] lg:gap-9">
        {categories.map((category) => {
          const isSelected = selected === category.id;
          return (
            <li key={category.id}>
              <button
                type="button"
                aria-expanded={isSelected}
                aria-controls="package-details"
                onClick={() => choose(category.id)}
                className="group flex w-full flex-col items-center text-cream"
              >
                <span className="relative block w-full">
                  <Photo
                    slot={category.image}
                    className={`aspect-[284/421] w-full rounded-[50%] outline-offset-4 transition-[outline-color] duration-500 ${
                      isSelected ? "outline-2 outline-cream" : "outline-2 outline-transparent"
                    }`}
                    sizes="(min-width: 48rem) 24vw, 80vw"
                  />
                  <ApertureBloom className="absolute bottom-[8%] left-1/2 h-10 w-10 -translate-x-1/2 transition-transform duration-500 group-hover:rotate-45 lg:h-12 lg:w-12" />
                </span>
                <span className="mt-1 block h-8 w-px bg-cream/70" aria-hidden="true" />
                <T id={`category.${category.id}`} className="script mt-2 text-[28px] lowercase lg:text-[36px]" />
              </button>
            </li>
          );
        })}
      </ul>

      <div id="package-details" ref={panelRef} className="scroll-mt-6">
        {details ? (
          <div className="mx-auto mt-14 max-w-[1100px] rounded-[28px] bg-cream px-6 py-10 text-espresso animate-[fade-in_0.5s_ease] md:mx-6 md:px-10 lg:mx-auto lg:px-14 lg:py-14">
            <div className="flex items-start justify-between gap-4">
              <T as="h3" id={`packages.${selected}.heading`} className="display text-[36px] text-sage lg:text-[56px]" />
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close package details"
                className="flex h-11 w-11 shrink-0 items-center justify-center text-sage"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" aria-hidden="true">
                  <path d="M3 3l18 18M21 3L3 21" />
                </svg>
              </button>
            </div>
            <T as="p" id={`packages.${selected}.intro`} className="mt-4 max-w-[700px]" />
            <ul className={`mt-8 grid gap-6 md:grid-cols-2 ${details.packages.length === 3 ? "lg:grid-cols-3" : ""}`}>
              {details.packages.map((item, index) => (
                <li key={index} className="flex flex-col rounded-[10px] border border-sage/50 p-6">
                  <T as="h4" id={`packages.${selected}.${index + 1}.name`} className="script text-[30px]" />
                  <T as="p" id={`packages.${selected}.${index + 1}.price`} className="display mt-2 text-[34px] text-rust" />
                  <T as="p" id={`packages.${selected}.${index + 1}.summary`} className="mt-3 text-[15px]" />
                  <ul className="mt-4 list-inside list-disc space-y-1 text-[15px] marker:text-sage">
                    {item.includes.map((_, lineIndex) => (
                      <T as="li" key={lineIndex} id={`packages.${selected}.${index + 1}.include.${lineIndex + 1}`} />
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <T as="p" id={`packages.${selected}.note`} className="mt-6 text-[14px] text-walnut" />
            <Link href="/contact" className="btn mt-8">
              <T id="packages.inquire" />
            </Link>
          </div>
        ) : null}
      </div>
    </>
  );
}
