// Per-language transcriber/voice settings for the Vapi call.
// Kept separate from index.js so a single language (e.g. Arabic) can later
// be switched to a different transcriber/voice provider without touching
// the call-building logic.
//
// `languageName` is the full English name of the language, used in
// assistantOverrides.variableValues.language so the assistant's prompt can
// say e.g. "The customer speaks French."

const DEFAULT_VOICE_PROVIDER = "vapi";

export function buildVoiceConfig(languageCode, voiceId) {
  const entry = VOICE_CONFIG[languageCode] || VOICE_CONFIG.en;
  return {
    languageName: entry.languageName,
    transcriber: {
      provider: entry.transcriberProvider,
      model: entry.transcriberModel,
      language: languageCode,
    },
    voice: {
      provider: entry.voiceProvider,
      voiceId,
      version: 2,
      language: languageCode,
    },
  };
}

export const VOICE_CONFIG = {
  en: {
    languageName: "English",
    transcriberProvider: "deepgram",
    transcriberModel: "nova-3",
    voiceProvider: DEFAULT_VOICE_PROVIDER,
  },
  fr: {
    languageName: "French",
    transcriberProvider: "deepgram",
    transcriberModel: "nova-3",
    voiceProvider: DEFAULT_VOICE_PROVIDER,
  },
  es: {
    languageName: "Spanish",
    transcriberProvider: "deepgram",
    transcriberModel: "nova-3",
    voiceProvider: DEFAULT_VOICE_PROVIDER,
  },
  de: {
    languageName: "German",
    transcriberProvider: "deepgram",
    transcriberModel: "nova-3",
    voiceProvider: DEFAULT_VOICE_PROVIDER,
  },
  ar: {
    languageName: "Arabic",
    // Placeholder: swap this if nova-3 doesn't cover Arabic well enough
    // once you've tested with a real call.
    transcriberProvider: "deepgram",
    transcriberModel: "nova-3",
    voiceProvider: DEFAULT_VOICE_PROVIDER,
  },
  pt: {
    languageName: "Portuguese",
    transcriberProvider: "deepgram",
    transcriberModel: "nova-3",
    voiceProvider: DEFAULT_VOICE_PROVIDER,
  },
  it: {
    languageName: "Italian",
    transcriberProvider: "deepgram",
    transcriberModel: "nova-3",
    voiceProvider: DEFAULT_VOICE_PROVIDER,
  },
};
