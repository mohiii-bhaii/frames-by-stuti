/**
 * The long-form inquiry: its fields, options and validation. Shared by the
 * browser form and the server action. The database checks the same rules again,
 * so a request that skips both is still refused.
 */

/** Stored value and the original label. The label shown on the site is editable text (form.session.<value>). */
export const sessionOptions = [
  { value: "newborn", label: "Newborn" },
  { value: "maternity", label: "Maternity" },
  { value: "cake-smash", label: "Cake Smash" },
  { value: "family", label: "Family / Lifestyle" },
  { value: "milestones", label: "Milestones" },
  { value: "couples", label: "Engagement / Couple" },
  { value: "portraits", label: "Portraits" },
  { value: "seniors", label: "Seniors / Graduation" },
  { value: "events", label: "Events" },
  { value: "other", label: "Other / Custom Session" },
] as const;

export const sessionTypeIds: string[] = sessionOptions.map((option) => option.value);

/** Sessions that ask for a due date. */
export const dueDateSessions: string[] = ["newborn", "maternity"];

export const locationPreferences = ["Studio", "Outdoor", "At Home", "Other"] as const;

export const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

/** Fixed values that are stored. The labels visitors see are editable text. */
export const referralOptions = ["Instagram", "Google", "Friend or family", "Previous client", "Other"] as const;

/**
 * A session type for a card's label on the home page. Cards can be renamed in
 * the editor, so the card says what it is called and this finds the matching
 * session. Returns "" when nothing matches.
 */
export function sessionTypeForLabel(label: string): string {
  const text = label.toLowerCase();
  const rules: [RegExp, string][] = [
    [/newborn/, "newborn"],
    [/maternity|pregnan/, "maternity"],
    [/cake/, "cake-smash"],
    [/senior|graduat/, "seniors"],
    [/milestone|birthday/, "milestones"],
    [/engage|couple/, "couples"],
    [/event/, "events"],
    [/family|lifestyle/, "family"],
    [/portrait/, "portraits"],
  ];
  return rules.find(([pattern]) => pattern.test(text))?.[1] ?? "";
}

export type InquiryValues = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  sessionType: string;
  dueDate: string;
  locationPreference: string;
  location: string;
  preferredDays: string[];
  message: string;
  referral: string;
};

export type InquiryField = keyof InquiryValues;
export type InquiryErrors = Partial<Record<InquiryField, string>>;

/** The order errors are reported and focused in, which follows the form from top to bottom. */
export const inquiryFields: InquiryField[] = [
  "firstName",
  "lastName",
  "phone",
  "email",
  "sessionType",
  "dueDate",
  "locationPreference",
  "location",
  "preferredDays",
  "message",
  "referral",
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARS = /^[+()\d\s.-]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const NAME_LIMIT = 80;
const SHORT_LIMIT = 120;
export const MESSAGE_LIMIT = 4000;

export function validateInquiry(values: InquiryValues): InquiryErrors {
  const errors: InquiryErrors = {};
  const firstName = values.firstName.trim();
  const lastName = values.lastName.trim();
  const phone = values.phone.trim();
  const email = values.email.trim();
  const digits = phone.replace(/\D/g, "");

  if (!firstName) errors.firstName = "Please enter your first name.";
  else if (firstName.length > NAME_LIMIT) errors.firstName = "Please shorten your first name.";

  if (!lastName) errors.lastName = "Please enter your last name.";
  else if (lastName.length > NAME_LIMIT) errors.lastName = "Please shorten your last name.";

  if (!phone) errors.phone = "Please enter your phone number.";
  else if (!PHONE_CHARS.test(phone) || digits.length < 10 || digits.length > 15) {
    errors.phone = "Please enter a valid phone number with the area code, like 613-555-0142.";
  }

  if (!email) errors.email = "Please enter your email address.";
  else if (email.length > 254 || !EMAIL.test(email)) {
    errors.email = "Please enter a valid email address, like name@example.com.";
  }

  if (!sessionTypeIds.includes(values.sessionType)) {
    errors.sessionType = "Please choose the type of session you're looking for.";
  }

  // Only asked of newborn and maternity sessions, so it is ignored for the rest.
  const dueDate = values.dueDate.trim();
  if (dueDateSessions.includes(values.sessionType) && dueDate) {
    if (!DATE.test(dueDate) || Number.isNaN(Date.parse(dueDate))) errors.dueDate = "Please choose a valid date.";
  }

  if (values.locationPreference && !(locationPreferences as readonly string[]).includes(values.locationPreference)) {
    errors.locationPreference = "Please choose an option from the list.";
  }

  if (values.location.trim().length > SHORT_LIMIT) errors.location = "Please shorten the city or area.";

  if (values.preferredDays.length === 0) {
    errors.preferredDays = "Please choose at least one day that works for you.";
  } else if (!values.preferredDays.every((day) => (weekdays as readonly string[]).includes(day))) {
    errors.preferredDays = "Please choose from the days listed.";
  }

  const message = values.message.trim();
  if (!message) errors.message = "Please tell us a little about your session.";
  else if (message.length < 10) errors.message = "Please tell us a little more (at least 10 characters).";
  else if (message.length > MESSAGE_LIMIT) errors.message = `Please keep this under ${MESSAGE_LIMIT} characters.`;

  if (values.referral && !(referralOptions as readonly string[]).includes(values.referral)) {
    errors.referral = "Please choose an option from the list.";
  }

  return errors;
}

export type InquiryState =
  | { status: "idle" }
  | { status: "invalid"; errors: InquiryErrors }
  /** Valid, but it could not be saved. Shows a message and keeps what was typed. */
  | { status: "error"; message: string }
  | { status: "sent" };
