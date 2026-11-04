import type { Metadata } from "next";
import { PricingCategoryPage } from "@/components/pricing/category-page";

export const metadata: Metadata = {
  title: "Milestones pricing",
  description: "Milestones photography packages and pricing from Frames by Stuti.",
};

export default function Page() {
  return <PricingCategoryPage slug="milestones" />;
}
