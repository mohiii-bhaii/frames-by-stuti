"use client";

import { useText } from "@/components/site-texts-provider";

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-full w-full"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.200" cy="6.800" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-full w-full"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M14 8.500V6.700c0-.9.600-1.200 1.100-1.200H17V2h-2.800C11 2 9.800 4.300 9.800 6.400v2.100H7V12h2.800v10H14V12h2.700l.4-3.500Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-full w-full"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.600"
      aria-hidden="true"
    >
      <rect x="2.500" y="5" width="19" height="14" rx="1.500" />
      <path d="M3 6l9 7 9-7M3 18l6-6.500M21 18l-6-6.500" />
    </svg>
  );
}

/**
 * Social and email icons. A network only renders once its URL is set (in the
 * visual editor), so the site never links to an account that isn't Stuti's.
 */
export function SocialLinks({
  className = "",
  iconClassName = "h-5 w-5",
  includeEmail = false,
}: {
  className?: string;
  iconClassName?: string;
  includeEmail?: boolean;
}) {
  const instagram = useText("site.instagramUrl");
  const facebook = useText("site.facebookUrl");
  const email = useText("site.email");
  const links = [
    { href: instagram, label: "Instagram", icon: <InstagramIcon /> },
    { href: facebook, label: "Facebook", icon: <FacebookIcon /> },
    ...(includeEmail && email
      ? [{ href: `mailto:${email}`, label: "Email", icon: <MailIcon /> }]
      : []),
  ].filter((link) => link.href);

  if (links.length === 0) return null;

  return (
    <ul className={`flex items-center ${className}`}>
      {links.map((link) => (
        <li key={link.label}>
          <a
            href={link.href}
            aria-label={link.label}
            className={`block transition-opacity duration-500 hover:opacity-60 ${iconClassName}`}
          >
            {link.icon}
          </a>
        </li>
      ))}
    </ul>
  );
}
