import type { ReactNode } from "react";
import { draftMode } from "next/headers";
import { EditorLoader } from "@/components/editor/editor-loader";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteImagesProvider } from "@/components/site-images-provider";
import { SiteTextsProvider } from "@/components/site-texts-provider";
import { getPublishedImages } from "@/lib/site-images";
import { getPublishedTexts } from "@/lib/site-texts";

/**
 * Loads the editor only for an admin who has opened edit mode. For everyone
 * else this renders nothing and stays in the prerendered page.
 */
async function EditorMount() {
  "use cache";
  const { isEnabled } = await draftMode();
  return isEnabled ? <EditorLoader /> : null;
}

/** The header, footer and published photographs shared by every public page. */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const [images, texts] = await Promise.all([
    getPublishedImages(),
    getPublishedTexts(),
  ]);
  return (
    <SiteImagesProvider images={images}>
      <SiteTextsProvider texts={texts}>
        <a
          href="#main"
          className="sr-only z-50 bg-cream px-4 py-2 focus:not-sr-only focus:fixed focus:left-2 focus:top-2"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
          <EditorMount />
      </SiteTextsProvider>
    </SiteImagesProvider>
  );
}
