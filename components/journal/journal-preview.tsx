import Link from "next/link";
import { T } from "@/components/editable-text";
import { PostCard } from "@/components/journal/post-card";
import { getPublishedPosts } from "@/lib/journal";
import { getPublishedTexts } from "@/lib/site-texts";
import { textDefaults } from "@/content/texts";

/** The home page's Journal section: the three newest published articles. Hidden while there are none. */
export async function JournalPreview() {
  const [posts, texts] = await Promise.all([getPublishedPosts(), getPublishedTexts()]);
  const latest = posts.slice(0, 3);
  if (latest.length === 0) return null;
  const readMore = texts["blog.readmore"] ?? textDefaults["blog.readmore"];
  return (
    <section className="paper relative overflow-x-clip">
      <div className="mx-auto max-w-[1200px] px-6 pb-16 pt-6 md:pb-24 lg:px-[45px]">
        <div className="mx-auto max-w-[680px] text-center">
          <T as="p" id="home.journal.eyebrow" data-reveal="up" className="eyebrow text-[12px] tracking-[0.3em] text-terracotta" />
          <T
            as="h2"
            id="home.journal.heading"
            data-reveal="title"
            className="display mt-4 text-[clamp(30px,9vw,44px)] normal-case leading-[1.08] text-espresso md:text-[58px]"
          />
          <T as="p" id="home.journal.subtitle" data-reveal="up" className="mx-auto mt-5 max-w-[500px] text-[15.5px] leading-[1.8] text-walnut lg:text-[17px]" />
        </div>
        <ul className="mt-12 grid grid-cols-1 gap-x-7 gap-y-14 md:mt-16 md:grid-cols-2 lg:grid-cols-3">
          {latest.map((post, index) => (
            <li key={post.id} data-reveal="up" className={index === 2 ? "md:col-span-2 md:mx-auto md:w-[calc(50%-14px)] lg:col-span-1 lg:w-auto" : undefined}>
              <PostCard post={post} readMore={readMore} />
            </li>
          ))}
        </ul>
        <div data-reveal="up" className="mt-14 flex justify-center">
          <Link href="/blog" className="btn">
            <T id="home.journal.button" />
          </Link>
        </div>
      </div>
    </section>
  );
}
