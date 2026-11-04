"use client";

import Link from "next/link";
import { T } from "@/components/editable-text";
import { useIsEditingText, useTexts } from "@/components/site-texts-provider";
import { inquiryHref, tierFields, tierKey, tierNumbers, type PricingKind, type TierField } from "@/content/pricing";

type Values = Record<TierField, string>;

const hasText = (value: string) => value.trim() !== "";

/** A list of lines such as inclusions, with a small diamond before each. */
function LineList({ text }: { text: string }) {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  return (
    <ul className="mt-3 space-y-2 text-[15px] text-walnut">
      {lines.map((line, index) => (
        <li key={index} className="flex gap-3">
          <span aria-hidden="true" className="mt-[9px] h-[5px] w-[5px] shrink-0 rotate-45 bg-terracotta" />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

function Field({
  slug,
  n,
  field,
  value,
  editing,
  label,
  emptyLabel,
  className,
  list,
}: {
  slug: string;
  n: number;
  field: TierField;
  value: string;
  editing: boolean;
  label?: string;
  emptyLabel: string;
  className?: string;
  list?: boolean;
}) {
  if (!hasText(value) && !editing) return null;
  const key = tierKey(slug, n, field);
  return (
    <div className="mt-6">
      {label ? <T as="p" id={label} className="eyebrow text-[12px] text-rust" /> : null}
      {list && !editing ? (
        <LineList text={value} />
      ) : (
        <T as="p" id={key} emptyLabel={emptyLabel} className={className ?? "mt-2 text-[15px] text-walnut"} />
      )}
    </div>
  );
}

/**
 * The packages of one category. A package with no name is hidden from visitors
 * (and shown dimmed in the editor so it can be filled in). A package with no
 * price says "Inquire for pricing". If no package is published at all, a short
 * message and the inquiry button are shown instead.
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
    <ul className="mx-auto grid max-w-[1100px] gap-6 md:grid-cols-2 lg:gap-8">
      {visible.map(({ n, values }, index) => {
        const hidden = !hasText(values.name);
        return (
          <li
            key={n}
            data-reveal="up"
            style={{ "--reveal-delay": `${(index % 2) * 0.12}s` } as React.CSSProperties}
            className={`flex flex-col rounded-[28px] border border-terracotta/60 bg-cream/70 p-7 text-center shadow-[0_24px_40px_-32px_rgb(53_48_38/0.5)] md:p-9 md:text-left ${
              hidden ? "opacity-60" : ""
            }`}
          >
            <T
              as="h3"
              id={tierKey(slug, n, "name")}
              emptyLabel={`Package ${n}: click to add a name (a package without a name is hidden)`}
              className="display text-[28px] text-rust lg:text-[34px]"
            />
            <div className="mt-3">
              {hasText(values.price) || editing ? (
                <T
                  as="p"
                  id={tierKey(slug, n, "price")}
                  emptyLabel="Click to add a price (empty shows “Inquire for pricing”)"
                  className="script text-[30px] text-terracotta lg:text-[36px]"
                />
              ) : (
                <T as="p" id={`pricing.${slug}.priceEmpty`} className="script text-[26px] text-terracotta lg:text-[30px]" />
              )}
            </div>

            <Field slug={slug} n={n} field="details" value={values.details} editing={editing} emptyLabel="Click to add a description" />
            {kind === "bundle" ? (
              <>
                <Field slug={slug} n={n} field="sessions" value={values.sessions} editing={editing} label="pricing.label.sessions" emptyLabel="Click to add the sessions included" list />
                <Field slug={slug} n={n} field="individual" value={values.individual} editing={editing} label="pricing.label.individual" emptyLabel="Click to add individual prices" />
                <Field slug={slug} n={n} field="savings" value={values.savings} editing={editing} label="pricing.label.savings" emptyLabel="Click to add the savings" />
              </>
            ) : (
              <Field slug={slug} n={n} field="duration" value={values.duration} editing={editing} label="pricing.label.duration" emptyLabel="Click to add the session length" />
            )}
            <Field slug={slug} n={n} field="includes" value={values.includes} editing={editing} label="pricing.label.includes" emptyLabel="Click to add what's included, one item per line" list />
            {kind !== "bundle" ? (
              <Field slug={slug} n={n} field="location" value={values.location} editing={editing} label="pricing.label.location" emptyLabel="Click to add outfit and location information" />
            ) : null}

            <div className="mt-auto flex justify-center pt-8 md:justify-start">
              <Link href={inquiryHref(session, values.name)} className="btn">
                <T id={`pricing.${slug}.tier.button`} plain />
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
