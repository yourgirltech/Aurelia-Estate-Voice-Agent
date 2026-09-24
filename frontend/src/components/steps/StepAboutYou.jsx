import PhoneInput from "react-phone-number-input";
import Field, { inputClass } from "../ui/Field.jsx";
import { TITLES, COUNTRIES } from "../../config/formOptions.js";
import { LANGUAGES } from "../../config/languages.js";

export default function StepAboutYou({ formData, setField, errors }) {
  return (
    <div>
      <h2 className="font-serif text-2xl text-brand mb-1">Let's start with you</h2>
      <p className="text-brand/60 text-sm mb-6">
        So we know who we're speaking with, and how to greet you properly.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Title" required error={errors.titleCode} htmlFor="titleCode">
          <select
            id="titleCode"
            className={inputClass}
            value={formData.titleCode}
            onChange={(e) => setField("titleCode", e.target.value)}
          >
            <option value="">Select…</option>
            {TITLES.map((t) => (
              <option key={t.code} value={t.code}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Preferred language" required error={errors.language} htmlFor="language">
          <select
            id="language"
            className={inputClass}
            value={formData.language}
            onChange={(e) => setField("language", e.target.value)}
          >
            <option value="">Select…</option>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="First name" required error={errors.firstName} htmlFor="firstName">
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            className={inputClass}
            value={formData.firstName}
            onChange={(e) => setField("firstName", e.target.value)}
          />
        </Field>

        <Field label="Surname" required error={errors.surname} htmlFor="surname">
          <input
            id="surname"
            type="text"
            autoComplete="family-name"
            className={inputClass}
            value={formData.surname}
            onChange={(e) => setField("surname", e.target.value)}
          />
        </Field>
      </div>

      <Field label="Email" required error={errors.email} htmlFor="email">
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={inputClass}
          value={formData.email}
          onChange={(e) => setField("email", e.target.value)}
        />
      </Field>

      <Field label="Phone number" required error={errors.phone} htmlFor="phone">
        <PhoneInput
          id="phone"
          international
          defaultCountry="GB"
          value={formData.phone}
          onChange={(value) => setField("phone", value || "")}
        />
      </Field>

      <Field label="Country of residence" required error={errors.country} htmlFor="country">
        <select
          id="country"
          className={inputClass}
          value={formData.country}
          onChange={(e) => setField("country", e.target.value)}
        >
          <option value="">Select…</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}
