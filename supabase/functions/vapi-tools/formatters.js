// Small text helpers shared by the search and details tools.

export function formatMoney(amount) {
  if (amount == null) return "";
  return Number(amount).toLocaleString("en-US");
}

// PostgREST's .or() syntax breaks on commas/parentheses inside a value, and
// callers may pass a whole spoken phrase ("Marina Crest, please") as query.
export function sanitizeQueryText(text) {
  return String(text || "").replace(/[(),]/g, " ").trim();
}

export function statusWord(status) {
  if (status === "reserved") return "reserved";
  if (status === "sold") return "sold";
  if (status === "rented") return "rented";
  return status || "unavailable";
}
