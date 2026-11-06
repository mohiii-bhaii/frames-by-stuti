import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/site";

/** Search engines may crawl the public site; the owner's editor is private. */
export default function robots(): MetadataRoute.Robots {
  return {
    // Googlebot is named so it is plain that it is welcome; every other crawler gets the same rule.
    rules: [
      { userAgent: "Googlebot", allow: "/", disallow: ["/admin", "/admin/"] },
      { userAgent: "*", allow: "/", disallow: ["/admin", "/admin/"] },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
