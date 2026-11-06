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

/**
 * Every page, for the editor's page picker and the dashboard. `inMenu: false`
 * keeps a page out of the site menu and footer menu while it stays editable.
 */
export const navigation = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About", inMenu: false },
  { href: "/galleries", label: "Galleries" },
  { href: "/pricing", label: "Pricing & Packages" },
] as readonly { href: string; label: string; inMenu?: boolean }[];

/** The pages shown in the site menu and the footer menu. */
export const menuNavigation = navigation.filter((item) => item.inMenu !== false);

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
 * photo) but no Services packages or Galleries filter yet.
 */
export const sessionCards = [
  ...categories,
  { id: "events", label: "Events", image: "session-events" },
] as const;

/**
 * Room for three client testimonials. They start empty on purpose: the
 * Testimonials section only appears on the website once a testimonial has both
 * a review and a client name (see lib/testimonials.ts). Add them in the editor.
 */
export const TESTIMONIAL_SLOTS = 3;

export const about = {
  greeting: "Hello there!",
  intro: "I'm Stuti",
  homeIntro: [
    "The girl behind the camera, the heart behind Frames by Stuti, and someone who definitely knows how to make an entrance into a room!",
    "I’m a little stubborn, a bit of a perfectionist, and the girl who says ‘Just one more picture!’ about ten times. 😂",
    "I love capturing beautiful moments, but even more than that, I love the people and stories behind them. Come as you are, and I promise we’ll have a lovely time together!",
  ],
  /** The About page story, in four parts. Each part has its own heading and text, both editable. */
  story: [
    {
      heading: "A Little More About Me",
      text: `If there’s one thing you should know about me, it’s that I bring my whole heart and a whole lot of energy into everything I do. I’m a little stubborn, a bit of a perfectionist, and when it comes to photography, I simply won’t stop until I get that perfect shot. Yes, I’m that girl who says, “Just one more picture!” about ten times. 😂

When I’m not behind the camera, you’ll probably find me travelling, exploring new places, or spending time with my two favourite people — my husband, Rajat, and our little bundle of energy, Kashvi!

And oh, Kashvi! My 10-month-old daughter who keeps me on my toes every single day. She’s the little girl who changed everything for me, in the most beautiful way possible.`,
    },
    {
      heading: "How It All Began",
      text: `Here’s a little backstory…

I’ve always been in love with photography. Even before Frames by Stuti existed, I was the person clicking pictures of places, people, and pretty much anything that had a story to tell.

But when Kashvi came into my life, something shifted.

Watching her grow, change, and discover the world made me realise just how quickly the little moments become memories. And somewhere between motherhood and all those precious firsts, she sparked something in me.

She gave me the courage to turn something I’d always loved into something I could do with my whole heart.

And that’s how Frames by Stuti became more than just a passion. It became my profession, my creative little world, and a way to preserve the moments that matter most.`,
    },
    {
      heading: "More Than Just Photographs",
      text: `Now, here’s the thing about me…

I don’t want you to feel like you’re walking into a photography session with a stranger.

I want you to feel like you’re meeting a friend!

Whether you’re a new parent running on very little sleep, a mama-to-be feeling a little camera shy, or a family wondering how on earth everyone is going to look at the camera at the same time — trust me, we’ll figure it out together! 😄

For me, the connection starts long before I pick up my camera. From our very first conversation, I want you to feel comfortable, heard, and excited about your session.

No pressure to pose perfectly. No need to pretend to be someone you’re not.

Just come as you are, and let me take care of the rest.

Because the best photographs? They’re the ones where you’re simply being you.

And one tiny warning…

Remember how I mentioned I’m a perfectionist?

Well, I meant it! 😂

If I know we can make a photograph even more beautiful, you can bet I’m going to try. I’ll fix that little detail, adjust the angle, and probably ask for just one more shot.

Not because everything needs to be perfect, but because I genuinely care about giving you photographs you’ll fall in love with.`,
    },
    {
      heading: "Until We Meet!",
      text: `And while I absolutely love capturing beautiful images, what makes this journey even more special is the people I meet along the way.

The families who come back, the babies I get to watch grow, and the connections that turn into lasting relationships — that’s what makes my heart happiest.

I don’t want to be just your photographer for one day. I’d love to be the person you come back to as your story unfolds, one beautiful chapter at a time.

So, whenever you’re ready to make some memories, come say hello!

I can’t wait to meet you, hear your story, and create something beautiful together.

Xoxo,
Stuti 🤎`,
    },
  ],
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
