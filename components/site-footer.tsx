import Link from "next/link";
import { T } from "@/components/editable-text";
import { InstagramHandle } from "@/components/instagram-handle";
import { ServiceAreas } from "@/components/service-areas";
import { contactLink, menuNavigation } from "@/content/site";
import { navKey } from "@/content/texts";
import { FullLogo } from "@/components/logo";
import { Photo } from "@/components/photo";
import { SocialLinks } from "@/components/social-links";
import type { ImageSlot } from "@/lib/images";

const recentWork: ImageSlot[] = ["footer-1", "footer-2", "footer-3", "footer-4", "footer-5"];
export function SiteFooter() {
  return (
    <footer>
      <div className="paper bg-walnut text-cream">
        <div className="mx-auto grid max-w-[1200px] gap-y-8 px-6 pb-8 md:grid-cols-[150px_1fr_170px] md:items-start md:gap-x-6 pt-14 lg:px-[45px] lg:pt-[72px]">
          <div className="order-2 text-center md:order-none md:text-left">
            <T as="h2" id="footer.menu" className="display text-[36px] text-terracotta md:text-cream" />
            <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px] uppercase tracking-[0.1em] md:flex-col md:gap-y-[11px] md:text-[14px]">
              {menuNavigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-opacity duration-500 hover:opacity-60">
                    <T id={navKey(item.href)} />
                  </Link>
                </li>
              ))}
              <li>
                <Link href={contactLink.href} className="transition-opacity duration-500 hover:opacity-60">
                  <T id={navKey(contactLink.href)} />
                </Link>
              </li>
            </ul>
            <SocialLinks className="mt-5 hidden gap-4 md:flex" iconClassName="h-5 w-5" />
          </div>

          <div className="order-1 flex flex-col items-center md:order-none">
            <FullLogo tone="light" editable className="w-[min(240px,64vw)] lg:w-[280px]" />
            <T
              as="p"
              id="footer.blurb"
              className="mt-6 max-w-[729px] text-center text-[13px] uppercase leading-[1.8] tracking-[0.04em] md:text-[15px] lg:text-[17px]"
            />
            <ServiceAreas className="mt-3 text-center text-[11px] uppercase leading-[1.8] tracking-[0.04em] lg:text-[12px]" />
          </div>

          <div className="order-3 flex flex-col items-center md:order-none">
            <Photo
              slot="footer-avatar"
              className="hidden aspect-square w-[156px] rounded-full md:block"
              sizes="156px"
              position="50% 30%"
            />
            <Link
              href="/about"
              className="script mt-4 hidden text-[18px] lowercase transition-opacity duration-500 hover:opacity-60 md:block"
            >
              <T id="footer.meet" />
            </Link>
            <Link
              href={contactLink.href}
              className="display mt-3 inline-flex h-[33px] w-[153px] items-center justify-center rounded-[65px] border border-cream text-[18px] transition-colors duration-500 hover:bg-cream hover:text-walnut"
            >
              <T id="footer.contact" />
            </Link>
            <SocialLinks className="mt-5 gap-4 md:hidden" iconClassName="h-6 w-6" />
          </div>
        </div>

        <ul className="grid grid-cols-2 gap-1 px-1 pb-1 md:grid-cols-5">
          {recentWork.map((slot, index) => (
            <li key={slot} className={index === 4 ? "hidden md:block" : undefined}>
              <Photo slot={slot} className="aspect-square w-full" sizes="(min-width: 48rem) 20vw, 50vw" />
            </li>
          ))}
        </ul>

        <InstagramHandle className="px-3 pb-2 pt-2 text-center text-[13px] uppercase md:text-right" />
      </div>

      <div className="flex flex-col gap-1 bg-cream px-2 py-3 text-center text-[11px] leading-snug text-espresso md:grid md:grid-cols-3 md:py-[2px] md:text-[12px]">
        <T as="p" id="footer.left" className="md:text-left" />
        <T as="p" id="footer.copyright" />
        <T as="p" id="footer.rights" className="md:text-right" />
      </div>
    </footer>
  );
}
