import { T } from "@/components/editable-text";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { BotanicalBranch } from "@/components/line-art";
import { getPublishedFaqs } from "@/lib/journal";

/**
 * The FAQ section shown at the foot of the Home and Contact pages. Both pages draw this one
 * component, so they always show the same published questions, in the owner's order.
 * Nothing is drawn while no question is published.
 */
export async function FaqSection() {
  const faqs = await getPublishedFaqs();
  if (faqs.length === 0) return null;
  return (
    <section aria-labelledby="faq-heading" className="paper relative overflow-x-clip">
      <BotanicalBranch
        className="pointer-events-none absolute bottom-0 left-0 hidden w-[200px] origin-bottom-left -translate-x-[45%] -rotate-[14deg] text-pencil opacity-50 md:block lg:w-[260px]"
      />
      <div className="relative mx-auto max-w-[1200px] px-6 pb-20 pt-6 md:pb-24 lg:pb-[120px]">
        <div className="mx-auto max-w-[680px] text-center">
          <T as="p" id="faq.section.eyebrow" data-reveal="up" className="eyebrow text-[12px] tracking-[0.3em] text-terracotta" />
          <h2 id="faq-heading" data-reveal="title" className="mt-4">
            <T id="faq.section.heading" className="display block text-[clamp(28px,8vw,36px)] leading-[1.12] text-espresso md:text-[48px]" />
          </h2>
        </div>
        <div data-reveal="up" className="mt-10 md:mt-14">
          <FaqAccordion groups={[{ items: faqs }]} />
        </div>
      </div>
    </section>
  );
}
