"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { submitInquiry } from "@/app/(site)/contact/actions";
import { T } from "@/components/editable-text";
import { useText } from "@/components/site-texts-provider";
import {
  inquiryFields,
  referralOptions,
  sessionTypes,
  timelineOptions,
  validateInquiry,
  type InquiryErrors,
  type InquiryField,
  type InquiryState,
  type InquiryValues,
} from "@/lib/inquiry";

const controlClass =
  "mt-1 block w-full rounded-[2px] border border-sage bg-cream px-3 py-2 text-[15px] text-espresso placeholder:text-sage/80 aria-invalid:border-rust aria-invalid:border-2";

function readValues(form: HTMLFormElement): InquiryValues {
  const data = new FormData(form);
  return Object.fromEntries(
    inquiryFields.map((field) => [field, String(data.get(field) ?? "")]),
  ) as InquiryValues;
}

type FieldProps = {
  name: InquiryField;
  required?: boolean;
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

function Field({ name, required = false, errors, children }: FieldProps) {
  const id = `inquiry-${name}`;
  const errorId = `${id}-error`;
  const error = errors[name];
  return (
    <div>
      <label htmlFor={id} className="text-[15px] text-espresso">
        <T id={`form.${name}.label`} />
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
        <p id={errorId} className="mt-1 text-[13px] text-rust">
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
  const placeholders = {
    name: useText("form.name.placeholder"),
    email: useText("form.email.placeholder"),
    phone: useText("form.phone.placeholder"),
    instagram: useText("form.instagram.placeholder"),
    details: useText("form.details.placeholder"),
    about: useText("form.about.placeholder"),
    inspiration: useText("form.inspiration.placeholder"),
  };
  const email = useText("site.email");

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

  // Submitting by hand keeps the visitor's text in place if sending fails,
  // because React resets a form after an action run through its `action` prop.
  // That prop stays on the form so it still submits without JavaScript.
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
      <div ref={thanksRef} role="status" tabIndex={-1} className="py-24 text-center outline-none">
        <T as="h3" id="form.thanks.heading" className="script text-[40px] text-terracotta" />
        <T as="p" id="form.thanks.text" className="mt-4" />
      </div>
    );
  }

  return (
    <form action={action} onSubmit={handleSubmit} onChange={handleChange} noValidate className="space-y-6">
      <T as="p" id="form.required" className="text-[14px] text-walnut" />

      <Field name="name" required errors={errors}>
        {(props) => <input {...props} type="text" autoComplete="name" placeholder={placeholders.name} />}
      </Field>
      <Field name="email" required errors={errors}>
        {(props) => <input {...props} type="email" autoComplete="email" placeholder={placeholders.email} />}
      </Field>
      <Field name="phone" errors={errors}>
        {(props) => <input {...props} type="tel" autoComplete="tel" placeholder={placeholders.phone} />}
      </Field>
      <Field name="instagram" errors={errors}>
        {(props) => <input {...props} type="text" placeholder={placeholders.instagram} />}
      </Field>
      <Field name="sessionType" required errors={errors}>
        {(props) => (
          <select {...props} defaultValue="">
            <option value="" disabled>
              Select an option
            </option>
            {sessionTypes.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        )}
      </Field>
      <Field name="referral" errors={errors}>
        {(props) => (
          <select {...props} defaultValue="">
            <option value="">Select an option</option>
            {referralOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        )}
      </Field>
      <Field name="timeline" errors={errors}>
        {(props) => (
          <select {...props} defaultValue="">
            <option value="">Select an option</option>
            {timelineOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        )}
      </Field>
      <Field name="details" required errors={errors}>
        {(props) => <textarea {...props} rows={4} placeholder={placeholders.details} />}
      </Field>
      <Field name="about" errors={errors}>
        {(props) => <textarea {...props} rows={4} placeholder={placeholders.about} />}
      </Field>
      <Field name="inspiration" errors={errors}>
        {(props) => <textarea {...props} rows={4} placeholder={placeholders.inspiration} />}
      </Field>

      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {Object.keys(errors).length > 0 ? (
        <p role="alert" className="text-[14px] text-rust">
          Please check the highlighted fields above.
        </p>
      ) : null}

      {state.status === "undelivered" ? (
        <p role="alert" className="rounded-[10px] border border-rust p-4 text-[14px] text-rust">
          Thanks, your details look good, but this form could not send your message. Please email{" "}
          <a href={`mailto:${email}`} className="underline">
            {email}
          </a>{" "}
          instead.
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn">
        <T id={pending ? "form.sending" : "form.submit"} />
      </button>
    </form>
  );
}
