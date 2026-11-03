import { categories } from "@/content/site";

/** Validation shared by the browser form and the server action. */
export const sessionTypes: string[] = categories.map((category) => category.label);

export const referralOptions = ["Instagram", "Facebook", "Google", "A friend or family member", "Other"];

export const timelineOptions = [
  "Just looking for now",
  "Comparing photographers",
  "Ready to book",
];

export type InquiryField =
  | "name"
  | "email"
  | "phone"
  | "instagram"
  | "sessionType"
  | "referral"
  | "timeline"
  | "details"
  | "about"
  | "inspiration";

export type InquiryValues = Record<InquiryField, string>;
export type InquiryErrors = Partial<Record<InquiryField, string>>;

export const inquiryFields: InquiryField[] = [
  "name",
  "email",
  "phone",
  "instagram",
  "sessionType",
  "referral",
  "timeline",
  "details",
  "about",
  "inspiration",
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()\d\s.-]{7,20}$/;
const SHORT_LIMIT = 120;
const LONG_LIMIT = 4000;

export function validateInquiry(values: InquiryValues): InquiryErrors {
  const errors: InquiryErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const phone = values.phone.trim();

  if (!name) errors.name = "Please enter your full name.";
  else if (name.length > SHORT_LIMIT) errors.name = "Please shorten your name.";

  if (!email) errors.email = "Please enter your email address.";
  else if (email.length > SHORT_LIMIT || !EMAIL.test(email)) {
    errors.email = "Please enter a valid email address, like name@example.com.";
  }

  if (phone && !PHONE.test(phone)) {
    errors.phone = "Please enter a valid phone number, or leave this blank.";
  }

  if (values.instagram.trim().length > SHORT_LIMIT) {
    errors.instagram = "Please shorten your Instagram handle.";
  }

  if (!sessionTypes.includes(values.sessionType)) {
    errors.sessionType = "Please choose a session type.";
  }

  if (values.referral && !referralOptions.includes(values.referral)) {
    errors.referral = "Please choose an option from the list.";
  }

  if (values.timeline && !timelineOptions.includes(values.timeline)) {
    errors.timeline = "Please choose an option from the list.";
  }

  if (values.details.trim().length < 10) {
    errors.details = "Please tell me a little more about your session (at least 10 characters).";
  }

  for (const field of ["details", "about", "inspiration"] as const) {
    if (values[field].length > LONG_LIMIT) {
      errors[field] = `Please keep this under ${LONG_LIMIT} characters.`;
    }
  }

  return errors;
}

export type InquiryState =
  | { status: "idle" }
  | { status: "invalid"; errors: InquiryErrors }
  /** Valid, but no destination is configured or delivery failed. */
  | { status: "undelivered" }
  | { status: "sent" };
