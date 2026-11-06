"use client";

import { useMemo, useState } from "react";
import { T } from "@/components/editable-text";
import { PostCard } from "@/components/journal/post-card";
import { JOURNAL_PAGE_SIZE, journalCategories } from "@/content/journal";
import type { PublishedPostSummary } from "@/lib/journal";
import { useText } from "@/components/site-texts-provider";

/**
 * The Journal's article grid with category filters and a Load more button. The featured article, if
 * there is one, is shown large on top while no filter is chosen.
 */
export function JournalGrid({ posts }: { posts: PublishedPostSummary[] }) {
  const [category, setCategory] = useState<string>("all");
  const [shown, setShown] = useState(JOURNAL_PAGE_SIZE);
  const readMore = useText("blog.readmore");
  const featuredLabel = useText("blog.featured");

  // Only categories that have articles get a filter.
  const used = useMemo(() => journalCategories.filter((item) => posts.some((post) => post.category === item.id)), [posts]);
  const featured = category === "all" ? posts.find((post) => post.featured) : undefined;
  const list = posts.filter((post) => (category === "all" || post.category === category) && post !== featured);
  const visible = list.slice(0, shown);

  return (
    <div>
      {used.length > 1 ? (
        <nav aria-label="Journal categories" className="mx-auto flex max-w-[860px] flex-wrap justify-center gap-x-3 gap-y-2">
          {[{ id: "all", label: null as string | null }, ...used].map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={category === item.id}
              onClick={() => {
                setCategory(item.id);
                setShown(JOURNAL_PAGE_SIZE);
              }}
              className="eyebrow min-h-11 rounded-full border border-terracotta/45 px-4 text-[11px] tracking-[0.2em] text-walnut transition-colors duration-500 hover:border-rust hover:text-rust aria-pressed:border-rust aria-pressed:bg-rust aria-pressed:text-cream"
            >
              {item.label ?? <T id="blog.all" plain />}
            </button>
          ))}
        </nav>
      ) : null}

      {featured ? (
        <div className="mx-auto mt-12 max-w-[1100px]">
          <p className="eyebrow mb-4 text-[11px] tracking-[0.3em] text-walnut/70">{featuredLabel}</p>
          <PostCard post={featured} readMore={readMore} showDate priority />
        </div>
      ) : null}

      <ul className="mx-auto mt-12 grid max-w-[1200px] grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((post, index) => (
          <li key={post.id}>
            <PostCard post={post} readMore={readMore} showDate priority={index < 2 && !featured} />
          </li>
        ))}
      </ul>

      {list.length > shown ? (
        <div className="mt-14 flex justify-center">
          <button type="button" onClick={() => setShown((count) => count + JOURNAL_PAGE_SIZE)} className="btn">
            <T id="blog.loadmore" plain />
          </button>
        </div>
      ) : null}
    </div>
  );
}
