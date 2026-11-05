import type { Metadata } from "next";
import { IntroPhoto } from "@/components/portfolio/intro-photo";
import { PortfolioGalleries } from "@/components/portfolio/portfolio-galleries";
import { ScrollMotion } from "@/components/scroll-motion";
import { portfolioCategories } from "@/content/portfolio";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Portfolio",
  description: `Maternity, newborn, milestone, lifestyle and family, and event photography by ${site.name}.`,
};

export default function PortfolioPage() {
  return (
    <>
      <section className="paper relative overflow-x-clip">
        <h1 className="sr-only">Portfolio</h1>
        <div className="pb-16 pt-4 md:pb-24 md:pt-8">
          <IntroPhoto />
          <PortfolioGalleries categories={portfolioCategories} />
        </div>
      </section>
      <ScrollMotion />
    </>
  );
}
