"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import { submitInquiry } from "@/app/(site)/contact/actions";
import { T } from "@/components/editable-text";
import { useText } from "@/components/site-texts-provider";
import { categories } from "@/content/site";
import {
  inquiryFields,
  isoDate,
  referralOptions,
  sessionTypeIds,
  validateInquiry,
  MESSAGE_LIMIT,
  type InquiryErrors,
  type InquiryField,
  type InquiryState,
  type InquiryValues,
} from "@/lib/inquiry";

// 16px text stops iPhones zooming the page when a field is tapped, and the
// 52px height keeps every field easy to hit with a thumb.
const controlClass =
  "mt-2 block min-h-[52px] w-full rounded-[10px] border border-sage/70 bg-white/70 px-4 py-3 text-[16px] text-espresso placeholder:text-sage/80 transition-[border-color,box-shadow,background-color] duration-300 hover:border-sage focus:border-terracotta focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/40 aria-invalid:border-2 aria-invalid:border-rust";

function readValues(form: HTMLFormElement): InquiryValues {
  const data = new FormData(form);
  return Object.fromEntries(
    inquiryFields.map((field) => [field, String(data.get(field) ?? "")]),
  ) as InquiryValues;
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
  required?: boolean;
  /** Spans both columns on wide screens. */
  wide?: boolean;
  /** Position in the form, for the staggered entrance. */
  index: number;
  errors: InquiryErrors;
  children: (props: {
    id: string;
    name: InquiryField;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
    required: boolean;
    className: string;
  }) => ReactNode;
};

function Field({ name, required = false, wide = false, index, errors, children }: FieldProps) {
  const id = `inquiry-${name}`;
  const errorId = `${id}-error`;
  const error = errors[name];
  return (
    <div
      data-reveal="up"
      style={{ "--reveal-delay": `${Math.min(index, 8) * 0.06}s` } as CSSProperties}
      className={`flex flex-col justify-end ${wide ? "md:col-span-2" : ""}`}
    >
      <label htmlFor={id} className="text-[13px] uppercase tracking-[0.1em] text-walnut">
        <T id={`form.${name === "preferredDate" ? "date" : name}.label`} />
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
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
  const sessionRef = useRef<HTMLSelectElement>(null);
  const startedRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const placeholders = {
    name: useText("form.name.placeholder"),
    email: useText("form.email.placeholder"),
    phone: useText("form.phone.placeholder"),
    instagram: useText("form.instagram.placeholder"),
    location: useText("form.location.placeholder"),
    message: useText("form.message.placeholder"),
  };

  // A card on the home page can send the visitor here with the session already chosen.
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("session");
    if (wanted && sessionTypeIds.includes(wanted) && sessionRef.current) sessionRef.current.value = wanted;
    // Today's date is only known in the browser, so the earliest choosable day is set here.
    if (dateRef.current) dateRef.current.min = isoDate(new Date());
    // Used to spot bots that fill the form in instantly.
    if (startedRef.current) startedRef.current.value = String(Date.now());
  }, []);

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
    const form = event.currentTarget;
    const found = validateInquiry(readValues(form));
    if (Object.keys(found).length > 0) {
      setClientErrors(found);
      focusFirstError(found);
      return;
    }
    setClientErrors(null);
    startTransition(() => action(new FormData(form)));
  };

  // Clear a field's message as soon as its value becomes valid.
  const handleChange = (event: FormEvent<HTMLFormElement>) => {
    if (!clientErrors) return;
    const target = event.target as HTMLInputElement;
    const found = validateInquiry(readValues(event.currentTarget));
    const field = target.name as InquiryField;
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
    <form action={action} onSubmit={handleSubmit} onChange={handleChange} noValidate className="grid gap-x-6 gap-y-7 md:grid-cols-2">
      <T as="p" id="form.required" className="text-[14px] text-walnut md:col-span-2" />

      <Field name="name" required index={0} errors={errors}>
        {(props) => <input {...props} type="text" autoComplete="name" placeholder={placeholders.name} />}
      </Field>
      <Field name="email" required index={1} errors={errors}>
        {(props) => <input {...props} type="email" autoComplete="email" inputMode="email" placeholder={placeholders.email} />}
      </Field>
      <Field name="phone" index={2} errors={errors}>
        {(props) => <input {...props} type="tel" autoComplete="tel" inputMode="tel" placeholder={placeholders.phone} />}
      </Field>
      <Field name="instagram" index={3} errors={errors}>
        {(props) => <input {...props} type="text" autoCapitalize="none" autoCorrect="off" placeholder={placeholders.instagram} />}
      </Field>
      <Field name="sessionType" required index={4} errors={errors}>
        {(props) => (
          <div className="relative">
            <select {...props} ref={sessionRef} defaultValue="" className={`${props.className} appearance-none pr-11`}>
              <TextOption id="form.select.placeholder" value="" disabled />
              {categories.map((category) => (
                <TextOption key={category.id} id={`category.${category.id}`} value={category.id} />
              ))}
              <TextOption id="form.sessionType.other" value="other" />
            </select>
            <Chevron />
          </div>
        )}
      </Field>
      <Field name="referral" index={5} errors={errors}>
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
      <Field name="location" index={6} errors={errors}>
        {(props) => <input {...props} type="text" autoComplete="address-level2" placeholder={placeholders.location} />}
      </Field>
      <Field name="preferredDate" index={7} errors={errors}>
        {(props) => <input {...props} ref={dateRef} type="date" />}
      </Field>
      <Field name="message" wide index={8} errors={errors}>
        {(props) => (
          <textarea
            {...props}
            rows={5}
            maxLength={MESSAGE_LIMIT}
            placeholder={placeholders.message}
            className={`${props.className} min-h-[150px] resize-y leading-relaxed`}
          />
        )}
      </Field>

      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
        <input ref={startedRef} type="hidden" name="startedAt" defaultValue="" />
      </div>

      <div data-reveal="up" style={{ "--reveal-delay": "0.6s" } as CSSProperties} className="space-y-4 md:col-span-2">
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
