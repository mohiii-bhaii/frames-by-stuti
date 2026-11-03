"use client";

import { useEffect, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";
import { editorStore, useEditorStore } from "@/lib/editor-store";
import { slotLabel, type SlotId } from "@/lib/images";

type EditHandleProps = {
  slot: SlotId;
  /** The layout's own crop position, used as the starting focal point. */
  defaultPosition?: string;
  label?: string;
};

/** Lists a photo in the editor's "Photos on this page", including ones hidden at this screen size. */
export function useRegisterSlot(slot: SlotId) {
  const active = useEditorStore((current) => current.active);
  useEffect(() => (active ? editorStore.register(slot) : undefined), [active, slot]);
}

/**
 * The Replace button and selection outline drawn over a photo in edit mode.
 * Both are absolutely positioned inside the photo's frame, so they never move
 * or resize anything on the page. Renders nothing for public visitors.
 */
export function EditHandle({ slot, defaultPosition, label = "Replace photo" }: EditHandleProps) {
  const editing = useEditorStore((current) => current.active && current.mode === "edit");
  const selected = useEditorStore((current) => current.selected?.slot === slot);
  useRegisterSlot(slot);

  if (!editing) return null;

  const open = (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
    // Photos often sit inside links and buttons. Editing must not follow them.
    event.preventDefault();
    event.stopPropagation();
    const frame = event.currentTarget.parentElement?.getBoundingClientRect();
    const aspect = frame && frame.height > 0 ? frame.width / frame.height : 1;
    editorStore.select({ slot, aspect, defaultPosition });
  };
  const stop = (event: PointerEvent<HTMLElement>) => event.stopPropagation();

  return (
    <>
      {selected ? <span aria-hidden="true" className="cms-outline" /> : null}
      {/* A span, because photos are often already inside a link or button. */}
      <span
        role="button"
        tabIndex={0}
        aria-label={`${label}: ${slotLabel(slot)}`}
        data-selected={selected || undefined}
        className="cms-handle"
        onClick={open}
        onPointerDown={stop}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") open(event);
        }}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.800">
          <path d="M4 7h3l2-3h6l2 3h3v13H4z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        <span>{label}</span>
      </span>
    </>
  );
}
