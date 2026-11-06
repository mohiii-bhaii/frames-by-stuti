import type { FaqCategory, JournalCategory } from "@/content/journal";

export type ContentStatus = "draft" | "published" | "unpublished";

export type ActionOk<T> = { ok: true; data: T };
export type ActionFail = { ok: false; error: string; signedOut?: boolean };
export type ContentResult<T> = ActionOk<T> | ActionFail;

export type FaqFields = { question: string; answer: string; category: FaqCategory; showOnHome: boolean };

/** One FAQ question as the owner's screens see it: what is live, and the saved unpublished edit, if any. */
export type FaqRecord = {
  id: string;
  status: ContentStatus;
  sortOrder: number;
  live: FaqFields;
  draft: FaqFields | null;
  publishedAt: string | null;
};

export type PostFields = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: JournalCategory;
  /** The photo library file used as the featured photograph (null for none). */
  mediaId: string | null;
  featuredAlt: string;
  seoTitle: string;
  seoDescription: string;
  /** The publication date, as YYYY-MM-DD. */
  publishedOn: string;
};

export type PostRecord = {
  id: string;
  status: ContentStatus;
  isFeatured: boolean;
  live: PostFields;
  draft: PostFields | null;
  publishedAt: string | null;
  updatedAt: string;
  /** The address and size of the featured photograph (live or in the draft), for showing it. */
  media: { id: string; url: string; width: number; height: number } | null;
};
