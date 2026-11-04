import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Bodoni_Moda, Montserrat } from "next/font/google";
import { site } from "@/content/site";
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

export const metadata: Metadata = {
  title: {
    default: `${site.name} | Photography`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${montserrat.variable} ${bodoni.variable} antialiased`}>
      <body className="relative min-h-svh">{children}</body>
    </html>
  );
}
