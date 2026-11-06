import "server-only";
import type { Metadata } from "next";
import { seoKey, seoPages, type SeoPage } from "@/content/seo";
import { site, siteUrl } from "@/content/site";
import { instagramProfileUrl } from "@/lib/links";
import { getPublishedImages } from "@/lib/site-images";
import type { PublishedPost } from "@/lib/journal";
import { getPublishedTexts, type TextMap } from "@/lib/site-texts";

const textOr = (texts: TextMap, key: string, fallback: string) => (texts[key]?.trim() ? texts[key].trim() : fallback);

/** A photograph to show when a link is shared: the first of these that has a real, published photo. */
async function shareImage() {
  const images = await getPublishedImages();
  for (const slot of ["home-banner-2", "hero-1", "hero-2", "home-banner-1"] as const) {
    const image = images[slot];
    if (image?.src && /^https?:\/\//.test(image.src)) {
      // Served through the site's own image optimiser so the file is a sensible size for social apps.
      const width = 1200;
      const height = Math.round((width * image.height) / image.width);
      return { url: `${siteUrl}/_next/image?url=${encodeURIComponent(image.src)}&w=${width}&q=75`, width, height, alt: image.alt };
    }
  }
  return null;
}

/**
 * Title, description, canonical link and social-sharing details for one public page. The wording is
 * the editable "Google search" text for that page, read from the published texts, so a change made in
 * the visual editor and published reaches search engines on the next build or refresh of the page.
 */
export async function pageMetadata(page: SeoPage): Promise<Metadata> {
  const item = seoPages.find((entry) => entry.page === page)!;
  const [texts, image] = await Promise.all([getPublishedTexts(), shareImage()]);
  const title = textOr(texts, seoKey(page, "title"), item.title);
  const description = textOr(texts, seoKey(page, "description"), item.description);
  const isHome = page === "home";
  const shown = isHome ? `${title} | ${site.name}` : `${title} | ${site.name}`;
  return {
    title: isHome ? { absolute: shown } : title,
    description,
    // The home page is "/" on the domain; Google treats the address with and without the slash as one.
    alternates: { canonical: item.path === "/" ? `${siteUrl}/` : item.path },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: "en_CA",
      url: item.path === "/" ? `${siteUrl}/` : item.path,
      title: shown,
      description,
      images: image ? [{ url: image.url, width: image.width, height: image.height, alt: image.alt || `${site.name}, Ottawa photographer` }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: shown,
      description,
      images: image ? [image.url] : undefined,
    },
  };
}

const real = (value: string | undefined) => {
  const text = (value ?? "").trim();
  // Anything still in [square brackets], or the template's example address, is a placeholder, not a fact.
  return text && !text.includes("[") && !/example\.com/i.test(text) ? text : "";
};

/** Cities from the footer's editable "areas served" text ("| Ottawa | Gatineau | ..."). */
function serviceAreas(texts: TextMap) {
  const raw = [1, 2, 3, 4, 5].map((n) => texts[`site.area.${n}`] ?? "").join("|");
  const names = raw.split("|").map((name) => name.trim()).filter((name) => name && !name.includes("["));
  return [...new Set(names)];
}

/**
 * LocalBusiness structured data, built only from details the owner has published in the editor.
 * There is no street address (this is a service-area business), no rating, no hours and no prices.
 */
export async function localBusinessJsonLd() {
  const texts = await getPublishedTexts();
  const image = await shareImage();
  const location = real(texts["site.location"]);
  const [city, region] = location.split(",").map((part) => part.trim());
  const email = real(texts["site.email"]);
  const phone = real(texts["site.phone"]);
  const instagram = instagramProfileUrl(texts["site.instagramHandle"] ?? "", texts["site.instagramUrl"] ?? "");
  const facebook = (texts["site.facebookUrl"] ?? "").trim();
  const sameAs = [instagram, /^https?:\/\//.test(facebook) ? facebook : ""].filter(Boolean);
  const areas = serviceAreas(texts);
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl}/#business`,
    name: site.name,
    url: `${siteUrl}/`,
    description: textOr(texts, seoKey("home", "description"), seoPages[0].description),
    ...(image ? { image: image.url } : {}),
    ...(email ? { email } : {}),
    ...(phone ? { telephone: phone } : {}),
    ...(city
      ? { address: { "@type": "PostalAddress", addressLocality: city, ...(region ? { addressRegion: region === "Ontario" ? "ON" : region } : {}), addressCountry: "CA" } }
      : {}),
    ...(areas.length ? { areaServed: areas.map((name) => ({ "@type": "City", name })) } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

/** BreadcrumbList for a page: Home, then each step. Paths are absolute from the site root. */
export function breadcrumbJsonLd(steps: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...steps].map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      item: `${siteUrl}${step.path}`,
    })),
  };
}

/** Title, description, canonical link and share details for one Journal article. */
export function articleMetadata(post: PublishedPost): Metadata {
  const title = post.seoTitle.trim() || post.title;
  const description = post.seoDescription.trim() || post.excerpt;
  const path = `/blog/${post.slug}`;
  const image = post.image
    ? { url: `${siteUrl}/_next/image?url=${encodeURIComponent(post.image.url)}&w=1200&q=75`, width: 1200, height: Math.round((1200 * post.image.height) / post.image.width), alt: post.image.alt || post.title }
    : null;
  const shown = `${title} | ${site.name}`;
  return {
    title,
    description: description || undefined,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      siteName: site.name,
      locale: "en_CA",
      url: path,
      title: shown,
      description: description || undefined,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt ?? undefined,
      images: image ? [image] : undefined,
    },
    twitter: { card: image ? "summary_large_image" : "summary", title: shown, description: description || undefined, images: image ? [image.url] : undefined },
  };
}

/** BlogPosting structured data for a published article, from what is on the page. */
export function articleJsonLd(post: PublishedPost) {
  const description = post.seoDescription.trim() || post.excerpt;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    ...(description ? { description } : {}),
    ...(post.image ? { image: [post.image.url] } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    dateModified: post.updatedAt ?? post.publishedAt ?? undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}/blog/${post.slug}` },
    author: { "@type": "Person", name: "Stuti" },
    publisher: { "@type": "LocalBusiness", "@id": `${siteUrl}/#business`, name: site.name },
    inLanguage: "en-CA",
  };
}

