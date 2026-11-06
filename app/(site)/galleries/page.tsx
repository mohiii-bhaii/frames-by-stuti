import type { Metadata } from "next";
import { PortfolioGalleries } from "@/components/portfolio/portfolio-galleries";
import { ScrollMotion } from "@/components/scroll-motion";
import { portfolioCategories } from "@/content/portfolio";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Galleries",
  description: `Maternity, newborn, milestone, lifestyle and family, and event photography by ${site.name}.`,
};

export default function GalleriesPage() {
  return (
    <>
      <section className="paper relative overflow-x-clip">
        <h1 className="sr-only">Galleries</h1>
        <div className="pb-16 pt-6 md:pb-24 md:pt-10">
          <PortfolioGalleries categories={portfolioCategories} />
        </div>
      </section>
      <ScrollMotion />
    </>
  );
}
