import type { Metadata } from "next";
import Link from "next/link";
import { ApertureBloom, CameraSketch, LeafSprig, Sparkle } from "@/components/line-art";
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
      {/* Intro over a full-width portrait that fades into the dark section */}
      <section className="relative overflow-hidden bg-walnut text-cream">
        <div className="absolute inset-x-0 top-0 h-[92vw] max-h-[1071px] md:h-[86vw]">
          <Photo slot="about-hero" parallax={0.06} zoom className="h-full w-full" priority position="50% 20%" />
          <div className="absolute inset-0 bg-espresso/25" />
          <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-b from-transparent to-walnut" />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-6 pb-16 pt-[112px] lg:px-0 lg:pb-[77px] lg:pt-[222px]">
          <h1 className="display text-[52px] lg:ml-[104px] lg:flex lg:w-[801px] lg:justify-between lg:text-[86px] lg:leading-[1.04]">
            <T id="about.title.1" /> <T id="about.title.2" />
          </h1>

          <T
            as="p"
            id="about.heroStory"
            data-reveal="up"
            className="mt-[28vw] text-[15px] lg:ml-[725px] lg:mt-[175px] lg:w-[420px] lg:text-justify lg:text-[16px]"
          />

          <div className="mt-12 grid items-start gap-10 md:grid-cols-[auto_1fr] md:gap-7 lg:ml-[127px] lg:mt-[112px]">
            <div className="relative mx-auto w-[70%] md:w-[280px] lg:w-[377px]">
              <Photo
                slot="about-family"
                reveal="mask"
                className="aspect-[377/483] w-full rounded-[43px]"
                sizes="(min-width: 64rem) 377px, 70vw"
              />
              <Sparkle data-speed="0.3" className="absolute -bottom-4 -right-3 w-14" />
              <Sparkle className="absolute -bottom-10 right-12 w-8" />
            </div>
            <T
              as="p"
              id="about.personalStory"
              className="text-[15px] md:mt-20 lg:mt-[107px] lg:w-[420px] lg:text-justify lg:text-[16px]"
            />
          </div>
        </div>
      </section>

      {/* Quick facts */}
      <section className="paper relative overflow-hidden bg-walnut px-6 pb-44 pt-12 text-center text-cream lg:h-[667px] lg:pb-0 lg:pt-[69px]">
        <T as="h2" id="about.facts.heading" data-reveal="fade" className="script text-[48px] lowercase lg:text-[63px]" />
        <ul className="mx-auto mt-9 grid max-w-[1000px] gap-x-12 gap-y-7 text-[14px] uppercase tracking-[0.08em] md:grid-cols-2 lg:mt-[58px] lg:gap-y-[40px] lg:text-[15px]">
          {[1, 2, 3, 4, 5, 6].map((number, index) => (
            <li
              key={number}
              data-reveal={index % 2 === 0 ? "left" : "right"}
              className={index % 2 === 0 ? "md:text-center lg:pr-[100px]" : "md:text-center lg:pl-[100px]"}
            >
              <T id={`about.fact.${number}.label`} />: <T id={`about.fact.${number}.value`} />
            </li>
          ))}
        </ul>
        <CameraSketch className="absolute bottom-10 left-1/2 w-[125px] -translate-x-1/2 lg:bottom-[28px] lg:w-[190px]" />
      </section>

      {/* Why I do this */}
      <section className="paper relative">
        <div className="absolute inset-x-0 top-0 h-[358px] bg-gradient-to-b from-walnut to-cream" />
        <div className="relative mx-auto grid max-w-[1200px] items-start gap-8 px-6 pb-16 pt-8 md:grid-cols-2 md:gap-10 lg:grid-cols-[480px_1fr] lg:gap-[70px] lg:pb-16 lg:pl-[73px] lg:pr-[93px] lg:pt-[65px]">
          <div className="relative mx-auto w-[61%] md:w-full">
            <Photo
              slot="about-work"
              className="aspect-[480/766] w-full rounded-[10px]"
              sizes="(min-width: 64rem) 480px, 60vw"
            />
            <LeafSprig className="absolute -bottom-[6%] -left-[18%] w-[52%] text-espresso lg:-left-[14%]" />
          </div>
          <div className="relative text-center md:pt-14 md:text-left lg:pt-[84px]">
            <T as="h2" id="about.why.heading" data-reveal="fade" className="display text-[30px] text-rust lg:text-[36px]" />
            <T
              as="p"
              id="about.why.story"
              className="mt-6 text-[16px] tracking-[0.05em] lg:text-[18px] lg:leading-[1.6] lg:tracking-[0.08em]"
            />
            <Link href="/services" className="btn mt-9">
              <T id="about.why.button" />
            </Link>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="paper">
        <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-6 pb-16 md:grid-cols-[1fr_1fr] lg:grid-cols-[1fr_466px] lg:gap-16 lg:px-0 lg:pb-[58px] lg:pl-[110px] lg:pr-[37px] lg:pt-[43px]">
          <div className="order-2 text-center md:order-1 md:text-left">
            <T as="h2" id="about.cta.heading" data-reveal="fade" className="display text-[42px] text-rust lg:text-[55px]" />
            <T as="p" id="about.cta.text" className="mt-5 text-[15px] text-walnut lg:max-w-[210px] lg:text-center" />
            <Link href="/services" className="btn mt-5">
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
