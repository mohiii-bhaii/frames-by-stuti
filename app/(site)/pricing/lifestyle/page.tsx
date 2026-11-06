import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PricingCategoryPage } from "@/components/pricing/category-page";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("lifestyle");
}

export default function Page() {
  return <PricingCategoryPage slug="lifestyle" />;
}
