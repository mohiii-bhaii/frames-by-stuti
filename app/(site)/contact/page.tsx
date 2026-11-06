import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, localBusinessJsonLd, pageMetadata } from "@/lib/seo";
import { ContactForm } from "@/components/contact-form";
import { ContactReach } from "@/components/contact-reach";
import { T } from "@/components/editable-text";
import { ApertureBloom } from "@/components/line-art";
import { Photo } from "@/components/photo";
import { ScrollMotion } from "@/components/scroll-motion";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("contact");
}

export default async function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Contact", path: "/contact" }])} />
      <JsonLd data={await localBusinessJsonLd()} />
      {/* Hero: one large photograph with the heading centred over it */}
      <section className="relative flex h-[150vw] max-h-[960px] min-h-[480px] items-center justify-center overflow-hidden bg-walnut md:h-[58vw]">
        <Photo slot="contact-hero" className="absolute inset-0" priority position="50% 45%" />
        {/* A soft shade behind the heading only, so white text stays readable on a light photograph. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(70%_38%_at_50%_50%,rgb(53_48_38/0.16),transparent)]"
        />
        <h1 className="display relative px-6 text-center text-[clamp(28px,8.2vw,40px)] uppercase leading-[1.18] tracking-[0.03em] text-white [text-shadow:0_2px_28px_rgb(53_48_38/0.5)] md:text-[64px] lg:text-[88px]">
          <T id="contact.hero.line1" />
          <br />
          <T id="contact.hero.line2" />
        </h1>
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

      <ScrollMotion />
    </>
  );
}
