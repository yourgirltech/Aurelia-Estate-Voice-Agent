import { supabase } from "./supabaseHelpers.js";
import { PROPERTY_TYPE_MAP } from "./propertyTypeMap.js";
import { formatMoney, sanitizeQueryText, statusWord } from "./formatters.js";

const SEARCH_COLUMNS =
  "id, name, building_name, area, city, property_type, bedrooms, bathrooms, price, currency, listing_type, features, nearby, status";

export async function searchProperties(args = {}) {
  const {
    query,
    city,
    area,
    property_type,
    bedrooms,
    listing_type,
    max_budget,
    currency,
    features = [],
    near = [],
  } = args;

  // If a specific building/name was asked for, check it across ALL
  // statuses first so we can say "X is currently reserved" up front.
  const reservedNote = await checkNamedBuildingStatus(query);

  const strictFilters = {
    query: reservedNote ? null : query,
    city,
    area,
    property_type,
    bedrooms,
    listing_type,
  };

  // Relax step by step: bedrooms ±1, then budget +20%, then drop area
  // (keep the city). Each tier only widens what the previous one had.
  const tiers = [{ filters: strictFilters, budgetFactor: 1 }];
  if (bedrooms != null) {
    tiers.push({
      filters: { ...strictFilters, bedrooms: null, bedroomsMin: bedrooms - 1, bedroomsMax: bedrooms + 1 },
      budgetFactor: 1,
    });
  }
  if (max_budget != null) {
    const last = tiers[tiers.length - 1].filters;
    tiers.push({ filters: { ...last }, budgetFactor: 1.2 });
  }
  if (area) {
    const last = tiers[tiers.length - 1].filters;
    tiers.push({ filters: { ...last, area: null }, budgetFactor: 1.2 });
  }

  let matches = [];
  let exact = false;
  for (let i = 0; i < tiers.length; i++) {
    const rows = await runQuery(tiers[i].filters);
    const withBudget = applyBudget(rows, max_budget, currency, tiers[i].budgetFactor);
    if (withBudget.length > 0) {
      matches = withBudget;
      exact = i === 0;
      break;
    }
  }

  if (matches.length === 0) {
    const prefix = reservedNote ? `${reservedNote}\n` : "";
    return `${prefix}NO PROPERTIES AVAILABLE for this search. Offer to have a consultant send options.`;
  }

  const ranked = rankMatches(matches, features, near).slice(0, 3);
  const mixedCurrency = ranked.some(
    (p) => currency && p.currency && p.currency.toUpperCase() !== currency.toUpperCase()
  );

  const lines = ranked.map((property, i) =>
    formatLine(property, i + 1, near, exact ? "" : reasonFor(property, { bedrooms, max_budget, currency, area }))
  );

  const header = exact
    ? `FOUND ${lines.length} MATCH${lines.length === 1 ? "" : "ES"}:`
    : "NO EXACT MATCH. CLOSEST ALTERNATIVES:";

  const parts = [];
  if (reservedNote) parts.push(reservedNote);
  parts.push(header, ...lines);
  if (mixedCurrency) parts.push("Note: some prices above are in the listing's own currency.");

  return parts.join("\n");
}

async function runQuery({ query, city, area, property_type, bedrooms, bedroomsMin, bedroomsMax, listing_type }) {
  let q = supabase.from("properties").select(SEARCH_COLUMNS).eq("status", "available");

  if (query) {
    const sanitized = sanitizeQueryText(query);
    if (sanitized) {
      q = q.or(`building_name.ilike.%${sanitized}%,name.ilike.%${sanitized}%,area.ilike.%${sanitized}%`);
    }
  }
  if (city) q = q.ilike("city", city);
  if (area) q = q.ilike("area", area);
  if (property_type) {
    const mapped = PROPERTY_TYPE_MAP[String(property_type).toLowerCase()];
    if (mapped) q = q.ilike("property_type", mapped);
  }
  if (bedrooms != null) {
    q = q.eq("bedrooms", bedrooms);
  } else {
    if (bedroomsMin != null) q = q.gte("bedrooms", Math.max(0, bedroomsMin));
    if (bedroomsMax != null) q = q.lte("bedrooms", bedroomsMax);
  }
  if (listing_type) q = q.eq("listing_type", listing_type);

  const { data, error } = await q.limit(20);
  if (error) throw error;
  return data || [];
}

// Only excludes a property on budget when we can actually compare
// (same currency) — a different-currency listing is never dropped for it.
function applyBudget(rows, maxBudget, currency, factor) {
  if (maxBudget == null || !currency) return rows;
  const limit = maxBudget * factor;
  return rows.filter((p) => {
    if (!p.currency || p.currency.toUpperCase() !== currency.toUpperCase()) return true;
    return Number(p.price) <= limit;
  });
}

function rankMatches(rows, features, near) {
  return rows
    .map((property) => ({ property, score: matchScore(property, features, near) }))
    .sort((a, b) => b.score - a.score || Number(a.property.price) - Number(b.property.price))
    .map((r) => r.property);
}

function matchScore(property, features, near) {
  const propFeatures = (property.features || []).map((f) => f.toLowerCase());
  const propNearby = (property.nearby || []).map((n) => n.toLowerCase());
  let score = 0;
  for (const f of features) {
    if (propFeatures.some((pf) => pf.includes(String(f).toLowerCase()))) score += 1;
  }
  for (const n of near) {
    if (propNearby.some((pn) => pn.includes(String(n).toLowerCase()))) score += 1;
  }
  return score;
}

function reasonFor(property, { bedrooms, max_budget, currency, area }) {
  const reasons = [];
  if (bedrooms != null && property.bedrooms !== bedrooms) {
    reasons.push(`${property.bedrooms} bedroom${property.bedrooms === 1 ? "" : "s"} instead of ${bedrooms}`);
  }
  if (
    max_budget != null &&
    currency &&
    property.currency &&
    property.currency.toUpperCase() === currency.toUpperCase() &&
    Number(property.price) > max_budget
  ) {
    reasons.push("slightly above budget");
  }
  if (area && property.area && property.area.toLowerCase() !== area.toLowerCase()) {
    reasons.push(`different area in ${property.city || "the same city"}`);
  }
  return reasons.length ? `(${reasons.join(", ")})` : "";
}

function formatLine(property, index, near, reasonText) {
  const label = property.building_name || property.name;
  const bedText = property.bedrooms != null ? `${property.bedrooms}-bed` : "";
  const typeText = (property.property_type || "").toLowerCase();
  const priceText = `${formatMoney(property.price)} ${property.currency || ""}`.trim();
  const featureText = (property.features || []).slice(0, 3).join(", ");
  const nearText = pickNearbyLine(property.nearby, near);

  const segments = [
    `${index}) [id: ${property.id}] ${label}, ${property.area || property.city || ""}`.trim(),
    `${bedText} ${typeText}`.trim(),
    priceText,
  ];
  if (featureText) segments.push(featureText);
  if (nearText) segments.push(`near: ${nearText}`);

  let line = segments.filter(Boolean).join(" – ");
  if (reasonText) line += ` ${reasonText}`;
  return line;
}

function pickNearbyLine(nearby = [], near = []) {
  if (!nearby.length) return "";
  if (near.length) {
    const hit = nearby.find((n) => near.some((term) => n.toLowerCase().includes(String(term).toLowerCase())));
    if (hit) return hit;
  }
  return nearby[0];
}

async function checkNamedBuildingStatus(query) {
  const sanitized = sanitizeQueryText(query);
  if (!sanitized) return "";

  const { data, error } = await supabase
    .from("properties")
    .select("id, name, building_name, status")
    .or(`building_name.ilike.%${sanitized}%,name.ilike.%${sanitized}%`)
    .limit(1);

  if (error || !data || !data[0] || data[0].status === "available") return "";

  const label = data[0].building_name || data[0].name;
  return `${label} is currently ${statusWord(data[0].status)}.`;
}
