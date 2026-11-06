import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/journal/article-view";
import { JsonLd } from "@/components/json-ld";
import { ScrollMotion } from "@/components/scroll-motion";
import { getPublishedPost, getPublishedPosts } from "@/lib/journal";
import { articleJsonLd, articleMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { getPublishedTexts } from "@/lib/site-texts";

/**
 * Published articles are built ahead of time. A new one is built the first time it is visited and
 * kept. (At least one address must be listed; the placeholder never matches an article and shows
 * "not found".)
 */
export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.length > 0 ? posts.map((post) => ({ slug: post.slug })) : [{ slug: "journal-placeholder" }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  return post ? articleMetadata(post) : { title: "Article not found", robots: { index: false } };
}

/**
 * `params` is read here, not behind a loading placeholder, so an address that is not a published
 * article answers with a real "not found" (404) and not a page that only looks empty.
 */
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, all, texts] = await Promise.all([getPublishedPost(slug), getPublishedPosts(), getPublishedTexts()]);
  if (!post) notFound();
  // More from the same category first, then the newest others, three in all.
  const others = all.filter((item) => item.slug !== post.slug);
  const related = [...others.filter((item) => item.category === post.category), ...others.filter((item) => item.category !== post.category)].slice(0, 3);
  return (
    <>
      <JsonLd data={articleJsonLd(post)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "The Journal", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      <ArticleView
        article={{ title: post.title, category: post.category, publishedAt: post.publishedAt, body: post.body, image: post.image }}
        related={related}
        texts={texts}
      />
      <ScrollMotion />
    </>
  );
}
