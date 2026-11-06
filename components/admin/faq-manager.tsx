"use client";

import { useState } from "react";
import {
  createFaq,
  deleteFaq,
  discardFaqDraft,
  moveFaq,
  publishAllFaqs,
  publishFaq,
  saveFaqDraft,
  unpublishFaq,
} from "@/app/admin/content-actions";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { faqCategories, HOME_FAQ_LIMIT, type FaqCategory } from "@/content/journal";
import type { ContentResult, FaqFields, FaqRecord } from "@/lib/content-types";

const STATUS = {
  draft: { label: "Draft (not on the website)", className: "bg-neutral-100 text-neutral-800" },
  published: { label: "Live", className: "bg-emerald-50 text-emerald-900" },
  unpublished: { label: "Taken down", className: "bg-amber-50 text-amber-900" },
} as const;

const field = "min-h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base";
const button = "min-h-11 rounded-lg border border-neutral-300 px-4 text-sm font-medium disabled:opacity-50";

function Item({
  record,
  index,
  count,
  onChange,
  onList,
  onRemove,
}: {
  record: FaqRecord;
  index: number;
  count: number;
  onChange: (record: FaqRecord) => void;
  onList: (records: FaqRecord[]) => void;
  onRemove: (id: string) => void;
}) {
  const saved = record.draft ?? record.live;
  const [fields, setFields] = useState<FaqFields>(saved);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [preview, setPreview] = useState(false);
  const dirty = JSON.stringify(fields) !== JSON.stringify(saved);

  async function act<T>(task: () => Promise<ContentResult<T>>, done: (data: T) => void, success: string) {
    setBusy(true);
    setMessage(null);
    const result = await task();
    setBusy(false);
    if (!result.ok) return setMessage({ text: result.error, error: true });
    done(result.data);
    setMessage({ text: success });
  }

  const take = (next: FaqRecord) => {
    onChange(next);
    setFields(next.draft ?? next.live);
  };

  const status = STATUS[record.status];
  return (
    <li className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
          {status.label}
          {record.status === "published" && record.draft ? " · has unpublished changes" : ""}
        </span>
        <div className="flex gap-1">
          <button type="button" aria-label="Move up" disabled={busy || index === 0} onClick={() => act(() => moveFaq(record.id, "up"), onList, "Moved up.")} className="min-h-11 min-w-11 rounded-lg border border-neutral-300 disabled:opacity-40">
            ▲
          </button>
          <button type="button" aria-label="Move down" disabled={busy || index === count - 1} onClick={() => act(() => moveFaq(record.id, "down"), onList, "Moved down.")} className="min-h-11 min-w-11 rounded-lg border border-neutral-300 disabled:opacity-40">
            ▼
          </button>
        </div>
      </div>

      <label className="mt-3 block text-sm font-medium">
        Question
        <input value={fields.question} maxLength={300} onChange={(event) => setFields({ ...fields, question: event.target.value })} className={`${field} mt-1`} />
      </label>
      <label className="mt-3 block text-sm font-medium">
        Answer
        <textarea value={fields.answer} maxLength={4000} rows={5} onChange={(event) => setFields({ ...fields, answer: event.target.value })} className={`${field} mt-1 leading-relaxed`} />
        <span className="mt-1 block text-xs font-normal text-neutral-600">A blank line starts a new paragraph. Plain text only.</span>
      </label>
      <div className="mt-3 flex flex-wrap items-end gap-4">
        <label className="block text-sm font-medium">
          Category
          <select value={fields.category} onChange={(event) => setFields({ ...fields, category: event.target.value as FaqCategory })} className={`${field} mt-1`}>
            {faqCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={fields.showOnHome} onChange={(event) => setFields({ ...fields, showOnHome: event.target.checked })} className="h-5 w-5" />
          Show on the home page
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => act(() => saveFaqDraft(record.id, fields), take, "Draft saved. The website has not changed.")} className={button}>
          Save draft
        </button>
        <button type="button" disabled={busy} onClick={() => act(() => publishFaq(record.id, fields), take, "Published. It is on the website now.")} className="min-h-11 rounded-lg bg-[#2f6fed] px-4 text-sm font-medium text-white disabled:opacity-50">
          {record.status === "published" ? "Publish changes" : "Publish"}
        </button>
        <button type="button" onClick={() => setPreview((value) => !value)} aria-pressed={preview} className={button}>
          {preview ? "Hide preview" : "Preview"}
        </button>
        {record.status === "published" ? (
          <button type="button" disabled={busy} onClick={() => act(() => unpublishFaq(record.id), take, "Taken down from the website.")} className={button}>
            Unpublish
          </button>
        ) : null}
        {record.draft ? (
          <button type="button" disabled={busy} onClick={() => act(() => discardFaqDraft(record.id), take, "Draft discarded.")} className={button}>
            Discard changes
          </button>
        ) : null}
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            if (window.confirm("Delete this question for good? This can't be undone.")) void act(() => deleteFaq(record.id), () => onRemove(record.id), "Deleted.");
          }}
          className="min-h-11 rounded-lg border border-red-300 px-4 text-sm font-medium text-red-800 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
      {dirty ? <p className="mt-2 text-xs text-amber-800">You have changes that are not saved yet.</p> : null}
      {message ? (
        <p role={message.error ? "alert" : "status"} className={`mt-2 text-sm ${message.error ? "text-red-700" : "text-emerald-800"}`}>
          {message.text}
        </p>
      ) : null}
      {preview ? (
        <div className="mt-4 rounded-xl bg-[#ebe6db] p-4">
          <p className="mb-3 text-xs text-neutral-700">How it will look on the website (this is the version you have typed above):</p>
          <FaqAccordion groups={[{ items: [{ id: record.id, question: fields.question || "(no question yet)", answer: fields.answer || "(no answer yet)" }] }]} />
        </div>
      ) : null}
    </li>
  );
}

/** The owner's FAQ screen: add, edit, reorder, choose home-page questions, save drafts, publish. */
export function FaqManager({ initial }: { initial: FaqRecord[] }) {
  const [records, setRecords] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const onHome = records.filter((item) => (item.draft ?? item.live).showOnHome && item.status === "published").length;

  async function run<T>(task: () => Promise<ContentResult<T>>, done: (data: T) => void, success: string) {
    setBusy(true);
    setMessage(null);
    const result = await task();
    setBusy(false);
    if (!result.ok) return setMessage({ text: result.error, error: true });
    done(result.data);
    setMessage({ text: success });
  }

  return (
    <div>
      <p className="text-sm text-neutral-700">
        Questions you save stay private until you press <strong>Publish</strong>. The home page shows the first {HOME_FAQ_LIMIT} live questions marked &ldquo;Show on the home page&rdquo; (currently {onHome});
        the FAQ page shows every live question.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => run(() => createFaq(), (record) => setRecords((current) => [...current, record]), "New question added at the end.")} className="min-h-11 rounded-lg bg-[#2f6fed] px-4 text-sm font-medium text-white disabled:opacity-50">
          Add a question
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            if (window.confirm("Publish every question that is not live yet, and every saved edit?")) void run(() => publishAllFaqs(), setRecords, "Everything is published.");
          }}
          className={button}
        >
          Publish everything
        </button>
        <a href="/faq" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-lg border border-neutral-300 px-4 text-sm font-medium">
          View the FAQ page ↗
        </a>
      </div>
      {message ? (
        <p role={message.error ? "alert" : "status"} className={`mt-3 text-sm ${message.error ? "text-red-700" : "text-emerald-800"}`}>
          {message.text}
        </p>
      ) : null}
      {records.length === 0 ? <p className="mt-6 rounded-2xl bg-white p-5 text-neutral-700 shadow-sm">No questions yet. Add the first one.</p> : null}
      <ul className="mt-6 space-y-3">
        {records.map((record, index) => (
          <Item
            key={`${record.id}-${record.sortOrder}`}
            record={record}
            index={index}
            count={records.length}
            onChange={(next) => setRecords((current) => current.map((item) => (item.id === next.id ? next : item)))}
            onList={setRecords}
            onRemove={(id) => setRecords((current) => current.filter((item) => item.id !== id))}
          />
        ))}
      </ul>
    </div>
  );
}
