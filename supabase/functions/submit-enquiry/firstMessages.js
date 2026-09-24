// First message spoken by the AI agent, per language.
//
// ⚠️ REVIEW REQUIRED: every message below must be reviewed by a native
// speaker before this goes live with real customers. Machine-approximate
// phrasing is a placeholder, not a final script.
//
// {salutation} and {company} are always filled in. {property} is filled in
// only when the lead selected a specific property — otherwise the
// "*_no_property" variant is used instead.

export const FIRST_MESSAGES = {
  en: {
    with_property:
      "Hello, am I speaking with {salutation}? This is Ada calling from {company} about your enquiry regarding {property}.",
    no_property:
      "Hello, am I speaking with {salutation}? This is Ada calling from {company} about your enquiry.",
  },
  fr: {
    with_property:
      "Bonjour, suis-je bien en ligne avec {salutation} ? Ici Ada, de {company}, au sujet de votre demande concernant {property}.",
    no_property:
      "Bonjour, suis-je bien en ligne avec {salutation} ? Ici Ada, de {company}, au sujet de votre demande.",
  },
  es: {
    with_property:
      "Hola, ¿hablo con {salutation}? Soy Ada, de {company}, y le llamo por su consulta sobre {property}.",
    no_property:
      "Hola, ¿hablo con {salutation}? Soy Ada, de {company}, y le llamo por su consulta.",
  },
  de: {
    with_property:
      "Guten Tag, spreche ich mit {salutation}? Hier ist Ada von {company}, ich rufe wegen Ihrer Anfrage zu {property} an.",
    no_property:
      "Guten Tag, spreche ich mit {salutation}? Hier ist Ada von {company}, ich rufe wegen Ihrer Anfrage an.",
  },
  ar: {
    with_property:
      "مرحباً، هل أتحدث مع {salutation}؟ معك آدا من {company}، أتصل بخصوص استفسارك عن {property}.",
    no_property:
      "مرحباً، هل أتحدث مع {salutation}؟ معك آدا من {company}، أتصل بخصوص استفسارك.",
  },
  pt: {
    with_property:
      "Olá, falo com {salutation}? Aqui é a Ada, da {company}, a ligar sobre o seu pedido de informação sobre {property}.",
    no_property:
      "Olá, falo com {salutation}? Aqui é a Ada, da {company}, a ligar sobre o seu pedido de informação.",
  },
  it: {
    with_property:
      "Buongiorno, parlo con {salutation}? Sono Ada di {company} e la chiamo per la sua richiesta su {property}.",
    no_property:
      "Buongiorno, parlo con {salutation}? Sono Ada di {company} e la chiamo per la sua richiesta.",
  },
};

/**
 * Build the spoken first message for a call.
 * Falls back to English if the language isn't configured.
 */
export function buildFirstMessage(language, { salutation, company, property }) {
  const table = FIRST_MESSAGES[language] || FIRST_MESSAGES.en;
  const template = property ? table.with_property : table.no_property;
  return template
    .replace("{salutation}", salutation)
    .replace("{company}", company)
    .replace("{property}", property || "");
}
