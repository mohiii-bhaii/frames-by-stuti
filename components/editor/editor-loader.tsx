"use client";

import dynamic from "next/dynamic";

// Only admins in edit mode ever download the editor's code.
const EditorRoot = dynamic(() => import("@/components/editor/editor-root"), { ssr: false });

export function EditorLoader() {
  return <EditorRoot />;
}
