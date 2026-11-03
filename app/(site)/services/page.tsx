import type { Metadata } from "next";
import Link from "next/link";
import { T } from "@/components/editable-text";
import { FaqAccordion } from "@/components/faq-accordion";
import { ApertureBloom, LeafSprig } from "@/components/line-art";
import { PackageExplorer } from "@/components/package-explorer";
import { Photo } from "@/components/photo";
import { TestimonialSlider } from "@/components/testimonial-slider";
import { site } from "@/content/site";
import { ScrollMotion } from "@/components/scroll-motion";

export const metadata: Metadata = {
  title: "Services & Pricing",
  description: `Session types, packages, pricing and frequently asked questions for ${site.name}.`,
};

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex h-[120vw] max-h-[1055px] min-h-[520px] items-center justify-center overflow-hidden bg-espresso md:h-[73vw]">
        <Photo slot="services-hero" parallax={0.08} zoom className="absolute inset-0" priority />
        <div className="absolute inset-0 bg-espresso/15" />
        <div className="absolute inset-x-0 bottom-0 h-[20%] bg-gradient-to-b from-transparent to-sage" />
        <T
          as="h1"
          id="services.title"
          className="script relative max-w-[712px] px-6 text-center text-[52px] leading-[1] text-cream lg:-mt-[44px] lg:text-[90px]"
        />
      </section>

      {/* How it works */}
      <section className="relative overflow-hidden bg-sage text-cream">
        <ApertureBloom className="absolute -right-[10%] top-[18%] w-[80%] text-cream/20 lg:right-[-4%] lg:w-[640px]" />
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-10 px-6 py-14 md:grid-cols-2 lg:gap-[52px] lg:px-[38px] lg:pb-[100px] lg:pt-[59px]">
          <div>
            <p className="font-display text-center text-[24px] tracking-[-0.02em] lg:mr-[60px] lg:text-[32px]">
              <em>&amp;</em> <T id="services.how.kicker" />
            </p>
            <T as="h2" id="services.how.heading" className="display mt-2 text-center text-[46px] lg:text-[58px]" />
            <T as="p" id="services.how.text" className="mt-6 text-[15px] lg:text-[17px]" />
            <div className="mt-8 flex justify-center md:justify-start">
              <a href="#packages" className="btn">
                <T id="services.how.button" />
              </a>
            </div>
          </div>
          <Photo
            slot="services-simple"
            className="aspect-[478/549] w-full rounded-[28px] md:ml-auto md:max-w-[478px]"
            sizes="(min-width: 48rem) 478px, 90vw"
          />
        </div>
      </section>

      {/* Investment */}
      <section className="relative overflow-hidden bg-sage text-cream">
        <div className="relative mx-auto max-w-[1200px] px-6 pb-16 lg:h-[1035px] lg:px-0 lg:pb-0">
          <Photo
            slot="services-invest-1"
            className="relative mx-auto aspect-[338/437] w-[62%] rounded-[28px] md:w-[300px] lg:absolute lg:left-[431px] lg:top-[-120px] lg:w-[338px]"
            sizes="338px"
          />
          <T
            as="h2"
            id="services.invest.heading"
            className="script relative mt-8 text-center text-[64px] leading-[0.92] capitalize md:text-[96px] lg:absolute lg:right-[29px] lg:top-[193px] lg:mt-0 lg:w-[927px] lg:text-right lg:text-[132px]"
          />
          <div className="mt-8 grid items-start gap-8 md:grid-cols-2 lg:contents">
            <T
              as="p"
              id="services.invest.text"
              className="text-[15px] lg:absolute lg:left-[548px] lg:top-[462px] lg:w-[608px] lg:text-[16px]"
            />
            <div className="flex justify-center md:justify-start lg:absolute lg:left-[548px] lg:top-[623px]">
              <a href="#packages" className="btn">
                <T id="services.invest.button" />
              </a>
            </div>
          </div>
          <Photo
            slot="services-invest-2"
            className="relative mx-auto mt-10 aspect-[480/620] w-[76%] md:max-w-[420px] lg:absolute lg:left-[-14px] lg:top-[328px] lg:mt-0 lg:w-[480px] lg:max-w-none"
            sizes="(min-width: 64rem) 480px, 76vw"
          />
          <div className="mt-6 grid grid-cols-2 gap-4 lg:contents">
            <Photo
              slot="services-invest-3"
              className="aspect-square w-full rounded-[26px] lg:absolute lg:left-[431px] lg:top-[747px] lg:w-[282px]"
              sizes="(min-width: 64rem) 282px, 45vw"
            />
            <Photo
              slot="services-invest-4"
              className="aspect-square w-full rounded-[26px] lg:absolute lg:left-[902px] lg:top-[642px] lg:w-[282px]"
              sizes="(min-width: 64rem) 282px, 45vw"
            />
          </div>
          <LeafSprig className="absolute bottom-[-12px] left-[-20px] hidden w-[156px] text-espresso lg:block" />
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="relative scroll-mt-4 bg-sage pb-16 pt-10 text-cream lg:pb-[85px] lg:pt-[68px]">
        <div className="px-6 text-center">
          <T as="h2" id="services.packages.heading" className="display text-[56px] lg:text-[100px]" />
          <T as="p" id="services.packages.hint" className="mt-4 text-[14px]" />
        </div>
        <PackageExplorer />
      </section>

      {/* Reassurance banner */}
      <section className="relative overflow-hidden bg-espresso text-cream">
        <Photo slot="services-banner" parallax={0.12} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-espresso/70 via-espresso/25 to-transparent" />
        <div className="relative mx-auto flex max-w-[1200px] flex-col justify-center px-6 py-14 md:min-h-[500px] lg:h-[750px] lg:px-[64px]">
          <T as="h2" id="services.banner.heading" className="script max-w-[427px] text-[34px] lg:text-[36px]" />
          <T as="p" id="services.banner.text" className="mt-5 max-w-[420px] text-[15px] lg:text-justify lg:text-[17px]" />
          <div className="mt-7">
            <Link href="/contact" className="btn">
              <T id="services.banner.button" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="paper px-6 pb-12 pt-12 lg:pb-[91px] lg:pt-[68px]">
        <div className="text-center">
          <T as="h2" id="services.faq.heading" className="display text-[44px] text-sage lg:text-[100px]" />
          <T as="p" id="services.faq.sub" className="eyebrow mt-3 text-[13px] text-sage lg:text-[14px]" />
        </div>
        <div className="mt-8 lg:mt-12">
          <FaqAccordion />
        </div>
      </section>

      {/* Testimonial */}
      <section className="paper grid md:grid-cols-2">
        <div className="order-2 flex items-center justify-center px-6 py-12 md:order-1 md:py-10 lg:h-[660px]">
          <TestimonialSlider large />
        </div>
        <Photo slot="services-testimonial" className="order-1 aspect-square w-full md:order-2 md:aspect-auto md:h-full" sizes="(min-width: 48rem) 50vw, 100vw" />
      </section>
      <ScrollMotion />
    </>
  );
}
