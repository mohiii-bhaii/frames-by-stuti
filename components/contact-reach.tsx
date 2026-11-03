"use client";

import { T } from "@/components/editable-text";
import { useText } from "@/components/site-texts-provider";

/** "Prefer email? Write to ..." with the email, phone and location all editable. */
export function ContactReach() {
  const email = useText("site.email");
  return (
    <p>
      <T id="contact.reach.before" />{" "}
      <a href={`mailto:${email}`} className="underline underline-offset-4 hover:text-rust">
        <T id="site.email" />
      </a>{" "}
      <T id="contact.reach.middle" /> <T id="site.phone" />. <T id="contact.reach.after" /> <T id="site.location" />.
    </p>
  );
}
