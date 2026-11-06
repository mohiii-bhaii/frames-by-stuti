import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import Link from "next/link";
import type { CSSProperties } from "react";
import { T } from "@/components/editable-text";
import { ApertureBloom } from "@/components/line-art";
import { Photo } from "@/components/photo";
import { ScrollMotion } from "@/components/scroll-motion";
import { inquiryHref, pricingCategories, pricingHref } from "@/content/pricing";
import type { ImageSlot } from "@/lib/images";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("pricing");
}

export default function PricingPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Pricing & Packages", path: "/pricing" }])} />
      <section className="relative flex h-[110vw] max-h-[820px] min-h-[460px] items-center justify-center overflow-hidden bg-espresso md:h-[52vw]">
        <Photo slot="pricing-landing-hero" parallax={0.08} zoom className="absolute inset-0" priority />
        <div className="absolute inset-0 bg-espresso/15" />
        <T
          as="h1"
          id="pricing.landing.title"
          className="display relative max-w-[900px] px-6 pt-16 text-center text-[46px] uppercase leading-[1.04] text-cream [text-shadow:0_2px_28px_rgb(53_48_38/0.45)] md:text-[72px] lg:text-[96px]"
        />
      </section>

      <section className="paper relative overflow-x-clip">
        <div className="mx-auto max-w-[1200px] px-6 py-14 lg:px-[40px] lg:py-[88px]">
          <div className="mx-auto max-w-[640px] text-center">
            <ApertureBloom className="mx-auto mb-5 w-12 text-walnut" />
            <T as="p" id="pricing.landing.intro" data-reveal="up" className="text-[16px] text-walnut lg:text-[18px] lg:leading-[1.7]" />
            <T as="h2" id="pricing.landing.choose" data-reveal="title" className="script mt-10 text-[38px] text-terracotta lg:text-[52px]" />
          </div>

          <ul className="mx-auto mt-10 grid max-w-[360px] gap-x-6 gap-y-12 md:mt-14 md:max-w-none md:grid-cols-3 lg:gap-x-8">
            {pricingCategories.map((category, index) => (
              <li key={category.slug} data-reveal="up" style={{ "--reveal-delay": `${(index % 3) * 0.12}s` } as CSSProperties}>
                <Link href={pricingHref(category.slug)} className="group block text-center text-espresso">
                  <span className="relative block overflow-hidden rounded-[12px] shadow-[0_24px_40px_-28px_rgb(53_48_38/0.55)] transition-[translate,box-shadow] duration-700 ease-[var(--ease-soft)] group-hover:-translate-y-1.5 group-hover:shadow-[0_30px_50px_-26px_rgb(53_48_38/0.65)]">
                    <Photo
                      slot={`pricing-${category.slug}-card` as ImageSlot}
                      className="aspect-square w-full rounded-[12px]"
                      imageClassName="transition-[scale] duration-[1.4s] ease-[var(--ease-soft)] group-hover:scale-[1.06]"
                      sizes="(min-width: 48rem) 33vw, 360px"
                    />
                    <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[12px] bg-gradient-to-t from-espresso/20 via-transparent to-transparent opacity-80 transition-opacity duration-700 group-hover:opacity-100" />
                    <span aria-hidden="true" className="pointer-events-none absolute inset-[8px] rounded-[8px] border border-cream/70" />
                    <ApertureBloom className="absolute bottom-[8%] left-1/2 h-7 w-7 -translate-x-1/2 transition-[rotate] duration-700 group-hover:rotate-45" />
                  </span>
                  <span className="mx-auto block h-[42px] w-px origin-top bg-espresso/45 transition-[scale] duration-700 group-hover:scale-y-125" aria-hidden="true" />
                  <T as="h3" id={`pricing.${category.slug}.name`} className="display text-[30px] uppercase lg:text-[34px]" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="paper bg-clay/40 px-6 py-14 text-center lg:py-[88px]">
        <T as="h2" id="pricing.landing.help.heading" data-reveal="fade" className="display text-[34px] text-rust lg:text-[48px]" />
        <T as="p" id="pricing.landing.help.text" data-reveal="up" className="mx-auto mt-4 max-w-[480px] text-[15px] text-walnut" />
        <Link href={inquiryHref("other")} className="btn mt-7">
          <T id="pricing.landing.help.button" plain />
        </Link>
      </section>
      <ScrollMotion />
    </>
  );
}
