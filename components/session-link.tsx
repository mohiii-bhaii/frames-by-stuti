"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useText } from "@/components/site-texts-provider";
import { sessionTypeForLabel } from "@/lib/inquiry";

/**
 * A home page card that opens the Contact form with its session type already
 * chosen. The card's name is editable, so the session is found from the name
 * the card has right now (for example "Cake Smash" selects Cake Smash).
 */
export function SessionLink({ categoryId, className, children }: { categoryId: string; className?: string; children: ReactNode }) {
  const session = sessionTypeForLabel(useText(`category.${categoryId}`));
  return (
    <Link href={`/contact${session ? `?session=${session}` : ""}#inquiry`} className={className}>
      {children}
    </Link>
  );
}
