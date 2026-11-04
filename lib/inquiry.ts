import { categories } from "@/content/site";

/**
 * Validation shared by the browser form and the server action. The database
 * checks the same rules again, so a request that skips both is still refused.
 */

/** Session types are the photography categories, plus "other". Stored by id. */
export const sessionTypeIds: string[] = [...categories.map((category) => category.id), "other"];

/** Fixed values that are stored. The labels visitors see are editable text. */
export const referralOptions = ["Instagram", "Google", "Friend or family", "Other"] as const;

export type InquiryField =
  | "name"
  | "email"
  | "phone"
  | "instagram"
  | "sessionType"
  | "referral"
  | "location"
  | "message"
  | "preferredDate";

export type InquiryValues = Record<InquiryField, string>;
export type InquiryErrors = Partial<Record<InquiryField, string>>;

export const inquiryFields: InquiryField[] = [
  "name",
  "email",
  "phone",
  "instagram",
  "sessionType",
  "referral",
  "location",
  "message",
  "preferredDate",
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()\d\s.-]{7,20}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const SHORT_LIMIT = 120;
export const MESSAGE_LIMIT = 4000;

/** Today as YYYY-MM-DD in the given date's local time. */
export const isoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function validateInquiry(values: InquiryValues, today = isoDate(new Date())): InquiryErrors {
  const errors: InquiryErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const phone = values.phone.trim();
  const date = values.preferredDate.trim();

  if (!name) errors.name = "Please enter your full name.";
  else if (name.length > SHORT_LIMIT) errors.name = "Please shorten your name.";

  if (!email) errors.email = "Please enter your email address.";
  else if (email.length > 254 || !EMAIL.test(email)) {
    errors.email = "Please enter a valid email address, like name@example.com.";
  }

  if (phone && !PHONE.test(phone)) {
    errors.phone = "Please enter a valid phone number, or leave this blank.";
  }

  if (values.instagram.trim().length > 60) {
    errors.instagram = "Please shorten your Instagram handle.";
  }

  if (!sessionTypeIds.includes(values.sessionType)) {
    errors.sessionType = "Please choose a session type.";
  }

  if (values.referral && !(referralOptions as readonly string[]).includes(values.referral)) {
    errors.referral = "Please choose an option from the list.";
  }

  if (values.location.trim().length > SHORT_LIMIT) {
    errors.location = "Please shorten the location.";
  }

  if (values.message.length > MESSAGE_LIMIT) {
    errors.message = `Please keep this under ${MESSAGE_LIMIT} characters.`;
  }

  if (date) {
    if (!DATE.test(date) || Number.isNaN(Date.parse(date))) errors.preferredDate = "Please choose a valid date.";
    else if (date < today) errors.preferredDate = "Please choose today or a later date.";
  }

  return errors;
}

export type InquiryState =
  | { status: "idle" }
  | { status: "invalid"; errors: InquiryErrors }
  /** Valid, but it could not be saved. Shows a message and keeps what was typed. */
  | { status: "error"; message: string }
  | { status: "sent" };
