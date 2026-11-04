import Link from "next/link";
import { T } from "@/components/editable-text";
import { ApertureBloom, LeafSprig } from "@/components/line-art";
import { Photo } from "@/components/photo";
import { CategoryStrip } from "@/components/pricing/category-strip";
import { PricingTiers } from "@/components/pricing/pricing-tiers";
import { ScrollMotion } from "@/components/scroll-motion";
import { inquiryHref, pricingCategories } from "@/content/pricing";
import type { ImageSlot } from "@/lib/images";

/** One category's own pricing page. Everything on it is editable text or an editable photo. */
export function PricingCategoryPage({ slug }: { slug: string }) {
  const category = pricingCategories.find((item) => item.slug === slug);
  if (!category) throw new Error(`Unknown pricing category: ${slug}`);
  const slot = (suffix: string) => `pricing-${slug}-${suffix}` as ImageSlot;

  return (
    <>
      {/* Hero */}
      <section className="relative flex h-[100vw] max-h-[760px] min-h-[420px] items-center justify-center overflow-hidden bg-espresso md:h-[48vw]">
        <Photo slot={slot("hero")} parallax={0.08} zoom className="absolute inset-0" priority />
        <div className="absolute inset-0 bg-espresso/35" />
        <div className="relative px-6 pt-16 text-center text-cream">
          <T as="h1" id={`pricing.${slug}.title`} className="display text-[46px] uppercase leading-[1.04] md:text-[72px] lg:text-[96px]" />
        </div>
      </section>

      {/* Introduction */}
      <section className="paper relative overflow-x-clip">
        <div className="mx-auto grid max-w-[1100px] items-center gap-10 px-6 py-14 md:grid-cols-[1fr_minmax(0,360px)] lg:gap-[72px] lg:px-[40px] lg:py-[88px]">
          <div className="text-center md:text-left">
            <Link
              href="/pricing"
              className="eyebrow inline-flex min-h-11 items-center gap-2 text-[13px] text-walnut transition-colors duration-500 hover:text-rust"
            >
              <span aria-hidden="true">←</span>
              <T id="pricing.back" plain />
            </Link>
            <ApertureBloom className="mx-auto mt-4 w-12 text-walnut md:mx-0" />
            <T as="p" id={`pricing.${slug}.intro`} data-reveal="up" className="mt-6 text-[16px] text-walnut lg:text-[18px] lg:leading-[1.7]" />
          </div>
          <div className="relative mx-auto w-[70%] md:w-full" data-reveal="mask">
            <Photo slot={slot("1")} className="aspect-[4/5] w-full rounded-[43px]" sizes="(min-width: 48rem) 360px, 70vw" />
            <LeafSprig className="absolute -bottom-[8%] -left-[16%] w-[44%] text-espresso" />
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="paper relative overflow-x-clip bg-clay/40">
        <div className="px-6 py-14 lg:py-[88px]">
          <T as="h2" id={`pricing.${slug}.packages.heading`} data-reveal="title" className="script mb-10 text-center text-[40px] text-terracotta lg:mb-14 lg:text-[56px]" />
          <PricingTiers slug={slug} kind={category.kind} session={category.session} />
        </div>
      </section>

      {/* Closing photo and inquiry */}
      <section className="paper relative overflow-x-clip">
        <div className="mx-auto grid max-w-[1100px] items-center gap-10 px-6 py-14 md:grid-cols-2 lg:gap-[72px] lg:px-[40px] lg:py-[88px]">
          <div className="relative order-2 md:order-1" data-reveal="mask">
            <div className="overflow-hidden rounded-[28px]">
              <Photo slot={slot("2")} className="aspect-square w-full" sizes="(min-width: 48rem) 480px, 90vw" />
            </div>
          </div>
          <div className="order-1 text-center md:order-2 md:text-left">
            <Link href={inquiryHref(category.session)} className="btn">
              <T id={`pricing.${slug}.button`} plain />
            </Link>
          </div>
        </div>
      </section>

      <section className="paper pb-16 lg:pb-[96px]">
        <CategoryStrip current={slug} />
      </section>
      <ScrollMotion />
    </>
  );
}
