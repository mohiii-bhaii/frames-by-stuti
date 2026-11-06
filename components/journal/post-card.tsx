import Image from "next/image";
import Link from "next/link";
import { ApertureBloom } from "@/components/line-art";
import { journalCategoryLabel } from "@/content/journal";
import type { PublishedPostSummary } from "@/lib/journal";

const dateFormat = new Intl.DateTimeFormat("en-CA", { dateStyle: "long", timeZone: "America/Toronto" });
export const formatPostDate = (value: string | null) => (value ? dateFormat.format(new Date(value)) : "");

/**
 * One article in a list: its photograph (or a quiet placeholder if it has none), category, title,
 * a short excerpt and a Read more link. The whole card is the link.
 */
export function PostCard({
  post,
  readMore,
  showDate = false,
  priority = false,
}: {
  post: PublishedPostSummary;
  readMore: string;
  showDate?: boolean;
  priority?: boolean;
}) {
  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block">
        <span className="relative block aspect-[4/3] overflow-hidden rounded-[12px] bg-clay/60">
          {post.image ? (
            <Image
              src={post.image.url}
              alt={post.image.alt || `${post.title}, a Frames by Stuti Journal article`}
              fill
              quality={85}
              priority={priority}
              sizes="(min-width: 64rem) 384px, (min-width: 48rem) 45vw, 92vw"
              className="object-cover transition-[scale] duration-[1.4s] ease-[var(--ease-soft)] group-hover:scale-[1.04] motion-reduce:transition-none"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center">
              <ApertureBloom className="h-14 w-14 text-walnut/30" />
            </span>
          )}
        </span>
        <span className="eyebrow mt-5 block text-[11px] tracking-[0.26em] text-terracotta">
          {journalCategoryLabel(post.category)}
          {showDate && post.publishedAt ? <span className="text-walnut/70"> · {formatPostDate(post.publishedAt)}</span> : null}
        </span>
        <h3 style={{ textTransform: "none" }} className="display mt-2 text-[23px] leading-[1.22] text-espresso transition-colors duration-500 group-hover:text-rust md:text-[26px]">
          {post.title}
        </h3>
        {post.excerpt ? <p className="mt-3 line-clamp-3 text-[15px] leading-[1.75] text-walnut">{post.excerpt}</p> : null}
        <span className="eyebrow mt-4 inline-flex min-h-11 items-center text-[11px] tracking-[0.18em] text-rust underline decoration-terracotta/50 underline-offset-[7px]">
          {readMore} →
        </span>
      </Link>
    </article>
  );
}
