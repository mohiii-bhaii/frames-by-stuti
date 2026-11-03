import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import { EditableLogo } from "@/components/editable-logo";
import logoDark from "@/public/brand/logo.png";
import logoLight from "@/public/brand/logo-light.png";
import wordmarkDark from "@/public/brand/wordmark.png";
import wordmarkLight from "@/public/brand/wordmark-light.png";

// Built from scripts/brand/logo-reference.jpg by `npm run logo`. The files are
// transparent, so they sit on cream, walnut or a photo with no visible box.
type Tone = "dark" | "light";

/** "Frames by Stuti" without the camera, for the top of each page. */
export function Wordmark({ tone = "dark", className = "", priority }: { tone?: Tone; className?: string; priority?: boolean }) {
  return (
    <Link href="/" aria-label={`${site.name}, home`} className={`relative inline-block ${className}`}>
      <EditableLogo slot="logo-wordmark" className="h-full w-auto">
        <Image
          src={tone === "dark" ? wordmarkDark : wordmarkLight}
          alt=""
          priority={priority}
          sizes="240px"
          // A faint shadow keeps the cream wordmark legible over bright photos.
          className={`h-full w-auto ${tone === "light" ? "drop-shadow-[0_1px_10px_rgb(53_48_38/0.35)]" : ""}`}
        />
      </EditableLogo>
    </Link>
  );
}

/**
 * The full logo with the camera and tagline. Only the footer's copy is
 * editable: the menu and admin pages always show the original artwork, so an
 * uploaded logo made for the dark footer never lands on a cream background.
 */
export function FullLogo({
  tone = "dark",
  className = "",
  link = true,
  editable = false,
}: {
  tone?: Tone;
  className?: string;
  link?: boolean;
  editable?: boolean;
}) {
  const artwork = <Image src={tone === "dark" ? logoDark : logoLight} alt="" sizes="360px" className="h-auto w-full" />;
  const image = editable ? (
    <EditableLogo slot="logo-badge" className="h-auto w-full">
      {artwork}
    </EditableLogo>
  ) : (
    artwork
  );
  if (!link) {
    return (
      <div role="img" aria-label={site.name} className={`relative block ${className}`}>
        {image}
      </div>
    );
  }
  return (
    <Link href="/" aria-label={`${site.name}, home`} className={`relative block ${className}`}>
      {image}
    </Link>
  );
}
