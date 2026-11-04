/**
 * Pricing & Packages: the six categories, and every editable piece of text on
 * their pages. Nothing here is a price. Prices, durations and inclusions start
 * empty and are typed in the visual editor, so a tier with no name stays
 * hidden and a tier with no price says "Inquire for pricing".
 *
 * To add a category: add it to this list, add the matching page file under
 * app/(site)/pricing/<slug>/page.tsx, and run `npm run placeholders`.
 */
export type PricingKind = "session" | "event" | "bundle";

export type PricingCategory = {
  slug: string;
  /** Shown in menus and on the landing page. Editable (pricing.<slug>.name). */
  name: string;
  /** The Contact form's session type this category selects. */
  session: string;
  kind: PricingKind;
  intro: string;
};

export const pricingCategories: PricingCategory[] = [
  {
    slug: "maternity",
    name: "Maternity",
    session: "maternity",
    kind: "session",
    intro: "Portraits that celebrate this chapter of your story. Package details and pricing are shared on inquiry.",
  },
  {
    slug: "newborn",
    name: "Newborn",
    session: "newborn",
    kind: "session",
    intro: "Gentle portraits of the first days. Package details and pricing are shared on inquiry.",
  },
  {
    slug: "milestones",
    name: "Milestones",
    session: "milestones",
    kind: "session",
    intro: "Baby milestones, birthdays and Cake Smash sessions. Package details and pricing are shared on inquiry.",
  },
  {
    slug: "lifestyle",
    name: "Lifestyle / Family",
    session: "family",
    kind: "session",
    intro: "Relaxed family portraits that feel like you. Package details and pricing are shared on inquiry.",
  },
  {
    slug: "events",
    name: "Events",
    session: "events",
    kind: "event",
    intro: "Photography for the occasions you want remembered. Every event is different, so quotations are shared on inquiry.",
  },
  {
    slug: "bundle",
    name: "Bundle + Save",
    session: "other",
    kind: "bundle",
    intro: "Combine sessions into one booking. Bundle details and pricing are shared on inquiry.",
  },
];

export const TIERS_PER_CATEGORY = 4;
export const tierNumbers = Array.from({ length: TIERS_PER_CATEGORY }, (_, index) => index + 1);

/** Fields of one package tier, in the order they appear on the page. */
export const tierFields = ["name", "price", "caption", "details", "duration", "includes", "location", "sessions", "individual", "savings", "note"] as const;
export type TierField = (typeof tierFields)[number];

export const tierKey = (slug: string, n: number, field: TierField) => `pricing.${slug}.t${n}.${field}`;

export function pricingHref(slug?: string) {
  return slug ? `/pricing/${slug}` : "/pricing";
}

/** The Contact page link for an inquiry, with the session chosen and, optionally, the package asked about. */
export function inquiryHref(session: string, packageName = "") {
  const params = new URLSearchParams({ session });
  const name = packageName.trim().slice(0, 120);
  if (name) params.set("package", name);
  return `/contact?${params.toString()}#inquiry`;
}

export const pricingPaths = ["/pricing", ...pricingCategories.map((category) => pricingHref(category.slug))];

/** Original wording for every editable text of the pricing pages. */
export const pricingTexts: Record<string, string> = {
  "nav.pricing.back": "Back",
  "nav.pricing.all": "All pricing & packages",
  "pricing.landing.title": "Pricing & Packages",
  "pricing.landing.intro":
    "Choose a session type to see its packages. If you are not sure which one fits, send an inquiry and we will find it together.",
  "pricing.landing.choose": "Choose your session",
  "pricing.landing.help.heading": "Not sure where to start?",
  "pricing.landing.help.text": "Tell me about the moments you want to keep and I will suggest what fits.",
  "pricing.landing.help.button": "Send an inquiry",
  "pricing.back": "All pricing & packages",
  "pricing.more": "More session types",
  "pricing.label.duration": "Session length",
  "pricing.label.includes": "This package includes:",
  "pricing.label.location": "Outfits & location",
  "pricing.label.sessions": "Sessions included",
  "pricing.label.individual": "Individual prices",
  "pricing.label.savings": "Total savings:",
};

for (const category of pricingCategories) {
  const base = `pricing.${category.slug}`;
  Object.assign(pricingTexts, {
    [`${base}.name`]: category.name,
    [`${base}.title`]: category.name,
    [`${base}.subtitle`]: "",
    [`${base}.intro`]: category.intro,
    [`${base}.packages.heading`]: category.kind === "bundle" ? "Bundles" : category.kind === "event" ? "Event packages" : "Packages",
    [`${base}.empty`]: "Packages and pricing for this session are shared on inquiry. Send a message and I will reply with the details.",
    [`${base}.priceEmpty`]: category.kind === "event" ? "Custom quotation on inquiry" : "Inquire for pricing",
    [`${base}.button`]: "Inquire about this session",
    [`${base}.tier.button`]: "Inquire about this package",
  });
  for (const n of tierNumbers) for (const field of tierFields) pricingTexts[tierKey(category.slug, n, field)] = "";
}

const fieldLabels: Record<TierField, string> = {
  name: "Package name (leave empty to hide the package)",
  price: "Price (leave empty to show “Inquire for pricing”)",
  duration: "Session length",
  details: "Description",
  caption: "Caption under the package photo",
  note: "Footnotes (shown in italics, one per line)",
  includes: "What's included (one item per line; start a line with - for an indented sub-item)",
  location: "Outfits & location",
  sessions: "Sessions included (bundles)",
  individual: "Individual prices (bundles)",
  savings: "Savings (bundles)",
};

/** A readable name for the editor, such as "Maternity · Package 2 · Price". */
export function pricingTextLabel(key: string): string | null {
  const parts = key.split(".");
  if (parts[0] !== "pricing") return null;
  const category = pricingCategories.find((item) => item.slug === parts[1]);
  if (!category) return null;
  const tier = /^t(\d+)$/.exec(parts[2] ?? "");
  if (tier) return `${category.name} · Package ${tier[1]} · ${fieldLabels[parts[3] as TierField] ?? parts[3]}`;
  const names: Record<string, string> = {
    name: "Name in menus and cards",
    title: "Page heading",
    subtitle: "Subtitle under the heading",
    intro: "Introduction",
    "packages.heading": "Packages heading",
    empty: "Message while no package is published",
    priceEmpty: "Text shown when a package has no price",
    button: "Inquiry button at the end of the page",
    "tier.button": "Inquiry button on each package",
  };
  return `${category.name} · ${names[parts.slice(2).join(".")] ?? parts.slice(2).join(" ")}`;
}
