import Field, { inputClass } from "../ui/Field.jsx";
import SelectCard from "../ui/SelectCard.jsx";
import { PropertyCard, NotSurePropertyCard } from "../ui/PropertyCard.jsx";
import PropertySkeleton from "../ui/PropertySkeleton.jsx";
import {
  ENQUIRY_TYPE_ICONS,
  PROPERTY_TYPE_ICONS,
  PROXIMITY_ICONS,
  TIMELINE_ICONS,
  PAYMENT_METHOD_ICONS,
  BEDROOMS_ICON,
} from "../ui/optionIcons.js";
import {
  ENQUIRY_TYPES,
  PROPERTY_TYPES,
  PROXIMITY_OPTIONS,
  BEDROOMS,
  CURRENCIES,
  TIMELINES,
  PAYMENT_METHODS,
} from "../../config/formOptions.js";
import { currencySymbol } from "../../lib/format.js";

export default function StepEnquiry({
  formData,
  setField,
  errors,
  properties,
  propertiesLoading,
}) {
  function toggleProximity(code) {
    const current = formData.proximityPreferences || [];
    const next = current.includes(code)
      ? current.filter((c) => c !== code)
      : [...current, code];
    setField("proximityPreferences", next);
  }

  return (
    <div>
      <h2 className="font-serif text-2xl text-brand mb-1">What are you looking for?</h2>
      <p className="text-brand/60 text-sm mb-6">
        A few details so we can put you through to the right specialist.
      </p>

      <Field label="Enquiry type" required error={errors.enquiryType}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="group" aria-label="Enquiry type">
          {ENQUIRY_TYPES.map((opt) => (
            <SelectCard
              key={opt.code}
              label={opt.label}
              icon={ENQUIRY_TYPE_ICONS[opt.code]}
              selected={formData.enquiryType === opt.code}
              onClick={() => setField("enquiryType", opt.code)}
            />
          ))}
        </div>
      </Field>

      <Field label="Property of interest">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="group" aria-label="Property of interest">
          <NotSurePropertyCard
            selected={!formData.propertyId}
            onClick={() => setField("propertyId", "")}
          />
          {propertiesLoading
            ? Array.from({ length: 3 }).map((_, i) => <PropertySkeleton key={i} />)
            : properties.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  selected={formData.propertyId === p.id}
                  onClick={() => setField("propertyId", p.id)}
                />
              ))}
        </div>
      </Field>

      <Field label="Preferred location(s)" htmlFor="preferredLocations">
        <input
          id="preferredLocations"
          type="text"
          placeholder="e.g. Marina, Downtown"
          className={inputClass}
          value={formData.preferredLocations}
          onChange={(e) => setField("preferredLocations", e.target.value)}
        />
      </Field>

      <Field label="Property type">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" role="group" aria-label="Property type">
          {PROPERTY_TYPES.map((opt) => (
            <SelectCard
              key={opt.code}
              label={opt.label}
              icon={PROPERTY_TYPE_ICONS[opt.code]}
              compact
              selected={formData.propertyType === opt.code}
              onClick={() => setField("propertyType", opt.code)}
            />
          ))}
        </div>
      </Field>

      <Field label="Close to" hint="Select any that matter to you">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="group" aria-label="Proximity preferences">
          {PROXIMITY_OPTIONS.map((opt) => (
            <SelectCard
              key={opt.code}
              label={opt.label}
              icon={PROXIMITY_ICONS[opt.code]}
              compact
              selected={(formData.proximityPreferences || []).includes(opt.code)}
              onClick={() => toggleProximity(opt.code)}
            />
          ))}
        </div>
      </Field>

      <Field label="Bedrooms">
        <div className="flex flex-wrap gap-3" role="group" aria-label="Bedrooms">
          {BEDROOMS.map((opt) => (
            <SelectCard
              key={opt.code}
              label={opt.label}
              icon={BEDROOMS_ICON}
              compact
              selected={formData.bedrooms === opt.code}
              onClick={() => setField("bedrooms", opt.code)}
            />
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Budget min" htmlFor="budgetMin">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand/40 text-sm">
              {currencySymbol(formData.currency) || "#"}
            </span>
            <input
              id="budgetMin"
              type="number"
              min="0"
              inputMode="numeric"
              className={`${inputClass} pl-8`}
              value={formData.budgetMin}
              onChange={(e) => setField("budgetMin", e.target.value)}
            />
          </div>
        </Field>

        <Field label="Budget max" htmlFor="budgetMax">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand/40 text-sm">
              {currencySymbol(formData.currency) || "#"}
            </span>
            <input
              id="budgetMax"
              type="number"
              min="0"
              inputMode="numeric"
              className={`${inputClass} pl-8`}
              value={formData.budgetMax}
              onChange={(e) => setField("budgetMax", e.target.value)}
            />
          </div>
        </Field>

        <Field label="Currency" htmlFor="currency">
          <select
            id="currency"
            className={inputClass}
            value={formData.currency}
            onChange={(e) => setField("currency", e.target.value)}
          >
            <option value="">Select…</option>
            {CURRENCIES.map((o) => (
              <option key={o.code} value={o.code}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Timeline">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" role="group" aria-label="Timeline">
          {TIMELINES.map((opt) => (
            <SelectCard
              key={opt.code}
              label={opt.label}
              icon={TIMELINE_ICONS[opt.code]}
              compact
              selected={formData.timeline === opt.code}
              onClick={() => setField("timeline", opt.code)}
            />
          ))}
        </div>
      </Field>

      <Field label="Payment method">
        <div className="grid grid-cols-2 gap-3" role="group" aria-label="Payment method">
          {PAYMENT_METHODS.map((opt) => (
            <SelectCard
              key={opt.code}
              label={opt.label}
              icon={PAYMENT_METHOD_ICONS[opt.code]}
              compact
              selected={formData.paymentMethod === opt.code}
              onClick={() => setField("paymentMethod", opt.code)}
            />
          ))}
        </div>
      </Field>
    </div>
  );
}
