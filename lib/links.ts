/** A web address that is safe to put in a link: http(s) only, no spaces. Anything else is dropped. */
export function safeWebUrl(value: string) {
  const url = value.trim();
  return /^https?:\/\/[^\s/$.?#][^\s]*$/i.test(url) ? url : "";
}

/**
 * Where the Instagram links go. The profile link wins when one is set;
 * otherwise a plain username such as "@framesbystuti" is turned into one.
 * A placeholder like "@[instagram-handle]" gives no link at all.
 */
export function instagramProfileUrl(handle: string, url: string) {
  const link = safeWebUrl(url);
  if (link) return link;
  const name = handle.trim().replace(/^@/, "");
  return /^[A-Za-z0-9._]{1,30}$/.test(name) ? `https://www.instagram.com/${name}/` : "";
}
