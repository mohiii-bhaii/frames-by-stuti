/** Categories for The Journal and for the FAQ. The ids are stored in the database; only the labels are shown. */
export const journalCategories = [
  { id: "newborn", label: "Newborn" },
  { id: "maternity", label: "Maternity" },
  { id: "family", label: "Family" },
  { id: "milestones", label: "Milestones" },
  { id: "events", label: "Events" },
  { id: "photography-tips", label: "Photography Tips" },
] as const;

export type JournalCategory = (typeof journalCategories)[number]["id"];

export const faqCategories = [
  { id: "booking", label: "Booking" },
  { id: "newborn", label: "Newborn" },
  { id: "maternity", label: "Maternity" },
  { id: "family", label: "Family" },
  { id: "general", label: "General" },
] as const;

export type FaqCategory = (typeof faqCategories)[number]["id"];

export const journalCategoryLabel = (id: string) => journalCategories.find((item) => item.id === id)?.label ?? "Journal";
export const faqCategoryLabel = (id: string) => faqCategories.find((item) => item.id === id)?.label ?? "General";

/** How many articles the Journal lists before "Load more". */
export const JOURNAL_PAGE_SIZE = 9;
