import { pricingCategories } from "@/content/pricing";
import { portfolioCategories } from "@/content/portfolio";
import { site } from "@/content/site";
import type { SlotId } from "@/lib/images";

const sessionNames: Record<string, string> = {
  newborns: "Newborn",
  newborn: "Newborn",
  maternity: "Maternity",
  milestones: "Baby milestone",
  lifestyle: "Lifestyle and family",
  family: "Family",
  couples: "Couples",
  portraits: "Portrait",
  events: "Event",
  bundle: "Photography",
};

/** The gallery category a stored photo spot belongs to, from the Galleries page's own layout. */
function galleryCategory(slot: string) {
  return portfolioCategories.find((category) => (category.slots as string[]).includes(slot))?.id;
}

/**
 * Descriptive alt text for a photo that has none of its own, so search engines and screen readers
 * get a meaningful description instead of nothing. It only says what the site already knows: the kind
 * of session and the business. Alt text typed in the editor always wins over these.
 */
export function defaultAlt(slot: SlotId | string): string {
  const where = `${site.name}, Ottawa photographer`;
  const category = galleryCategory(slot) ?? slot.match(/^pf-([a-z]+)-/)?.[1] ?? slot.match(/^pricing-([a-z]+)-/)?.[1] ?? slot.match(/^session-([a-z]+)/)?.[1];
  const known = category && sessionNames[category];
  if (known) return `${known} photography by ${where}`;
  if (/^pricing-landing/.test(slot) || pricingCategories.some((item) => slot.includes(item.slug))) return `Photography sessions by ${where}`;
  if (slot === "home-portrait" || slot.startsWith("about-")) return `Stuti, the photographer behind ${site.name} in Ottawa`;
  if (slot.startsWith("hero-") || slot.startsWith("home-")) return `Family, newborn and maternity photography by ${where}`;
  return `Photography by ${where}`;
}

/** The photo's own alt text, or a descriptive default when it has none (or is still a placeholder). */
export function altFor(slot: SlotId | string, alt: string | undefined) {
  const own = (alt ?? "").trim();
  return own && !own.startsWith("Placeholder") ? own : defaultAlt(slot);
}
