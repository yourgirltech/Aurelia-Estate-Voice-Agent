// UI-only formatting helpers. Does not touch form data shape or validation.

const SYMBOLS = { USD: "$", EUR: "€", GBP: "£", NGN: "₦", AED: "د.إ" };

export function currencySymbol(code) {
  return SYMBOLS[code] || code || "";
}

export function formatPrice(value, currency) {
  if (value === null || value === undefined) return "";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currencySymbol(currency)}${Number(value).toLocaleString("en-US")}`;
  }
}

export function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "";
  return Number(value).toLocaleString("en-US");
}
