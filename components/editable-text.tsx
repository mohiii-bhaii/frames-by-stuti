"use client";

import { createElement, Fragment, type HTMLAttributes, type KeyboardEvent, type MouseEvent } from "react";
import { CurvedText } from "@/components/curved-text";
import { useIsEditingText, useText } from "@/components/site-texts-provider";
import { editorStore, useEditorStore } from "@/lib/editor-store";

/** Line breaks the owner types are kept as line breaks. */
export function Lines({ text }: { text: string }) {
  return text.split("\n").map((line, index) => (
    <Fragment key={index}>
      {index > 0 ? <br /> : null}
      {line}
    </Fragment>
  ));
}

/**
 * Props that make an element open the text panel in edit mode. Outside edit
 * mode (including for every visitor) this adds nothing at all, so the markup,
 * styling and links are exactly what the page defines.
 */
function useTextEdit(id: string) {
  const editing = useIsEditingText();
  const selected = useEditorStore((current) => current.selectedText === id);
  if (!editing) return {};
  const open = (event: MouseEvent | KeyboardEvent) => {
    // Text often sits inside links and buttons. Editing must not follow them.
    event.preventDefault();
    event.stopPropagation();
    editorStore.selectText(id);
  };
  return {
    "data-cms-text": id,
    "data-selected": selected ? "" : undefined,
    tabIndex: 0,
    onClick: open,
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === "Enter") open(event);
    },
  };
}

type TextTag = "span" | "p" | "h1" | "h2" | "h3" | "h4" | "div" | "blockquote" | "figcaption" | "em" | "a" | "li";

type TextProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  /** The key in content/texts.ts. */
  id: string;
  as?: TextTag;
  /** Shows the text without making it clickable in the editor, for places the editor can't reach (such as the menu panel). */
  plain?: boolean;
};

/**
 * One piece of editable website text. It renders the element and classes the
 * page gives it, so typography, colour, spacing and animation stay with the
 * page. Only the words come from the editor and the database.
 */
export function T({ id, as = "span", plain = false, ...props }: TextProps) {
  const text = useText(id);
  const edit = useTextEdit(id);
  return createElement(as, { ...props, ...(plain ? null : edit) }, <Lines text={text} />);
}

/** Editable text set along an arc. */
export function CurvedT({ id, ...props }: { id: string } & Omit<React.ComponentProps<typeof CurvedText>, "text">) {
  const text = useText(id);
  const edit = useTextEdit(id);
  return <CurvedText text={text} {...props} {...edit} />;
}
