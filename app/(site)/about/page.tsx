import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ApertureBloom, LeafSprig, Sparkle } from "@/components/line-art";
import { Photo } from "@/components/photo";
import { T } from "@/components/editable-text";
import { site } from "@/content/site";
import { ScrollMotion } from "@/components/scroll-motion";

export const metadata: Metadata = {
  title: "About",
  description: `Meet Stuti, the photographer behind ${site.name}.`,
};

export default function AboutPage() {
  return (
    <>
      {/* Introduction: a large portrait beside the first part of the story */}
      <section className="paper relative overflow-x-clip">
        <ApertureBloom data-speed="-0.2" className="absolute -left-[12%] top-[8%] hidden w-[38%] text-walnut/10 md:block" />
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-y-10 px-6 pb-16 pt-[96px] lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:gap-x-[84px] lg:px-[70px] lg:pb-[100px] lg:pt-[150px]">
          <div className="relative mx-auto w-full max-w-[420px] pb-6 md:max-w-[480px] lg:mx-0 lg:max-w-none">
            <div data-reveal="left" className="rounded-[89px] border border-terracotta p-[3px] lg:p-0">
              <Photo
                slot="about-family"
                parallax={0.06}
                priority
                className="aspect-[480/659] w-full rounded-[87px]"
                sizes="(min-width: 64rem) 520px, (min-width: 48rem) 480px, 85vw"
              />
            </div>
            <Sparkle data-speed="0.3" className="absolute -bottom-2 -right-3 w-12" />
            <Sparkle className="absolute -bottom-9 right-10 w-7" />
          </div>
          <div className="text-center lg:text-left">
            <h1 className="display text-[52px] leading-[1.04] text-espresso lg:text-[86px]">
              <T id="about.title.1" /> <T id="about.title.2" />
            </h1>
            <T as="p" id="about.hello" data-reveal="up" className="script mt-3 text-[30px] text-terracotta lg:text-[40px]" />
            <T as="p" id="about.heroStory" data-reveal="up" className="mt-7 text-[15px] text-walnut lg:text-[16px]" />
          </div>
        </div>
      </section>

      {/* Personal story: text beside a wide photograph */}
      <section className="paper relative overflow-x-clip">
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-y-10 px-6 pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-x-[84px] lg:px-[70px] lg:pb-[100px]">
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <T as="p" id="about.personalStory" data-reveal="up" className="text-[15px] text-walnut lg:text-[16px]" />
          </div>
          <div className="relative order-1 lg:order-2">
            <div data-reveal="mask" className="overflow-hidden rounded-[28px]">
              <Photo
                slot="about-hero"
                parallax={0.06}
                className="aspect-[4/3] w-full"
                sizes="(min-width: 64rem) 560px, 90vw"
              />
            </div>
            <LeafSprig className="absolute -bottom-[10%] -right-[4%] w-[26%] text-espresso" />
          </div>
        </div>
      </section>

      {/* A few more personal photographs */}
      <section className="paper relative overflow-x-clip bg-clay/40">
        <div className="mx-auto max-w-[1200px] px-6 py-16 lg:px-[70px] lg:py-[96px]">
          <T as="h2" id="about.moments.heading" data-reveal="title" className="script text-center text-[38px] text-terracotta lg:text-[55px]" />
          <div className="mx-auto mt-10 grid max-w-[360px] gap-6 md:mt-14 md:max-w-none md:grid-cols-3 md:items-end md:gap-5 lg:gap-8">
            <div data-reveal="up">
              <Photo slot="about-moment-1" className="aspect-[4/5] w-full rounded-[43px]" sizes="(min-width: 48rem) 33vw, 90vw" />
            </div>
            <div data-reveal="up" style={{ "--reveal-delay": "0.15s" } as CSSProperties}>
              <Photo slot="about-moment-2" className="aspect-square w-full rounded-[10px]" sizes="(min-width: 48rem) 33vw, 90vw" />
            </div>
            <div data-reveal="up" style={{ "--reveal-delay": "0.3s" } as CSSProperties}>
              <Photo slot="about-moment-3" className="aspect-[4/5] w-full rounded-[43px]" sizes="(min-width: 48rem) 33vw, 90vw" />
            </div>
          </div>
        </div>
      </section>

      {/* Why I do this */}
      <section className="paper relative overflow-x-clip">
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-8 px-6 py-16 md:grid-cols-2 md:gap-10 lg:grid-cols-[480px_1fr] lg:gap-[84px] lg:px-[70px] lg:py-[100px]">
          <div className="relative mx-auto w-[70%] md:w-full">
            <div data-reveal="mask">
              <Photo
                slot="about-work"
                className="aspect-[480/766] w-full rounded-[10px]"
                sizes="(min-width: 64rem) 480px, 70vw"
              />
            </div>
            <LeafSprig className="absolute -bottom-[6%] -left-[18%] w-[52%] text-espresso lg:-left-[14%]" />
          </div>
          <div className="relative text-center md:text-left">
            <T as="h2" id="about.why.heading" data-reveal="fade" className="display text-[30px] text-rust lg:text-[36px]" />
            <T
              as="p"
              id="about.why.story"
              data-reveal="up"
              className="mt-6 text-[16px] tracking-[0.05em] lg:text-[18px] lg:leading-[1.6] lg:tracking-[0.08em]"
            />
            <Link href="/services" className="btn mt-9">
              <T id="about.why.button" />
            </Link>
          </div>
        </div>
      </section>

      {/* Closing invitation */}
      <section className="paper overflow-x-clip">
        <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-6 pb-16 md:grid-cols-2 lg:grid-cols-[1fr_466px] lg:gap-16 lg:px-[70px] lg:pb-[80px] lg:pt-[20px]">
          <div className="order-2 text-center md:order-1 md:text-left">
            <T as="h2" id="about.cta.heading" data-reveal="fade" className="display text-[42px] text-rust lg:text-[55px]" />
            <T as="p" id="about.cta.text" data-reveal="up" className="mt-5 text-[15px] text-walnut lg:max-w-[360px]" />
            <Link href="/contact" className="btn mt-7">
              <T id="about.cta.button" />
            </Link>
          </div>
          <div className="relative order-1 md:order-2">
            <div className="border-[10px] border-sage">
              <Photo slot="about-cta" className="aspect-[447/417] w-full" sizes="(min-width: 64rem) 447px, 90vw" />
            </div>
            <ApertureBloom className="absolute -bottom-10 -left-8 w-[110px] text-walnut lg:w-[155px]" />
          </div>
        </div>
      </section>
      <ScrollMotion />
    </>
  );
}
