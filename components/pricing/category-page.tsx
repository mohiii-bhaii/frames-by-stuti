import Link from "next/link";
import { T } from "@/components/editable-text";
import { ApertureBloom } from "@/components/line-art";
import { CategoryStrip } from "@/components/pricing/category-strip";
import { PricingTiers } from "@/components/pricing/pricing-tiers";
import { ScrollMotion } from "@/components/scroll-motion";
import { inquiryHref, pricingCategories } from "@/content/pricing";

/**
 * One category's own pricing page, laid out like the reference: a plain
 * centered title, an optional subtitle and introduction, then each package
 * stacked with its own photo, then one closing inquiry button.
 */
export function PricingCategoryPage({ slug }: { slug: string }) {
  const category = pricingCategories.find((item) => item.slug === slug);
  if (!category) throw new Error(`Unknown pricing category: ${slug}`);

  return (
    <>
      <section className="paper relative overflow-x-clip">
        <div className="mx-auto max-w-[760px] px-6 pb-12 pt-6 text-center lg:pb-16 lg:pt-10">
          <Link
            href="/pricing"
            className="eyebrow inline-flex min-h-11 items-center gap-2 text-[13px] text-walnut transition-colors duration-500 hover:text-rust"
          >
            <span aria-hidden="true">«</span>
            <T id="pricing.back" plain />
          </Link>
          <T as="h1" id={`pricing.${slug}.title`} data-reveal="title" className="display mt-4 text-[40px] uppercase leading-[1.06] text-espresso md:text-[60px] lg:text-[78px]" />
          <T as="p" id={`pricing.${slug}.subtitle`} emptyLabel="Click to add a subtitle (optional)" data-reveal="up" className="script mt-3 text-[28px] text-terracotta empty:hidden lg:text-[38px]" />
          <ApertureBloom className="mx-auto mt-6 w-12 text-walnut" />
          <T as="p" id={`pricing.${slug}.intro`} data-reveal="up" className="mt-6 text-[16px] text-walnut lg:text-[18px] lg:leading-[1.7]" />
        </div>
      </section>

      <section className="paper relative overflow-x-clip">
        <div className="px-6 pb-14 lg:pb-[88px]">
          <T as="h2" id={`pricing.${slug}.packages.heading`} data-reveal="title" className="script mb-10 text-center text-[36px] text-terracotta lg:mb-14 lg:text-[50px]" />
          <PricingTiers slug={slug} kind={category.kind} session={category.session} />
        </div>
      </section>

      <section className="paper relative overflow-x-clip bg-clay/40">
        <div className="px-6 py-14 text-center lg:py-[80px]">
          <Link href={inquiryHref(category.session)} className="btn">
            <T id={`pricing.${slug}.button`} plain />
          </Link>
        </div>
      </section>

      <section className="paper py-14 lg:py-[88px]">
        <CategoryStrip current={slug} />
      </section>
      <ScrollMotion />
    </>
  );
}
