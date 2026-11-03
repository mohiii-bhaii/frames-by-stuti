"use client";

import { useEffect, useRef } from "react";
import { MAX_TEXT_LENGTH, optionalTextKeys, textDefaults, textLabel } from "@/content/texts";
import type { TextState } from "@/lib/editor-types";

export type TextStatus = "unsaved" | "draft" | "live" | "original";

const STATUS_TEXT: Record<TextStatus, { label: string; className: string }> = {
  unsaved: { label: "Unsaved change", className: "bg-amber-100 text-amber-900" },
  draft: { label: "Draft saved, not live yet", className: "bg-sky-100 text-sky-900" },
  live: { label: "Live on the website", className: "bg-emerald-100 text-emerald-900" },
  original: { label: "Original wording", className: "bg-neutral-100 text-neutral-800" },
};

type TextPanelProps = {
  id: string;
  /** What the page is showing right now, including unsaved typing. */
  value: string;
  saved: TextState | undefined;
  status: TextStatus;
  busy: boolean;
  onChange: (value: string) => void;
  onUseOriginal: () => void;
  onDiscardDraft: () => void;
  onSave: () => void;
  onCancel: () => void;
};

/**
 * Edits the words of one piece of text. Only the wording changes: the page
 * keeps the font, size, colour, spacing and animation it already gives the
 * element, so the preview on the page is exactly what will be published.
 */
export function TextPanel({ id, value, saved, status, busy, onChange, onUseOriginal, onDiscardDraft, onSave, onCancel }: TextPanelProps) {
  const field = useRef<HTMLTextAreaElement>(null);
  const original = textDefaults[id];
  const optional = optionalTextKeys.has(id);
  const empty = value.trim() === "" && !optional;
  const tooLong = value.length > MAX_TEXT_LENGTH;
  const changed = status === "unsaved";
  const badge = STATUS_TEXT[status];

  // The panel is keyed by text, so this runs each time a different piece of text is picked.
  useEffect(() => {
    const element = field.current;
    if (!element) return;
    element.focus({ preventScroll: true });
    element.setSelectionRange(element.value.length, element.value.length);
  }, []);

  // Grow with the text, within the panel's height.
  useEffect(() => {
    const element = field.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight + 2, 260)}px`;
  }, [value]);

  return (
    <section
      aria-label={`Edit text: ${textLabel(id)}`}
      className="fixed inset-x-0 bottom-[var(--cms-toolbar)] z-[61] flex max-h-[72dvh] flex-col rounded-t-2xl bg-white text-neutral-900 shadow-[0_-8px_30px_rgb(0_0_0/0.25)] md:inset-x-auto md:right-4 md:top-4 md:bottom-[calc(var(--cms-toolbar)+16px)] md:max-h-none md:w-[400px] md:rounded-2xl"
    >
      <header className="flex items-start justify-between gap-3 border-b border-neutral-200 px-4 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">{textLabel(id)}</h2>
          <p className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>{badge.label}</p>
        </div>
        <button type="button" onClick={onCancel} aria-label="Cancel and close" className="-mr-2 h-11 w-11 shrink-0 text-lg">
          ✕
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <label className="block">
          <span className="text-sm font-medium">Text</span>
          <textarea
            ref={field}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            rows={2}
            maxLength={MAX_TEXT_LENGTH + 200}
            aria-invalid={empty || tooLong}
            aria-describedby={`${id}-help`}
            // 16px stops iPhones zooming the page when the field is focused.
            className="mt-1 block w-full resize-none rounded-lg border border-neutral-300 px-3 py-2 text-base leading-snug aria-invalid:border-red-600"
          />
        </label>
        <p id={`${id}-help`} className={`mt-1 flex justify-between gap-3 text-xs ${empty || tooLong ? "text-red-700" : "text-neutral-600"}`}>
          <span>
            {empty
              ? "This can't be empty. Use the original wording to go back."
              : tooLong
                ? `Too long. Keep it under ${MAX_TEXT_LENGTH} characters.`
                : optional
                  ? "Leave empty to hide this."
                  : "Only the words change. The design stays the same."}
          </span>
          <span className="shrink-0">{value.length}</span>
        </p>

        <details className="mt-3 text-sm">
          <summary className="min-h-11 cursor-pointer py-2 text-neutral-700">Original wording</summary>
          <p className="whitespace-pre-line rounded-lg bg-neutral-100 p-3 text-neutral-800">{original || "(empty)"}</p>
        </details>

        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
          <button
            type="button"
            onClick={onUseOriginal}
            disabled={busy || value === original}
            className="min-h-11 text-sm font-medium text-[#2f6fed] disabled:text-neutral-400"
          >
            Use original wording
          </button>
          {saved?.draft && !changed ? (
            <button type="button" onClick={onDiscardDraft} disabled={busy} className="min-h-11 text-sm font-medium text-red-700 disabled:opacity-40">
              Discard saved draft
            </button>
          ) : null}
        </div>
      </div>

      <footer className="flex gap-2 border-t border-neutral-200 p-3">
        <button type="button" onClick={onCancel} disabled={busy} className="min-h-12 flex-1 rounded-lg border border-neutral-300 font-medium">
          {changed ? "Cancel" : "Close"}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={busy || !changed || empty || tooLong}
          className="min-h-12 flex-1 rounded-lg bg-neutral-900 font-semibold text-white disabled:bg-neutral-300"
        >
          Save draft
        </button>
      </footer>
    </section>
  );
}
