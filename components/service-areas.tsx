"use client";

import { T } from "@/components/editable-text";
import { useIsEditingText, useTexts } from "@/components/site-texts-provider";
import { areaKeys } from "@/content/texts";

/**
 * The footer's service areas, joined with " | ". Each one is its own editable
 * text. An area that is emptied disappears along with its separator, so there
 * are never stray bars. While the owner is editing, empty areas show as faint
 * "Add area" buttons so they can be filled in again.
 */
export function ServiceAreas({ className }: { className?: string }) {
  const editing = useIsEditingText();
  const values = useTexts(areaKeys);
  const shown = areaKeys.filter((_, index) => editing || values[index].trim() !== "");
  if (shown.length === 0) return null;
  return (
    <p className={className}>
      {shown.map((key, position) => {
        const empty = values[areaKeys.indexOf(key)].trim() === "";
        return (
          <span key={key}>
            {position > 0 ? (
              <>
                {" "}
                <span aria-hidden="true">|</span>{" "}
              </>
            ) : null}
            <T id={key} emptyLabel={`+ Add area ${areaKeys.indexOf(key) + 1}`} className={empty ? "opacity-50" : undefined} />
          </span>
        );
      })}
    </p>
  );
}
