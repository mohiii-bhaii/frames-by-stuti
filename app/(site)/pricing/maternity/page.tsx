import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PricingCategoryPage } from "@/components/pricing/category-page";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("maternity");
}

export default function Page() {
  return <PricingCategoryPage slug="maternity" />;
}
