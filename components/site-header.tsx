"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { T } from "@/components/editable-text";
import { pricingCategories, pricingHref } from "@/content/pricing";
import { contactLink, navigation } from "@/content/site";
import { navKey } from "@/content/texts";
import { FullLogo, HeaderLogo } from "@/components/logo";
import { SocialLinks } from "@/components/social-links";

const subscribeNever = () => () => {};

export function SiteHeader() {
  const pathname = usePathname();
  // False on the server and while hydrating, true afterwards. The URL the server
  // sees for a prerendered page isn't always the visitor's, so anything that
  // reads the pathname waits until the browser has taken over.
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);
  const current = mounted ? pathname : null;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  // "main" is the menu; "pricing" is the Pricing & Packages sub-menu with its own Back button.
  const [view, setView] = useState<"main" | "pricing">("main");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
    document.documentElement.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    setView("main");
  };

  return (
    <>
      {/*
        The homepage and the other pages draw the header differently. Both
        versions are in the HTML and CSS shows one, keyed on the homepage's
        [data-page-home] marker (see globals.css). That keeps the server's HTML
        and the browser's identical, with no flash and no mismatch.
      */}
      {/* Inner pages: a cream bar the header sits on, so the logo is always dark on cream and never over a photo. Hidden on the homepage. */}
      <div aria-hidden="true" className="header-spacer paper" />
      <header className="site-header absolute inset-x-0 top-0 z-30">
        <div className="header-home relative mx-auto h-[150px] max-w-[1440px] md:h-[100px]">
          <T
            as="p"
            id="header.eyebrow"
            className="eyebrow absolute left-[23px] top-[14px] hidden w-[215px] text-[16px] leading-normal tracking-normal lg:block"
          />
          <HeaderLogo priority className="absolute left-1/2 top-[52px] h-[100px] -translate-x-1/2 md:top-[6px] md:h-[92px]" />
        </div>
        <HeaderLogo
          priority
          className="header-inner absolute left-1/2 top-3 h-[120px] -translate-x-1/2 md:h-[132px]"
        />
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className="header-burger absolute right-1 top-12 flex h-12 w-14 items-center justify-center md:right-3 md:top-[54px]"
        >
          <svg viewBox="0 0 52 20" className="w-[42px] md:w-[50px]" fill="none" stroke="currentColor" strokeWidth="1.800" aria-hidden="true">
            <path d="M1 2h50M1 10h50M1 18h50" />
          </svg>
        </button>
      </header>

      <dialog
        ref={dialogRef}
        aria-label="Site menu"
        className="nav-panel overflow-y-auto rounded-b-[20px] border-2 border-sage bg-cream text-walnut md:rounded-l-[20px] md:rounded-br-none md:border-y-0 md:border-r-0"
        onClose={close}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div className="relative flex min-h-[620px] flex-col items-center px-6 pb-10 pt-8 md:min-h-full md:justify-center md:gap-12 md:pb-16 md:pt-14">
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.200" aria-hidden="true">
              <path d="M2 2l20 20M22 2L2 22" />
            </svg>
          </button>

          {view === "pricing" ? (
            <button
              type="button"
              onClick={() => setView("main")}
              className="eyebrow absolute left-3 top-3 flex min-h-11 items-center gap-2 px-2 text-[13px] text-walnut transition-colors duration-500 hover:text-rust"
            >
              <span aria-hidden="true">«</span>
              <T id="nav.pricing.back" plain />
            </button>
          ) : null}

          <FullLogo link={false} className="w-[220px] md:w-[250px]" />

          {view === "pricing" ? (
            <nav aria-label="Pricing & Packages" key="pricing" className="mt-6 animate-[fade-in_0.4s_ease] md:mt-0">
              <ul className="flex flex-col items-center gap-5 text-center text-xl uppercase md:gap-4 md:text-[15px] md:tracking-[0.06em]">
                <li>
                  <Link
                    href="/pricing"
                    onClick={close}
                    aria-current={current === "/pricing" ? "page" : undefined}
                    className="text-rust transition-colors duration-500 hover:text-terracotta aria-[current=page]:underline aria-[current=page]:underline-offset-6"
                  >
                    <T id="nav.pricing.all" plain />
                  </Link>
                </li>
                {pricingCategories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={pricingHref(category.slug)}
                      onClick={close}
                      aria-current={current === pricingHref(category.slug) ? "page" : undefined}
                      className="transition-colors duration-500 hover:text-terracotta aria-[current=page]:underline aria-[current=page]:underline-offset-6"
                    >
                      <T id={`pricing.${category.slug}.name`} plain />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : (
            <nav aria-label="Main" key="main" className="mt-6 animate-[fade-in_0.4s_ease] md:mt-0">
              <ul className="flex flex-col items-center gap-6 text-center text-xl uppercase md:gap-5 md:text-[15px] md:tracking-[0.06em]">
                {navigation.map((item) => (
                  <li key={item.href}>
                    {item.href === "/pricing" ? (
                      <button
                        type="button"
                        onClick={() => setView("pricing")}
                        aria-haspopup="true"
                        aria-current={current?.startsWith("/pricing") ? "page" : undefined}
                        className="inline-flex items-center gap-2 uppercase transition-colors duration-500 hover:text-terracotta aria-[current=page]:underline aria-[current=page]:underline-offset-6"
                      >
                        <T id={navKey(item.href)} plain />
                        <span aria-hidden="true">»</span>
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={close}
                        aria-current={current === item.href ? "page" : undefined}
                        className="transition-colors duration-500 hover:text-terracotta aria-[current=page]:underline aria-[current=page]:underline-offset-6"
                      >
                        <T id={navKey(item.href)} plain />
                      </Link>
                    )}
                  </li>
                ))}
                <li className="mt-5 text-[28px] text-rust md:mt-3 md:text-[19px]">
                  <Link
                    href={contactLink.href}
                    onClick={close}
                    aria-current={current === contactLink.href ? "page" : undefined}
                    className="transition-colors duration-500 hover:text-terracotta aria-[current=page]:underline aria-[current=page]:underline-offset-6"
                  >
                    <T id={navKey(contactLink.href)} plain />
                  </Link>
                </li>
              </ul>
            </nav>
          )}

          <SocialLinks includeEmail className="mt-10 gap-4 text-rust md:mt-0" iconClassName="h-7 w-7 md:h-6 md:w-6" />
        </div>
      </dialog>
    </>
  );
}
