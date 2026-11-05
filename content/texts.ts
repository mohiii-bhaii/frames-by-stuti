import { about, categories, sessionCards, contactLink, faqs, navigation, packageDetails, site, testimonials } from "@/content/site";
import { portfolioCategories } from "@/content/portfolio";
import { pricingCategories, pricingHref, pricingTexts, pricingTextLabel } from "@/content/pricing";
import { locationPreferences, referralOptions, sessionOptions, weekdays } from "@/lib/inquiry";

/**
 * Every editable piece of website text, with its original wording.
 *
 * The original is the fallback: the website shows it until an admin publishes
 * a change from the visual editor, and "Use original" in the editor goes back
 * to it. Keys are the only thing the database stores alongside an edit, so
 * the editor can only change text that is listed here.
 *
 * Group a key by its first segment: home, about, portfolio, services, contact,
 * faq, packages, testimonial, category, nav, footer, form and site.
 */
const texts: Record<string, string> = {};

/** Nav keys: "/" is home, "/about" is about, and so on. */
export const navKey = (href: string) => `nav.${href === "/" ? "home" : href.slice(1)}`;

for (const item of [...navigation, contactLink]) texts[navKey(item.href)] = item.label;

/** The footer's service areas, each its own text so they can be changed or hidden one by one. */
export const areaKeys = site.serviceAreas.map((_, index) => `site.area.${index + 1}`);
areaKeys.forEach((key, index) => {
  texts[key] = site.serviceAreas[index];
});
for (const category of sessionCards) texts[`category.${category.id}`] = category.label;
Object.assign(texts, pricingTexts);
for (const category of portfolioCategories) texts[`portfolio.${category.id}.title`] = category.title;
texts["portfolio.empty"] = "New photographs are coming soon.";

// Business details. Social links are hidden on the site while they are empty.
Object.assign(texts, {
  "site.email": site.email,
  "site.phone": site.phone,
  "site.location": site.location,
  "site.instagramHandle": site.instagramHandle,
  "site.instagramUrl": site.social.instagram,
  "site.facebookUrl": site.social.facebook,
});

Object.assign(texts, {
  // Header
  "header.eyebrow": `${site.location} Photographer`,

  // Home
  "home.words.1": "Portraits",
  "home.words.2": "Couples",
  "home.words.3": "Families",
  "home.tagline": "every frame, a feeling",
  "home.tagline.button": "Save my memories",
  "home.about.greeting": about.greeting,
  "home.about.intro": about.intro,
  "home.about.p1": about.homeIntro[0],
  "home.about.p2": about.homeIntro[1],
  "home.about.heading": "Meet your photographer",
  "home.about.button": "More about Stuti",
  "home.banner": "for the ordinary days you'll miss the most",
  "home.belief.heading": "I believe the quiet moments are the ones worth keeping",
  "home.belief.p1":
    "[Placeholder.] Write about what you notice that others might miss, and why those small, unposed moments matter to you and to the people you photograph.",
  "home.belief.p2":
    "Then describe how you make that happen: how you put people at ease, how you direct without posing, and how a session with you feels from start to finish.",
  "home.belief.button": "More details",
  "home.sessions.heading": "Choose your session",

  // About
  "about.eyebrow": "Behind the lens",
  "about.hello": "Hello there, I'm Stuti",
  "about.heroStory": about.heroStory,
  "about.heart.heading": "The heart behind the photographs",
  "about.why.story": about.whyStory,
  "about.cta.heading": "Let's make some memories together.",
  "about.cta.text": "I'd love to hear your story and capture the moments that mean the most to you.",
  "about.cta.button": "Get in touch",

  // Portfolio

  // Services
  "services.title": "it's all about the experience",
  "services.how.kicker": "here's how it works",
  "services.how.heading": "Come as you are",
  "services.how.text":
    "[Placeholder.] Describe your approach: how you get to know each client, how you plan a session together and what makes the experience feel easy from the first message to the final gallery.",
  "services.how.button": "See the packages",
  "services.invest.heading": "Invest in your\nmemories",
  "services.invest.text":
    "[Placeholder.] Explain the value of professional photographs: why they matter, what they will mean years from now and what is included in every session you offer.",
  "services.invest.button": "Pricing details",
  "services.packages.heading": "The packages",
  "services.packages.hint": "Choose a session type to see package details",
  "services.banner.heading": "you'll only wish you'd taken more photographs",
  "services.banner.text": "[Placeholder.] A closing thought on why now is the right time to book, written in your own words.",
  "services.banner.button": "Inquire",
  "services.faq.heading": "Questions & answers",
  "services.faq.sub": "Everything you might want to ask",

  // Contact
  "contact.hero.line1": "Let's get you on",
  "contact.hero.line2": "the calendar",
  "contact.form.heading": "Tell me everything",
  "contact.reach.before": "Prefer email? Write to",
  "contact.reach.middle": "or call",
  "contact.reach.after": "Based in",


  // Footer
  "footer.menu": "Menu",
  "footer.blurb": `${site.tagline}. Warm, honest photographs of real people, real places and real moments.`,
  "footer.meet": "meet stuti",
  "footer.contact": "Contact me",
  "footer.left": `${site.location} & beyond`,
  "footer.copyright": `© ${site.year} ${site.name}`,
  "footer.rights": "All rights reserved",

  // Packages: shared button
  "packages.inquire": "Inquire",
});

// Contact form: every label, hint and option can be edited.
Object.assign(texts, {
  "form.required": "Fields marked * are required.",
  "form.name.heading": "Name",
  "form.firstName.label": "First name",
  "form.lastName.label": "Last name",
  "form.phone.label": "Phone number",
  "form.phone.placeholder": "(613) 555-0142",
  "form.email.label": "Email address",
  "form.email.placeholder": "name@example.com",
  "form.sessionType.label": "What type of session are you looking for?",
  "form.select.placeholder": "Select an option",
  "form.maternity.heading": "Maternity + Newborn Only",
  "form.dueDate.label": "What is your due date?",
  "form.locationPreference.label": "Do you have a location preference?",
  "form.location.label": "Preferred city or area (optional)",
  "form.location.placeholder": "City or area, for example Ottawa",
  "form.days.label": "What days of the week work best for you?",
  "form.days.hint": "Choose all that apply.",
  "form.message.label": "Tell us more about your session.",
  "form.message.hint":
    "Is there something specific you’re hoping for? Tell me about your ideas, the people involved, and the moments you’d love to capture.",
  "form.referral.label": "How did you hear about Frames by Stuti?",
  "form.submit": "Submit inquiry",
  "form.sending": "Sending...",
  "form.thanks.heading": "thank you!",
  "form.thanks.text": "Your inquiry is on its way. I'll reply as soon as I can.",
});
for (const option of sessionOptions) texts[`form.session.${option.value}`] = option.label;
const locationLabels: Record<(typeof locationPreferences)[number], string> = {
  Studio: "Studio",
  Outdoor: "Outdoor",
  "At Home": "At Home",
  Other: "Other / Not Sure Yet",
};
locationPreferences.forEach((value, index) => {
  texts[`form.locationPreference.option.${index + 1}`] = locationLabels[value];
});
const referralLabels: Record<(typeof referralOptions)[number], string> = {
  Instagram: "Instagram",
  Google: "Google Search",
  "Friend or family": "Friend or Family Referral",
  "Previous client": "Previous Client",
  Other: "Other",
};
referralOptions.forEach((value, index) => {
  texts[`form.referral.option.${index + 1}`] = referralLabels[value];
});
weekdays.forEach((day, index) => {
  texts[`form.day.${index + 1}`] = day;
});

for (const category of categories) {
  const details = packageDetails[category.id];
  texts[`packages.${category.id}.heading`] = `${category.label} sessions`;
  texts[`packages.${category.id}.intro`] = details.intro;
  texts[`packages.${category.id}.note`] = details.note;
  details.packages.forEach((item, index) => {
    const base = `packages.${category.id}.${index + 1}`;
    texts[`${base}.name`] = item.name;
    texts[`${base}.price`] = item.price;
    texts[`${base}.summary`] = item.summary;
    item.includes.forEach((line, lineIndex) => {
      texts[`${base}.include.${lineIndex + 1}`] = line;
    });
  });
}

faqs.forEach((faq, index) => {
  texts[`faq.${index + 1}.q`] = faq.question;
  texts[`faq.${index + 1}.a`] = faq.answer;
});

testimonials.forEach((testimonial, index) => {
  texts[`testimonial.${index + 1}.quote`] = testimonial.quote;
  texts[`testimonial.${index + 1}.author`] = testimonial.author;
});

// The database only accepts keys of this shape (see the site_texts migrations).
// Failing here, at build time, beats an edit that silently fails to save.
for (const key of Object.keys(texts)) {
  if (!/^[A-Za-z0-9.-]{1,80}$/.test(key)) throw new Error(`Text key "${key}" can't be stored. Use letters, digits, dots and dashes, up to 80 characters.`);
}

export const textDefaults: Readonly<Record<string, string>> = texts;
export type TextKey = string;
export const textKeys = Object.keys(texts).sort();

export const isTextKey = (key: unknown): key is TextKey =>
  typeof key === "string" && Object.hasOwn(texts, key);

/** Text that may be emptied, which hides it on the site. */
export const optionalTextKeys = new Set(["site.instagramUrl", "site.facebookUrl", ...areaKeys]);

/** Text that is a web address. It must be empty or start with https:// (checked again before it is saved). */
export const urlTextKeys = new Set(["site.instagramUrl", "site.facebookUrl"]);

/** Names that read better in the editor than the key does. */
const labelOverrides: Record<string, string> = {
  "site.instagramHandle": "Instagram username (shown in the footer)",
  "site.instagramUrl": "Instagram profile link (web address)",
  "site.facebookUrl": "Facebook page link (web address)",
  ...Object.fromEntries(areaKeys.map((key, index) => [key, `Footer area ${index + 1} (leave empty to hide)`])),
  "about.eyebrow": "About · Small line above the heading",
  "about.hello": "About · Main heading",
  "about.heroStory": "About · Introduction beside the portrait",
  "about.heart.heading": "About · Heading below the flower",
  "about.why.story": "About · Paragraph below that heading",
  "about.cta.heading": "About · Closing invitation, heading",
  "about.cta.text": "About · Closing invitation, text",
  "about.cta.button": "About · Closing invitation, button (opens Contact)",
};

export const MAX_TEXT_LENGTH = 1500;

/** The route each group of text appears on. Anything not listed shows on every page. */
const groupRoutes: Record<string, string[]> = {
  home: ["/"],
  about: ["/about"],
  portfolio: ["/portfolio"],
  services: ["/services"],
  packages: ["/services"],
  faq: ["/services"],
  contact: ["/contact"],
  form: ["/contact"],
  testimonial: ["/", "/services"],
};

export function textAppearsOn(key: string, pathname: string) {
  const [group, second] = key.split(".");
  if (group === "pricing") {
    const category = pricingCategories.find((item) => item.slug === second);
    return pathname === pricingHref(category?.slug);
  }
  if (key.startsWith("nav.pricing.")) return true;
  const routes = groupRoutes[key.split(".")[0]];
  return !routes || routes.includes(pathname);
}

const groupNames: Record<string, string> = {
  home: "Home",
  about: "About",
  portfolio: "Portfolio",
  services: "Services",
  contact: "Contact",
  faq: "FAQ",
  packages: "Packages",
  testimonial: "Testimonials",
  category: "Session types",
  nav: "Menu",
  footer: "Footer",
  form: "Contact form",
  site: "Contact details",
  header: "Header",
  pricing: "Pricing & Packages",
};

const words = (part: string) =>
  part
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (letter) => letter.toUpperCase());

/** A readable name for the editor, such as "Home · Belief heading". */
export function textLabel(key: string) {
  if (labelOverrides[key]) return labelOverrides[key];
  const pricingLabel = pricingTextLabel(key);
  if (pricingLabel) return pricingLabel;
  const [group, ...rest] = key.split(".");
  if (group === "faq") return `FAQ · ${rest[1] === "q" ? "Question" : "Answer"} ${rest[0]}`;
  const tail = rest.map((part) => (/^\d+$/.test(part) ? part : words(part))).join(" ");
  return `${groupNames[group] ?? words(group)}${tail ? ` · ${tail}` : ""}`;
}
