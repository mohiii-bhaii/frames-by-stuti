/** Structured data for search engines, written into the page's HTML (not added by JavaScript). */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // "<" is escaped so no text in the data can close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
