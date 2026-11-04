import { about, categories, contactLink, faqs, navigation, packageDetails, site, testimonials } from "@/content/site";

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
for (const category of categories) texts[`category.${category.id}`] = category.label;

// Business details. Social links are hidden on the site while they are empty.
Object.assign(texts, {
  "site.email": site.email,
  "site.phone": site.phone,
  "site.location": site.location,
  "site.instagramHandle": site.instagramHandle,
  "site.serviceArea": site.serviceArea,
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
  "home.about.button": "More on me",
  "home.banner": "for the ordinary days you'll miss the most",
  "home.belief.heading": "I believe the quiet moments are the ones worth keeping",
  "home.belief.p1":
    "[Placeholder.] Write about what you notice that others might miss, and why those small, unposed moments matter to you and to the people you photograph.",
  "home.belief.p2":
    "Then describe how you make that happen: how you put people at ease, how you direct without posing, and how a session with you feels from start to finish.",
  "home.belief.button": "More details",
  "home.sessions.heading": "Choose your session",
  "home.invite.line1": "Are you ready",
  "home.invite.line2": "to be seen?",
  "home.invite.eyebrow": "I'd love to meet you",
  "home.invite.button": "Say hello",

  // About
  "about.title.1": "About",
  "about.title.2": "me",
  "about.heroStory": about.heroStory,
  "about.personalStory": about.personalStory,
  "about.why.heading": about.whyHeading,
  "about.why.story": about.whyStory,
  "about.why.button": "Session details",
  "about.cta.heading": "Got a moment you want to keep?",
  "about.cta.text": "See session types and pricing details:",
  "about.cta.button": "Let's go!",

  // Portfolio
  "portfolio.title": "The work",
  "portfolio.heading": "a few favourite frames",
  "portfolio.intro":
    "[Placeholder.] Introduce your portfolio here. Choose a session type, then select any photograph to see it larger.",
  "portfolio.filterAll": "All",
  "portfolio.cta.line1": "See something you love?",
  "portfolio.cta.line2": "let's make yours.",
  "portfolio.cta.button": "Say hello",

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
  "contact.title.1": "Contact me",
  "contact.title.2": "let's",
  "contact.title.3": "make something lovely",
  "contact.intro.p1":
    "[Placeholder.] Tell people what to include when they get in touch: the occasion, who will be in the photographs and anything else that would help you plan their session.",
  "contact.intro.p2": "Not sure what you want yet? That's completely fine. We can work it out together.",
  "contact.intro.button": "Inquire",
  "contact.form.heading": "Tell me everything",
  "contact.reach.before": "Prefer email? Write to",
  "contact.reach.middle": "or call",
  "contact.reach.after": "Based in",

  // Contact form
  "form.required": "Fields marked * are required.",
  "form.name.label": "Your full name",
  "form.name.placeholder": "Your name here",
  "form.email.label": "Email",
  "form.email.placeholder": "name@example.com",
  "form.phone.label": "Phone number",
  "form.phone.placeholder": "000-000-0000",
  "form.instagram.label": "Instagram handle (if you have one)",
  "form.instagram.placeholder": "@yourhandle",
  "form.sessionType.label": "Session type",
  "form.referral.label": "How did you hear about me?",
  "form.timeline.label": "Where are you in choosing a photographer?",
  "form.details.label": "What are you looking for in our session?",
  "form.details.placeholder": "The occasion, the people, the feeling you'd like to capture",
  "form.about.label": "Tell me about yourself",
  "form.about.placeholder": "Who you are, where you're from, what you love",
  "form.inspiration.label": "What drew you to my work?",
  "form.inspiration.placeholder": "This helps me know what to focus on during our session",
  "form.submit": "Send inquiry",
  "form.sending": "Sending...",
  "form.thanks.heading": "thank you!",
  "form.thanks.text": "Your inquiry is on its way. I'll reply as soon as I can.",

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
export const optionalTextKeys = new Set(["site.instagramUrl", "site.facebookUrl"]);

/** Text that is a web address. It must be empty or start with https:// (checked again before it is saved). */
export const urlTextKeys = new Set(["site.instagramUrl", "site.facebookUrl"]);

/** Names that read better in the editor than the key does. */
const labelOverrides: Record<string, string> = {
  "site.instagramHandle": "Instagram username (shown in the footer)",
  "site.instagramUrl": "Instagram profile link (web address)",
  "site.facebookUrl": "Facebook page link (web address)",
  "site.serviceArea": "Footer service areas",
  "about.heroStory": "About · Biography at the top",
  "about.personalStory": "About · Biography beside the photo",
  "about.why.heading": "About · Why I do this, heading",
  "about.why.story": "About · Why I do this, text",
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
};

const words = (part: string) =>
  part
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (letter) => letter.toUpperCase());

/** A readable name for the editor, such as "Home · Belief heading". */
export function textLabel(key: string) {
  if (labelOverrides[key]) return labelOverrides[key];
  const [group, ...rest] = key.split(".");
  if (group === "faq") return `FAQ · ${rest[1] === "q" ? "Question" : "Answer"} ${rest[0]}`;
  const tail = rest.map((part) => (/^\d+$/.test(part) ? part : words(part))).join(" ");
  return `${groupNames[group] ?? words(group)}${tail ? ` · ${tail}` : ""}`;
}
