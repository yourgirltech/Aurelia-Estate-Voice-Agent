import { supabase } from "./supabaseHelpers.js";
import { formatMoney, sanitizeQueryText, statusWord } from "./formatters.js";

const DETAIL_COLUMNS =
  "id, name, building_name, area, city, property_type, bedrooms, bathrooms, size_value, size_unit, price, currency, discounted_price, listing_type, completion_status, payment_terms, features, nearby, virtual_tour_available, status";

export async function getPropertyDetails(args = {}) {
  const { property_id, property_name } = args;

  if (!property_id && !property_name) {
    return "Please tell me the property's name or ID so I can look it up.";
  }

  let property = null;

  if (property_id) {
    const { data, error } = await supabase
      .from("properties")
      .select(DETAIL_COLUMNS)
      .eq("id", property_id)
      .maybeSingle();
    if (!error) property = data;
  }

  if (!property && property_name) {
    const sanitized = sanitizeQueryText(property_name);
    if (sanitized) {
      const { data, error } = await supabase
        .from("properties")
        .select(DETAIL_COLUMNS)
        .or(`building_name.ilike.%${sanitized}%,name.ilike.%${sanitized}%`)
        .limit(1);
      if (!error && data && data[0]) property = data[0];
    }
  }

  if (!property) {
    return "I couldn't find that property. Could you tell me the building name or area again?";
  }

  return formatDetails(property);
}

function formatDetails(p) {
  const hasDistinctBuilding = p.building_name && p.building_name !== p.name;
  const label = hasDistinctBuilding ? `${p.name}, at ${p.building_name}` : p.building_name || p.name;
  const size = p.size_value ? `${p.size_value} ${p.size_unit || ""}`.trim() : "size not listed";
  const completion = p.completion_status === "off_plan" ? "off-plan" : "ready to move in";
  const availability = p.status === "available" ? "currently available" : `currently ${statusWord(p.status)}`;
  const tour = p.virtual_tour_available ? "a virtual tour is available" : "no virtual tour is available yet";
  const featureText = (p.features || []).join(", ") || "no listed features";
  const nearbyText = (p.nearby || []).join("; ") || "no nearby places listed";
  const priceKind = p.listing_type === "rent" ? "per year" : "for sale";

  const sentences = [
    `${label} is a ${p.bedrooms}-bedroom, ${p.bathrooms}-bathroom ${(p.property_type || "property").toLowerCase()} in ${p.area || p.city || "an unspecified area"}, ${p.city || ""}.`,
    `It's ${size}, priced at ${formatMoney(p.price)} ${p.currency || ""} (${priceKind}) — discounted price on request: ${formatMoney(p.discounted_price)} ${p.currency || ""}, only mention if the customer asks about discounts.`,
    `It's ${completion} and ${availability}, and ${tour}.`,
    `Features: ${featureText}.`,
    `Nearby: ${nearbyText}.`,
    p.payment_terms ? `Payment terms: ${p.payment_terms}.` : "",
    "Full terms and conditions will be sent by email.",
  ];

  return sentences.filter(Boolean).join(" ");
}
