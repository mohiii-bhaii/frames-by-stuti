import Link from "next/link";
import type { CSSProperties } from "react";
import { CurvedT, T } from "@/components/editable-text";
import { PhotoSlideshow } from "@/components/photo-slideshow";
import { SessionLink } from "@/components/session-link";
import { ApertureBloom, LeafSprig, Sparkle } from "@/components/line-art";
import { Photo } from "@/components/photo";
import { TestimonialSlider } from "@/components/testimonial-slider";
import { categories, site } from "@/content/site";
import { ScrollMotion } from "@/components/scroll-motion";

function VerticalWords({ className = "" }: { className?: string }) {
  return (
    <p className={`eyebrow whitespace-nowrap text-[13px] text-espresso md:text-[16px] ${className}`}>
      <T id="home.words.1" />
      &nbsp;&nbsp;&nbsp;
      <T id="home.words.2" />
      &nbsp;&nbsp;&nbsp;
      <T id="home.words.3" />
    </p>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Tells the header it is on the homepage (see globals.css). */}
      <span hidden data-page-home />

      {/* Hero */}
      <section className="paper relative h-[190vw] max-h-[900px] min-h-[640px] md:h-svh md:max-h-none md:min-h-[720px]">
        <h1 className="sr-only">
          {site.name}: {site.location} photographer
        </h1>
        <div
          data-parallax="0.04"
          data-zoom
          className="absolute inset-x-[15%] bottom-[5%] top-[172px] overflow-hidden rounded-[38px] border-2 border-sage md:inset-x-[12.150%] md:bottom-2 md:top-[101px]"
        >
          <PhotoSlideshow
            priority
            slots={["hero-1", "hero-2", "hero-3", "hero-4", "hero-5", "hero-6"]}
            sizes="(min-width: 48rem) 76vw, 70vw"
          />
        </div>
        <VerticalWords className="absolute left-[7.500%] top-[62%] origin-center -translate-x-1/2 -translate-y-1/2 -rotate-90 md:left-[10.700%] md:top-[55%]" />
        <VerticalWords className="absolute right-[7.500%] top-[62%] origin-center translate-x-1/2 -translate-y-1/2 rotate-90 md:right-[10.700%] md:top-[55%]" />
        <ApertureBloom data-speed="0.25" className="absolute right-[3%] top-[120px] w-[64px] text-walnut md:right-[9%] md:top-[34px] md:w-[74px]" />
        <LeafSprig data-speed="0.35" className="absolute -left-2 bottom-[2%] w-[120px] text-walnut md:bottom-[-6px] md:left-[1.500%] md:w-[270px]" />
        <T
          as="p"
          id="header.eyebrow"
          className="eyebrow absolute inset-x-0 bottom-[1.200%] text-center text-[11px] tracking-normal md:hidden"
        />
      </section>

      {/* Tagline */}
      <section className="paper flex flex-col items-center px-6 pb-11 pt-12 text-center lg:h-[277px] lg:justify-between lg:px-0 lg:pb-6 lg:pt-[62px]">
        <div data-reveal="title" className="w-full max-w-[682px]">
          <CurvedT id="home.tagline" className="w-full text-walnut" />
        </div>
        <div data-reveal="up" style={{ "--reveal-delay": "0.25s" } as CSSProperties} className="mt-8 lg:mt-0">
          <Link href="/contact" className="btn">
            <T id="home.tagline.button" />
          </Link>
        </div>
      </section>

      {/* About intro */}
      <section className="paper overflow-x-clip">
        <div className="mx-auto grid max-w-[1200px] items-start gap-y-8 px-6 pb-12 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-0 lg:px-0 lg:pb-[66px] lg:pt-[70px]">
        <div className="relative order-2 mx-auto w-full max-w-[480px] pb-10 lg:order-none lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:ml-[70px] lg:pb-[108px]">
          <ApertureBloom data-speed="-0.2" className="absolute -right-[44%] top-[11%] hidden w-[80%] text-walnut/15 md:block" />
          <div data-reveal="left" className="rounded-[89px] border border-terracotta p-[3px] lg:p-0">
            <Photo
              slot="home-portrait"
              parallax={0.06}
              className="aspect-[480/659] w-full rounded-[87px]"
              sizes="(min-width: 64rem) 480px, 80vw"
            />
          </div>
          <div data-speed="0.18" className="absolute -right-[6%] bottom-0 w-[50%] md:-right-[14%]">
            <Photo
              slot="home-detail"
              reveal="mask"
              className="aspect-[238/311] w-full border-[5px] border-tan"
              sizes="(min-width: 64rem) 248px, 40vw"
            />
          </div>
          <Sparkle data-speed="0.3" className="absolute bottom-[10%] left-[8%] w-8" />
          <Sparkle data-speed="0.45" className="absolute bottom-[1%] left-[26%] w-5" />
          <Sparkle className="absolute -bottom-3 left-[47%] w-4" />
        </div>

        <div className="order-1 flex flex-wrap items-baseline justify-center gap-x-3 text-center lg:order-none lg:col-start-2 lg:row-start-1 lg:block lg:pl-[72px] lg:pr-[99px] lg:pt-[160px]">
          <T as="p" id="home.about.greeting" data-reveal="up" className="script text-[36px] text-walnut" />
          <T
            as="h2"
            id="home.about.intro"
            data-reveal="title"
            style={{ "--reveal-delay": "0.15s" } as CSSProperties}
            className="script text-[44px] lowercase text-terracotta lg:text-[55px]"
          />
        </div>

        <div className="order-3 text-center lg:order-none lg:col-start-2 lg:row-start-2 lg:pl-[72px] lg:pr-[99px] lg:pt-6 lg:text-left">
          <div data-reveal="up" className="space-y-4 text-[15px] text-walnut lg:text-[16px]">
            <T as="p" id="home.about.p1" />
            <T as="p" id="home.about.p2" />
          </div>
          <div className="mt-7 flex justify-center">
            <Link href="/about" className="btn">
              <T id="home.about.button" />
            </Link>
          </div>
        </div>
        </div>
      </section>

      {/* Full-width photo with overlay line */}
      <section className="relative">
        <Photo slot="home-banner-1" parallax={0.1} className="h-[143vw] max-h-[768px] w-full md:h-[53vw]" />
        <T
          as="p"
          id="home.banner"
          data-reveal="title"
          className="script absolute inset-x-6 top-[48%] text-center text-[34px] text-cream md:text-[36px]"
        />
      </section>

      {/* Belief */}
      <section className="paper overflow-x-clip">
        <div className="mx-auto grid max-w-[1200px] gap-y-8 px-6 pb-14 lg:grid-cols-[1fr_610px] lg:gap-x-9 lg:px-0 lg:pb-0">
          <div className="order-2 text-center lg:order-1 lg:h-[826px] lg:pl-[53px] lg:pt-[164px] lg:text-left">
            <T as="h2" id="home.belief.heading" data-reveal="title" className="display text-[34px] lg:text-[36px]" />
            <div data-reveal="up" className="mt-6 space-y-5 text-[15px] lg:text-justify lg:text-[16px]">
              <T as="p" id="home.belief.p1" />
              <T as="p" id="home.belief.p2" />
            </div>
            <div className="mt-7">
              <Link href="/services" className="btn">
                <T id="home.belief.button" />
              </Link>
            </div>
          </div>
          <div className="relative order-1 mx-auto w-[70%] max-w-[610px] -mt-8 lg:order-2 lg:-mt-[18px] lg:mr-0 lg:w-full">
            <div data-reveal="right" className="rounded-[50%] border border-terracotta p-[6px]">
              <PhotoSlideshow
                slots={["home-oval", "home-oval-2", "home-oval-3"]}
                frameClassName="aspect-[599/756] w-full rounded-[50%]"
                parallax={0.06}
                sizes="(min-width: 64rem) 600px, 70vw"
              />
            </div>
            <ApertureBloom data-speed="0.3" className="absolute bottom-[-2%] right-[-6%] w-[34%] text-walnut lg:bottom-[-6px] lg:left-[16%] lg:right-auto lg:w-[145px]" />
          </div>
        </div>
      </section>

      {/* Photo into curved session heading */}
      <section className="relative bg-clay">
        <Photo slot="home-banner-2" parallax={0.1} zoom className="h-[105vw] max-h-[768px] w-full md:h-[53vw]" />
        {/* The photograph melts into the soft clay of the session cards below. */}
        <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-b from-transparent to-clay" />
        <div data-reveal="title" className="absolute inset-x-[3%] bottom-[-3%] mx-auto max-w-[1137px] text-rust">
          <h2>
            <CurvedT id="home.sessions.heading" uppercase italic={false} rise={0.11} size={76} className="w-full" />
          </h2>
        </div>
      </section>

      {/* Session cards */}
      <section className="relative overflow-hidden bg-clay">
        {/* A soft photographic texture under a light clay wash, so the cards stay the focus. */}
        <Photo slot="session-backdrop" decorative parallax={0.12} className="absolute inset-0 opacity-25 mix-blend-multiply" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgb(235_230_219/0.55),rgb(202_128_96/0.16))]"
        />
        {/* ...and fades into the cream testimonials below. */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[90px] bg-gradient-to-b from-transparent to-cream" />
        <ul className="relative mx-auto grid max-w-[270px] grid-cols-1 gap-y-12 py-14 md:max-w-[1200px] md:grid-cols-4 md:gap-x-5 md:px-6 lg:gap-x-7 lg:px-[29px] lg:pb-[80px] lg:pt-[84px]">
          {categories.map((category, index) => (
            <li
              key={category.id}
              data-reveal="up"
              style={{ "--reveal-delay": `${index * 0.12}s` } as CSSProperties}
            >
              <SessionLink categoryId={category.id} className="group block text-center text-espresso">
                <span className="relative block overflow-hidden rounded-[12px] shadow-[0_24px_40px_-28px_rgb(53_48_38/0.55)] transition-[translate,box-shadow] duration-700 ease-[var(--ease-soft)] group-hover:-translate-y-1.5 group-hover:shadow-[0_30px_50px_-26px_rgb(53_48_38/0.65)]">
                  <Photo
                    slot={category.image}
                    className="aspect-square w-full rounded-[12px]"
                    imageClassName="transition-[scale] duration-[1.4s] ease-[var(--ease-soft)] group-hover:scale-[1.06]"
                    sizes="(min-width: 48rem) 25vw, 270px"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-[12px] bg-gradient-to-t from-espresso/45 via-transparent to-transparent opacity-80 transition-opacity duration-700 group-hover:opacity-100"
                  />
                  <span aria-hidden="true" className="pointer-events-none absolute inset-[8px] rounded-[8px] border border-cream/70" />
                  <ApertureBloom className="absolute bottom-[8%] left-1/2 h-7 w-7 -translate-x-1/2 transition-[rotate] duration-700 group-hover:rotate-45" />
                </span>
                <span
                  className="mx-auto block h-[42px] w-px origin-top bg-espresso/45 transition-[scale] duration-700 group-hover:scale-y-125"
                  aria-hidden="true"
                />
                <T as="h3" id={`category.${category.id}`} className="display text-[34px] md:text-[26px] lg:text-[35px]" />
              </SessionLink>
            </li>
          ))}
        </ul>
      </section>

      {/* Testimonials */}
      <section className="paper grid md:grid-cols-2">
        <div className="flex items-center justify-center px-6 py-14 md:py-10 lg:h-[660px]">
          <TestimonialSlider />
        </div>
        <Photo slot="home-testimonial" parallax={0.06} className="aspect-square w-full md:aspect-auto md:h-full" sizes="(min-width: 48rem) 50vw, 100vw" />
      </section>

      <ScrollMotion />
    </>
  );
}
