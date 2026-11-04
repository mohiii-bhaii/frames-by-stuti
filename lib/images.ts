/**
 * Every photograph on the site is listed here.
 *
 * Photos are replaced from the visual editor at /admin, which stores them in
 * Supabase. The files in /public/images are the placeholders shown for any
 * slot that has nothing published yet.
 *
 * Page layouts crop with `object-fit: cover`, so exact dimensions are not
 * required.
 */
export type SiteImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type Scene = "field" | "studio" | "soft" | "window";

type SlotSpec = {
  width: number;
  height: number;
  alt: string;
  /** Only used by scripts/generate-placeholders.mjs. */
  scene: Scene;
};

const LANDSCAPE = { width: 2000, height: 1250 };
const PORTRAIT = { width: 1200, height: 1500 };
const SQUARE = { width: 1000, height: 1000 };

export const imageSlots = {
  // Home
  "hero-1": { ...LANDSCAPE, scene: "soft", alt: "Placeholder: hero photograph one" },
  "hero-2": { ...LANDSCAPE, scene: "field", alt: "Placeholder: hero photograph two" },
  "hero-3": { ...LANDSCAPE, scene: "window", alt: "Placeholder: hero photograph three" },
  "home-portrait": { ...PORTRAIT, scene: "studio", alt: "Placeholder: portrait of Stuti" },
  "home-detail": { ...PORTRAIT, scene: "window", alt: "Placeholder: Stuti at work" },
  "home-banner-1": { ...LANDSCAPE, scene: "field", alt: "Placeholder: wide outdoor photograph" },
  "home-oval": { ...PORTRAIT, scene: "field", alt: "Placeholder: couple portrait" },
  "home-banner-2": { ...LANDSCAPE, scene: "window", alt: "Placeholder: wide indoor photograph" },
  "session-backdrop": { ...LANDSCAPE, scene: "soft", alt: "" },
  "session-portraits": { ...SQUARE, scene: "studio", alt: "Placeholder: portrait session" },
  "session-couples": { ...SQUARE, scene: "field", alt: "Placeholder: couples session" },
  "session-family": { ...SQUARE, scene: "window", alt: "Placeholder: family session" },
  "session-milestones": { ...SQUARE, scene: "soft", alt: "Placeholder: milestone session" },
  "home-testimonial": { ...SQUARE, scene: "field", alt: "Placeholder: client photograph" },
  "home-invite": { ...PORTRAIT, scene: "studio", alt: "Placeholder: Stuti holding a camera" },

  // Footer
  "footer-1": { ...SQUARE, scene: "soft", alt: "Placeholder: recent work one" },
  "footer-2": { ...SQUARE, scene: "field", alt: "Placeholder: recent work two" },
  "footer-3": { ...SQUARE, scene: "window", alt: "Placeholder: recent work three" },
  "footer-4": { ...SQUARE, scene: "studio", alt: "Placeholder: recent work four" },
  "footer-5": { ...SQUARE, scene: "field", alt: "Placeholder: recent work five" },
  "footer-avatar": { ...SQUARE, scene: "studio", alt: "Placeholder: headshot of Stuti" },

  // About
  "about-hero": { ...LANDSCAPE, scene: "window", alt: "Placeholder: Stuti at home" },
  "about-family": { ...PORTRAIT, scene: "field", alt: "Placeholder: Stuti outdoors" },
  "about-work": { ...PORTRAIT, scene: "field", alt: "Placeholder: Stuti working with clients" },
  "about-banner": { ...LANDSCAPE, scene: "soft", alt: "" },
  "about-cta": { ...SQUARE, scene: "field", alt: "Placeholder: outdoor session" },

  // Services
  "services-hero": { ...LANDSCAPE, scene: "field", alt: "Placeholder: outdoor session in tall grass" },
  "services-simple": { ...PORTRAIT, scene: "field", alt: "Placeholder: relaxed outdoor session" },
  "services-invest-1": { ...PORTRAIT, scene: "window", alt: "Placeholder: quiet indoor moment" },
  "services-invest-2": { ...PORTRAIT, scene: "field", alt: "Placeholder: golden hour portrait" },
  "services-invest-3": { ...SQUARE, scene: "field", alt: "Placeholder: wide field photograph" },
  "services-invest-4": { ...SQUARE, scene: "soft", alt: "Placeholder: close detail photograph" },
  "services-banner": { ...LANDSCAPE, scene: "field", alt: "Placeholder: wide golden hour photograph" },
  "services-testimonial": { ...SQUARE, scene: "soft", alt: "Placeholder: close detail photograph" },

  // Contact
  "contact-hero": { ...LANDSCAPE, scene: "window", alt: "Placeholder: portrait of Stuti" },
  "contact-banner": { ...LANDSCAPE, scene: "field", alt: "Placeholder: wide outdoor photograph" },

  // Portfolio
  "portfolio-hero": { ...LANDSCAPE, scene: "soft", alt: "Placeholder: portfolio cover photograph" },
  "gallery-01": { ...PORTRAIT, scene: "studio", alt: "Placeholder: portrait session photograph" },
  "gallery-02": { ...LANDSCAPE, scene: "field", alt: "Placeholder: couples session photograph" },
  "gallery-03": { ...SQUARE, scene: "window", alt: "Placeholder: family session photograph" },
  "gallery-04": { ...PORTRAIT, scene: "soft", alt: "Placeholder: milestone session photograph" },
  "gallery-05": { ...LANDSCAPE, scene: "window", alt: "Placeholder: portrait session photograph" },
  "gallery-06": { ...PORTRAIT, scene: "field", alt: "Placeholder: couples session photograph" },
  "gallery-07": { ...PORTRAIT, scene: "field", alt: "Placeholder: family session photograph" },
  "gallery-08": { ...SQUARE, scene: "studio", alt: "Placeholder: milestone session photograph" },
  "gallery-09": { ...SQUARE, scene: "soft", alt: "Placeholder: portrait session photograph" },
  "gallery-10": { ...PORTRAIT, scene: "window", alt: "Placeholder: couples session photograph" },
  "gallery-11": { ...LANDSCAPE, scene: "field", alt: "Placeholder: family session photograph" },
  "gallery-12": { ...PORTRAIT, scene: "studio", alt: "Placeholder: milestone session photograph" },
  "gallery-13": { ...PORTRAIT, scene: "field", alt: "Placeholder: portrait session photograph" },
  "gallery-14": { ...SQUARE, scene: "window", alt: "Placeholder: couples session photograph" },
  "gallery-15": { ...PORTRAIT, scene: "soft", alt: "Placeholder: family session photograph" },
  "gallery-16": { ...LANDSCAPE, scene: "window", alt: "Placeholder: milestone session photograph" },
} satisfies Record<string, SlotSpec>;

export type ImageSlot = keyof typeof imageSlots;

/**
 * The brand logo can also be replaced from the editor. Until a logo image is
 * published, the original typeset logo is shown, so these have no placeholder file.
 */
export const logoSlots = {
  "logo-wordmark": { width: 600, height: 200, alt: "Frames by Stuti" },
  "logo-badge": { width: 600, height: 420, alt: "Frames by Stuti" },
} satisfies Record<string, Omit<SlotSpec, "scene">>;

export type LogoSlot = keyof typeof logoSlots;

/** Every editable image on the site. These ids are permanent: they key the database rows. */
export type SlotId = ImageSlot | LogoSlot;

export const slotIds = [...Object.keys(imageSlots), ...Object.keys(logoSlots)] as SlotId[];

export function isSlotId(value: unknown): value is SlotId {
  return typeof value === "string" && (value in imageSlots || value in logoSlots);
}

export function isLogoSlot(slot: SlotId): slot is LogoSlot {
  return slot in logoSlots;
}

export function getImage(slot: ImageSlot): SiteImage {
  const { width, height, alt } = imageSlots[slot];
  return { src: `/images/${slot}.jpg`, width, height, alt };
}

/** What a slot shows: the placeholder, or a photo chosen in the editor. */
export type SlotImage = {
  /** null only for a logo slot that shows the typeset logo. */
  src: string | null;
  width: number;
  height: number;
  alt: string;
  /** Focal point in percent. null keeps the layout's own default crop position. */
  focal: { x: number; y: number } | null;
  /** 1 shows the whole crop; larger values zoom in around the focal point. */
  zoom: number;
};

export function getFallbackImage(slot: SlotId): SlotImage {
  if (isLogoSlot(slot)) {
    const { width, height, alt } = logoSlots[slot];
    return { src: null, width, height, alt, focal: null, zoom: 1 };
  }
  return { ...getImage(slot), focal: null, zoom: 1 };
}

/** CSS for an image's crop inside its frame. */
export function cropStyle(image: SlotImage, defaultPosition?: string) {
  const position = image.focal ? `${image.focal.x}% ${image.focal.y}%` : defaultPosition;
  if (image.zoom <= 1) return position ? { objectPosition: position } : undefined;
  const origin = position ?? "50% 50%";
  return { objectPosition: origin, transform: `scale(${image.zoom})`, transformOrigin: origin };
}

/** Parses a CSS object-position such as "50% 20%" into a focal point. */
export function parsePosition(position?: string) {
  const [x, y] = (position ?? "").split(/\s+/).map((part) => Number.parseFloat(part));
  return { x: Number.isFinite(x) ? x : 50, y: Number.isFinite(y) ? y : 50 };
}

/** Friendly names for the editor, for example "home-banner-1" becomes "Home banner 1". */
export function slotLabel(slot: SlotId) {
  const text = slot.replace(/-/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}
