"use client";

import { useId, useState } from "react";
import { T } from "@/components/editable-text";
import { faqs } from "@/content/site";

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  const baseId = useId();

  return (
    <ul className="mx-auto max-w-[827px] border-sage/50">
      {faqs.map((_, index) => {
        const isOpen = open === index;
        const panelId = `${baseId}-panel-${index}`;
        return (
          <li key={index} className="border-b border-sage/50">
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : index)}
                className="flex min-h-[52px] w-full items-center justify-between gap-5 py-4 text-left text-sage uppercase tracking-[0.1em] text-[15px] lg:py-6 lg:text-[20px]"
              >
                <span>
                  {String(index + 1).padStart(2, "0")}. <T id={`faq.${index + 1}.q`} />
                </span>
                <svg
                  viewBox="0 0 32 32"
                  className={`h-7 w-7 shrink-0 transition-transform duration-500 lg:h-8 lg:w-8 ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <circle cx="16" cy="16" r="15" />
                  <path d="M16 8v15M10 17l6 6 6-6" />
                </svg>
              </button>
            </h3>
            <div
              id={panelId}
              inert={!isOpen}
              className={`grid transition-[grid-template-rows] duration-500 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <T as="p" id={`faq.${index + 1}.a`} className="pb-6 pr-10 text-[15px] text-espresso lg:text-[18px] lg:leading-[1.5]" />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
