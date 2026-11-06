import Image from "next/image";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { mediaUrl } from "@/lib/supabase/config";

/**
 * Article text is stored as plain text with a few simple marks, and turned into page elements here.
 * It is never treated as HTML, so nothing typed into an article can add a script or markup:
 *
 *   ## Heading     ### Smaller heading     - list item     1. numbered item     > quote     ---
 *   **bold**   *italic*   [link text](/contact)   ![describe the photo](photo-address)
 *
 * Links may go to this site ("/..."), to https:// addresses, or be mailto:/tel:. Photos must come from
 * the site's own photo library. Anything else is shown as plain text.
 */

const SAFE_LINK = /^(\/(?!\/)[^\s]*|#[^\s]*|https?:\/\/[^\s]+|mailto:[^\s]+|tel:[+\d\s().-]+)$/i;

function safeHref(url: string) {
  return SAFE_LINK.test(url.trim()) ? url.trim() : null;
}

/** Photos must be from the site's own library (or a site image), and may carry their size as #1600x1067. */
function safeImage(url: string) {
  const [address, size] = url.trim().split("#");
  const library = mediaUrl("");
  const ok = address.startsWith("/images/") || (library.includes("/storage/") && address.startsWith(library));
  if (!ok) return null;
  const match = size?.match(/^(\d{2,5})x(\d{2,5})$/);
  return { src: address, width: match ? Number(match[1]) : 1600, height: match ? Number(match[2]) : 1067 };
}

const INLINE = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|_[^_\n]+_|\[[^\]\n]+\]\([^)\s]+\))/g;

function inline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(INLINE).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return <strong key={key}>{inline(part.slice(2, -2), key)}</strong>;
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return <em key={key}>{inline(part.slice(1, -1), key)}</em>;
    if (part.startsWith("_") && part.endsWith("_") && part.length > 2) return <em key={key}>{inline(part.slice(1, -1), key)}</em>;
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      const href = safeHref(link[2]);
      if (!href) return <Fragment key={key}>{link[1]}</Fragment>;
      const className = "text-rust underline decoration-terracotta/60 underline-offset-4 transition-colors hover:text-terracotta";
      if (href.startsWith("/") || href.startsWith("#")) {
        return (
          <Link key={key} href={href} className={className}>
            {link[1]}
          </Link>
        );
      }
      return (
        <a key={key} href={href} className={className} rel="noopener noreferrer" target={href.startsWith("http") ? "_blank" : undefined}>
          {link[1]}
        </a>
      );
    }
    // Single line breaks inside a paragraph stay line breaks.
    return part.split("\n").map((line, lineIndex) => (
      <Fragment key={`${key}-${lineIndex}`}>
        {lineIndex > 0 ? <br /> : null}
        {line}
      </Fragment>
    ));
  });
}

/** The article body as styled elements. Pass the stored text exactly as saved. */
export function ArticleBody({ source }: { source: string }) {
  const blocks = source.replace(/\r\n?/g, "\n").split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
  return (
    <div className="journal-body">
      {blocks.map((block, index) => {
        const key = `b${index}`;
        const heading = block.match(/^(#{1,3})\s+([\s\S]+)$/);
        if (heading) {
          const level = heading[1].length >= 3 ? 3 : 2;
          const text = heading[2].replace(/\n/g, " ");
          return level === 2 ? (
            <h2 key={key} className="display mt-12 text-[28px] leading-[1.15] text-espresso md:text-[34px]">
              {inline(text, key)}
            </h2>
          ) : (
            <h3 key={key} className="display mt-9 text-[22px] leading-[1.2] text-espresso md:text-[26px]">
              {inline(text, key)}
            </h3>
          );
        }
        if (/^---+$/.test(block)) return <hr key={key} className="my-10 border-terracotta/30" />;
        const image = block.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
        if (image) {
          const safe = safeImage(image[2]);
          if (!safe) return null;
          return (
            <figure key={key} className="my-9">
              <Image
                src={safe.src}
                alt={image[1]}
                width={safe.width}
                height={safe.height}
                sizes="(min-width: 48rem) 720px, 100vw"
                quality={85}
                className="h-auto w-full rounded-[12px]"
              />
            </figure>
          );
        }
        if (/^>\s/.test(block)) {
          return (
            <blockquote key={key} className="my-8 border-l border-terracotta/60 pl-5 text-[19px] italic leading-[1.7] text-walnut">
              {inline(block.replace(/^>\s?/gm, "").trim(), key)}
            </blockquote>
          );
        }
        const lines = block.split("\n");
        if (lines.every((line) => /^[-*]\s+/.test(line))) {
          return (
            <ul key={key} className="my-6 list-disc space-y-2 pl-6 marker:text-terracotta">
              {lines.map((line, i) => (
                <li key={i}>{inline(line.replace(/^[-*]\s+/, ""), `${key}-${i}`)}</li>
              ))}
            </ul>
          );
        }
        if (lines.every((line) => /^\d+[.)]\s+/.test(line))) {
          return (
            <ol key={key} className="my-6 list-decimal space-y-2 pl-6 marker:text-terracotta">
              {lines.map((line, i) => (
                <li key={i}>{inline(line.replace(/^\d+[.)]\s+/, ""), `${key}-${i}`)}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={key} className="my-5">
            {inline(block, key)}
          </p>
        );
      })}
    </div>
  );
}
