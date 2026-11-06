import type { MetadataRoute } from "next";
import { seoPages } from "@/content/seo";
import { siteUrl } from "@/content/site";
import { getPublishedFaqs, getPublishedPosts } from "@/lib/journal";

/**
 * Every public, indexable page on the canonical domain. The list is the same one that supplies each
 * page's Google title and description, so a new page added there is in the sitemap automatically.
 * The FAQ and Journal pages are listed only once something is published there, and each published
 * article is listed with its real last-changed date. Drafts and unpublished content never appear.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [faqs, posts] = await Promise.all([getPublishedFaqs(), getPublishedPosts()]);
  const pages = seoPages
    .filter((page) => (page.page === "faq" ? faqs.length > 0 : page.page === "blog" ? posts.length > 0 : true))
    .map((page) => ({
      url: `${siteUrl}${page.path}`,
      changeFrequency: (page.page === "home" ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: page.page === "home" ? 1 : page.path.startsWith("/pricing/") ? 0.7 : 0.8,
    }));
  const articles = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    ...(post.publishedAt ? { lastModified: new Date(post.publishedAt) } : {}),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  return [...pages, ...articles];
}
