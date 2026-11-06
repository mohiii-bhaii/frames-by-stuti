"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  deletePost,
  discardPostDraft,
  publishPost,
  savePostDraft,
  setFeaturedPost,
  unpublishPost,
} from "@/app/admin/content-actions";
import { MediaLibrary } from "@/components/editor/media-library";
import { journalCategories, type JournalCategory } from "@/content/journal";
import { pricingCategories, pricingHref } from "@/content/pricing";
import type { MediaItem } from "@/lib/editor-types";
import type { ContentResult, PostFields, PostRecord } from "@/lib/content-types";
import { ArticleBody } from "@/lib/markdown";
import { slugify } from "@/lib/slug";

const STATUS = {
  draft: { label: "Draft (not on the website)", className: "bg-neutral-100 text-neutral-800" },
  published: { label: "Live", className: "bg-emerald-50 text-emerald-900" },
  unpublished: { label: "Taken down", className: "bg-amber-50 text-amber-900" },
} as const;

const field = "min-h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base";
const button = "min-h-11 rounded-lg border border-neutral-300 px-4 text-sm font-medium disabled:opacity-50";
const toolButton = "min-h-11 min-w-11 rounded-md border border-neutral-300 bg-white px-3 text-sm font-medium hover:bg-neutral-50";

const internalLinks = [
  { label: "Home", href: "/" },
  { label: "Galleries", href: "/galleries" },
  { label: "Pricing & Packages", href: "/pricing" },
  ...pricingCategories.map((category) => ({ label: `${category.name} pricing`, href: pricingHref(category.slug) })),
  { label: "Contact (book a session)", href: "/contact" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "The Journal", href: "/blog" },
];

const today = () => new Date().toISOString().slice(0, 10);

type Picker = { mode: "featured" } | { mode: "inline" } | null;

export function PostEditor({ initial }: { initial: PostRecord }) {
  const router = useRouter();
  const [record, setRecord] = useState(initial);
  const saved = record.draft ?? record.live;
  const [fields, setFields] = useState<PostFields>({ ...saved, publishedOn: saved.publishedOn || today() });
  const [media, setMedia] = useState(record.media);
  const [slugTouched, setSlugTouched] = useState(() => saved.slug !== slugify(saved.title) && !/^post-[0-9a-f]{8}$/.test(saved.slug));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [picker, setPicker] = useState<Picker>(null);
  const [inlineAlt, setInlineAlt] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkHref, setLinkHref] = useState("/contact");
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const comparable = (value: PostFields) => JSON.stringify({ ...value, publishedOn: value.publishedOn || "" });
  const dirty = comparable(fields) !== comparable({ ...saved, publishedOn: saved.publishedOn || fields.publishedOn });

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = <K extends keyof PostFields>(key: K, value: PostFields[K]) => setFields((current) => ({ ...current, [key]: value }));

  async function act<T>(task: () => Promise<ContentResult<T>>, done: (data: T) => void, success: string) {
    setBusy(true);
    setMessage(null);
    const result = await task();
    setBusy(false);
    if (!result.ok) {
      setMessage({ text: result.error, error: true });
      return false;
    }
    done(result.data);
    setMessage({ text: success });
    return true;
  }

  const take = (next: PostRecord) => {
    setRecord(next);
    setMedia(next.media);
    const value = next.draft ?? next.live;
    setFields({ ...value, publishedOn: value.publishedOn || fields.publishedOn || today() });
    setSlugTouched(value.slug !== slugify(value.title) && !/^post-[0-9a-f]{8}$/.test(value.slug));
  };

  /** Edits the body text at the cursor: wraps the selection, or puts a prefix on each selected line. */
  function edit(kind: "wrap" | "lines", before: string, after = "", placeholder = "") {
    const area = bodyRef.current;
    if (!area) return;
    const { selectionStart: start, selectionEnd: end, value } = area;
    let next: string;
    let caret: number;
    if (kind === "wrap") {
      const selected = value.slice(start, end) || placeholder;
      next = value.slice(0, start) + before + selected + after + value.slice(end);
      caret = start + before.length + selected.length + after.length;
    } else {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const chunk = value.slice(lineStart, end) || placeholder;
      const prefixed = chunk
        .split("\n")
        .map((line, index) => (before === "1. " ? `${index + 1}. ` : before) + line)
        .join("\n");
      next = value.slice(0, lineStart) + prefixed + value.slice(end);
      caret = lineStart + prefixed.length;
    }
    set("body", next);
    requestAnimationFrame(() => {
      area.focus();
      area.setSelectionRange(caret, caret);
    });
  }

  function insertAtCursor(text: string) {
    const area = bodyRef.current;
    const position = area ? area.selectionEnd : fields.body.length;
    const before = fields.body.slice(0, position);
    const after = fields.body.slice(position);
    const lead = before && !before.endsWith("\n\n") ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
    set("body", `${before}${lead}${text}\n\n${after}`.replace(/\n+$/, "\n"));
  }

  function choose(item: MediaItem) {
    if (picker?.mode === "featured") {
      set("mediaId", item.id);
      setMedia({ id: item.id, url: item.url, width: item.width, height: item.height });
      if (!fields.featuredAlt) set("featuredAlt", "");
    } else if (picker?.mode === "inline") {
      insertAtCursor(`![${inlineAlt.replace(/[\[\]\n]/g, " ").trim()}](${item.url}#${item.width}x${item.height})`);
      setInlineAlt("");
    }
    setPicker(null);
  }

  const status = STATUS[record.status];
  const live = record.status === "published";
  const publicUrl = `https://framesbystuti.com/blog/${fields.slug || "…"}`;

  return (
    <div className="mt-2 pb-24">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
          {status.label}
          {live && record.draft ? " · has unpublished changes" : ""}
        </span>
        {record.isFeatured ? <span className="rounded-full bg-[#ca8060]/20 px-2.5 py-0.5 text-xs font-medium text-[#874122]">Featured</span> : null}
      </div>

      <div className="mt-4 space-y-5 rounded-2xl bg-white p-4 shadow-sm sm:p-6">
        <label className="block text-sm font-medium">
          Title
          <input
            value={fields.title}
            maxLength={200}
            onChange={(event) => {
              set("title", event.target.value);
              if (!slugTouched) set("slug", slugify(event.target.value));
            }}
            className={`${field} mt-1 text-lg`}
          />
        </label>

        <div>
          <label className="block text-sm font-medium">
            Web address
            <input
              value={fields.slug}
              maxLength={80}
              onChange={(event) => {
                setSlugTouched(true);
                set("slug", slugify(event.target.value, 80));
              }}
              className={`${field} mt-1`}
            />
          </label>
          <p className="mt-1 break-all text-xs text-neutral-600">
            {publicUrl}
            {live ? " · changing this changes the link of a live article, so old links will stop working." : ""}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Category
            <select value={fields.category} onChange={(event) => set("category", event.target.value as JournalCategory)} className={`${field} mt-1`}>
              {journalCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Publication date
            <input type="date" value={fields.publishedOn} onChange={(event) => set("publishedOn", event.target.value)} className={`${field} mt-1`} />
          </label>
        </div>

        <label className="block text-sm font-medium">
          Short excerpt (shown in lists and on the home page)
          <textarea value={fields.excerpt} maxLength={400} rows={3} onChange={(event) => set("excerpt", event.target.value)} className={`${field} mt-1 leading-relaxed`} />
          <span className="mt-1 block text-xs font-normal text-neutral-600">{fields.excerpt.length}/400</span>
        </label>

        <div>
          <p className="text-sm font-medium">Featured photograph</p>
          {media ? (
            <div className="mt-2 flex flex-wrap items-start gap-4">
              <Image src={media.url} alt="" width={160} height={Math.round((160 * media.height) / media.width)} className="h-auto w-40 rounded-lg" />
              <div className="flex flex-col gap-2">
                <button type="button" onClick={() => setPicker({ mode: "featured" })} className={button}>
                  Change photo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    set("mediaId", null);
                    setMedia(null);
                  }}
                  className={button}
                >
                  Remove photo
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setPicker({ mode: "featured" })} className={`${button} mt-2`}>
              Choose from your photo library, or upload one
            </button>
          )}
          <label className="mt-3 block text-sm font-medium">
            Describe the photograph (alt text, for search engines and screen readers)
            <input value={fields.featuredAlt} maxLength={300} onChange={(event) => set("featuredAlt", event.target.value)} className={`${field} mt-1`} />
          </label>
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">Article text</p>
            <button type="button" aria-pressed={showPreview} onClick={() => setShowPreview((value) => !value)} className={toolButton}>
              {showPreview ? "Back to writing" : "Preview the text"}
            </button>
          </div>
          {!showPreview ? (
            <>
              <div className="mt-2 flex flex-wrap gap-1.5" role="toolbar" aria-label="Formatting">
                <button type="button" className={toolButton} onClick={() => edit("lines", "## ", "", "Heading")}>
                  Heading
                </button>
                <button type="button" className={toolButton} onClick={() => edit("lines", "### ", "", "Smaller heading")}>
                  Subheading
                </button>
                <button type="button" className={`${toolButton} font-bold`} onClick={() => edit("wrap", "**", "**", "bold text")}>
                  B
                </button>
                <button type="button" className={`${toolButton} italic`} onClick={() => edit("wrap", "*", "*", "italic text")}>
                  I
                </button>
                <button type="button" className={toolButton} onClick={() => edit("lines", "- ", "", "List item")}>
                  • List
                </button>
                <button type="button" className={toolButton} onClick={() => edit("lines", "1. ", "", "List item")}>
                  1. List
                </button>
                <button type="button" className={toolButton} onClick={() => edit("lines", "> ", "", "Quote")}>
                  Quote
                </button>
                <button
                  type="button"
                  className={toolButton}
                  onClick={() => {
                    const area = bodyRef.current;
                    setLinkText(area ? area.value.slice(area.selectionStart, area.selectionEnd) : "");
                    setLinkOpen((value) => !value);
                  }}
                >
                  Link
                </button>
                <button type="button" className={toolButton} onClick={() => setPicker({ mode: "inline" })}>
                  Photo
                </button>
              </div>
              {linkOpen ? (
                <div className="mt-2 grid gap-2 rounded-lg bg-neutral-50 p-3 sm:grid-cols-[1fr_1fr_auto]">
                  <label className="text-xs font-medium">
                    Link text
                    <input value={linkText} onChange={(event) => setLinkText(event.target.value)} className={`${field} mt-1`} />
                  </label>
                  <label className="text-xs font-medium">
                    Goes to
                    <select
                      value={internalLinks.some((item) => item.href === linkHref) ? linkHref : "custom"}
                      onChange={(event) => setLinkHref(event.target.value === "custom" ? "https://" : event.target.value)}
                      className={`${field} mt-1`}
                    >
                      {internalLinks.map((item) => (
                        <option key={item.href} value={item.href}>
                          {item.label}
                        </option>
                      ))}
                      <option value="custom">Another web address…</option>
                    </select>
                    {!internalLinks.some((item) => item.href === linkHref) ? <input value={linkHref} onChange={(event) => setLinkHref(event.target.value)} placeholder="https://" className={`${field} mt-1`} /> : null}
                  </label>
                  <button
                    type="button"
                    className="min-h-11 self-end rounded-lg bg-[#2f6fed] px-4 text-sm font-medium text-white"
                    onClick={() => {
                      const text = linkText.trim() || "link text";
                      const area = bodyRef.current;
                      if (area) {
                        const { selectionStart: start, selectionEnd: end } = area;
                        set("body", `${fields.body.slice(0, start)}[${text}](${linkHref.trim()})${fields.body.slice(end)}`);
                      } else insertAtCursor(`[${text}](${linkHref.trim()})`);
                      setLinkOpen(false);
                    }}
                  >
                    Add link
                  </button>
                </div>
              ) : null}
              <textarea
                ref={bodyRef}
                value={fields.body}
                maxLength={100000}
                rows={22}
                onChange={(event) => set("body", event.target.value)}
                className={`${field} mt-2 font-mono text-[15px] leading-relaxed`}
                aria-label="Article text"
              />
              <p className="mt-1 text-xs text-neutral-600">
                A blank line starts a new paragraph. Use the buttons above for headings, lists, links and photos. Only plain text and these simple marks are kept; anything else (such as code) is shown as ordinary words.
              </p>
            </>
          ) : (
            <div className="mt-2 rounded-xl bg-[#ebe6db] p-4 text-[16px] leading-[1.9] text-[#5e452f] sm:p-6">
              {fields.body.trim() ? <ArticleBody source={fields.body} /> : <p>Nothing written yet.</p>}
            </div>
          )}
        </div>

        <details className="rounded-lg border border-neutral-200 p-3">
          <summary className="min-h-11 cursor-pointer text-sm font-medium leading-[44px]">Search engine settings (optional)</summary>
          <div className="mt-2 space-y-4">
            <label className="block text-sm font-medium">
              Page title for Google (leave empty to use the article title)
              <input value={fields.seoTitle} maxLength={120} onChange={(event) => set("seoTitle", event.target.value)} className={`${field} mt-1`} />
              <span className="mt-1 block text-xs font-normal text-neutral-600">{fields.seoTitle.length}/120 · about 60 is ideal</span>
            </label>
            <label className="block text-sm font-medium">
              Description for Google (leave empty to use the excerpt)
              <textarea value={fields.seoDescription} maxLength={300} rows={3} onChange={(event) => set("seoDescription", event.target.value)} className={`${field} mt-1`} />
              <span className="mt-1 block text-xs font-normal text-neutral-600">{fields.seoDescription.length}/300 · about 150 is ideal</span>
            </label>
          </div>
        </details>
      </div>

      {dirty ? <p className="mt-3 text-sm text-amber-800">You have changes that are not saved yet.</p> : null}
      {message ? (
        <p role={message.error ? "alert" : "status"} className={`mt-3 text-sm ${message.error ? "text-red-700" : "text-emerald-800"}`}>
          {message.text}
        </p>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => act(() => savePostDraft(record.id, fields), take, "Draft saved. The website has not changed.")} className={button}>
            Save draft
          </button>
          <button type="button" disabled={busy} onClick={() => act(() => publishPost(record.id, fields), take, "Published. It is on the website now.")} className="min-h-11 rounded-lg bg-[#2f6fed] px-4 text-sm font-medium text-white disabled:opacity-50">
            {live ? "Publish changes" : "Publish"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              const ok = await act(() => savePostDraft(record.id, fields), take, "Draft saved. Opening the preview…");
              if (ok) window.open(`/admin/journal/${record.id}/preview`, "_blank");
            }}
            className={button}
          >
            Save and preview
          </button>
          {live ? (
            <>
              <button type="button" disabled={busy} onClick={() => act(() => setFeaturedPost(record.id, !record.isFeatured), take, record.isFeatured ? "No longer featured." : "This is now the featured article.")} className={button}>
                {record.isFeatured ? "Remove featured" : "Make featured"}
              </button>
              <button type="button" disabled={busy} onClick={() => act(() => unpublishPost(record.id), take, "Taken down from the website.")} className={button}>
                Unpublish
              </button>
            </>
          ) : null}
          {record.draft ? (
            <button type="button" disabled={busy} onClick={() => act(() => discardPostDraft(record.id), take, "Draft discarded.")} className={button}>
              Discard changes
            </button>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              if (!window.confirm("Delete this article for good? This can't be undone.")) return;
              const ok = await act(() => deletePost(record.id), () => undefined, "Deleted.");
              if (ok) router.push("/admin/journal");
            }}
            className="min-h-11 rounded-lg border border-red-300 px-4 text-sm font-medium text-red-800 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      {picker ? (
        <div role="dialog" aria-modal="true" aria-label="Choose a photograph" className="fixed inset-0 z-40 flex items-end bg-black/50 sm:items-center sm:justify-center">
          <div className="max-h-[90svh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 sm:max-w-3xl sm:rounded-2xl sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{picker.mode === "featured" ? "Choose the featured photograph" : "Add a photograph to the text"}</h2>
              <button type="button" onClick={() => setPicker(null)} className="min-h-11 rounded-lg border border-neutral-300 px-4 text-sm">
                Close
              </button>
            </div>
            {picker.mode === "inline" ? (
              <label className="mt-3 block text-sm font-medium">
                Describe the photograph first (alt text)
                <input value={inlineAlt} onChange={(event) => setInlineAlt(event.target.value)} className={`${field} mt-1`} />
              </label>
            ) : null}
            <p className="mt-3 text-sm text-neutral-700">Pick a photo from your library, or upload a new one. The photo is added to your library as well.</p>
            <div className="mt-3">
              <MediaLibrary onSelect={choose} selectedId={picker.mode === "featured" ? fields.mediaId : null} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
