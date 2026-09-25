import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import ProgressBar from "./ui/ProgressBar.jsx";
import StepAboutYou from "./steps/StepAboutYou.jsx";
import StepEnquiry from "./steps/StepEnquiry.jsx";
import StepReview from "./steps/StepReview.jsx";
import ErrorState from "./ErrorState.jsx";
import { fetchAvailableProperties, submitEnquiry } from "../lib/supabase.js";
import { COUNTRY_CURRENCY } from "../config/formOptions.js";

const initialFormData = {
  titleCode: "",
  firstName: "",
  surname: "",
  email: "",
  phone: "",
  country: "",
  language: "",
  enquiryType: "",
  propertyId: "",
  preferredLocations: "",
  propertyType: "",
  proximityPreferences: [],
  bedrooms: "",
  budgetMin: "",
  budgetMax: "",
  currency: "",
  timeline: "",
  paymentMethod: "",
  message: "",
  consentGiven: false,
  website: "", // honeypot
};

const TOTAL_STEPS = 3;

// Pressing Enter inside a text/select field would otherwise submit the form
// natively (running full validation, including future steps) instead of
// just confirming that field's value. Buttons and the textarea are unaffected.
function preventEnterSubmit(e) {
  if (e.key === "Enter" && (e.target.tagName === "INPUT" || e.target.tagName === "SELECT")) {
    e.preventDefault();
  }
}

export default function EnquiryForm({ onSubmitted, onAboutYouComplete }) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [properties, setProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    fetchAvailableProperties()
      .then(setProperties)
      .catch((err) => console.error("Failed to load properties:", err))
      .finally(() => setPropertiesLoading(false));
  }, []);

  function setField(name, value) {
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // Prefill currency based on country, but only if the user hasn't
      // already picked one themselves.
      if (name === "country" && !prev.currency) {
        next.currency = COUNTRY_CURRENCY[value] || "USD";
      }
      return next;
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  }

  function validateStep(targetStep) {
    const next = {};
    if (targetStep === 1) {
      if (!formData.titleCode) next.titleCode = "Please select a title.";
      if (!formData.firstName.trim()) next.firstName = "First name is required.";
      if (!formData.surname.trim()) next.surname = "Surname is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) next.email = "Enter a valid email.";
      if (!formData.phone || !/^\+[1-9]\d{6,14}$/.test(formData.phone)) {
        next.phone = "Enter a valid phone number.";
      }
      if (!formData.country) next.country = "Please select your country.";
      if (!formData.language) next.language = "Please select a language.";
    }
    if (targetStep === 2) {
      if (!formData.enquiryType) next.enquiryType = "Please select an enquiry type.";
    }
    if (targetStep === 3) {
      if (!formData.consentGiven) next.consentGiven = "Consent is required to place the call.";
    }
    setErrors((prev) => ({ ...prev, ...next, ...clearOthers(next, targetStep) }));
    return Object.keys(next).length === 0;
  }

  // Only replace error keys relevant to the step being validated, keep the rest untouched.
  function clearOthers(nextErrors, targetStep) {
    const fieldsByStep = {
      1: ["titleCode", "firstName", "surname", "email", "phone", "country", "language"],
      2: ["enquiryType"],
      3: ["consentGiven"],
    };
    const cleared = {};
    for (const f of fieldsByStep[targetStep]) {
      if (!(f in nextErrors)) cleared[f] = null;
    }
    return cleared;
  }

  function goNext() {
    if (!validateStep(step)) return;
    if (step === 1) {
      // Let the "Talk to Precious" widget greet the visitor by name once we
      // actually know who they are — purely additive, doesn't touch
      // validation or the eventual submit payload.
      onAboutYouComplete?.({
        titleCode: formData.titleCode,
        firstName: formData.firstName,
        surname: formData.surname,
        email: formData.email,
        language: formData.language,
      });
    }
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function goBack() {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  }

  function goToStep(target) {
    setDirection(target > step ? 1 : -1);
    setStep(target);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);

    const step1Valid = validateStep(1);
    const step2Valid = validateStep(2);
    const step3Valid = validateStep(3);

    if (!step1Valid) return goToStep(1);
    if (!step2Valid) return goToStep(2);
    if (!step3Valid) return;

    setSubmitting(true);
    try {
      const result = await submitEnquiry({
        titleCode: formData.titleCode,
        firstName: formData.firstName,
        surname: formData.surname,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        language: formData.language,
        enquiryType: formData.enquiryType,
        propertyId: formData.propertyId || null,
        preferredLocations: formData.preferredLocations || null,
        propertyType: formData.propertyType || null,
        proximityPreferences: formData.proximityPreferences,
        bedrooms: formData.bedrooms || null,
        budgetMin: formData.budgetMin ? Number(formData.budgetMin) : null,
        budgetMax: formData.budgetMax ? Number(formData.budgetMax) : null,
        currency: formData.currency || null,
        timeline: formData.timeline || null,
        paymentMethod: formData.paymentMethod || null,
        message: formData.message,
        consentGiven: formData.consentGiven,
        website: formData.website, // honeypot
      });
      onSubmitted({ salutation: result.salutation, language: formData.language });
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitError) {
    return <ErrorState message={submitError} onRetry={() => setSubmitError(null)} />;
  }

  const stepVariants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 24 : -24 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -24 : 24 }),
  };

  return (
    <div className="bg-brand-surface rounded-2xl shadow-card border border-brand-border p-6 sm:p-8 relative">
      <ProgressBar currentStep={step} />

      <form onSubmit={handleSubmit} onKeyDown={preventEnterSubmit}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {step === 1 && (
              <StepAboutYou formData={formData} setField={setField} errors={errors} />
            )}
            {step === 2 && (
              <StepEnquiry
                formData={formData}
                setField={setField}
                errors={errors}
                properties={properties}
                propertiesLoading={propertiesLoading}
              />
            )}
            {step === 3 && (
              <StepReview
                formData={formData}
                setField={setField}
                errors={errors}
                properties={properties}
                goToStep={goToStep}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-8 gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1 min-h-[44px] px-4 rounded-xl text-brand/70 font-medium hover:bg-brand-bg transition-colors"
            >
              <ChevronLeft size={18} strokeWidth={1.75} />
              Back
            </button>
          ) : (
            <span />
          )}

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-1 min-h-[44px] px-6 rounded-xl bg-brand text-white font-medium hover:bg-brand-dark transition-colors"
            >
              Continue
              <ChevronRight size={18} strokeWidth={1.75} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 min-h-[44px] px-6 rounded-xl bg-brand text-white font-medium hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {submitting && <Loader2 size={18} className="animate-spin" strokeWidth={2} />}
              {submitting ? "Connecting your call…" : "Request my call"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
