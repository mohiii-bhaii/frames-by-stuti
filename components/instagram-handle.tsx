"use client";

import { T } from "@/components/editable-text";
import { useText } from "@/components/site-texts-provider";
import { instagramProfileUrl } from "@/lib/links";

/**
 * The Instagram username in the footer. It links to the profile once a real
 * username or profile link is set, and is plain text while it is still the
 * placeholder. Both the username and the link are editable.
 */
export function InstagramHandle({ className }: { className?: string }) {
  const href = instagramProfileUrl(useText("site.instagramHandle"), useText("site.instagramUrl"));
  return (
    <p className={className}>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-opacity duration-500 hover:opacity-60"
        >
          <T id="site.instagramHandle" />
        </a>
      ) : (
        <T id="site.instagramHandle" />
      )}
    </p>
  );
}
