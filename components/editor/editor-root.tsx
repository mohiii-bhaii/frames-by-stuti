"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { closeEditor } from "@/app/admin/auth-actions";
import {
  discardDraft,
  discardTextDraft,
  getEditorSnapshot,
  publishDrafts,
  restorePrevious,
  saveDrafts,
  saveTextDrafts,
} from "@/app/admin/editor-actions";
import { ImagePanel, type SlotStatus } from "@/components/editor/image-panel";
import { MediaLibrary } from "@/components/editor/media-library";
import { TextPanel, type TextStatus } from "@/components/editor/text-panel";
import { contactLink, navigation } from "@/content/site";
import { textAppearsOn, textDefaults, textKeys, textLabel } from "@/content/texts";
import type { ImageMap } from "@/lib/cms";
import { editorStore, useEditorStore } from "@/lib/editor-store";
import type { ActionResult, DraftInput, EditorSnapshot, SlotValue } from "@/lib/editor-types";
import {
  getFallbackImage,
  imageSlots,
  isLogoSlot,
  logoSlots,
  parsePosition,
  slotLabel,
  type SlotId,
} from "@/lib/images";

type Notice = { tone: "success" | "error" | "info"; text: string; signedOut?: boolean };
type Pending = Partial<Record<SlotId, SlotValue>>;
/** Unsaved text edits by key. null means "go back to the original wording". */
type PendingTexts = Record<string, string | null>;

const pages = [...navigation, contactLink];

function slotAspect(slot: SlotId) {
  const spec = isLogoSlot(slot) ? logoSlots[slot] : imageSlots[slot];
  return spec.width / spec.height;
}

/** A small "Edit text" tag that follows the text under the pointer on desktop. Touch screens just tap the text. */
function TextHoverTag() {
  const [tag, setTag] = useState<{ x: number; y: number } | null>(null);
  const mode = useEditorStore((current) => current.mode);

  useEffect(() => {
    if (mode !== "edit" || !window.matchMedia("(hover: hover)").matches) return;
    const over = (event: PointerEvent) => {
      const element = (event.target as Element | null)?.closest?.("[data-cms-text]");
      if (!element) return setTag(null);
      const rect = element.getBoundingClientRect();
      setTag({ x: Math.max(8, Math.min(rect.left, window.innerWidth - 100)), y: rect.top > 40 ? rect.top - 30 : rect.bottom + 6 });
    };
    const hide = () => setTag(null);
    document.addEventListener("pointerover", over);
    document.addEventListener("scroll", hide, { passive: true });
    return () => {
      document.removeEventListener("pointerover", over);
      document.removeEventListener("scroll", hide);
    };
  }, [mode]);

  if (!tag || mode !== "edit") return null;
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none fixed z-[59] rounded-md bg-[#2f6fed] px-2 py-1 text-xs font-semibold text-white shadow"
      style={{ left: tag.x, top: tag.y }}
    >
      Edit text
    </span>
  );
}

/**
 * The visual editor. Runs on top of the real pages for a signed-in admin in
 * edit mode: it shows drafts in place, opens the photo panel when a Replace
 * button is pressed, and saves and publishes through Server Actions.
 */
export default function EditorRoot() {
  const router = useRouter();
  const pathname = usePathname();
  const [snapshot, setSnapshot] = useState<EditorSnapshot | null>(null);
  const [pending, setPending] = useState<Pending>({});
  const [pendingTexts, setPendingTexts] = useState<PendingTexts>({});
  const [textsOpen, setTextsOpen] = useState(false);
  const [textSearch, setTextSearch] = useState("");
  const [busy, setBusy] = useState<"saving" | "publishing" | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [photosOpen, setPhotosOpen] = useState(false);
  const libraryDialog = useRef<HTMLDialogElement>(null);
  const publishDialog = useRef<HTMLDialogElement>(null);
  const [libraryOpen, setLibraryOpen] = useState<"pick" | "browse" | null>(null);
  const mode = useEditorStore((current) => current.mode);
  const selected = useEditorStore((current) => current.selected);
  const selectedText = useEditorStore((current) => current.selectedText);
  const mounted = useEditorStore((current) => current.mounted);

  const report = useCallback(<T,>(result: ActionResult<T>): result is { ok: true; data: T } => {
    if (!result.ok) setNotice({ tone: "error", text: result.error, signedOut: result.signedOut });
    return result.ok;
  }, []);

  const reload = useCallback(async () => {
    const result = await getEditorSnapshot();
    if (report(result)) setSnapshot(result.data);
  }, [report]);

  useEffect(() => {
    editorStore.activate();
    let current = true;
    void getEditorSnapshot().then((result) => {
      if (current && report(result)) setSnapshot(result.data);
    });
    return () => {
      current = false;
      editorStore.deactivate();
    };
  }, [report]);

  // Close the photo panel when moving to another page.
  useEffect(() => {
    editorStore.select(null);
    editorStore.selectText(null);
  }, [pathname]);

  // Show unsaved edits, then saved drafts, then the latest published photo, everywhere on the page.
  useEffect(() => {
    const display: ImageMap = {};
    for (const [slot, state] of Object.entries(snapshot?.slots ?? {})) {
      const value = state.draft ?? state.published;
      if (value) display[slot as SlotId] = value.image;
    }
    for (const [slot, value] of Object.entries(pending)) display[slot as SlotId] = value.image;
    editorStore.setDisplay(display);
  }, [snapshot, pending]);

  // Show saved text drafts and unsaved typing in place. Anything else shows what is published.
  useEffect(() => {
    const display: Record<string, string | null> = {};
    for (const [key, state] of Object.entries(snapshot?.texts ?? {})) {
      if (state.draft) display[key] = state.draft.value;
    }
    Object.assign(display, pendingTexts);
    editorStore.setTextDisplay(display);
  }, [snapshot, pendingTexts]);

  const unsavedPhotos = Object.keys(pending).length;
  const unsavedTexts = Object.keys(pendingTexts).length;
  const unsavedCount = unsavedPhotos + unsavedTexts;
  const draftTexts = useMemo(
    () => Object.entries(snapshot?.texts ?? {}).filter(([, state]) => state.draft).map(([key]) => key),
    [snapshot],
  );
  const changedTexts = [...new Set([...draftTexts, ...Object.keys(pendingTexts)])];
  const draftSlots = useMemo(
    () => Object.entries(snapshot?.slots ?? {}).filter(([, state]) => state.draft).map(([slot]) => slot as SlotId),
    [snapshot],
  );
  const changedSlots = [...new Set<SlotId>([...draftSlots, ...(Object.keys(pending) as SlotId[])])];
  const changeCount = changedSlots.length + changedTexts.length;

  useEffect(() => {
    if (unsavedCount === 0) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsavedCount]);

  useEffect(() => {
    if (notice?.tone !== "success") return;
    const timer = window.setTimeout(() => setNotice(null), 6000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const dialog = libraryDialog.current;
    if (!dialog) return;
    if (libraryOpen && !dialog.open) dialog.showModal();
    if (!libraryOpen && dialog.open) dialog.close();
  }, [libraryOpen]);

  const valueFor = (slot: SlotId, defaultPosition?: string): SlotValue => {
    const saved = snapshot?.slots[slot];
    const value = pending[slot] ?? saved?.draft ?? saved?.published;
    if (value) return value;
    const fallback = getFallbackImage(slot);
    return { mediaId: null, image: { ...fallback, focal: isLogoSlot(slot) ? null : parsePosition(defaultPosition) } };
  };

  const statusFor = (slot: SlotId): SlotStatus => {
    if (pending[slot]) return "unsaved";
    const saved = snapshot?.slots[slot];
    if (saved?.draft) return "draft";
    return saved?.published ? "live" : "original";
  };

  const edit = (slot: SlotId, value: SlotValue) => setPending((current) => ({ ...current, [slot]: value }));
  const forget = (slot: SlotId) =>
    setPending((current) => {
      const next = { ...current };
      delete next[slot];
      return next;
    });

  /** Saves unsaved edits as drafts. Returns false if anything failed. */
  const save = async (only?: SlotId) => {
    const entries = Object.entries(pending).filter(([slot]) => !only || slot === only) as [SlotId, SlotValue][];
    if (entries.length === 0) return true;
    const inputs: DraftInput[] = entries.map(([slot, value]) => {
      const focal = value.image.focal ?? { x: 50, y: 50 };
      return { slot, mediaId: value.mediaId, alt: value.image.alt, focalX: focal.x, focalY: focal.y, zoom: value.image.zoom };
    });
    const result = await saveDrafts(inputs);
    if (!report(result)) return false;
    setSnapshot((current) => {
      const slots = { ...(current?.slots ?? {}) };
      for (const [slot, value] of Object.entries(result.data) as [SlotId, SlotValue][]) {
        slots[slot] = { published: null, hasPrevious: false, ...slots[slot], draft: value };
      }
      return { email: current?.email ?? "", slots, texts: current?.texts ?? {} };
    });
    setPending((current) => {
      const next = { ...current };
      for (const slot of Object.keys(result.data)) delete next[slot as SlotId];
      return next;
    });
    return true;
  };

  /** The wording a text shows right now, whether unsaved, drafted, published or original. */
  const textNow = (key: string) => {
    if (Object.hasOwn(pendingTexts, key)) return pendingTexts[key] ?? textDefaults[key];
    const state = snapshot?.texts[key];
    if (state?.draft) return state.draft.value ?? textDefaults[key];
    return state?.published ?? textDefaults[key];
  };

  /** What the text is once saved: the draft if there is one, else the live wording. */
  const textSaved = (key: string) => {
    const state = snapshot?.texts[key];
    if (state?.draft) return state.draft.value ?? textDefaults[key];
    return state?.published ?? textDefaults[key];
  };

  const textStatus = (key: string): TextStatus => {
    if (Object.hasOwn(pendingTexts, key)) return "unsaved";
    const state = snapshot?.texts[key];
    if (state?.draft) return "draft";
    return state?.published != null ? "live" : "original";
  };

  const editText = (key: string, value: string | null) =>
    setPendingTexts((current) => {
      const next = { ...current };
      // Typing back to what is already saved is not a change.
      if ((value ?? textDefaults[key]) === textSaved(key)) delete next[key];
      else next[key] = value;
      return next;
    });
  const forgetText = (key: string) =>
    setPendingTexts((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });

  /** Saves unsaved text edits as drafts. Returns false if anything failed. */
  const saveTexts = async (only?: string) => {
    const entries = Object.entries(pendingTexts).filter(([key]) => !only || key === only);
    if (entries.length === 0) return true;
    const result = await saveTextDrafts(entries.map(([key, value]) => ({ key, value })));
    if (!report(result)) return false;
    setSnapshot((current) => {
      if (!current) return current;
      const texts = { ...current.texts };
      for (const [key, value] of Object.entries(result.data)) {
        texts[key] = { published: texts[key]?.published ?? null, draft: { value } };
      }
      return { ...current, texts };
    });
    setPendingTexts((current) => {
      const next = { ...current };
      for (const key of Object.keys(result.data)) delete next[key];
      return next;
    });
    return true;
  };

  const withBusy = async (kind: "saving" | "publishing", task: () => Promise<void>) => {
    setBusy(kind);
    try {
      await task();
    } finally {
      setBusy(null);
    }
  };

  const saveAll = () =>
    withBusy("saving", async () => {
      const count = unsavedCount;
      if ((await save()) && (await saveTexts())) setNotice({ tone: "success", text: `Saved ${count} ${count === 1 ? "change" : "changes"} as a draft. Visitors won't see them until you publish.` });
    });

  const publish = () =>
    withBusy("publishing", async () => {
      publishDialog.current?.close();
      if (!(await save()) || !(await saveTexts())) return;
      const result = await publishDrafts();
      if (!report(result)) return;
      const { photos, texts } = result.data;
      const parts = [
        photos.length ? `${photos.length} ${photos.length === 1 ? "photo" : "photos"}` : "",
        texts.length ? `${texts.length} ${texts.length === 1 ? "text" : "texts"}` : "",
      ].filter(Boolean);
      setNotice({ tone: "success", text: `Published ${parts.join(" and ") || "nothing new"}. The live website is updated.` });
      await reload();
      router.refresh();
    });

  const exit = () => {
    if (unsavedCount > 0 && !window.confirm("You have unsaved changes. Leave the editor and lose them?")) return;
    setPending({});
    setPendingTexts({});
    void closeEditor();
  };

  const cancelChanges = () => {
    setMenuOpen(false);
    if (unsavedCount === 0) return setNotice({ tone: "info", text: "There are no unsaved changes." });
    if (!window.confirm(`Discard ${unsavedCount} unsaved ${unsavedCount === 1 ? "change" : "changes"}? Saved drafts are kept.`)) return;
    setPending({});
    setPendingTexts({});
    setNotice({ tone: "info", text: "Unsaved changes discarded." });
  };

  const selectedSlot = selected?.slot;
  const onThisPage = (Object.keys(mounted) as SlotId[]).sort();

  return (
    <>
      {/* Room at the end of the page so the toolbar never covers the footer. */}
      <div aria-hidden="true" className="h-[var(--cms-toolbar)]" />

      <TextHoverTag />

      <style>{`:root { --cms-toolbar: 132px; } @media (min-width: 48rem) { :root { --cms-toolbar: 88px; } }`}</style>

      {notice ? (
        <div
          role={notice.tone === "error" ? "alert" : "status"}
          className={`fixed inset-x-3 bottom-[calc(var(--cms-toolbar)+12px)] z-[62] mx-auto flex max-w-xl items-start gap-3 rounded-xl px-4 py-3 text-sm shadow-lg md:left-4 md:right-auto md:mx-0 md:max-w-md ${
            notice.tone === "error" ? "bg-red-700 text-white" : notice.tone === "success" ? "bg-emerald-700 text-white" : "bg-neutral-900 text-white"
          }`}
        >
          <p className="flex-1">
            {notice.text}
            {notice.signedOut ? (
              <>
                {" "}
                <a href="/admin/login" target="_blank" rel="noreferrer" className="font-semibold underline">
                  Log in again in a new tab
                </a>
                , then come back here and try again.
              </>
            ) : null}
          </p>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss message" className="-my-2 -mr-2 h-11 w-11 shrink-0">
            ✕
          </button>
        </div>
      ) : null}

      {selectedText && mode === "edit" ? (
        <TextPanel
          key={selectedText}
          id={selectedText}
          value={textNow(selectedText)}
          saved={snapshot?.texts[selectedText]}
          status={textStatus(selectedText)}
          busy={busy !== null}
          onChange={(value) => editText(selectedText, value)}
          onUseOriginal={() => editText(selectedText, null)}
          onDiscardDraft={() =>
            withBusy("saving", async () => {
              const result = await discardTextDraft(selectedText);
              if (!report(result)) return;
              forgetText(selectedText);
              setSnapshot((current) =>
                current ? { ...current, texts: { ...current.texts, [selectedText]: { published: current.texts[selectedText]?.published ?? null, draft: null } } } : current,
              );
              setNotice({ tone: "success", text: "Draft discarded. This text shows the live wording again." });
            })
          }
          onSave={() =>
            withBusy("saving", async () => {
              if (await saveTexts(selectedText)) {
                setNotice({ tone: "success", text: "Draft saved. Press Publish when you're ready." });
                editorStore.selectText(null);
              }
            })
          }
          onCancel={() => {
            forgetText(selectedText);
            editorStore.selectText(null);
          }}
        />
      ) : null}

      {selectedSlot && mode === "edit" ? (
        <ImagePanel
          key={selectedSlot}
          slot={selectedSlot}
          aspect={selected.aspect}
          defaultPosition={selected.defaultPosition}
          value={valueFor(selectedSlot, selected.defaultPosition)}
          saved={snapshot?.slots[selectedSlot]}
          status={statusFor(selectedSlot)}
          busy={busy !== null}
          onChange={(value) => edit(selectedSlot, value)}
          onUndo={() => forget(selectedSlot)}
          onDiscardDraft={() =>
            withBusy("saving", async () => {
              const result = await discardDraft(selectedSlot);
              if (!report(result)) return;
              forget(selectedSlot);
              setSnapshot((current) =>
                current
                  ? { ...current, slots: { ...current.slots, [selectedSlot]: { ...current.slots[selectedSlot]!, draft: null } } }
                  : current,
              );
              setNotice({ tone: "success", text: "Draft discarded. This spot shows the live photo again." });
            })
          }
          onRestorePrevious={() =>
            withBusy("saving", async () => {
              const result = await restorePrevious(selectedSlot);
              if (!report(result)) return;
              forget(selectedSlot);
              setSnapshot((current) =>
                current
                  ? { ...current, slots: { ...current.slots, [selectedSlot]: { ...current.slots[selectedSlot]!, draft: result.data } } }
                  : current,
              );
              setNotice({ tone: "success", text: "The previous photo is back as a draft. Press Publish to make it live." });
            })
          }
          onUsePlaceholder={() => {
            const fallback = getFallbackImage(selectedSlot);
            edit(selectedSlot, {
              mediaId: null,
              image: { ...fallback, focal: isLogoSlot(selectedSlot) ? null : parsePosition(selected.defaultPosition) },
            });
          }}
          onOpenLibrary={() => setLibraryOpen("pick")}
          onSave={() =>
            withBusy("saving", async () => {
              if (await save(selectedSlot)) setNotice({ tone: "success", text: "Draft saved. Press Publish when you're ready." });
            })
          }
          onClose={() => editorStore.select(null)}
        />
      ) : null}

      {/* Toolbar */}
      <div
        role="toolbar"
        aria-label="Website editor"
        className="fixed inset-x-0 bottom-0 z-[60] border-t border-neutral-200 bg-white/95 px-3 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 text-neutral-900 shadow-[0_-4px_20px_rgb(0_0_0/0.15)] backdrop-blur md:inset-x-4 md:bottom-4 md:rounded-2xl md:border md:pb-2"
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-neutral-100 p-1" role="group" aria-label="Mode">
            {(["edit", "preview"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={mode === option}
                onClick={() => editorStore.setMode(option)}
                className="min-h-10 rounded-md px-3 text-sm font-medium capitalize aria-pressed:bg-white aria-pressed:shadow"
              >
                {option}
              </button>
            ))}
          </div>

          <label className="min-w-0 flex-1 md:flex-none">
            <span className="sr-only">Page</span>
            <select
              value={pages.some((page) => page.href === pathname) ? pathname : ""}
              onChange={(event) => {
                setTextsOpen(false);
                router.push(event.target.value);
              }}
              className="min-h-11 w-full rounded-lg border border-neutral-300 bg-white px-2 text-base md:w-40"
            >
              {pages.some((page) => page.href === pathname) ? null : <option value="">Choose a page</option>}
              {pages.map((page) => (
                <option key={page.href} value={page.href}>
                  {page.label}
                </option>
              ))}
            </select>
          </label>

          <div className="relative">
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={() => {
                setMenuOpen((open) => !open);
                setPhotosOpen(false);
                setTextsOpen(false);
              }}
              className="min-h-11 rounded-lg border border-neutral-300 px-3 text-sm font-medium"
            >
              More
            </button>
            {menuOpen ? (
              <div role="menu" className="absolute bottom-full right-0 mb-2 w-64 rounded-xl border border-neutral-200 bg-white p-1 shadow-xl md:left-0 md:right-auto">
                {[
                  { label: "Text on this page", action: () => setTextsOpen(true) },
                  { label: "Photos on this page", action: () => setPhotosOpen(true) },
                  { label: "Media library", action: () => setLibraryOpen("browse") },
                  { label: "Cancel unsaved changes", action: cancelChanges },
                  { label: "Exit editor", action: exit },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      item.action();
                    }}
                    className="block min-h-11 w-full rounded-lg px-3 text-left text-sm hover:bg-neutral-100"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
            {textsOpen ? (
              <div className="absolute bottom-full right-0 mb-2 flex max-h-[60dvh] w-[min(22rem,calc(100vw-1.5rem))] flex-col rounded-xl border border-neutral-200 bg-white p-1 shadow-xl md:left-0 md:right-auto">
                <div className="flex items-center justify-between px-3 py-1">
                  <p className="text-sm font-semibold">Text on this page</p>
                  <button type="button" onClick={() => setTextsOpen(false)} className="h-11 w-11" aria-label="Close list">
                    ✕
                  </button>
                </div>
                <input
                  type="search"
                  value={textSearch}
                  onChange={(event) => setTextSearch(event.target.value)}
                  placeholder="Search text"
                  aria-label="Search text on this page"
                  className="mx-2 mb-1 min-h-11 rounded-lg border border-neutral-300 px-3 text-base"
                />
                <div className="min-h-0 flex-1 overflow-y-auto">
                  {textKeys
                    .filter((key) => textAppearsOn(key, pathname))
                    .filter((key) => {
                      const term = textSearch.trim().toLowerCase();
                      return !term || textLabel(key).toLowerCase().includes(term) || textNow(key).toLowerCase().includes(term);
                    })
                    .map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setTextsOpen(false);
                          editorStore.setMode("edit");
                          editorStore.selectText(key);
                        }}
                        className="block min-h-11 w-full rounded-lg px-3 py-1.5 text-left hover:bg-neutral-100"
                      >
                        <span className="flex items-center justify-between gap-2 text-sm font-medium">
                          <span className="truncate">{textLabel(key)}</span>
                          {textStatus(key) === "unsaved" || textStatus(key) === "draft" ? (
                            <span className="shrink-0 text-xs font-normal text-amber-800">changed</span>
                          ) : null}
                        </span>
                        <span className="block truncate text-xs text-neutral-600">{textNow(key) || "(empty)"}</span>
                      </button>
                    ))}
                </div>
              </div>
            ) : null}
            {photosOpen ? (
              <div className="absolute bottom-full right-0 mb-2 max-h-[50dvh] w-72 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-1 shadow-xl md:left-0 md:right-auto">
                <div className="flex items-center justify-between px-3 py-1">
                  <p className="text-sm font-semibold">Photos on this page</p>
                  <button type="button" onClick={() => setPhotosOpen(false)} className="h-11 w-11" aria-label="Close list">
                    ✕
                  </button>
                </div>
                {onThisPage.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => {
                      setPhotosOpen(false);
                      editorStore.setMode("edit");
                      editorStore.select({ slot, aspect: slotAspect(slot) });
                    }}
                    className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-3 text-left text-sm hover:bg-neutral-100"
                  >
                    <span className="truncate">{slotLabel(slot)}</span>
                    {statusFor(slot) === "unsaved" || statusFor(slot) === "draft" ? (
                      <span className="shrink-0 text-xs text-amber-800">changed</span>
                    ) : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <p className="order-last w-full text-xs text-neutral-600 md:order-none md:ml-auto md:w-auto" aria-live="polite">
            {busy === "saving"
              ? "Saving…"
              : busy === "publishing"
                ? "Publishing…"
                : !snapshot
                  ? "Loading…"
                  : unsavedCount > 0
                    ? `${unsavedCount} unsaved`
                    : draftSlots.length + draftTexts.length > 0
                      ? `${draftSlots.length + draftTexts.length} draft${draftSlots.length + draftTexts.length === 1 ? "" : "s"} not live`
                      : "Everything is published"}
          </p>

          <div className="flex w-full gap-2 md:w-auto">
            <button
              type="button"
              disabled={busy !== null || unsavedCount === 0}
              onClick={saveAll}
              className="min-h-11 flex-1 rounded-lg border border-neutral-300 px-4 text-sm font-medium disabled:opacity-40 md:flex-none"
            >
              Save draft
            </button>
            <button
              type="button"
              disabled={busy !== null || changeCount === 0}
              onClick={() => publishDialog.current?.showModal()}
              className="min-h-11 flex-1 rounded-lg bg-[#2f6fed] px-4 text-sm font-semibold text-white disabled:opacity-40 md:flex-none"
            >
              Publish
            </button>
          </div>
        </div>
      </div>

      <dialog
        ref={publishDialog}
        aria-labelledby="cms-publish-title"
        className="m-auto w-[min(92vw,440px)] rounded-2xl bg-white p-0 text-neutral-900 backdrop:bg-black/50"
      >
        <div className="p-5">
          <h2 id="cms-publish-title" className="text-lg font-semibold">
            Publish {changeCount} {changeCount === 1 ? "change" : "changes"}?
          </h2>
          <p className="mt-2 text-sm text-neutral-700">
            These changes will replace what visitors see on the live website right away. A photo can be restored to the
            previous one later; text can be changed back by editing it again.
          </p>
          <ul className="mt-3 max-h-48 list-inside list-disc overflow-y-auto text-sm">
            {changedSlots.map((slot) => (
              <li key={slot}>Photo: {slotLabel(slot)}</li>
            ))}
            {changedTexts.map((key) => (
              <li key={key}>Text: {textLabel(key)}</li>
            ))}
          </ul>
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => publishDialog.current?.close()}
              className="min-h-12 flex-1 rounded-lg border border-neutral-300 font-medium"
            >
              Not yet
            </button>
            <button type="button" onClick={publish} className="min-h-12 flex-1 rounded-lg bg-[#2f6fed] font-semibold text-white">
              Publish now
            </button>
          </div>
        </div>
      </dialog>

      <dialog
        ref={libraryDialog}
        aria-label="Media library"
        onClose={() => setLibraryOpen(null)}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-neutral-50 p-0 text-neutral-900 backdrop:bg-black/50 md:m-auto md:h-[85dvh] md:w-[min(92vw,960px)] md:rounded-2xl"
      >
        <div className="flex h-full flex-col">
          <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-2">
            <h2 className="text-base font-semibold">
              {libraryOpen === "pick" && selectedSlot ? `Choose a photo for ${slotLabel(selectedSlot)}` : "Media library"}
            </h2>
            <button type="button" onClick={() => setLibraryOpen(null)} aria-label="Close media library" className="h-11 w-11 text-lg">
              ✕
            </button>
          </header>
          <div className="flex-1 overflow-y-auto p-4">
            {libraryOpen ? (
              <MediaLibrary
                selectedId={selectedSlot ? valueFor(selectedSlot).mediaId : null}
                onSelect={
                  libraryOpen === "pick" && selectedSlot
                    ? (item) => {
                        const current = valueFor(selectedSlot, selected?.defaultPosition);
                        const alt = current.image.alt.startsWith("Placeholder") ? "" : current.image.alt;
                        edit(selectedSlot, {
                          mediaId: item.id,
                          image: {
                            src: item.url,
                            width: item.width,
                            height: item.height,
                            alt,
                            focal: isLogoSlot(selectedSlot) ? null : { x: 50, y: 50 },
                            zoom: 1,
                          },
                        });
                        setLibraryOpen(null);
                      }
                    : undefined
                }
              />
            ) : null}
          </div>
        </div>
      </dialog>
    </>
  );
}
