"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useIsEditingText, useText } from "@/components/site-texts-provider";
import { pricingHrefForSession } from "@/content/pricing";
import { sessionTypeForLabel } from "@/lib/inquiry";

/**
 * A home page card that opens the matching Pricing & Packages page. The card's
 * name is editable, so the page is found from the name the card has right now
 * (for example "Newborn" opens the Newborn page). A card with no page of its
 * own opens the Pricing & Packages overview. The inquiry button on each pricing
 * page is what leads on to the Contact form.
 *
 * In the editor's edit mode the card does not navigate, so its photo and title
 * can be edited. Everywhere else (preview and the public site) it does.
 */
export function SessionLink({ categoryId, className, children }: { categoryId: string; className?: string; children: ReactNode }) {
  const session = sessionTypeForLabel(useText(`category.${categoryId}`));
  const editing = useIsEditingText();
  return (
    <Link
      href={pricingHrefForSession(session)}
      className={className}
      onClick={editing ? (event) => event.preventDefault() : undefined}
    >
      {children}
    </Link>
  );
}
