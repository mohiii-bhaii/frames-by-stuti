"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import { submitInquiry } from "@/app/(site)/contact/actions";
import { T } from "@/components/editable-text";
import { useText } from "@/components/site-texts-provider";
import {
  dueDateSessions,
  inquiryFields,
  locationPreferences,
  MESSAGE_LIMIT,
  referralOptions,
  sessionOptions,
  sessionTypeIds,
  validateInquiry,
  weekdays,
  type InquiryErrors,
  type InquiryField,
  type InquiryState,
  type InquiryValues,
} from "@/lib/inquiry";

// 16px text stops iPhones zooming the page when a field is tapped, and the
// 52px height keeps every field easy to hit with a thumb.
const controlClass =
  "mt-2 block min-h-[52px] w-full rounded-[10px] border border-sage/70 bg-white/70 px-4 py-3 text-[16px] text-espresso placeholder:text-sage/80 transition-[border-color,box-shadow,background-color] duration-300 hover:border-sage focus:border-terracotta focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/40 aria-invalid:border-2 aria-invalid:border-rust";

const subscribeNever = () => () => {};

function readValues(form: HTMLFormElement): InquiryValues {
  const data = new FormData(form);
  const text = (name: string) => String(data.get(name) ?? "");
  return {
    firstName: text("firstName"),
    lastName: text("lastName"),
    phone: text("phone"),
    email: text("email"),
    sessionType: text("sessionType"),
    dueDate: text("dueDate"),
    locationPreference: text("locationPreference"),
    location: text("location"),
    preferredDays: data.getAll("preferredDays").map(String),
    message: text("message"),
    referral: text("referral"),
  };
}

/** A new id for this visit, so a repeat of the same submission is recognised and saved once. */
function newToken() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** One <option> whose words are editable text. */
function TextOption({ id, value, disabled }: { id: string; value: string; disabled?: boolean }) {
  return (
    <option value={value} disabled={disabled}>
      {useText(id)}
    </option>
  );
}

function Chevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-walnut"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.600"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

type FieldProps = {
  name: InquiryField;
  /** Key of the editable label. */
  labelId: string;
  /** Key of the editable helper text under the label. */
  hintId?: string;
  required?: boolean;
  /** "question" labels are set in the serif heading style; "small" ones are quiet capitals. */
  variant?: "small" | "question";
  /** Position in the form, for the staggered entrance. */
  index: number;
  errors: InquiryErrors;
  className?: string;
  children: (props: {
    id: string;
    name: InquiryField;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
    required: boolean;
    className: string;
  }) => ReactNode;
};

const labelClass = {
  small: "block text-[13px] uppercase tracking-[0.1em] text-walnut",
  question: "display block text-[21px] leading-snug text-espresso md:text-[23px]",
};

function Field({ name, labelId, hintId, required = false, variant = "small", index, errors, className, children }: FieldProps) {
  const id = `inquiry-${name}`;
  const errorId = `${id}-error`;
  const error = errors[name];
  return (
    <div
      data-reveal="up"
      style={{ "--reveal-delay": `${Math.min(index, 8) * 0.05}s` } as CSSProperties}
      className={className}
    >
      <label htmlFor={id} className={labelClass[variant]}>
        <T id={labelId} />
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {hintId ? <T as="p" id={hintId} className="mt-1 text-[14px] leading-relaxed text-walnut/90" /> : null}
      {children({
        id,
        name,
        "aria-invalid": Boolean(error),
        "aria-describedby": error ? errorId : undefined,
        required,
        className: controlClass,
      })}
      {error ? (
        <p id={errorId} className="mt-2 text-[13px] text-rust">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ContactForm() {
  const [state, action, pending] = useActionState<InquiryState, FormData>(submitInquiry, {
    status: "idle",
  });
  const [clientErrors, setClientErrors] = useState<InquiryErrors | null>(null);
  const thanksRef = useRef<HTMLDivElement>(null);
  // Set in the browser. Kept here rather than in hidden inputs, because React
  // rewrites hidden inputs whenever the form re-renders and would wipe them.
  const meta = useRef({ token: "", startedAt: "" });
  // True from the moment a submission starts until the server answers, so two
  // taps in the same instant can't send it twice.
  const sending = useRef(false);

  // A card on the home page can send the visitor here with the session already chosen.
  const requested = useSyncExternalStore(
    subscribeNever,
    () => new URLSearchParams(window.location.search).get("session") ?? "",
    () => "",
  );
  const [picked, setPicked] = useState<string | null>(null);
  const session = picked ?? (sessionTypeIds.includes(requested) ? requested : "");
  const askDueDate = dueDateSessions.includes(session);

  const placeholders = {
    phone: useText("form.phone.placeholder"),
    email: useText("form.email.placeholder"),
    location: useText("form.location.placeholder"),
  };

  useEffect(() => {
    // Used to spot bots that fill the form in instantly, and to recognise a repeated submission.
    meta.current = { token: newToken(), startedAt: String(Date.now()) };
  }, []);

  useEffect(() => {
    // Any answer from the server, good or bad, lets the visitor try again.
    sending.current = false;
  }, [state]);

  // The form collapses once sent, so bring the confirmation into view.
  useEffect(() => {
    if (state.status !== "sent") return;
    thanksRef.current?.focus({ preventScroll: true });
    thanksRef.current?.scrollIntoView({ block: "center" });
  }, [state.status]);

  const errors: InquiryErrors = clientErrors ?? (state.status === "invalid" ? state.errors : {});

  const focusFirstError = (found: InquiryErrors) => {
    const first = inquiryFields.find((field) => found[field]);
    if (first) document.getElementById(`inquiry-${first}`)?.focus();
  };

  // Validate in the browser first, then send the values ourselves. We do this
  // because React resets a form after an action run through its `action` prop,
  // which would wipe what the visitor typed if the server then says no. That
  // prop stays on the form so it still submits without JavaScript.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending || sending.current) return;
    const form = event.currentTarget;
    const found = validateInquiry(readValues(form));
    if (Object.keys(found).length > 0) {
      setClientErrors(found);
      focusFirstError(found);
      return;
    }
    setClientErrors(null);
    sending.current = true;
    const data = new FormData(form);
    // The same token goes with a retry, so a submission that did get through is never saved twice.
    data.set("token", meta.current.token);
    data.set("startedAt", meta.current.startedAt);
    startTransition(() => action(data));
  };

  // Clear a field's message as soon as its value becomes valid.
  const handleChange = (event: FormEvent<HTMLFormElement>) => {
    if (!clientErrors) return;
    const found = validateInquiry(readValues(event.currentTarget));
    const field = (event.target as HTMLInputElement).name as InquiryField;
    if (!found[field] && clientErrors[field]) {
      const rest = { ...clientErrors };
      delete rest[field];
      setClientErrors(rest);
    }
  };

  if (state.status === "sent") {
    return (
      <div ref={thanksRef} role="status" tabIndex={-1} className="animate-[rise_0.9s_var(--ease-soft)_both] py-20 text-center outline-none">
        <T as="h3" id="form.thanks.heading" className="script text-[44px] text-terracotta" />
        <T as="p" id="form.thanks.text" className="mx-auto mt-4 max-w-[420px]" />
      </div>
    );
  }

  return (
    <form action={action} onSubmit={handleSubmit} onChange={handleChange} noValidate className="grid gap-y-8">
      <T as="p" id="form.required" className="text-[14px] text-walnut" />

      <fieldset data-reveal="up" className="grid gap-x-6 gap-y-5 md:grid-cols-2">
        <legend className="display mb-4 text-[21px] leading-snug text-espresso md:text-[23px]">
          <T id="form.name.heading" />
          <span aria-hidden="true"> *</span>
        </legend>
        <Field name="firstName" labelId="form.firstName.label" required index={0} errors={errors}>
          {(props) => <input {...props} type="text" autoComplete="given-name" />}
        </Field>
        <Field name="lastName" labelId="form.lastName.label" required index={1} errors={errors}>
          {(props) => <input {...props} type="text" autoComplete="family-name" />}
        </Field>
      </fieldset>

      <Field name="phone" labelId="form.phone.label" required variant="question" index={2} errors={errors}>
        {(props) => <input {...props} type="tel" autoComplete="tel" inputMode="tel" placeholder={placeholders.phone} />}
      </Field>

      <Field name="email" labelId="form.email.label" required variant="question" index={3} errors={errors}>
        {(props) => <input {...props} type="email" autoComplete="email" inputMode="email" placeholder={placeholders.email} />}
      </Field>

      <Field name="sessionType" labelId="form.sessionType.label" required variant="question" index={4} errors={errors}>
        {(props) => (
          <div className="relative">
            <select
              {...props}
              value={session}
              onChange={(event) => setPicked(event.target.value)}
              className={`${props.className} appearance-none pr-11`}
            >
              <TextOption id="form.select.placeholder" value="" disabled />
              {sessionOptions.map((option) => (
                <TextOption key={option.value} id={`form.session.${option.value}`} value={option.value} />
              ))}
            </select>
            <Chevron />
          </div>
        )}
      </Field>

      {askDueDate ? (
        <div className="animate-[rise_0.7s_var(--ease-soft)_both] rounded-[14px] border border-terracotta/50 bg-cream/70 p-5 md:p-6">
          <T as="h3" id="form.maternity.heading" className="display text-[21px] leading-snug text-rust md:text-[23px]" />
          <Field name="dueDate" labelId="form.dueDate.label" index={0} errors={errors} className="mt-4">
            {(props) => <input {...props} type="date" />}
          </Field>
        </div>
      ) : null}

      <div className="grid gap-x-6 gap-y-8 md:grid-cols-2">
        <Field name="locationPreference" labelId="form.locationPreference.label" variant="question" index={5} errors={errors}>
          {(props) => (
            <div className="relative">
              <select {...props} defaultValue="" className={`${props.className} appearance-none pr-11`}>
                <TextOption id="form.select.placeholder" value="" />
                {locationPreferences.map((option, index) => (
                  <TextOption key={option} id={`form.locationPreference.option.${index + 1}`} value={option} />
                ))}
              </select>
              <Chevron />
            </div>
          )}
        </Field>
        <Field name="location" labelId="form.location.label" index={6} errors={errors} className="md:self-end">
          {(props) => <input {...props} type="text" autoComplete="address-level2" placeholder={placeholders.location} />}
        </Field>
      </div>

      <fieldset
        data-reveal="up"
        aria-describedby={errors.preferredDays ? "inquiry-preferredDays-error" : undefined}
        className="min-w-0"
      >
        <legend className="display text-[21px] leading-snug text-espresso md:text-[23px]">
          <T id="form.days.label" />
          <span aria-hidden="true"> *</span>
        </legend>
        <T as="p" id="form.days.hint" className="mt-1 text-[14px] text-walnut/90" />
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {weekdays.map((day, index) => (
            <label
              key={day}
              className="flex min-h-[52px] cursor-pointer items-center gap-3 rounded-[10px] border border-sage/70 bg-white/70 px-4 text-[15px] text-espresso transition-[border-color,background-color] duration-300 hover:border-sage has-[input:checked]:border-terracotta has-[input:checked]:bg-terracotta/15 has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-terracotta/40"
            >
              <input
                id={index === 0 ? "inquiry-preferredDays" : undefined}
                type="checkbox"
                name="preferredDays"
                value={day}
                aria-invalid={Boolean(errors.preferredDays)}
                className="h-5 w-5 shrink-0 accent-rust"
              />
              <T id={`form.day.${index + 1}`} />
            </label>
          ))}
        </div>
        {errors.preferredDays ? (
          <p id="inquiry-preferredDays-error" className="mt-2 text-[13px] text-rust">
            {errors.preferredDays}
          </p>
        ) : null}
      </fieldset>

      <Field name="message" labelId="form.message.label" hintId="form.message.hint" required variant="question" index={8} errors={errors}>
        {(props) => (
          <textarea {...props} rows={6} maxLength={MESSAGE_LIMIT} className={`${props.className} min-h-[170px] resize-y leading-relaxed`} />
        )}
      </Field>

      <Field name="referral" labelId="form.referral.label" variant="question" index={9} errors={errors}>
        {(props) => (
          <div className="relative">
            <select {...props} defaultValue="" className={`${props.className} appearance-none pr-11`}>
              <TextOption id="form.select.placeholder" value="" />
              {referralOptions.map((option, index) => (
                <TextOption key={option} id={`form.referral.option.${index + 1}`} value={option} />
              ))}
            </select>
            <Chevron />
          </div>
        )}
      </Field>

      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div data-reveal="up" className="space-y-4">
        {Object.keys(errors).length > 0 ? (
          <p role="alert" className="text-[14px] text-rust">
            Please check the highlighted fields above.
          </p>
        ) : null}

        {state.status === "error" ? (
          <p role="alert" className="rounded-[10px] border border-rust bg-rust/5 p-4 text-[14px] text-rust">
            {state.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="btn w-full text-[14px] tracking-[0.18em] md:w-auto md:min-w-[300px]"
        >
          <T id={pending ? "form.sending" : "form.submit"} />
        </button>
      </div>
    </form>
  );
}
