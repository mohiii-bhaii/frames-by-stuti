import type { Metadata } from "next";
import Link from "next/link";
import { AboutGallery, type GalleryItem } from "@/components/about-gallery";
import { T } from "@/components/editable-text";
import { ApertureBloom, LeafSprig } from "@/components/line-art";
import { Photo } from "@/components/photo";
import { ScrollMotion } from "@/components/scroll-motion";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: `Meet Stuti, the photographer behind ${site.name}.`,
};

/** Up to five photographs, mixing portrait and landscape. Empty spots are skipped for visitors. */
const gallery: GalleryItem[] = [
  { slot: "about-hero", shape: "landscape" },
  { slot: "about-moment-1", shape: "portrait" },
  { slot: "about-moment-2", shape: "landscape" },
  { slot: "about-work", shape: "portrait" },
  { slot: "about-moment-3", shape: "portrait" },
];

export default function AboutPage() {
  return (
    <>
      {/* Meet Stuti */}
      <section className="paper relative overflow-x-clip">
        <ApertureBloom data-speed="-0.2" className="absolute -left-[14%] top-[6%] hidden w-[34%] text-walnut/10 md:block" />
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-y-10 px-6 pb-16 pt-6 lg:grid-cols-[minmax(0,500px)_minmax(0,1fr)] lg:gap-x-[88px] lg:px-[70px] lg:pb-[104px] lg:pt-10">
          <div className="relative mx-auto w-full max-w-[420px] md:max-w-[460px] lg:mx-0 lg:max-w-none">
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
          <div className="text-center lg:text-left">
            <T as="p" id="about.eyebrow" data-reveal="up" className="eyebrow text-[13px] text-walnut lg:text-[14px]" />
            <h1 data-reveal="title" className="mt-4">
              <T id="about.hello" className="display block text-[44px] leading-[1.06] text-espresso md:text-[60px] lg:text-[76px]" />
            </h1>
            <T as="p" id="about.heroStory" data-reveal="up" className="mt-7 text-[16px] leading-[1.8] text-walnut lg:text-[18px]" />
          </div>
        </div>
      </section>

      {/* The heart behind the photographs */}
      <section className="paper relative overflow-x-clip">
        <div className="mx-auto max-w-[720px] px-6 pb-16 pt-4 text-center lg:pb-[104px]">
          <ApertureBloom className="mx-auto mb-6 w-10 text-walnut" />
          <T as="h3" id="about.heart.heading" data-reveal="title" className="script text-[32px] text-terracotta lg:text-[44px]" />
          <T as="p" id="about.why.story" data-reveal="up" className="mt-6 text-[16px] leading-[1.85] text-walnut lg:text-[18px]" />
          <LeafSprig className="mx-auto mt-12 w-[110px] text-walnut/70" />
        </div>
      </section>

      {/* Behind the scenes */}
      <AboutGallery items={gallery} />

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
