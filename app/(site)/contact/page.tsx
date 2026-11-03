import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { ContactReach } from "@/components/contact-reach";
import { T } from "@/components/editable-text";
import { ApertureBloom } from "@/components/line-art";
import { Photo } from "@/components/photo";
import { site } from "@/content/site";
import { ScrollMotion } from "@/components/scroll-motion";

export const metadata: Metadata = {
  title: "Contact",
  description: `Send ${site.name} an inquiry about booking a session.`,
};

export default function ContactPage() {
  return (
    <>
      {/* Intro */}
      <section className="relative overflow-hidden bg-espresso text-cream">
        <Photo slot="contact-hero" parallax={0.08} zoom className="absolute inset-0" priority position="50% 20%" />
        <div className="absolute inset-0 bg-espresso/40" />
        <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-b from-transparent to-espresso/80" />
        <div className="relative mx-auto max-w-[1200px] px-6 pb-12 pt-[110px] lg:h-[1179px] lg:px-[53px] lg:pb-0 lg:pt-[240px]">
          <h1 className="display text-[48px] leading-[1.04] md:text-[64px] lg:text-[79px]">
            <T id="contact.title.1" />
            <br />
            <span className="font-display normal-case italic">&amp;</span> <T id="contact.title.2" />
            <br />
            <T id="contact.title.3" />
          </h1>
          <div className="mt-8 space-y-4 text-[15px] md:ml-auto md:max-w-[560px] lg:mr-[5px] lg:mt-[47px] lg:max-w-[671px] lg:text-[16px]">
            <T as="p" id="contact.intro.p1" />
            <T as="p" id="contact.intro.p2" />
          </div>
          <div className="mt-8 md:ml-auto md:w-fit lg:mr-[244px]">
            <a href="#inquiry" className="btn">
              <T id="contact.intro.button" />
            </a>
          </div>
        </div>
      </section>

      {/* Form */}
      <section id="inquiry" className="paper relative scroll-mt-4 overflow-hidden">
        <ApertureBloom className="absolute -right-[12%] top-[-4%] w-[60%] text-walnut/10 lg:right-[-8%] lg:w-[620px]" />
        <ApertureBloom className="absolute -left-[12%] bottom-[8%] w-[60%] text-walnut/10 lg:left-[-8%] lg:w-[720px]" />
        <div className="relative mx-auto max-w-[844px] px-4 py-3 lg:py-[10px]">
          <div className="bg-white/90 px-5 py-10 md:px-16 lg:px-[56px] lg:py-[60px]">
            <T as="h2" id="contact.form.heading" className="display text-[34px] text-rust lg:text-[48px]" />
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
          <div className="px-4 py-10 text-[15px] text-walnut lg:px-[28px] lg:text-[16px]">
            <ContactReach />
          </div>
        </div>
      </section>

      {/* Closing photo */}
      <Photo slot="contact-banner" parallax={0.1} className="h-[64vw] max-h-[721px] w-full md:h-[50vw]" />
      <ScrollMotion />
    </>
  );
}
