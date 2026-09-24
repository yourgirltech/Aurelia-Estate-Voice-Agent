import { motion } from "framer-motion";
import { Phone, Mail } from "lucide-react";
import { COMPANY } from "../config/company.js";
import { LANGUAGES } from "../config/languages.js";

export default function ThankYou({ salutation, language }) {
  const languageLabel = LANGUAGES.find((l) => l.code === language)?.label;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="bg-brand-surface rounded-2xl shadow-card border border-brand-border p-8 sm:p-10 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
        className="w-16 h-16 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center mx-auto mb-5"
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <motion.path
            d="M20 6L9 17l-5-5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0.2 }}
          />
        </svg>
      </motion.div>

      <h1 className="font-serif text-2xl text-brand mb-2">Thank you, {salutation}</h1>
      <p className="text-brand/70 mb-6">
        {COMPANY.name} will be calling within the minute — please keep your phone close.
      </p>

      <div className="text-left bg-brand-bg rounded-xl p-4 sm:p-5 mb-6">
        <p className="flex items-center gap-2 text-sm font-medium text-brand mb-3">
          <Phone size={16} strokeWidth={1.75} className="text-brand-gold" />
          What to expect
        </p>
        <ul className="text-sm text-brand/70 space-y-1.5 list-disc list-inside">
          <li>We'll confirm a few details about your enquiry</li>
          <li>
            The call will be entirely in {languageLabel || "your chosen language"}
          </li>
          <li>Most calls take two to five minutes</li>
        </ul>
      </div>

      <p className="flex items-center justify-center gap-2 text-xs text-brand/50">
        <Mail size={14} strokeWidth={1.75} />
        Would rather correspond by email? Just say so on the call and we'll take it from there.
      </p>
    </motion.div>
  );
}
