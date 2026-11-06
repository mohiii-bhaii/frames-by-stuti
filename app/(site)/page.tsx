import Link from "next/link";
import type { CSSProperties } from "react";
import { CurvedT, PathT, SplitHeadingT, T, WaveT } from "@/components/editable-text";
import { HomeMarker } from "@/components/home-marker";
import { PhotoSlideshow } from "@/components/photo-slideshow";
import { WindowPhoto } from "@/components/window-photo";
import { SessionLink } from "@/components/session-link";
import { ApertureBloom, BotanicalBranch, Dragonfly, LeafSprig, Sparkle } from "@/components/line-art";
import { Photo } from "@/components/photo";
import { TestimonialsSection } from "@/components/testimonials-section";
import { sessionCards, site } from "@/content/site";
import { ScrollMotion } from "@/components/scroll-motion";

function VerticalWords({ className = "" }: { className?: string }) {
  return (
    <p className={`eyebrow whitespace-nowrap text-[clamp(13px,4.2vw,17px)] font-light text-espresso md:text-[16px] md:font-normal ${className}`}>
      <T id="home.words.1" />
      &nbsp;&nbsp;&nbsp;
      <T id="home.words.2" />
      &nbsp;&nbsp;&nbsp;
      <T id="home.words.3" />
    </p>
  );
}

/**
 * The curve of "CHOOSE YOUR SESSION": it starts low on the left, climbs to a crest over "CHOOSE",
 * dips through "YOUR" into a trough under "SESSION" and rises again at the end, like a ribbon.
 */
const SESSION_CURVE = "M104 235C388 -74 681 440 932 186";
/** The same curve, run on a little past both ends along its own direction, as spare room for the letters. */
const SESSION_CURVE_LONG = "M44 300L104 235C388 -74 681 440 932 186L992 125";

export default function HomePage() {
  return (
    <>
      {/* Tells the header it is on the homepage (see globals.css). */}
      <HomeMarker />

      {/* Hero */}
      <section className="paper relative overflow-x-clip h-[calc(196vw+4px)] max-h-[920px] min-h-[640px] md:h-[calc(100svh+123px)] md:max-h-none md:min-h-[843px] lg:h-[calc(100svh+159px)] lg:min-h-[879px]">
        <h1 className="sr-only">
          {site.name}: {site.location} photographer
        </h1>
        {/*
          The outer box has the frame's position and size and does no clipping, so
          the flower can cross the border. The photograph is cropped by the inner
          frame, which fills the outer box exactly (same size, shape and border as
          before). The flower is placed on the outer box's top-right corner, so it
          stays on that corner at every screen size and whatever photo is showing.
        */}
        <div className="absolute inset-x-[15%] bottom-[5%] top-[192px] md:inset-x-[12.150%] md:bottom-2 md:top-[224px] lg:top-[260px]">
          <div
            data-parallax="0.04"
            data-zoom
            className="absolute inset-0 overflow-hidden rounded-[38px] border-2 border-sage"
          >
            <PhotoSlideshow
              priority
              slots={["hero-1", "hero-2", "hero-3", "hero-4", "hero-5", "hero-6"]}
              sizes="(min-width: 48rem) 76vw, 70vw"
            />
          </div>
          {/* Centred 16px in from the box corner along both edges, which puts about half of the round flower inside the curved frame and half outside. Not interactive. */}
          <ApertureBloom className="pointer-events-none absolute right-0 top-0 z-10 hidden w-[74px] translate-x-[calc(50%-16px)] -translate-y-[calc(50%-16px)] text-walnut md:block" />
          {/* Phone: a dragonfly hovering over the frame's top-right corner, about half outside and half inside. */}
          <Dragonfly className="pointer-events-none overflow-visible absolute right-0 top-0 z-10 w-[clamp(84px,27vw,108px)] translate-x-[34%] -translate-y-[40%] text-pencil opacity-80 md:hidden" />
          {/* Phone: a branch reaching in from outside the frame at the lower-left corner. */}
          <BotanicalBranch className="pointer-events-none absolute bottom-[-3%] left-0 z-10 w-[178px] -translate-x-[40%] origin-bottom-left -rotate-[14deg] text-pencil opacity-80 md:hidden" />
        </div>
        <VerticalWords className="absolute left-[10.200%] top-[47%] origin-center -translate-x-1/2 -translate-y-1/2 -rotate-90 md:left-[10.700%] md:top-[60%] lg:top-[62%]" />
        <VerticalWords className="absolute right-[10.200%] top-[68%] origin-center translate-x-1/2 -translate-y-1/2 rotate-90 md:right-[10.700%] md:top-[60%] lg:top-[62%]" />
        <LeafSprig data-speed="0.35" className="absolute -left-2 bottom-[2%] hidden w-[120px] text-walnut md:bottom-[-6px] md:block md:left-[1.500%] md:w-[270px]" />
        <T
          as="p"
          id="header.eyebrow"
          className="eyebrow absolute inset-x-0 bottom-[1.200%] text-center text-[11px] tracking-normal md:hidden"
        />
      </section>

      {/* Tagline */}
      <section className="paper flex flex-col items-center px-4 pb-10 pt-8 text-center md:pb-12 md:pt-12 lg:px-0 lg:pb-14 lg:pt-14">
        <div data-reveal="title" className="w-full max-w-[760px]">
          <WaveT id="home.tagline" className="w-full text-[#654737]" />
        </div>
        <div data-reveal="up" style={{ "--reveal-delay": "0.25s" } as CSSProperties} className="mt-1 md:mt-2">
          <Link href="/contact" className="btn btn-invite">
            <T id="home.tagline.button" />
          </Link>
        </div>
      </section>

      {/* Meet your photographer */}
      <section className="paper overflow-x-clip">
        <div className="relative mx-auto max-w-[1200px] px-6 pb-16 pt-14 lg:px-[70px] lg:pb-[96px] lg:pt-[88px]">
          <SplitHeadingT
            id="home.about.heading"
            data-reveal="title"
            className="display mx-auto max-w-[900px] text-[clamp(28px,9.4vw,46px)] uppercase leading-[1.05] text-espresso md:text-[72px] lg:text-[96px]"
          />

          <div className="mt-12 grid items-center gap-y-10 md:mt-12 lg:mt-[64px] lg:grid-cols-[minmax(0,540px)_minmax(0,1fr)] lg:gap-x-[80px]">
            <div className="relative mx-auto w-full max-w-[420px] md:max-w-[480px] lg:mx-0 lg:max-w-none">
              <ApertureBloom data-speed="-0.2" className="absolute -right-[30%] top-[6%] hidden w-[70%] text-walnut/15 md:block" />
              <div data-reveal="left" className="rounded-[89px] border border-terracotta p-[3px] lg:p-0">
                <Photo
                  slot="home-portrait"
                  parallax={0.06}
                  className="aspect-[480/659] w-full rounded-[87px]"
                  sizes="(min-width: 64rem) 540px, (min-width: 48rem) 480px, 85vw"
                />
              </div>
              <Sparkle data-speed="0.3" className="absolute -top-4 right-[6%] w-8" />
              <Sparkle data-speed="0.45" className="absolute -top-5 right-[18%] w-5 md:-top-8" />
            </div>

            <div className="text-center lg:text-left">
              <div className="flex flex-wrap items-baseline justify-center gap-x-3 lg:justify-start">
                <T as="p" id="home.about.greeting" data-reveal="up" className="script text-[28px] text-walnut lg:text-[34px]" />
                <T
                  as="p"
                  id="home.about.intro"
                  data-reveal="title"
                  style={{ "--reveal-delay": "0.15s" } as CSSProperties}
                  className="script text-[36px] text-terracotta lg:text-[46px]"
                />
              </div>
              <div data-reveal="up" className="mt-7 space-y-5 text-[15.5px] leading-[1.9] text-walnut lg:text-[16px]">
                <T as="p" id="home.about.t1" />
                <T as="p" id="home.about.t2" />
                <T as="p" id="home.about.t3" />
              </div>
              <div data-reveal="up" style={{ "--reveal-delay": "0.2s" } as CSSProperties} className="mt-8 flex justify-center lg:justify-start">
                <Link href="/about" className="btn">
                  <T id="home.about.button" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full-width photo with overlay line */}
      <section className="relative">
        <Photo slot="home-banner-1" parallax={0.1} className="h-[143vw] max-h-[768px] w-full md:h-[53vw]" />
        {/* A soft, feathered warm-espresso glow behind the line so it reads over light clothing, water or sky.
            It sits between the photograph and the text, has no edges, and leaves the rest of the photo untouched. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[calc(48%-90px)] h-[320px] md:top-[calc(48%-70px)] md:h-[240px]"
          style={{
            background:
              "radial-gradient(ellipse 62% 50% at 50% 50%, rgba(53,48,38,0.34) 0%, rgba(53,48,38,0.24) 38%, rgba(53,48,38,0.09) 68%, rgba(53,48,38,0) 100%)",
          }}
        />
        <T
          as="p"
          id="home.banner"
          data-reveal="title"
          className="script absolute inset-x-6 top-[48%] text-center text-[34px] text-cream [text-shadow:0_1px_14px_rgba(53,48,38,0.35)] md:text-[36px]"
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
              <Link href="/pricing" className="btn">
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

      {/* A cinematic photograph that stays still while the page scrolls over it, with the curved heading across its foot.
          Explicit layers, bottom to top: the fixed photo (0), the shade (10), the heading (20). The shade and heading are
          also given their own compositing layer (translateZ) so Safari can never paint the fixed photo over them. */}
      <section className="window-section isolate h-[82svh] max-h-[780px] min-h-[460px] bg-espresso md:h-[78vh] md:max-h-[880px] md:min-h-[520px]">
        <WindowPhoto slot="home-banner-2" />
        {/* The photo is light, so it is dimmed a little overall and shaded deeply toward its foot, where the heading sits
            (near black at the very bottom, like the reference). The top of the photo stays bright and natural. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 bg-espresso/15 [transform:translateZ(0)]" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[74%] bg-gradient-to-b from-transparent via-[#241d16]/55 to-[#16110d]/95 [transform:translateZ(0)]"
        />
        <div className="absolute inset-x-[1%] bottom-[9%] z-20 mx-auto max-w-[1137px] text-[#d9936f] [transform:translateZ(0)]">
          <h2>
            <PathT
              id="home.sessions.heading"
              uppercase
              d={SESSION_CURVE_LONG}
              fitD={SESSION_CURVE}
              viewBox="0 10 1000 300"
              size={110}
              letterSpacing="0.02em"
              opticalSize={40}
              edgePadding={20}
              className="w-full"
            />
          </h2>
        </div>
      </section>

      {/* Session cards */}
      <section className="relative z-10 -mt-7 overflow-hidden rounded-t-[28px] bg-clay">
        {/* A soft photographic texture under a light clay wash, so the cards stay the focus. */}
        <Photo slot="session-backdrop" decorative parallax={0.12} className="absolute inset-0 opacity-25 mix-blend-multiply" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgb(235_230_219/0.55),rgb(202_128_96/0.09))]"
        />
        {/* Delicate, closely spaced watercolor pinstripes in muted terracotta (#B87958), subtly visible (about 11%). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[url('/brand/watercolor-stripes.svg')] bg-[length:216px_480px] bg-repeat opacity-[0.11]"
        />
        {/* ...and fades into the cream testimonials below. */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[90px] bg-gradient-to-b from-transparent to-cream" />
        <ul className="relative mx-auto grid max-w-[270px] grid-cols-1 gap-y-12 py-14 md:max-w-[1200px] md:grid-cols-8 md:gap-x-5 md:px-6 lg:gap-x-7 lg:px-[29px] lg:pb-[80px] lg:pt-[84px]">
          {sessionCards.map((category, index) => (
            <li
              key={category.id}
              className={index === 4 ? "md:col-span-2 md:col-start-4" : "md:col-span-2"}
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
                    className="pointer-events-none absolute inset-0 rounded-[12px] bg-gradient-to-t from-espresso/20 via-transparent to-transparent opacity-80 transition-opacity duration-700 group-hover:opacity-100"
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

      {/* Testimonials: drawn only once there is at least one real one (see components/testimonials-section.tsx). */}
      <TestimonialsSection
        photo={<Photo slot="home-testimonial" parallax={0.06} className="aspect-square w-full md:aspect-auto md:h-full" sizes="(min-width: 48rem) 50vw, 100vw" />}
      />

      <ScrollMotion />
    </>
  );
}
