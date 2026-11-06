/**
 * Search-engine wording for every public page: the title and description Google may show, and that
 * social apps show when a link is shared. Each is an editable text in the visual editor
 * ("Google search" group), so the owner can change them without a developer. Nothing here is a
 * claim about awards, reviews, prices or hours.
 *
 * The page title is followed by " | Frames by Stuti" automatically (see app/layout.tsx).
 */
export type SeoPage = (typeof seoPages)[number]["page"];

export const seoPages = [
  {
    page: "home",
    path: "/",
    label: "Home",
    title: "Ottawa Family, Newborn & Maternity Photographer",
    description:
      "Frames by Stuti is an Ottawa photographer for newborn, maternity, milestone, family and event sessions, serving Ottawa, Gatineau, Kanata, Orléans and nearby areas.",
  },
  {
    page: "galleries",
    path: "/galleries",
    label: "Galleries",
    title: "Ottawa Newborn, Maternity & Family Galleries",
    description:
      "Browse galleries of newborn, maternity, milestone, lifestyle and family photography by Frames by Stuti, an Ottawa photographer.",
  },
  {
    page: "pricing",
    path: "/pricing",
    label: "Pricing & Packages",
    title: "Photography Pricing & Packages in Ottawa",
    description:
      "See Frames by Stuti's photography packages for newborn, maternity, milestone, lifestyle and family, event and bundle sessions in Ottawa. Details are shared on inquiry.",
  },
  {
    page: "newborn",
    path: "/pricing/newborn",
    label: "Newborn",
    title: "Newborn Photography Packages in Ottawa",
    description:
      "Gentle newborn photography in Ottawa. See the newborn session packages from Frames by Stuti and send an inquiry to book.",
  },
  {
    page: "maternity",
    path: "/pricing/maternity",
    label: "Maternity",
    title: "Maternity Photography Packages in Ottawa",
    description:
      "Maternity portraits in Ottawa that celebrate this chapter of your story. See Frames by Stuti's maternity packages and send an inquiry.",
  },
  {
    page: "milestones",
    path: "/pricing/milestones",
    label: "Milestones",
    title: "Milestone & Cake Smash Photography in Ottawa",
    description:
      "Baby milestone, birthday and cake smash photography in Ottawa from Frames by Stuti. See the milestone packages and send an inquiry.",
  },
  {
    page: "lifestyle",
    path: "/pricing/lifestyle",
    label: "Lifestyle / Family",
    title: "Lifestyle & Family Photography in Ottawa",
    description:
      "Relaxed lifestyle and family portraits in Ottawa that feel like you. See Frames by Stuti's family session packages and send an inquiry.",
  },
  {
    page: "events",
    path: "/pricing/events",
    label: "Events",
    title: "Event Photography in Ottawa",
    description:
      "Photography for the occasions you want remembered, in Ottawa and nearby. Every event is different, so quotations are shared on inquiry.",
  },
  {
    page: "bundle",
    path: "/pricing/bundle",
    label: "Bundle + Save",
    title: "Photography Session Bundles in Ottawa",
    description:
      "Combine sessions into one booking with a Frames by Stuti photography bundle in Ottawa. Send an inquiry for bundle details.",
  },
  {
    page: "contact",
    path: "/contact",
    label: "Contact",
    title: "Book a Photography Session in Ottawa",
    description:
      "Contact Frames by Stuti to book a newborn, maternity, milestone, family or event photography session in Ottawa, Gatineau and nearby areas.",
  },
  {
    page: "about",
    path: "/about",
    label: "About",
    title: "About Stuti, Ottawa Family Photographer",
    description:
      "Meet Stuti, the Ottawa photographer behind Frames by Stuti: a mom, a perfectionist and a friend behind the camera for your family's story.",
  },
] as const;

export const seoKey = (page: SeoPage, field: "title" | "description") => `seo.${page}.${field}`;

/** The page a search-engine text belongs to, so the editor lists it on that page. */
export function seoPagePath(page: string) {
  return seoPages.find((item) => item.page === page)?.path;
}
