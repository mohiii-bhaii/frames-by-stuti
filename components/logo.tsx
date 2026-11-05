import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import logoDark from "@/public/brand/logo.png";
import logoLight from "@/public/brand/logo-light.png";

// Built from scripts/brand/frames-by-stuti-logo.png by `npm run logo`. The files
// are trimmed to the artwork and transparent, so they sit on cream, walnut or a
// photo with no visible box. "dark" is the original ink, for cream backgrounds;
// "light" is cream, for the dark footer.
type Tone = "dark" | "light";

/**
 * The logo for the top of each page. Size it with the height: the width follows
 * from the artwork's own proportions, so it is never stretched or cropped.
 */
export function HeaderLogo({ tone = "dark", className = "", priority }: { tone?: Tone; className?: string; priority?: boolean }) {
  return (
    <Link href="/" aria-label={`${site.name}, home`} className={`relative inline-block ${className}`}>
      <Image
        src={tone === "dark" ? logoDark : logoLight}
        alt=""
        priority={priority}
        sizes="240px"
        className="h-full w-auto"
      />
    </Link>
  );
}

/** The same logo sized by its width, for the menu, footer and admin pages. */
export function FullLogo({ tone = "dark", className = "", link = true }: { tone?: Tone; className?: string; link?: boolean }) {
  const image = <Image src={tone === "dark" ? logoDark : logoLight} alt="" sizes="360px" className="h-auto w-full" />;
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
