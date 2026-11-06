import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { PortfolioGalleries } from "@/components/portfolio/portfolio-galleries";
import { ScrollMotion } from "@/components/scroll-motion";
import { portfolioCategories } from "@/content/portfolio";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("galleries");
}

export default function GalleriesPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Galleries", path: "/galleries" }])} />
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
