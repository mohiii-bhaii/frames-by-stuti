import type { Metadata } from "next";
import { PricingCategoryPage } from "@/components/pricing/category-page";

export const metadata: Metadata = {
  title: "Events pricing",
  description: "Events photography packages and pricing from Frames by Stuti.",
};

export default function Page() {
  return <PricingCategoryPage slug="events" />;
}
