import type { ImageSlot } from "@/lib/images";

/**
 * The Portfolio: five categories, each a row of photographs in the order
 * listed. Every entry is a permanent photo spot in the visual editor. A spot
 * with no published photograph is hidden from visitors, and a category with no
 * photographs at all is hidden completely, so rows grow as photos are added.
 *
 * The `gallery-NN` spots hold the photographs published before this redesign,
 * so none of them are lost. The `pf-...` spots are new and start empty.
 */
const pf = (category: string, from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, index) => `pf-${category}-${from + index}` as ImageSlot);

export type PortfolioCategory = {
  id: string;
  /** Original heading; the visitor sees the editable text portfolio.<id>.title. */
  title: string;
  /** A faint italic word set behind the heading. */
  word: string;
  slots: ImageSlot[];
};

export const portfolioCategories: PortfolioCategory[] = [
  { id: "newborns", title: "Newborn", word: "tiny", slots: pf("newborns", 1, 12) },
  { id: "maternity", title: "Maternity", word: "waiting", slots: pf("maternity", 1, 12) },
  {
    id: "lifestyle",
    title: "Lifestyle / Family",
    word: "together",
    slots: [
      "gallery-03", "gallery-07", "gallery-11", "gallery-15",
      "gallery-01", "gallery-05", "gallery-09", "gallery-13",
      "gallery-02", "gallery-06", "gallery-10", "gallery-14",
      ...pf("lifestyle", 13, 16),
    ],
  },
  {
    id: "milestones",
    title: "Milestones",
    word: "growing",
    slots: ["gallery-04", "gallery-08", "gallery-12", "gallery-16", ...pf("milestones", 5, 12)],
  },
  { id: "events", title: "Events", word: "celebrate", slots: pf("events", 1, 12) },
];

export const portfolioSlots: ImageSlot[] = portfolioCategories.flatMap((category) => category.slots);
