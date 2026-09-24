import { Pencil } from "lucide-react";
import {
  TITLES,
  ENQUIRY_TYPES,
  PROPERTY_TYPES,
  PROXIMITY_OPTIONS,
  TIMELINES,
  PAYMENT_METHODS,
} from "../../config/formOptions.js";
import { LANGUAGES } from "../../config/languages.js";
import { COMPANY } from "../../config/company.js";
import { formatNumber } from "../../lib/format.js";

function labelFor(list, code, key = "code") {
  return list.find((o) => o[key] === code)?.label || code;
}

export default function StepReview({
  formData,
  setField,
  errors,
  properties,
  goToStep,
}) {
  const property = properties.find((p) => p.id === formData.propertyId);

  return (
    <div>
      <h2 className="font-serif text-2xl text-brand mb-1">Almost there</h2>
      <p className="text-brand/60 text-sm mb-6">
        Take a moment to check everything below, then we'll have someone call you.
      </p>

      <SummarySection title="About you" onEdit={() => goToStep(1)}>
        <SummaryRow label="Name">
          {labelFor(TITLES, formData.titleCode)} {formData.firstName} {formData.surname}
        </SummaryRow>
        <SummaryRow label="Email">{formData.email}</SummaryRow>
        <SummaryRow label="Phone">{formData.phone}</SummaryRow>
        <SummaryRow label="Country">{formData.country}</SummaryRow>
        <SummaryRow label="Language">
          {labelFor(LANGUAGES, formData.language)}
        </SummaryRow>
      </SummarySection>

      <SummarySection title="Your enquiry" onEdit={() => goToStep(2)}>
        <SummaryRow label="Enquiry type">
          {labelFor(ENQUIRY_TYPES, formData.enquiryType)}
        </SummaryRow>
        <SummaryRow label="Property">{property ? property.name : "Not sure yet"}</SummaryRow>
        {formData.preferredLocations && (
          <SummaryRow label="Preferred location(s)">{formData.preferredLocations}</SummaryRow>
        )}
        {formData.propertyType && (
          <SummaryRow label="Property type">
            {labelFor(PROPERTY_TYPES, formData.propertyType)}
          </SummaryRow>
        )}
        {formData.proximityPreferences?.length > 0 && (
          <SummaryRow label="Close to">
            {formData.proximityPreferences
              .map((code) => labelFor(PROXIMITY_OPTIONS, code))
              .join(", ")}
          </SummaryRow>
        )}
        {formData.bedrooms && <SummaryRow label="Bedrooms">{formData.bedrooms}</SummaryRow>}
        {(formData.budgetMin || formData.budgetMax) && (
          <SummaryRow label="Budget">
            {formData.budgetMin ? formatNumber(formData.budgetMin) : "—"} to{" "}
            {formData.budgetMax ? formatNumber(formData.budgetMax) : "—"}{" "}
            {formData.currency}
          </SummaryRow>
        )}
        {formData.timeline && (
          <SummaryRow label="Timeline">{labelFor(TIMELINES, formData.timeline)}</SummaryRow>
        )}
        {formData.paymentMethod && (
          <SummaryRow label="Payment method">
            {labelFor(PAYMENT_METHODS, formData.paymentMethod)}
          </SummaryRow>
        )}
      </SummarySection>

      <div className="mb-6">
        <label htmlFor="message" className="block text-sm font-medium text-brand/80 mb-1.5">
          Message / questions
        </label>
        <textarea
          id="message"
          rows={4}
          maxLength={1000}
          placeholder="Anything else you'd like the assistant to know?"
          className="w-full rounded-xl border border-brand-border bg-brand-surface px-3.5 py-2.5 text-[0.9375rem] text-brand placeholder:text-brand/40 transition-colors focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold-light"
          value={formData.message}
          onChange={(e) => setField("message", e.target.value)}
        />
        <p className="mt-1 text-xs text-brand/40 text-right">{formData.message.length}/1000</p>
      </div>

      <div className="mb-2">
        <label className="flex items-start gap-3 text-sm text-brand/80 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.consentGiven}
            onChange={(e) => setField("consentGiven", e.target.checked)}
            className="mt-0.5 w-[18px] h-[18px] rounded border-brand-border text-brand-gold focus:ring-brand-gold-light"
          />
          <span>
            I agree to receive a phone call from an AI assistant on behalf of {COMPANY.name}{" "}
            about my enquiry. Calls may be recorded for quality and record-keeping.{" "}
            <span className="text-brand-gold">*</span>
          </span>
        </label>
        {errors.consentGiven && (
          <p className="mt-1.5 text-sm text-red-600" role="alert">
            {errors.consentGiven}
          </p>
        )}
      </div>

      {/* Honeypot: hidden from real users, bots tend to fill every field. */}
      <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
        <label htmlFor="website">Leave this field blank</label>
        <input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={formData.website}
          onChange={(e) => setField("website", e.target.value)}
        />
      </div>
    </div>
  );
}

function SummarySection({ title, onEdit, children }) {
  return (
    <div className="mb-5 rounded-xl border border-brand-border bg-brand-surface p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-brand">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 text-xs font-medium text-brand-gold hover:underline min-h-[44px] sm:min-h-0 px-2 -mr-2"
        >
          <Pencil size={13} strokeWidth={1.75} />
          Edit
        </button>
      </div>
      <dl className="space-y-1.5">{children}</dl>
    </div>
  );
}

function SummaryRow({ label, children }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-brand/50">{label}</dt>
      <dd className="text-brand text-right">{children}</dd>
    </div>
  );
}
