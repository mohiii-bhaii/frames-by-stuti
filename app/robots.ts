import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/site";

/** Search engines may crawl the public site; the owner's editor is private. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/admin/"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
