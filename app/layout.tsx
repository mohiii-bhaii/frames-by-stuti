import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Allura, Bodoni_Moda, Fraunces, Montserrat } from "next/font/google";
import { site, siteUrl } from "@/content/site";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

const allura = Allura({
  variable: "--font-allura",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  // Makes every relative link in the metadata (canonical, social images) absolute, on the canonical domain.
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} | Ottawa Photographer`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: { type: "website", siteName: site.name, locale: "en_CA" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${montserrat.variable} ${bodoni.variable} ${allura.variable} ${fraunces.variable} antialiased`}>
      <body className="relative min-h-svh">{children}</body>
    </html>
  );
}
