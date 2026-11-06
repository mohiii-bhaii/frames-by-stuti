import type { Metadata } from "next";
import { T } from "@/components/editable-text";
import { JsonLd } from "@/components/json-ld";
import { JournalGrid } from "@/components/journal/journal-grid";
import { ApertureBloom } from "@/components/line-art";
import { ScrollMotion } from "@/components/scroll-motion";
import { getPublishedPosts } from "@/lib/journal";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await pageMetadata("blog");
  // With no published article the page is only a heading, so search engines are asked to leave it out.
  return (await getPublishedPosts()).length > 0 ? metadata : { ...metadata, robots: { index: false, follow: true } };
}

export default async function JournalPage() {
  const posts = await getPublishedPosts();
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "The Journal", path: "/blog" }])} />
      <section className="paper relative overflow-x-clip">
        <div className="mx-auto max-w-[1240px] px-6 pb-20 pt-6 lg:px-[45px] lg:pb-28 lg:pt-10">
          <div className="mx-auto max-w-[700px] text-center">
            <T as="p" id="blog.eyebrow" data-reveal="up" className="eyebrow text-[12px] tracking-[0.3em] text-terracotta" />
            <h1 data-reveal="title" className="mt-4">
              <T id="blog.heading" className="display block text-[clamp(34px,10vw,52px)] leading-[1.06] text-espresso md:text-[72px]" />
            </h1>
            <T as="p" id="blog.intro" data-reveal="up" className="mx-auto mt-5 max-w-[540px] text-[16px] leading-[1.8] text-walnut lg:text-[18px]" />
            <ApertureBloom className="mx-auto mt-8 h-9 w-9 text-walnut/60" />
          </div>
          <div className="mt-12 md:mt-16">
            {posts.length > 0 ? (
              <JournalGrid posts={posts} />
            ) : (
              <T as="p" id="blog.empty" className="mx-auto max-w-[480px] py-10 text-center text-[16px] text-walnut" />
            )}
          </div>
        </div>
      </section>
      <ScrollMotion />
    </>
  );
}
