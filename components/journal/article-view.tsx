import Image from "next/image";
import Link from "next/link";
import { ApertureBloom } from "@/components/line-art";
import { PostCard, formatPostDate } from "@/components/journal/post-card";
import { journalCategoryLabel } from "@/content/journal";
import { textDefaults } from "@/content/texts";
import type { PublishedPostSummary } from "@/lib/journal";
import { ArticleBody } from "@/lib/markdown";

export type ArticleData = {
  title: string;
  category: string;
  publishedAt: string | null;
  body: string;
  image: { url: string; width: number; height: number; alt: string } | null;
  imageAlt?: string;
};

/**
 * One article, drawn the same way on the public site and in the owner's preview: a narrow, comfortable
 * column with the title, the featured photograph and the text, then a booking invitation and related
 * articles. Wording for the fixed labels comes from `texts` (the published, editable texts).
 */
export function ArticleView({ article, related = [], texts = {} }: { article: ArticleData; related?: PublishedPostSummary[]; texts?: Record<string, string> }) {
  const label = (key: string) => texts[key] ?? textDefaults[key] ?? "";
  return (
    <article>
      <div className="paper relative overflow-x-clip">
        <div className="mx-auto max-w-[760px] px-6 pb-8 pt-4 text-center lg:pt-10">
          <Link
            href="/blog"
            className="eyebrow inline-flex min-h-11 items-center gap-2 text-[12px] tracking-[0.2em] text-walnut transition-colors duration-500 hover:text-rust"
          >
            <span aria-hidden="true">«</span> {label("blog.back")}
          </Link>
          <p className="eyebrow mt-6 text-[12px] tracking-[0.28em] text-terracotta">
            {journalCategoryLabel(article.category)}
            {article.publishedAt ? <span className="text-walnut/70"> · {formatPostDate(article.publishedAt)}</span> : null}
          </p>
          <h1 className="display mt-4 text-[clamp(30px,8.4vw,44px)] normal-case leading-[1.1] text-espresso md:text-[56px]">{article.title}</h1>
          <ApertureBloom className="mx-auto mt-8 h-9 w-9 text-walnut/60" />
        </div>

        {article.image ? (
          <div className="mx-auto max-w-[1000px] px-6 pt-4">
            <Image
              src={article.image.url}
              alt={article.image.alt || article.title}
              width={article.image.width}
              height={article.image.height}
              quality={85}
              priority
              sizes="(min-width: 64rem) 1000px, 100vw"
              className="h-auto w-full rounded-[12px]"
            />
          </div>
        ) : null}

        <div className="mx-auto max-w-[720px] px-6 pb-16 pt-10 text-[16.5px] leading-[1.95] text-walnut md:text-[18px]">
          <ArticleBody source={article.body} />
        </div>
      </div>

      <section className="paper relative overflow-x-clip">
        <div className="mx-auto max-w-[640px] px-6 pb-16 pt-2 text-center">
          <h2 className="display text-[clamp(26px,7vw,34px)] normal-case leading-[1.1] text-espresso lg:text-[44px]">{label("blog.cta.heading")}</h2>
          <p className="mx-auto mt-5 max-w-[460px] text-[16px] leading-[1.8] text-walnut">{label("blog.cta.text")}</p>
          <Link href="/contact" className="btn mt-8">
            {label("blog.cta.button")}
          </Link>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="paper relative overflow-x-clip">
          <div className="mx-auto max-w-[1200px] px-6 pb-20 lg:px-[45px]">
            <h2 className="display text-center text-[clamp(26px,7vw,34px)] normal-case leading-[1.1] text-espresso lg:text-[44px]">{label("blog.related")}</h2>
            <ul className="mt-10 grid grid-cols-1 gap-x-7 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {related.map((post) => (
                <li key={post.id}>
                  <PostCard post={post} readMore={label("blog.readmore")} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </article>
  );
}
