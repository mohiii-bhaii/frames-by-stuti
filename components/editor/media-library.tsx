"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { listMedia } from "@/app/admin/editor-actions";
import { FILE_INPUT_ACCEPT, uploadPhoto, type UploadProgress } from "@/components/editor/upload";
import type { MediaItem } from "@/lib/editor-types";

type UploadRow = { id: string; name: string; progress: UploadProgress; error?: string };

const STAGE_LABEL = { preparing: "Preparing", uploading: "Uploading", saving: "Saving" } as const;

export function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Uploads several files one after another, reporting progress for each. */
export function useUploads(onUploaded: (item: MediaItem) => void) {
  const [rows, setRows] = useState<UploadRow[]>([]);
  const update = (id: string, patch: Partial<UploadRow>) =>
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const upload = async (files: FileList | File[]) => {
    const queued = Array.from(files).map((file) => ({
      file,
      row: { id: crypto.randomUUID(), name: file.name, progress: { stage: "preparing", percent: 0 } } as UploadRow,
    }));
    setRows((current) => [...queued.map((entry) => entry.row), ...current]);
    let last: MediaItem | null = null;
    for (const { file, row } of queued) {
      try {
        last = await uploadPhoto(file, (progress) => update(row.id, { progress }));
        update(row.id, { progress: { stage: "saving", percent: 100 } });
        setRows((current) => current.filter((entry) => entry.id !== row.id));
        onUploaded(last);
      } catch (error) {
        update(row.id, { error: error instanceof Error ? error.message : "Upload failed." });
      }
    }
    return last;
  };

  const dismiss = (id: string) => setRows((current) => current.filter((row) => row.id !== id));
  return { rows, upload, dismiss };
}

export function UploadList({ rows, onDismiss }: { rows: UploadRow[]; onDismiss: (id: string) => void }) {
  if (rows.length === 0) return null;
  return (
    <ul className="space-y-2" aria-live="polite">
      {rows.map((row) => (
        <li key={row.id} className="rounded-lg border border-neutral-200 bg-white p-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="truncate font-medium">{row.name}</span>
            {row.error ? (
              <button type="button" onClick={() => onDismiss(row.id)} className="min-h-11 shrink-0 px-2 text-neutral-600 underline">
                Dismiss
              </button>
            ) : (
              <span className="shrink-0 text-neutral-600">
                {STAGE_LABEL[row.progress.stage]}
                {row.progress.stage === "uploading" ? ` ${row.progress.percent}%` : "…"}
              </span>
            )}
          </div>
          {row.error ? (
            <p role="alert" className="mt-1 text-red-700">
              {row.error}
            </p>
          ) : (
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-[#2f6fed] transition-[width]"
                style={{ width: `${row.progress.stage === "preparing" ? 5 : row.progress.percent}%` }}
              />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

type MediaLibraryProps = {
  /** When set, clicking a photo picks it. Without it the library is for browsing and uploading. */
  onSelect?: (item: MediaItem) => void;
  selectedId?: string | null;
};

/** Browse, search and upload photos. Every photo can be used in any number of places. */
export function MediaLibrary({ onSelect, selectedId }: MediaLibraryProps) {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const request = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async (term: string, offset: number) => {
    const id = ++request.current;
    setLoading(true);
    const result = await listMedia(term, offset);
    if (id !== request.current) return;
    setLoading(false);
    if (!result.ok) return setError(result.error);
    setError(null);
    setMore(result.data.more);
    setItems((current) => (offset === 0 ? result.data.items : [...current, ...result.data.items]));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(search, 0), search ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [search, load]);

  const { rows, upload, dismiss } = useUploads((item) => setItems((current) => [item, ...current]));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">Search by file name</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by file name"
            className="min-h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-base"
          />
        </label>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="min-h-11 rounded-lg bg-[#2f6fed] px-4 font-medium text-white"
        >
          Upload photos
        </button>
        <input
          ref={fileInput}
          type="file"
          accept={FILE_INPUT_ACCEPT}
          multiple
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            if (event.target.files?.length) void upload(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      <UploadList rows={rows} onDismiss={dismiss} />

      {error ? (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {!loading && items.length === 0 && !error ? (
        <p className="py-8 text-center text-sm text-neutral-600">
          {search ? "No photos match that name." : "No photos yet. Upload some to get started."}
        </p>
      ) : null}

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => {
          const content = (
            <>
              <span className="relative block aspect-square overflow-hidden rounded-md bg-neutral-100">
                <Image src={item.url} alt="" fill sizes="(min-width: 64rem) 220px, 45vw" className="object-cover" />
              </span>
              <span className="mt-1 block truncate text-left text-xs font-medium">{item.filename}</span>
              <span className="block text-left text-xs text-neutral-600">
                {item.width} × {item.height} · {formatBytes(item.sizeBytes)}
              </span>
            </>
          );
          return (
            <li key={item.id}>
              {onSelect ? (
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  aria-pressed={item.id === selectedId}
                  aria-label={`Use ${item.filename}`}
                  className="block w-full rounded-lg p-1 outline-offset-2 aria-pressed:bg-[#2f6fed]/15 aria-pressed:outline-2 aria-pressed:outline-[#2f6fed]"
                >
                  {content}
                </button>
              ) : (
                <div className="p-1">{content}</div>
              )}
            </li>
          );
        })}
      </ul>

      {loading ? <p className="text-center text-sm text-neutral-600">Loading…</p> : null}
      {more && !loading ? (
        <button
          type="button"
          onClick={() => void load(search, items.length)}
          className="mx-auto min-h-11 rounded-lg border border-neutral-300 px-4"
        >
          Load more
        </button>
      ) : null}
    </div>
  );
}
