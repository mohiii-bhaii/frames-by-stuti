import type { Metadata } from "next";
import Link from "next/link";
import { ParagraphsT, T } from "@/components/editable-text";
import { ApertureBloom } from "@/components/line-art";
import { Photo } from "@/components/photo";
import { ScrollMotion } from "@/components/scroll-motion";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: `Meet Stuti, the photographer behind ${site.name}.`,
};

/** A fine line with a small flower between the parts of the story. */
function Divider() {
  return (
    <div aria-hidden="true" className="mx-auto flex items-center justify-center gap-4 text-terracotta/70">
      <span className="h-px w-14 bg-terracotta/35" />
      <ApertureBloom className="h-6 w-6" />
      <span className="h-px w-14 bg-terracotta/35" />
    </div>
  );
}

const bodyClass = "space-y-5 text-left text-[16px] leading-[1.9] text-walnut lg:text-[17px]";

export default function AboutPage() {
  return (
    <>
      {/* Meet Stuti */}
      <section className="paper relative overflow-x-clip">
        <ApertureBloom data-speed="-0.2" className="absolute -left-[14%] top-[6%] hidden w-[34%] text-walnut/10 md:block" />
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-y-10 px-6 pb-16 pt-6 lg:grid-cols-[minmax(0,500px)_minmax(0,1fr)] lg:gap-x-[88px] lg:px-[70px] lg:pb-[104px] lg:pt-10">
          <div className="relative mx-auto w-full max-w-[420px] md:max-w-[460px] lg:sticky lg:top-6 lg:mx-0 lg:max-w-none lg:self-start">
            <div data-reveal="left" className="rounded-t-[999px] rounded-b-[36px] border border-terracotta p-[3px]">
              <Photo
                slot="about-family"
                parallax={0.05}
                priority
                className="aspect-[4/5] w-full rounded-t-[999px] rounded-b-[33px]"
                sizes="(min-width: 64rem) 500px, (min-width: 48rem) 460px, 85vw"
              />
            </div>
          </div>
          <div className="text-center lg:self-center lg:text-left">
            <T as="p" id="about.eyebrow" data-reveal="up" className="eyebrow text-[13px] text-walnut lg:text-[14px]" />
            <h1 data-reveal="title" className="mt-4">
              <T id="about.hello" className="display block text-[44px] leading-[1.06] text-espresso md:text-[60px] lg:text-[76px]" />
            </h1>
            <div className="mt-9">
              <Divider />
              <T as="h2" id="about.part1.heading" data-reveal="title" className="display mt-7 text-[30px] leading-[1.1] text-espresso lg:text-[40px]" />
              <ParagraphsT id="about.part1.text" data-reveal="up" className={`mt-6 ${bodyClass}`} paragraphClassName="" />
            </div>
          </div>
        </div>
      </section>

      {/* The story continues in three more parts, each set apart by a fine divider. */}
      {[2, 3, 4].map((part) => (
        <section key={part} className="paper relative overflow-x-clip">
          <div className="mx-auto max-w-[680px] px-6 pb-14 pt-4 lg:pb-[88px]">
            <Divider />
            <T as="h2" id={`about.part${part}.heading`} data-reveal="title" className="display mt-8 text-center text-[30px] leading-[1.1] text-espresso lg:text-[42px]" />
            <ParagraphsT id={`about.part${part}.text`} data-reveal="up" className={`mt-7 ${bodyClass}`} />
          </div>
        </section>
      ))}

      {/* Closing invitation */}
      <section className="paper relative overflow-x-clip">
        <div className="mx-auto max-w-[640px] px-6 pb-20 pt-4 text-center lg:pb-[128px]">
          <T as="h2" id="about.cta.heading" data-reveal="title" className="display text-[34px] leading-[1.1] text-espresso lg:text-[52px]" />
          <T as="p" id="about.cta.text" data-reveal="up" className="mx-auto mt-6 max-w-[480px] text-[16px] leading-[1.8] text-walnut lg:text-[17px]" />
          <Link href="/contact" className="btn mt-9">
            <T id="about.cta.button" />
          </Link>
        </div>
      </section>
      <ScrollMotion />
    </>
  );
}
