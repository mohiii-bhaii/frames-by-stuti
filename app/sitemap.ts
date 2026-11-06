import type { MetadataRoute } from "next";
import { seoPages } from "@/content/seo";
import { siteUrl } from "@/content/site";

/**
 * Every public, indexable page on the canonical domain. The list is the same one that supplies each
 * page's Google title and description, so a new page added there is in the sitemap automatically.
 * (No "last modified" dates: they would only be guesses.)
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return seoPages.map((page) => ({
    url: `${siteUrl}${page.path}`,
    changeFrequency: page.page === "home" ? "weekly" : "monthly",
    priority: page.page === "home" ? 1 : page.path.startsWith("/pricing/") ? 0.7 : 0.8,
  }));
}
