// Languages the AI voice agent can call in.
// To add a language: add it here, then add matching entries in
// supabase/functions/submit-enquiry/salutations.js, firstMessages.js and
// voiceConfig.js.
export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "de", label: "German" },
  { code: "ar", label: "Arabic" },
  { code: "pt", label: "Portuguese" },
  { code: "it", label: "Italian" },
];
