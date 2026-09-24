// Salutation phrases per title code and language.
// IMPORTANT: never guess gender from a name — the customer's chosen title
// ("Title" dropdown on the form) is the only source of mr/mrs/ms/dr/prof/none.
//
// To add a language: add a key here (matching the language code in languages.js)
// with an entry for every title code below.

export const SALUTATIONS = {
  en: {
    mr: (first, last) => `Mr ${last}`,
    mrs: (first, last) => `Mrs ${last}`,
    ms: (first, last) => `Ms ${last}`,
    dr: (first, last) => `Dr ${last}`,
    prof: (first, last) => `Professor ${last}`,
    none: (first, last) => `${first} ${last}`,
  },
  fr: {
    mr: (first, last) => `Monsieur ${last}`,
    mrs: (first, last) => `Madame ${last}`,
    ms: (first, last) => `Madame ${last}`,
    dr: (first, last) => `Docteur ${last}`,
    prof: (first, last) => `Professeur ${last}`,
    none: (first, last) => `${first} ${last}`,
  },
  es: {
    mr: (first, last) => `Señor ${last}`,
    mrs: (first, last) => `Señora ${last}`,
    ms: (first, last) => `Señora ${last}`,
    dr: (first, last) => `Doctor/a ${last}`,
    prof: (first, last) => `Profesor ${last}`,
    none: (first, last) => `${first} ${last}`,
  },
  de: {
    mr: (first, last) => `Herr ${last}`,
    mrs: (first, last) => `Frau ${last}`,
    ms: (first, last) => `Frau ${last}`,
    dr: (first, last) => `Dr. ${last}`,
    prof: (first, last) => `Prof. ${last}`,
    none: (first, last) => `${first} ${last}`,
  },
  ar: {
    // Arabic salutations use the first name, not the surname.
    mr: (first, last) => `السيد ${first}`,
    mrs: (first, last) => `السيدة ${first}`,
    ms: (first, last) => `السيدة ${first}`,
    dr: (first, last) => `الدكتور ${first}`,
    prof: (first, last) => `الأستاذ الدكتور ${first}`,
    none: (first, last) => `${first}`,
  },
  pt: {
    mr: (first, last) => `Senhor ${last}`,
    mrs: (first, last) => `Senhora ${last}`,
    ms: (first, last) => `Senhora ${last}`,
    dr: (first, last) => `Doutor ${last}`,
    prof: (first, last) => `Professor ${last}`,
    none: (first, last) => `${first} ${last}`,
  },
  it: {
    mr: (first, last) => `Signor ${last}`,
    mrs: (first, last) => `Signora ${last}`,
    ms: (first, last) => `Signora ${last}`,
    dr: (first, last) => `Dottore ${last}`,
    prof: (first, last) => `Professore ${last}`,
    none: (first, last) => `${first} ${last}`,
  },
};

/**
 * Build the spoken salutation for a lead.
 * Falls back to English, then to "{first} {last}", if the language/title
 * combination isn't configured.
 */
export function buildSalutation(language, titleCode, firstName, surname) {
  const langTable = SALUTATIONS[language] || SALUTATIONS.en;
  const builder = langTable[titleCode] || langTable.none;
  return builder(firstName, surname);
}
