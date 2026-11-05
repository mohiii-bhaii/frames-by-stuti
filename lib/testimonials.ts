/**
 * What counts as a real testimonial: a review and a client name, both filled
 * in with real words. Anything empty, whitespace, or still in [square brackets]
 * (the old placeholder wording) is ignored, so placeholder text can never reach
 * a visitor.
 */
export function isRealText(value: string | undefined | null) {
  const text = (value ?? "").trim();
  if (text === "") return false;
  return !/^\[[\s\S]*\]$/.test(text);
}

/** The testimonial numbers (1, 2, 3...) that have both a real review and a real client name. */
export function validTestimonials(values: { quote: string; author: string }[]) {
  return values.flatMap((item, index) => (isRealText(item.quote) && isRealText(item.author) ? [index + 1] : []));
}
