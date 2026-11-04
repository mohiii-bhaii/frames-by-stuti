"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { T } from "@/components/editable-text";
import { Photo } from "@/components/photo";
import { useIsEditingText, useTexts } from "@/components/site-texts-provider";
import { inquiryHref, tierFields, tierKey, tierNumbers, type PricingKind, type TierField } from "@/content/pricing";
import type { ImageSlot } from "@/lib/images";

type Values = Record<TierField, string>;

const hasText = (value: string) => value.trim() !== "";

/**
 * A list of lines, with a small diamond before each. A line that starts with
 * "-" is an indented sub-item of the line above it.
 */
function LineList({ text }: { text: string }) {
  const lines = text.split("\n").map((line) => line.trimEnd()).filter((line) => line.trim() !== "");
  return (
    <ul className="mx-auto mt-4 max-w-[560px] space-y-2 text-left text-[15px] text-walnut lg:text-[16px]">
      {lines.map((line, index) => {
        const sub = /^\s*[-–]\s*/.test(line);
        return (
          <li key={index} className={`flex gap-3 ${sub ? "ml-7" : ""}`}>
            <span
              aria-hidden="true"
              className={`mt-[9px] shrink-0 ${sub ? "h-[6px] w-[6px] rounded-full border border-terracotta" : "h-[5px] w-[5px] rotate-45 bg-terracotta"}`}
            />
            <span>{line.replace(/^\s*[-–]\s*/, "")}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** One optional field. Empty fields are hidden from visitors and shown as a prompt in the editor. */
function Field({
  slug,
  n,
  field,
  value,
  editing,
  emptyLabel,
  className = "text-[15px] text-walnut lg:text-[16px]",
  list,
  label,
  italic,
}: {
  slug: string;
  n: number;
  field: TierField;
  value: string;
  editing: boolean;
  emptyLabel: string;
  className?: string;
  list?: boolean;
  label?: string;
  italic?: boolean;
}) {
  if (!hasText(value) && !editing) return null;
  return (
    <div className="mt-6">
      {label ? <T as="p" id={label} className="eyebrow text-[12px] text-rust" /> : null}
      {list && !editing ? (
        <LineList text={value} />
      ) : (
        <T as="p" id={tierKey(slug, n, field)} emptyLabel={emptyLabel} className={`${label ? "mt-2" : ""} ${italic ? "italic" : ""} ${className}`} />
      )}
    </div>
  );
}

/**
 * The packages of one category, stacked one under another. Each has its own
 * photo, name, price, details, inclusions, savings, footnotes and inquiry
 * button. A package with no name is hidden from visitors (and shown dimmed in
 * the editor so it can be filled in). A package with no price says "Inquire
 * for pricing". If no package is published at all, a short message is shown.
 */
export function PricingTiers({ slug, kind, session }: { slug: string; kind: PricingKind; session: string }) {
  const editing = useIsEditingText();
  const keys = tierNumbers.flatMap((n) => tierFields.map((field) => tierKey(slug, n, field)));
  const flat = useTexts(keys);
  const tiers = tierNumbers.map((n, index) => {
    const values = {} as Values;
    tierFields.forEach((field, fieldIndex) => {
      values[field] = flat[index * tierFields.length + fieldIndex];
    });
    return { n, values };
  });
  const visible = tiers.filter((tier) => editing || hasText(tier.values.name));

  if (visible.length === 0) {
    return <T as="p" id={`pricing.${slug}.empty`} className="mx-auto max-w-[560px] text-center text-[16px] text-walnut" />;
  }

  return (
    <ol className="mx-auto max-w-[760px] space-y-20 lg:space-y-28">
      {visible.map(({ n, values }) => {
        const hidden = !hasText(values.name);
        return (
          <li key={n} className={`text-center ${hidden ? "opacity-60" : ""}`}>
            <div data-reveal="up" className="rounded-[14px] border border-terracotta/40 bg-cream p-2 shadow-[0_24px_40px_-32px_rgb(53_48_38/0.5)] md:p-3">
              <div className="overflow-hidden rounded-[8px]">
                <Photo slot={`pricing-${slug}-banner-${n}` as ImageSlot} className="aspect-[16/10] w-full" sizes="(min-width: 48rem) 760px, 92vw" />
              </div>
              {hasText(values.caption) || editing ? (
                <T
                  as="p"
                  id={tierKey(slug, n, "caption")}
                  emptyLabel="Click to add a caption under the photo"
                  className="eyebrow px-2 pb-1 pt-3 text-[13px] tracking-[0.3em] text-walnut md:pt-4 md:text-[16px]"
                />
              ) : null}
            </div>

            <T
              as="h3"
              id={tierKey(slug, n, "name")}
              data-reveal="up"
              emptyLabel={`Package ${n}: click to add a name (a package without a name is hidden)`}
              className="display mt-10 text-[28px] tracking-[0.06em] text-rust lg:text-[38px]"
            />
            <div className="mt-3">
              {hasText(values.price) || editing ? (
                <T
                  as="p"
                  id={tierKey(slug, n, "price")}
                  emptyLabel="Click to add a price (empty shows “Inquire for pricing”)"
                  className="script text-[32px] text-terracotta lg:text-[40px]"
                />
              ) : (
                <T as="p" id={`pricing.${slug}.priceEmpty`} className="script text-[26px] text-terracotta lg:text-[32px]" />
              )}
            </div>

            <Field slug={slug} n={n} field="details" value={values.details} editing={editing} emptyLabel="Click to add a description" />
            {kind === "bundle" ? (
              <>
                <Field slug={slug} n={n} field="sessions" value={values.sessions} editing={editing} label="pricing.label.sessions" emptyLabel="Click to add the sessions included, one per line" list />
                <Field slug={slug} n={n} field="individual" value={values.individual} editing={editing} label="pricing.label.individual" emptyLabel="Click to add individual prices" />
              </>
            ) : (
              <Field slug={slug} n={n} field="duration" value={values.duration} editing={editing} label="pricing.label.duration" emptyLabel="Click to add the session length" />
            )}
            <Field slug={slug} n={n} field="includes" value={values.includes} editing={editing} label="pricing.label.includes" emptyLabel="Click to add what's included, one item per line (start a line with - for a sub-item)" list />
            {kind !== "bundle" ? (
              <Field slug={slug} n={n} field="location" value={values.location} editing={editing} label="pricing.label.location" emptyLabel="Click to add outfit and location information" />
            ) : null}
            {hasText(values.savings) || editing ? (
              <p className="mt-6 italic text-walnut">
                <T id="pricing.label.savings" /> <T id={tierKey(slug, n, "savings")} emptyLabel="Click to add the savings" />
              </p>
            ) : null}
            <Field slug={slug} n={n} field="note" value={values.note} editing={editing} emptyLabel="Click to add footnotes" className="text-[14px] italic text-walnut/90 lg:text-[15px]" italic />

            <div className="mt-9 flex justify-center">
              <Link href={inquiryHref(session, values.name)} className="btn" style={{ "--reveal-delay": "0s" } as CSSProperties}>
                <T id={`pricing.${slug}.tier.button`} plain />
              </Link>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
