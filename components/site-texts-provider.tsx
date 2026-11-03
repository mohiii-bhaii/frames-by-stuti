"use client";

import { createContext, use, type ReactNode } from "react";
import { textDefaults } from "@/content/texts";
import { useEditorStore } from "@/lib/editor-store";
import type { TextMap } from "@/lib/site-texts";

const PublishedTexts = createContext<TextMap>({});

/** Shares the published website text with every editable element on the page. */
export function SiteTextsProvider({ texts, children }: { texts: TextMap; children: ReactNode }) {
  return <PublishedTexts value={texts}>{children}</PublishedTexts>;
}

/**
 * What a piece of text should say right now: the editor's working copy while
 * editing, otherwise the published wording, otherwise the original.
 */
export function useText(key: string): string {
  const published = use(PublishedTexts)[key];
  // null means the editor is showing the original wording on purpose.
  const editing = useEditorStore((current) => (current.active ? current.textDisplay[key] : undefined));
  if (editing !== undefined) return editing ?? textDefaults[key];
  return published ?? textDefaults[key];
}

export function useIsEditingText() {
  return useEditorStore((current) => current.active && current.mode === "edit");
}
