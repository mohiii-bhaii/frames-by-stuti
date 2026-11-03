"use client";

import { useSyncExternalStore } from "react";
import type { ImageMap } from "@/lib/cms";
import type { SlotId } from "@/lib/images";

/**
 * A tiny shared store connecting the page's photographs to the visual editor.
 *
 * Public visitors never load the editor, so `active` stays false and every
 * photo renders exactly as published. When an admin opens the editor it sets
 * `active`, pushes the images it wants shown (unsaved and draft changes), and
 * listens for photos being selected.
 */
export type EditorMode = "edit" | "preview";

/** Measured when a photo is picked, so the crop tool can match its frame. */
export type SelectedFrame = { slot: SlotId; aspect: number; defaultPosition?: string };

type EditorState = {
  active: boolean;
  mode: EditorMode;
  selected: SelectedFrame | null;
  display: ImageMap;
  /** Slots currently on the page, with a count because a photo can appear more than once. */
  mounted: Partial<Record<SlotId, number>>;
  /** The editor's working text by key. null shows the original wording; a missing key shows what is published. */
  textDisplay: Record<string, string | null>;
  /** The text being edited in the text panel. */
  selectedText: string | null;
};

const initialState: EditorState = {
  active: false,
  mode: "edit",
  selected: null,
  display: {},
  mounted: {},
  textDisplay: {},
  selectedText: null,
};

let state = initialState;
const listeners = new Set<() => void>();

function setState(patch: Partial<EditorState>) {
  state = { ...state, ...patch };
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useEditorStore<T>(selector: (current: EditorState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(initialState),
  );
}

export const editorStore = {
  get: () => state,
  subscribe,
  activate: () => setState({ active: true }),
  deactivate: () => setState({ ...initialState, mounted: state.mounted }),
  setMode: (mode: EditorMode) =>
    setState({ mode, selected: mode === "preview" ? null : state.selected, selectedText: mode === "preview" ? null : state.selectedText }),
  setDisplay: (display: ImageMap) => setState({ display }),
  select: (selected: SelectedFrame | null) => setState({ selected, selectedText: selected ? null : state.selectedText }),
  setTextDisplay: (textDisplay: Record<string, string | null>) => setState({ textDisplay }),
  selectText: (selectedText: string | null) => setState({ selectedText, selected: selectedText ? null : state.selected }),
  register(slot: SlotId) {
    setState({ mounted: { ...state.mounted, [slot]: (state.mounted[slot] ?? 0) + 1 } });
    return () => {
      const count = (state.mounted[slot] ?? 1) - 1;
      const mounted = { ...state.mounted };
      if (count > 0) mounted[slot] = count;
      else delete mounted[slot];
      setState({ mounted });
    };
  },
};
