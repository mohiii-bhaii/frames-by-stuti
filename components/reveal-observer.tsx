"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Reveals any [data-reveal] element as it scrolls into view. Keeping one
 * observer here lets the page sections stay as server components.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    const observeAll = () => {
      document
        .querySelectorAll("[data-reveal]:not(.is-visible)")
        .forEach((element) => observer.observe(element));
    };
    observeAll();
    // Content inside streamed or client-rendered sections can arrive later.
    const mutations = new MutationObserver(observeAll);
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  return null;
}
