"use server";

import { updateTag } from "next/cache";
import { faqCategories, journalCategories } from "@/content/journal";
import { NotAuthorisedError, requireAdminAction } from "@/lib/auth";
import type { ContentResult, FaqFields, FaqRecord, PostFields, PostRecord } from "@/lib/content-types";
import { FAQ_TAG, JOURNAL_TAG } from "@/lib/journal";
import { slugify } from "@/lib/slug";
import { FAQ_COLUMNS, POST_COLUMNS, toFaqRecord, toPostRecord, type FaqRow, type MediaJoin, type PostRow } from "@/lib/content-records";

type Supabase = Awaited<ReturnType<typeof requireAdminAction>>["supabase"];

/** Runs an action for a verified admin and turns failures into a message the screen can show. */
async function run<T>(task: (supabase: Supabase) => Promise<T>): Promise<ContentResult<T>> {
  try {
    const { supabase } = await requireAdminAction();
    return { ok: true, data: await task(supabase) };
  } catch (error) {
    if (error instanceof NotAuthorisedError) return { ok: false, error: error.message, signedOut: true };
    console.error("Content action failed:", error);
    return { ok: false, error: error instanceof Error ? error.message : "Something went wrong. Please try again." };
  }
}

function fail(message: string, cause?: { message: string } | null): never {
  if (cause) console.error(message, cause.message);
  throw new Error(message);
}

const UUID = /^[0-9a-f-]{36}$/i;
const clean = (value: unknown, max: number) => String(value ?? "").replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim().slice(0, max);

// ------------------------------------------------------------------ FAQ

function cleanFaq(input: FaqFields) {
  const question = clean(input?.question, 300);
  const answer = clean(input?.answer, 4000);
  const category = faqCategories.some((item) => item.id === input?.category) ? input.category : "general";
  return { question, answer, category, show_on_home: input?.showOnHome === true };
}

async function loadFaq(supabase: Supabase, id: string) {
  if (!UUID.test(id)) fail("Unknown question.");
  const { data, error } = await supabase.from("faq_items").select(FAQ_COLUMNS).eq("id", id).maybeSingle();
  if (error || !data) fail("Could not find that question.", error);
  return toFaqRecord(data as FaqRow);
}

export async function createFaq(): Promise<ContentResult<FaqRecord>> {
  return run(async (supabase) => {
    const { data: last } = await supabase.from("faq_items").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
    const { data, error } = await supabase
      .from("faq_items")
      .insert({ sort_order: (last?.sort_order ?? 0) + 10 })
      .select(FAQ_COLUMNS)
      .single();
    if (error) fail("Could not add a question.", error);
    return toFaqRecord(data as FaqRow);
  });
}

/** Saves an edit as a draft. What visitors see does not change until Publish. */
export async function saveFaqDraft(id: string, fields: FaqFields): Promise<ContentResult<FaqRecord>> {
  return run(async (supabase) => {
    if (!UUID.test(id)) fail("Unknown question.");
    const { error } = await supabase.from("faq_items").update({ draft: cleanFaq(fields), updated_at: new Date().toISOString() }).eq("id", id);
    if (error) fail("Could not save the draft.", error);
    return loadFaq(supabase, id);
  });
}

/** Saves the edit and makes it live. */
export async function publishFaq(id: string, fields: FaqFields): Promise<ContentResult<FaqRecord>> {
  return run(async (supabase) => {
    if (!UUID.test(id)) fail("Unknown question.");
    const values = cleanFaq(fields);
    if (!values.question || !values.answer) fail("Add a question and an answer before publishing.");
    const saved = await supabase.from("faq_items").update({ draft: values, updated_at: new Date().toISOString() }).eq("id", id);
    if (saved.error) fail("Could not save the question.", saved.error);
    const { data, error } = await supabase.rpc("publish_faq", { p_id: id });
    if (error || data !== true) fail("Publishing failed. Nothing was changed on the live site.", error);
    updateTag(FAQ_TAG);
    return loadFaq(supabase, id);
  });
}

/** Takes a question off the website. Its wording is kept and it can be published again. */
export async function unpublishFaq(id: string): Promise<ContentResult<FaqRecord>> {
  return run(async (supabase) => {
    if (!UUID.test(id)) fail("Unknown question.");
    const { error } = await supabase.from("faq_items").update({ status: "unpublished", updated_at: new Date().toISOString() }).eq("id", id);
    if (error) fail("Could not unpublish the question.", error);
    updateTag(FAQ_TAG);
    return loadFaq(supabase, id);
  });
}

export async function discardFaqDraft(id: string): Promise<ContentResult<FaqRecord>> {
  return run(async (supabase) => {
    if (!UUID.test(id)) fail("Unknown question.");
    const { error } = await supabase.from("faq_items").update({ draft: null, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) fail("Could not discard the draft.", error);
    return loadFaq(supabase, id);
  });
}

export async function deleteFaq(id: string): Promise<ContentResult<null>> {
  return run(async (supabase) => {
    if (!UUID.test(id)) fail("Unknown question.");
    const { error } = await supabase.from("faq_items").delete().eq("id", id);
    if (error) fail("Could not delete the question.", error);
    updateTag(FAQ_TAG);
    return null;
  });
}

/** Moves a question up or down the list. The order applies straight away. */
export async function moveFaq(id: string, direction: "up" | "down"): Promise<ContentResult<FaqRecord[]>> {
  return run(async (supabase) => {
    if (!UUID.test(id)) fail("Unknown question.");
    const { data, error } = await supabase.from("faq_items").select("id, sort_order, created_at").order("sort_order").order("created_at");
    if (error || !data) fail("Could not load the questions.", error);
    const order = data.map((row) => row.id);
    const at = order.indexOf(id);
    const to = direction === "up" ? at - 1 : at + 1;
    if (at < 0 || to < 0 || to >= order.length) fail("It can't move any further.");
    [order[at], order[to]] = [order[to], order[at]];
    // Renumbered in steps of 10 so new questions can always be added at the end.
    for (const [index, itemId] of order.entries()) {
      const result = await supabase.from("faq_items").update({ sort_order: (index + 1) * 10 }).eq("id", itemId);
      if (result.error) fail("Could not save the new order.", result.error);
    }
    updateTag(FAQ_TAG);
    const list = await supabase.from("faq_items").select(FAQ_COLUMNS).order("sort_order").order("created_at");
    if (list.error) fail("Could not reload the questions.", list.error);
    return (list.data as FaqRow[]).map(toFaqRecord);
  });
}

/** Publishes every question that has something unpublished (never-published, taken down, or edited). */
export async function publishAllFaqs(): Promise<ContentResult<FaqRecord[]>> {
  return run(async (supabase) => {
    const { data, error } = await supabase.from("faq_items").select(FAQ_COLUMNS).order("sort_order").order("created_at");
    if (error || !data) fail("Could not load the questions.", error);
    for (const row of data as FaqRow[]) {
      if (row.status === "published" && !row.draft) continue;
      const result = await supabase.rpc("publish_faq", { p_id: row.id });
      if (result.error) fail("Publishing failed part-way. Please try again.", result.error);
    }
    updateTag(FAQ_TAG);
    const list = await supabase.from("faq_items").select(FAQ_COLUMNS).order("sort_order").order("created_at");
    if (list.error) fail("Could not reload the questions.", list.error);
    return (list.data as FaqRow[]).map(toFaqRecord);
  });
}

// ------------------------------------------------------------------ Journal

async function loadPost(supabase: Supabase, id: string) {
  if (!UUID.test(id)) fail("Unknown article.");
  const { data, error } = await supabase.from("journal_posts").select(POST_COLUMNS).eq("id", id).maybeSingle();
  if (error || !data) fail("Could not find that article.", error);
  const row = data as unknown as PostRow;
  let draftMedia: MediaJoin = null;
  const draftMediaId = row.draft && "featured_media_id" in row.draft ? row.draft.featured_media_id : undefined;
  if (draftMediaId) {
    const found = await supabase.from("photo_files").select("id, storage_path, width, height").eq("id", draftMediaId).maybeSingle();
    draftMedia = (found.data as MediaJoin) ?? null;
  }
  return toPostRecord(row, draftMedia);
}

function cleanPost(input: PostFields) {
  const title = clean(input?.title, 200);
  const slug = slugify(clean(input?.slug, 120) || title);
  const category = journalCategories.some((item) => item.id === input?.category) ? input.category : "photography-tips";
  const publishedOn = /^\d{4}-\d{2}-\d{2}$/.test(String(input?.publishedOn ?? "")) ? input.publishedOn : "";
  const mediaId = input?.mediaId && UUID.test(input.mediaId) ? input.mediaId : null;
  return {
    slug,
    title,
    excerpt: clean(input?.excerpt, 400),
    body: clean(input?.body, 100000),
    category,
    featured_media_id: mediaId,
    featured_alt: clean(input?.featuredAlt, 300),
    seo_title: clean(input?.seoTitle, 120),
    seo_description: clean(input?.seoDescription, 300),
    // Noon UTC, so the date reads the same in Ottawa.
    published_at: publishedOn ? `${publishedOn}T12:00:00Z` : null,
  };
}

async function checkSlug(supabase: Supabase, id: string, slug: string) {
  if (!slug) fail("Add a title (or a web address) for the article first.");
  const { data } = await supabase.from("journal_posts").select("id").eq("slug", slug).neq("id", id).limit(1);
  if (data && data.length > 0) fail("Another article already uses that web address. Please choose a different one.");
}

export async function createPost(): Promise<ContentResult<{ id: string }>> {
  return run(async (supabase) => {
    const { data, error } = await supabase.from("journal_posts").insert({}).select("id").single();
    if (error) fail("Could not start a new article.", error);
    return { id: data.id as string };
  });
}

export async function savePostDraft(id: string, fields: PostFields): Promise<ContentResult<PostRecord>> {
  return run(async (supabase) => {
    if (!UUID.test(id)) fail("Unknown article.");
    const values = cleanPost(fields);
    await checkSlug(supabase, id, values.slug);
    const { error } = await supabase.from("journal_posts").update({ draft: values, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) fail("Could not save the draft.", error);
    return loadPost(supabase, id);
  });
}

export async function publishPost(id: string, fields: PostFields): Promise<ContentResult<PostRecord>> {
  return run(async (supabase) => {
    if (!UUID.test(id)) fail("Unknown article.");
    const values = cleanPost(fields);
    if (!values.title) fail("Add a title before publishing.");
    if (!values.body) fail("Write the article before publishing.");
    await checkSlug(supabase, id, values.slug);
    const saved = await supabase.from("journal_posts").update({ draft: values, updated_at: new Date().toISOString() }).eq("id", id);
    if (saved.error) fail("Could not save the article.", saved.error);
    const { data, error } = await supabase.rpc("publish_journal_post", { p_id: id });
    if (error || data !== true) fail("Publishing failed. Nothing was changed on the live site.", error);
    updateTag(JOURNAL_TAG);
    return loadPost(supabase, id);
  });
}

export async function unpublishPost(id: string): Promise<ContentResult<PostRecord>> {
  return run(async (supabase) => {
    if (!UUID.test(id)) fail("Unknown article.");
    const { error } = await supabase.from("journal_posts").update({ status: "unpublished", is_featured: false, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) fail("Could not unpublish the article.", error);
    updateTag(JOURNAL_TAG);
    return loadPost(supabase, id);
  });
}

export async function discardPostDraft(id: string): Promise<ContentResult<PostRecord>> {
  return run(async (supabase) => {
    if (!UUID.test(id)) fail("Unknown article.");
    const { error } = await supabase.from("journal_posts").update({ draft: null, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) fail("Could not discard the draft.", error);
    return loadPost(supabase, id);
  });
}

export async function deletePost(id: string): Promise<ContentResult<null>> {
  return run(async (supabase) => {
    if (!UUID.test(id)) fail("Unknown article.");
    const { error } = await supabase.from("journal_posts").delete().eq("id", id);
    if (error) fail("Could not delete the article.", error);
    updateTag(JOURNAL_TAG);
    return null;
  });
}

/** Chooses the one featured article (or clears it). Only a published article can be featured. */
export async function setFeaturedPost(id: string, featured: boolean): Promise<ContentResult<PostRecord>> {
  return run(async (supabase) => {
    if (!UUID.test(id)) fail("Unknown article.");
    if (featured) {
      const { data } = await supabase.from("journal_posts").select("status").eq("id", id).maybeSingle();
      if (data?.status !== "published") fail("Publish the article first, then you can feature it.");
    }
    const { error } = await supabase.rpc("set_featured_journal_post", { p_id: id, p_featured: featured });
    if (error) fail("Could not change the featured article.", error);
    updateTag(JOURNAL_TAG);
    return loadPost(supabase, id);
  });
}
