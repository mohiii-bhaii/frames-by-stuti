/**
 * Editable business details and copy for Frames by Stuti.
 *
 * Anything in [square brackets] or priced $000 is a placeholder to replace
 * before launch. Social links are hidden from navigation until a URL is added.
 */
export const site = {
  name: "Frames by Stuti",
  tagline: "Photography for the moments you'll want to keep",
  description:
    "Frames by Stuti is a photography studio creating warm, honest portraits of people and the moments that matter to them.",
  location: "[City, State]",
  /** Shown in the footer, separated by " | ". Any can be emptied in the editor to hide it. */
  serviceAreas: ["[Area one]", "[Area two]", "[Area three]", "[Area four]", "[Area five]"],
  email: "hello@example.com",
  phone: "[000-000-0000]",
  instagramHandle: "@[instagram-handle]",
  /** Add full URLs here, for example "https://www.instagram.com/your-handle/". */
  social: {
    instagram: "",
    facebook: "",
  },
  year: 2026,
};

export const navigation = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/pricing", label: "Pricing & Packages" },
] as const;

export const contactLink = { href: "/contact", label: "Contact" } as const;

export const categories = [
  { id: "portraits", label: "Portraits", image: "session-portraits" },
  { id: "couples", label: "Couples", image: "session-couples" },
  { id: "family", label: "Family", image: "session-family" },
  { id: "milestones", label: "Milestones", image: "session-milestones" },
] as const;

export type CategoryId = (typeof categories)[number]["id"];

/**
 * The cards in the home page's "Choose your session" section. These are the
 * categories above plus Events, which has a card (and an editable title and
 * photo) but no Services packages or Portfolio filter yet.
 */
export const sessionCards = [
  ...categories,
  { id: "events", label: "Events", image: "session-events" },
] as const;

export const testimonials = [
  {
    quote:
      "[Client testimonial placeholder. Replace this with a real review describing what the session felt like and how the photographs turned out.]",
    author: "[Client name]",
  },
  {
    quote:
      "[Second testimonial placeholder. A short, specific quote from a real client works best here.]",
    author: "[Client name]",
  },
  {
    quote:
      "[Third testimonial placeholder. Ask a past client what they would tell a friend who was thinking of booking.]",
    author: "[Client name]",
  },
];

export const about = {
  greeting: "Hello there!",
  intro: "I'm Stuti",
  homeIntro: [
    "[Biography placeholder.] This is where I introduce myself: who I am, where I'm based and how I found my way to photography.",
    "Tell visitors what a session with you is really like and what you hope they feel when they see their photographs. Keep it warm, personal and in your own words.",
  ],
  heroStory:
    "[Biography placeholder.] Share how your photography journey began, the moment you knew it was what you wanted to do, and what still excites you about it. Two or three honest sentences are plenty.",
  personalStory:
    "[Biography placeholder.] Add the life behind the lens here: the people, places and everyday things that shape the way you see. A little personal detail helps future clients feel they already know you.",
  whyHeading: "helping you hold on to the moments that pass too quickly",
  whyStory:
    "[Biography placeholder.] Explain why photography matters to you and what clients take away from working with you. This is your promise to them, so write it the way you would say it in person.",
};

export type ServicePackage = {
  name: string;
  price: string;
  summary: string;
  includes: string[];
};

export const packageDetails: Record<
  CategoryId,
  { intro: string; packages: ServicePackage[]; note: string }
> = {
  portraits: {
    intro:
      "[Placeholder.] Describe your portrait sessions: who they suit, how they feel and what clients can expect on the day.",
    packages: [
      {
        name: "Petite",
        price: "$000",
        summary: "[A short session for one person.]",
        includes: ["[00] minutes", "[00] edited images", "[One] location"],
      },
      {
        name: "Signature",
        price: "$000",
        summary: "[Your most popular portrait session.]",
        includes: ["[00] minutes", "[00] edited images", "[Two] outfit changes"],
      },
    ],
    note: "[Add travel fees, wardrobe guidance or anything clients should keep in mind.]",
  },
  couples: {
    intro:
      "[Placeholder.] Describe your couples sessions: anniversaries, engagements or simply time together.",
    packages: [
      {
        name: "Petite",
        price: "$000",
        summary: "[A short, relaxed session.]",
        includes: ["[00] minutes", "[00] edited images", "[One] location"],
      },
      {
        name: "Signature",
        price: "$000",
        summary: "[A longer session with room to explore.]",
        includes: ["[00] minutes", "[00] edited images", "[Two] locations"],
      },
    ],
    note: "[Add location suggestions or best times of year.]",
  },
  family: {
    intro:
      "[Placeholder.] Describe your family sessions, including who can be included and how you keep everyone comfortable.",
    packages: [
      {
        name: "Half session",
        price: "$000",
        summary: "[Ideal for smaller families.]",
        includes: ["[00] minutes", "[00] edited images", "Up to [0] people"],
      },
      {
        name: "Full session",
        price: "$000",
        summary: "[Plenty of time for every combination.]",
        includes: ["[00] minutes", "[00] edited images", "Up to [0] people"],
      },
    ],
    note: "[Add details about additional family members or extended family.]",
  },
  milestones: {
    intro:
      "[Placeholder.] Describe the milestones you photograph, such as birthdays, graduations and new chapters.",
    packages: [
      {
        name: "Petite",
        price: "$000",
        summary: "[A quick celebration of one milestone.]",
        includes: ["[00] minutes", "[00] edited images", "[One] setup"],
      },
      {
        name: "Signature",
        price: "$000",
        summary: "[A complete session for a big occasion.]",
        includes: ["[00] minutes", "[00] edited images", "[Two] setups"],
      },
      {
        name: "Collection",
        price: "$000",
        summary: "[Several sessions booked together.]",
        includes: ["[0] sessions", "[00] edited images per session", "[Add a bonus]"],
      },
    ],
    note: "[Add available add-ons here.]",
  },
};

export const faqs = [
  {
    question: "How do I book a session?",
    answer:
      "[Placeholder.] Explain your booking steps, for example: send an inquiry, choose a date, sign the agreement and pay the retainer.",
  },
  {
    question: "What is your payment schedule?",
    answer: "[Placeholder.] Add your retainer amount, when the balance is due and the payment methods you accept.",
  },
  {
    question: "How long until I receive my photographs?",
    answer: "[Placeholder.] Add your typical turnaround time and how galleries are delivered.",
  },
  {
    question: "Where do sessions take place?",
    answer: "[Placeholder.] List your usual locations, your studio if you have one and any travel fees.",
  },
  {
    question: "What should we wear?",
    answer: "[Placeholder.] Share your wardrobe advice or link to a style guide.",
  },
  {
    question: "Do you retouch the images?",
    answer: "[Placeholder.] Describe your editing style and what retouching is included.",
  },
  {
    question: "What happens if the weather is bad?",
    answer: "[Placeholder.] Explain your rescheduling policy.",
  },
  {
    question: "Can I order prints?",
    answer: "[Placeholder.] Explain how prints and albums can be ordered.",
  },
];
