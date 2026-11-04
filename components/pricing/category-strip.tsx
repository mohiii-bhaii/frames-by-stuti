import Link from "next/link";
import { T } from "@/components/editable-text";
import { pricingCategories, pricingHref } from "@/content/pricing";

/** Links to every pricing page, for moving between categories. The current one is marked. */
export function CategoryStrip({ current }: { current?: string }) {
  return (
    <nav aria-label="Pricing categories" className="mx-auto max-w-[1100px] px-6 text-center">
      <T as="p" id="pricing.more" className="script text-[30px] text-terracotta lg:text-[38px]" />
      <ul className="mt-6 flex flex-wrap justify-center gap-3">
        {pricingCategories.map((category) => (
          <li key={category.slug}>
            <Link
              href={pricingHref(category.slug)}
              aria-current={category.slug === current ? "page" : undefined}
              className="eyebrow inline-flex min-h-11 items-center rounded-full border border-terracotta/60 px-5 text-[13px] text-walnut transition-[background-color,color,translate] duration-500 hover:-translate-y-0.5 hover:bg-terracotta hover:text-espresso aria-[current=page]:bg-rust aria-[current=page]:text-cream"
            >
              <T id={`pricing.${category.slug}.name`} plain />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
