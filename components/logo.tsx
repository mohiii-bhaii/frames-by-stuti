import Image from "next/image";
import Link from "next/link";
import { EditableLogo } from "@/components/editable-logo";
import { site } from "@/content/site";
import logoDark from "@/public/brand/logo.png";
import logoLight from "@/public/brand/logo-light.png";

// Built from scripts/brand/frames-by-stuti-logo.png by `npm run logo`. The files
// are trimmed to the artwork and transparent, so they sit on cream, walnut or a
// photo with no visible box. "dark" is the original ink, for cream backgrounds;
// "light" is cream, for the dark footer.
type Tone = "dark" | "light";

/**
 * The logo at the top of every page. Sized by its width (190px on phones, 230px
 * on tablets, 270px on desktops) with the height following from the artwork's
 * own proportions, so it is never stretched or cropped. Admins can replace it
 * in the editor; until then the bundled logo is shown.
 */
export function HeaderLogo({ tone = "dark", className = "", priority }: { tone?: Tone; className?: string; priority?: boolean }) {
  return (
    <Link href="/" aria-label={`${site.name}, home`} className={`relative block w-[190px] md:w-[230px] lg:w-[270px] ${className}`}>
      <EditableLogo slot="logo-header" className="h-auto w-full">
        <Image
          src={tone === "dark" ? logoDark : logoLight}
          alt=""
          priority={priority}
          sizes="(min-width: 64rem) 270px, (min-width: 48rem) 230px, 190px"
          className="h-auto w-full"
        />
      </EditableLogo>
    </Link>
  );
}

/**
 * The same logo sized by whatever width the caller gives it, for the menu,
 * footer and admin pages. Only the footer's copy is editable: the menu and admin
 * pages always show the bundled artwork. A logo uploaded for the dark footer is
 * drawn in cream, so a dark logo never disappears into the brown.
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
    <EditableLogo slot="logo-footer" className="h-auto w-full" imageClassName={tone === "light" ? "brightness-0 invert-[.92]" : ""}>
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
