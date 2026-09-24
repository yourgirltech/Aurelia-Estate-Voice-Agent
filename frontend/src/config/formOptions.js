// Static dropdown/radio options for the enquiry form.
// Kept in one file so adding/removing options doesn't require touching
// component code.

export const TITLES = [
  { code: "mr", label: "Mr" },
  { code: "mrs", label: "Mrs" },
  { code: "ms", label: "Ms" },
  { code: "dr", label: "Dr" },
  { code: "prof", label: "Prof" },
  { code: "none", label: "Prefer not to say" },
];

export const ENQUIRY_TYPES = [
  { code: "buy", label: "Buy" },
  { code: "rent", label: "Rent" },
  { code: "invest", label: "Invest" },
  { code: "general", label: "General question" },
];

export const PROPERTY_TYPES = [
  { code: "Apartment", label: "Apartment" },
  { code: "Detached House", label: "Detached" },
  { code: "Semi-Detached House", label: "Semi-detached" },
  { code: "Terraced House", label: "Terraced" },
  { code: "Bungalow", label: "Bungalow" },
  { code: "Land", label: "Land" },
  { code: "Commercial", label: "Commercial" },
  { code: "Other", label: "Other" },
];

// What the customer wants nearby. Stored as a text array on the lead.
export const PROXIMITY_OPTIONS = [
  { code: "main_road", label: "Main road / highway" },
  { code: "school", label: "School" },
  { code: "hospital", label: "Hospital" },
  { code: "shopping", label: "Shopping mall / market" },
  { code: "airport", label: "Airport" },
  { code: "public_transport", label: "Public transport" },
  { code: "worship", label: "Place of worship" },
  { code: "waterfront", label: "Waterfront / beach" },
];

export const BEDROOMS = [
  { code: "Studio", label: "Studio" },
  { code: "1", label: "1" },
  { code: "2", label: "2" },
  { code: "3", label: "3" },
  { code: "4", label: "4" },
  { code: "5+", label: "5+" },
];

export const CURRENCIES = [
  { code: "USD", label: "USD" },
  { code: "EUR", label: "EUR" },
  { code: "GBP", label: "GBP" },
  { code: "NGN", label: "NGN" },
  { code: "AED", label: "AED" },
];

export const TIMELINES = [
  { code: "immediately", label: "Immediately" },
  { code: "1-3 months", label: "1–3 months" },
  { code: "3-6 months", label: "3–6 months" },
  { code: "6+ months", label: "6+ months" },
  { code: "browsing", label: "Just browsing" },
];

export const PAYMENT_METHODS = [
  { code: "cash", label: "Cash" },
  { code: "mortgage", label: "Mortgage" },
  { code: "instalment", label: "Instalment plan" },
  { code: "not_sure", label: "Not sure" },
];

// Country -> default currency, used to prefill the Currency field.
// Falls back to USD when the customer's country isn't listed here.
export const COUNTRY_CURRENCY = {
  "United Arab Emirates": "AED",
  "United Kingdom": "GBP",
  Nigeria: "NGN",
  France: "EUR",
  Spain: "EUR",
  Germany: "EUR",
  Italy: "EUR",
  Portugal: "EUR",
  "United States": "USD",
};

export const COUNTRIES = [
  "United Arab Emirates",
  "United Kingdom",
  "Nigeria",
  "France",
  "Spain",
  "Germany",
  "Italy",
  "Portugal",
  "United States",
  "Canada",
  "Ireland",
  "South Africa",
  "Kenya",
  "Ghana",
  "Saudi Arabia",
  "Qatar",
  "Egypt",
  "Morocco",
  "Brazil",
  "Other",
];
