import Link from "next/link";
import { T } from "@/components/editable-text";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { ApertureBloom } from "@/components/line-art";
import { HOME_FAQ_LIMIT } from "@/content/journal";
import { getPublishedFaqs } from "@/lib/journal";

/** The home page's FAQ: the questions chosen for the home page, drawn only while at least one is published. */
export async function HomeFaqSection() {
  const faqs = (await getPublishedFaqs()).filter((item) => item.showOnHome).slice(0, HOME_FAQ_LIMIT);
  if (faqs.length === 0) return null;
  return (
    <section className="paper relative overflow-x-clip">
      <ApertureBloom data-speed="-0.2" className="absolute -right-[12%] top-[8%] hidden w-[26%] text-walnut/10 md:block" />
      <div className="relative mx-auto max-w-[1200px] px-6 pb-16 pt-16 md:pb-20 md:pt-24 lg:pt-28">
        <div className="mx-auto max-w-[680px] text-center">
          <T as="p" id="home.faq.eyebrow" data-reveal="up" className="eyebrow text-[12px] tracking-[0.3em] text-terracotta" />
          <T
            as="h2"
            id="home.faq.heading"
            data-reveal="title"
            className="display mt-4 text-[clamp(28px,8vw,40px)] normal-case leading-[1.1] text-espresso md:text-[52px]"
          />
          <T as="p" id="home.faq.subtitle" data-reveal="up" className="mx-auto mt-5 max-w-[520px] text-[15.5px] leading-[1.8] text-walnut lg:text-[17px]" />
        </div>
        <div data-reveal="up" className="mt-10 md:mt-14">
          <FaqAccordion groups={[{ items: faqs }]} />
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/faq"
            className="eyebrow inline-flex min-h-11 items-center text-[12px] tracking-[0.2em] text-rust underline decoration-terracotta/50 underline-offset-[8px] transition-colors duration-500 hover:text-terracotta"
          >
            <T id="home.faq.link" /> →
          </Link>
        </div>
      </div>
    </section>
  );
}
