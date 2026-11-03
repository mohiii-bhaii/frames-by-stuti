import type { Metadata } from "next";
import Link from "next/link";
import { ApertureBloom } from "@/components/line-art";
import { T } from "@/components/editable-text";
import { Photo } from "@/components/photo";
import { PortfolioGallery, type GalleryItem } from "@/components/portfolio-gallery";
import { site } from "@/content/site";
import { ScrollMotion } from "@/components/scroll-motion";

export const metadata: Metadata = {
  title: "Portfolio",
  description: `A selection of portrait, couples, family and milestone photography by ${site.name}.`,
};

const gallery: GalleryItem[] = [
  { slot: "gallery-01", category: "portraits" },
  { slot: "gallery-02", category: "couples" },
  { slot: "gallery-03", category: "family" },
  { slot: "gallery-04", category: "milestones" },
  { slot: "gallery-05", category: "portraits" },
  { slot: "gallery-06", category: "couples" },
  { slot: "gallery-07", category: "family" },
  { slot: "gallery-08", category: "milestones" },
  { slot: "gallery-09", category: "portraits" },
  { slot: "gallery-10", category: "couples" },
  { slot: "gallery-11", category: "family" },
  { slot: "gallery-12", category: "milestones" },
  { slot: "gallery-13", category: "portraits" },
  { slot: "gallery-14", category: "couples" },
  { slot: "gallery-15", category: "family" },
  { slot: "gallery-16", category: "milestones" },
];

export default function PortfolioPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex h-[120vw] max-h-[900px] min-h-[480px] items-center justify-center overflow-hidden bg-espresso md:h-[60vw]">
        <Photo slot="portfolio-hero" parallax={0.08} zoom className="absolute inset-0" priority />
        <div className="absolute inset-0 bg-espresso/30" />
        <T as="h1" id="portfolio.title" className="display relative px-6 text-center text-[60px] text-cream md:text-[100px] lg:text-[130px]" />
      </section>

      {/* Gallery */}
      <section className="paper pb-16 pt-12 lg:pb-24 lg:pt-20">
        <div className="mx-auto mb-10 max-w-[640px] px-6 text-center">
          <ApertureBloom className="mx-auto mb-5 w-14 text-walnut" />
          <T as="h2" id="portfolio.heading" className="script text-[40px] text-terracotta lg:text-[55px]" />
          <T as="p" id="portfolio.intro" className="mt-4 text-[15px] text-walnut lg:text-[16px]" />
        </div>
        <PortfolioGallery items={gallery} />
      </section>

      {/* Call to action */}
      <section className="paper bg-espresso px-6 py-16 text-center text-cream lg:py-24">
        <T as="p" id="portfolio.cta.line1" className="display text-[30px] lg:text-[45px]" />
        <T as="h2" id="portfolio.cta.line2" className="script mt-1 text-[42px] lg:text-[69px]" />
        <Link href="/contact" className="btn mt-8">
          <T id="portfolio.cta.button" />
        </Link>
      </section>
      <ScrollMotion />
    </>
  );
}
