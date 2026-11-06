"use client";

import { useId, useState } from "react";

export type FaqGroup = { label?: string; items: { id: string; question: string; answer: string }[] };

/** Answers are plain text; a blank line starts a new paragraph. */
function Answer({ text }: { text: string }) {
  return (
    <div className="space-y-3 pb-7 pr-10 text-[15.5px] leading-[1.85] text-walnut lg:text-[17px]">
      {text.split(/\n\s*\n/).map((paragraph, index) => (
        <p key={index}>{paragraph.trim()}</p>
      ))}
    </div>
  );
}

/**
 * The FAQ as an accordion: thin warm lines between the questions, a plus that becomes a minus, one
 * answer open at a time. Every answer is in the page's HTML (closed ones are only hidden from view),
 * so search engines and screen readers can read them all. Motion is skipped for visitors who prefer it.
 */
export function FaqAccordion({ groups }: { groups: FaqGroup[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const baseId = useId();

  return (
    <div className="mx-auto max-w-[820px] text-left">
      {groups.map((group, groupIndex) => (
        <div key={group.label ?? groupIndex} className={groupIndex > 0 ? "mt-14" : undefined}>
          {group.label ? (
            <h3 className="eyebrow border-b border-walnut/30 pb-3 text-[12px] tracking-[0.28em] text-terracotta">{group.label}</h3>
          ) : null}
          <ul className={group.label ? "" : "border-t border-walnut/30"}>
            {group.items.map((item) => {
              const isOpen = open === item.id;
              const panelId = `${baseId}-${item.id}`;
              return (
                <li key={item.id} className="border-b border-walnut/30">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : item.id)}
                      className="group flex min-h-[60px] w-full items-center justify-between gap-6 py-5 text-left lg:py-6"
                    >
                      <span style={{ textTransform: "none" }} className="display text-[19px] leading-[1.3] text-espresso transition-colors duration-500 group-hover:text-rust md:text-[22px]">
                        {item.question}
                      </span>
                      <span aria-hidden="true" className="relative block h-5 w-5 shrink-0 text-terracotta">
                        <span className="absolute left-0 top-1/2 h-px w-5 -translate-y-1/2 bg-current" />
                        <span
                          className={`absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-current transition-[opacity,transform] duration-500 motion-reduce:transition-none ${
                            isOpen ? "scale-y-0 opacity-0" : "opacity-100"
                          }`}
                        />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={undefined}
                    inert={!isOpen}
                    className={`grid transition-[grid-template-rows] duration-500 ease-[var(--ease-soft)] motion-reduce:transition-none ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <Answer text={item.answer} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
