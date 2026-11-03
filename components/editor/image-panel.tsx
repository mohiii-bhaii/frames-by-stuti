"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CropTool } from "@/components/editor/crop-tool";
import { UploadList, useUploads } from "@/components/editor/media-library";
import { FILE_INPUT_ACCEPT } from "@/components/editor/upload";
import type { MediaItem, SlotState, SlotValue } from "@/lib/editor-types";
import { isLogoSlot, parsePosition, slotLabel, type SlotId } from "@/lib/images";

export type SlotStatus = "unsaved" | "draft" | "live" | "original";

const STATUS_TEXT: Record<SlotStatus, { label: string; className: string }> = {
  unsaved: { label: "Unsaved change", className: "bg-amber-100 text-amber-900" },
  draft: { label: "Draft saved, not live yet", className: "bg-sky-100 text-sky-900" },
  live: { label: "Live on the website", className: "bg-emerald-100 text-emerald-900" },
  original: { label: "Original placeholder", className: "bg-neutral-100 text-neutral-800" },
};

type ImagePanelProps = {
  slot: SlotId;
  aspect: number;
  defaultPosition?: string;
  value: SlotValue;
  saved: SlotState | undefined;
  status: SlotStatus;
  busy: boolean;
  onChange: (value: SlotValue) => void;
  onUndo: () => void;
  onDiscardDraft: () => void;
  onRestorePrevious: () => void;
  onUsePlaceholder: () => void;
  onOpenLibrary: () => void;
  onSave: () => void;
  onClose: () => void;
};

/** Replaces one photo: upload or pick, adjust the crop, and describe it. */
export function ImagePanel(props: ImagePanelProps) {
  const { slot, aspect, defaultPosition, value, saved, status, busy, onChange, onClose } = props;
  const heading = useRef<HTMLHeadingElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [altTouched, setAltTouched] = useState(false);
  const logo = isLogoSlot(slot);
  const image = value.image;
  const focal = image.focal ?? parsePosition(defaultPosition);

  // The panel is keyed by slot, so this runs each time a different photo is picked.
  useEffect(() => heading.current?.focus(), []);

  const choose = (item: MediaItem) => {
    // Placeholder descriptions don't describe the new photo, so start fresh.
    const alt = image.alt.startsWith("Placeholder") ? "" : image.alt;
    onChange({
      mediaId: item.id,
      image: { src: item.url, width: item.width, height: item.height, alt, focal: logo ? null : { x: 50, y: 50 }, zoom: 1 },
    });
  };
  const { rows, upload, dismiss } = useUploads(choose);
  const uploading = rows.some((row) => !row.error);

  const isPlaceholder = value.mediaId === null;

  return (
    <section
      aria-labelledby="cms-panel-title"
      className="fixed inset-x-0 bottom-[var(--cms-toolbar)] z-[61] flex max-h-[72dvh] flex-col rounded-t-2xl bg-white text-neutral-900 shadow-[0_-8px_30px_rgb(0_0_0/0.25)] md:inset-x-auto md:right-4 md:top-4 md:bottom-[calc(var(--cms-toolbar)+16px)] md:max-h-none md:w-[400px] md:rounded-2xl"
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <header className="flex items-start justify-between gap-3 border-b border-neutral-200 px-4 py-3">
        <div className="min-w-0">
          <h2 id="cms-panel-title" ref={heading} tabIndex={-1} className="truncate text-base font-semibold outline-none">
            {slotLabel(slot)}
          </h2>
          <p className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TEXT[status].className}`}>
            {STATUS_TEXT[status].label}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo editor"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-neutral-100"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInput.current?.click()}
            className="min-h-12 rounded-lg bg-[#2f6fed] px-3 font-medium text-white disabled:opacity-60"
          >
            {uploading ? "Uploading…" : "Upload photo"}
          </button>
          <button
            type="button"
            onClick={props.onOpenLibrary}
            className="min-h-12 rounded-lg border border-neutral-300 px-3 font-medium"
          >
            Media library
          </button>
          <input
            ref={fileInput}
            type="file"
            accept={FILE_INPUT_ACCEPT}
            className="sr-only"
            tabIndex={-1}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload([file]);
              event.target.value = "";
            }}
          />
        </div>

        <UploadList rows={rows} onDismiss={dismiss} />

        {image.src && !logo ? (
          <CropTool
            image={image}
            aspect={aspect}
            focal={focal}
            onChange={(change) =>
              onChange({
                ...value,
                image: { ...image, focal: change.focal ?? focal, zoom: change.zoom ?? image.zoom },
              })
            }
          />
        ) : image.src ? (
          <div className="relative mx-auto h-28 w-full rounded-md bg-neutral-100">
            <Image src={image.src} alt="" fill sizes="400px" className="object-contain p-2" />
          </div>
        ) : (
          <p className="rounded-md bg-neutral-100 p-3 text-sm text-neutral-700">
            Showing the original text logo. Upload a logo image (PNG or WebP with a transparent background works best).
          </p>
        )}

        {!logo ? (
          <label className="block">
            <span className="text-sm font-medium">Description (alt text)</span>
            <textarea
              value={image.alt}
              maxLength={500}
              rows={3}
              onChange={(event) => {
                setAltTouched(true);
                onChange({ ...value, image: { ...image, alt: event.target.value } });
              }}
              placeholder="For example: A couple laughing in a wheat field at sunset"
              className="mt-1 w-full rounded-lg border border-neutral-300 p-3 text-base"
            />
            <span className="mt-1 block text-xs text-neutral-600">
              {!image.alt && !altTouched
                ? "Describe the photo for people using screen readers, and for search engines."
                : "Read aloud by screen readers. Keep it short and specific."}
            </span>
          </label>
        ) : null}

        <div className="flex flex-col gap-2 border-t border-neutral-200 pt-4 text-sm">
          {status === "unsaved" ? (
            <button type="button" onClick={props.onUndo} className="min-h-11 rounded-lg border border-neutral-300 px-3 text-left">
              Undo unsaved changes to this photo
            </button>
          ) : null}
          {saved?.draft ? (
            <button
              type="button"
              disabled={busy}
              onClick={props.onDiscardDraft}
              className="min-h-11 rounded-lg border border-neutral-300 px-3 text-left disabled:opacity-60"
            >
              Discard saved draft (keep what&apos;s live)
            </button>
          ) : null}
          {saved?.hasPrevious ? (
            <button
              type="button"
              disabled={busy}
              onClick={props.onRestorePrevious}
              className="min-h-11 rounded-lg border border-neutral-300 px-3 text-left disabled:opacity-60"
            >
              Restore the previously published photo
            </button>
          ) : null}
          {!isPlaceholder ? (
            <button type="button" onClick={props.onUsePlaceholder} className="min-h-11 rounded-lg border border-neutral-300 px-3 text-left">
              {logo ? "Go back to the text logo" : "Go back to the original placeholder"}
            </button>
          ) : null}
        </div>
      </div>

      <footer className="flex gap-2 border-t border-neutral-200 px-4 py-3">
        <button type="button" onClick={onClose} className="min-h-12 flex-1 rounded-lg border border-neutral-300 font-medium">
          Done
        </button>
        <button
          type="button"
          disabled={busy || status !== "unsaved"}
          onClick={props.onSave}
          className="min-h-12 flex-1 rounded-lg bg-neutral-900 font-medium text-white disabled:opacity-40"
        >
          Save draft
        </button>
      </footer>
    </section>
  );
}
