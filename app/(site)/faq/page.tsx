import type { Metadata } from "next";
import Link from "next/link";
import { T } from "@/components/editable-text";
import { FaqAccordion, type FaqGroup } from "@/components/faq/faq-accordion";
import { JsonLd } from "@/components/json-ld";
import { ApertureBloom } from "@/components/line-art";
import { ScrollMotion } from "@/components/scroll-motion";
import { faqCategories } from "@/content/journal";
import { getPublishedFaqs } from "@/lib/journal";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await pageMetadata("faq");
  // With nothing published the page is only a heading, so search engines are asked to leave it out.
  return (await getPublishedFaqs()).length > 0 ? metadata : { ...metadata, robots: { index: false, follow: true } };
}

export default async function FaqPage() {
  const faqs = await getPublishedFaqs();
  // With questions in more than one category they are grouped under small headings; otherwise one list.
  const used = faqCategories.filter((category) => faqs.some((item) => item.category === category.id));
  const groups: FaqGroup[] =
    used.length > 1
      ? used.map((category) => ({ label: category.label, items: faqs.filter((item) => item.category === category.id) }))
      : [{ items: faqs }];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "FAQ", path: "/faq" }])} />
      <section className="paper relative overflow-x-clip">
        <div className="mx-auto max-w-[1200px] px-6 pb-16 pt-6 lg:pb-24 lg:pt-10">
          <div className="mx-auto max-w-[700px] text-center">
            <T as="p" id="faqs.eyebrow" data-reveal="up" className="eyebrow text-[12px] tracking-[0.3em] text-terracotta" />
            <h1 data-reveal="title" className="mt-4">
              <T id="faqs.heading" className="display block text-[clamp(30px,8.6vw,44px)] normal-case leading-[1.08] text-espresso md:text-[60px]" />
            </h1>
            <T as="p" id="faqs.intro" data-reveal="up" className="mx-auto mt-5 max-w-[520px] text-[16px] leading-[1.8] text-walnut lg:text-[18px]" />
            <ApertureBloom className="mx-auto mt-8 h-9 w-9 text-walnut/60" />
          </div>
          <div className="mt-12 md:mt-16">
            {faqs.length > 0 ? <FaqAccordion groups={groups} /> : null}
          </div>
        </div>
      </section>

      <section className="paper relative overflow-x-clip">
        <div className="mx-auto max-w-[640px] px-6 pb-20 pt-2 text-center lg:pb-[120px]">
          <T as="h2" id="faqs.cta.heading" data-reveal="title" className="display text-[clamp(26px,7vw,34px)] normal-case leading-[1.1] text-espresso lg:text-[48px]" />
          <T as="p" id="faqs.cta.text" data-reveal="up" className="mx-auto mt-5 max-w-[460px] text-[16px] leading-[1.8] text-walnut" />
          <Link href="/contact" className="btn mt-8" data-reveal="up">
            <T id="faqs.cta.button" />
          </Link>
        </div>
      </section>
      <ScrollMotion />
    </>
  );
}
