// submit-enquiry Edge Function
//
// Receives a real estate enquiry from the frontend, stores it, and places
// an outbound Vapi call so a customer can be greeted by title/name in
// their preferred language almost immediately after submitting the form.
//
// The Vapi private API key lives only here (as a Supabase secret) and is
// never sent to or read by the frontend.

import { buildSalutation } from "./salutations.js";
import { buildFirstMessage } from "./firstMessages.js";
import { buildVoiceConfig } from "./voiceConfig.js";
import {
  getServiceClient,
  findRecentLeadByPhone,
  insertLead,
  getPropertyById,
  updateLeadStatus,
  insertCall,
} from "./supabaseHelpers.js";

// CORS: allow the frontend origin to call this function directly from the
// browser. Tighten ALLOWED_ORIGIN in production if you want to lock this
// down to your real domain instead of "*".
const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") || "*";
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const VALID_TITLE_CODES = ["mr", "mrs", "ms", "dr", "prof", "none"];
const VALID_ENQUIRY_TYPES = ["buy", "rent", "invest", "general"];
const VALID_LANGUAGES = ["en", "fr", "es", "de", "ar", "pt", "it"];

Deno.serve(async (req) => {
  // 1. Handle CORS preflight.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  // 2. Honeypot: if this hidden field is filled in, it's a bot.
  // Respond as if everything succeeded, but do nothing.
  if (body.website) {
    return jsonResponse({ success: true });
  }

  // 3. Validate the required fields.
  const validationError = validateEnquiry(body);
  if (validationError) {
    return jsonResponse({ error: validationError }, 400);
  }

  const supabase = getServiceClient();

  try {
    // 4. Duplicate protection: same phone number submitted in the last
    // 10 minutes -> still save the lead, but skip placing another call.
    const recentLead = await findRecentLeadByPhone(supabase, body.phone);
    const isDuplicate = Boolean(recentLead);

    // 5. Insert the lead.
    const lead = await insertLead(supabase, {
      title_code: body.titleCode,
      first_name: body.firstName.trim(),
      surname: body.surname.trim(),
      email: body.email.trim(),
      phone_e164: body.phone.trim(),
      country: body.country || null,
      language: body.language,
      enquiry_type: body.enquiryType,
      property_id: body.propertyId || null,
      preferred_locations: body.preferredLocations || null,
      property_type: body.propertyType || null,
      proximity_preferences: Array.isArray(body.proximityPreferences)
        ? body.proximityPreferences
        : [],
      bedrooms: body.bedrooms || null,
      budget_min: body.budgetMin || null,
      budget_max: body.budgetMax || null,
      currency: body.currency || null,
      timeline: body.timeline || null,
      payment_method: body.paymentMethod || null,
      message: (body.message || "").slice(0, 1000),
      consent_given: true,
      consent_at: new Date().toISOString(),
      status: "new",
    });

    const salutation = buildSalutation(
      body.language,
      body.titleCode,
      body.firstName.trim(),
      body.surname.trim()
    );

    if (isDuplicate) {
      // Lead saved, but we already called this number recently — don't call again.
      return jsonResponse({ success: true, salutation, callPlaced: false });
    }

    // 6. Place the Vapi call.
    try {
      const property = await getPropertyById(supabase, lead.property_id);
      const vapiCallId = await placeVapiCall({ lead, salutation, property });

      await insertCall(supabase, {
        lead_id: lead.id,
        vapi_call_id: vapiCallId,
        direction: "outbound",
        status: "queued",
      });

      await updateLeadStatus(supabase, lead.id, { status: "call_placed" });

      return jsonResponse({ success: true, salutation, callPlaced: true });
    } catch (vapiError) {
      // 7. Vapi failed: keep the lead, mark it, but still tell the user it worked.
      console.error("Vapi call failed:", vapiError);
      await updateLeadStatus(supabase, lead.id, {
        status: "call_failed",
        last_error: String(vapiError?.message || vapiError),
      });

      return jsonResponse({ success: true, salutation, callPlaced: false });
    }
  } catch (err) {
    console.error("submit-enquiry error:", err);
    return jsonResponse({ error: "Something went wrong. Please try again." }, 500);
  }
});

function validateEnquiry(body) {
  if (!body.titleCode || !VALID_TITLE_CODES.includes(body.titleCode)) {
    return "A valid title is required.";
  }
  if (!body.firstName || !body.firstName.trim()) {
    return "First name is required.";
  }
  if (!body.surname || !body.surname.trim()) {
    return "Surname is required.";
  }
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return "A valid email is required.";
  }
  if (!body.phone || !/^\+[1-9]\d{6,14}$/.test(body.phone)) {
    return "A valid phone number in international (E.164) format is required.";
  }
  if (!body.country) {
    return "Country of residence is required.";
  }
  if (!body.language || !VALID_LANGUAGES.includes(body.language)) {
    return "A valid preferred language is required.";
  }
  if (!body.enquiryType || !VALID_ENQUIRY_TYPES.includes(body.enquiryType)) {
    return "A valid enquiry type is required.";
  }
  if (body.consentGiven !== true) {
    return "Consent to be called is required.";
  }
  return null;
}

// Builds and sends the outbound call request to Vapi.
// Returns the Vapi call ID on success, throws on failure.
async function placeVapiCall({ lead, salutation, property }) {
  const apiKey = Deno.env.get("VAPI_API_KEY");
  const assistantId = Deno.env.get("VAPI_ASSISTANT_ID");
  const phoneNumberId = Deno.env.get("VAPI_PHONE_NUMBER_ID");
  const voiceId = Deno.env.get("VAPI_VOICE_ID");
  const companyName = Deno.env.get("COMPANY_NAME") || "our company";

  const { languageName, transcriber, voice } = buildVoiceConfig(lead.language, voiceId);

  const firstMessage = buildFirstMessage(lead.language, {
    salutation,
    company: companyName,
    property: property?.name || null,
  });

  const budget =
    lead.budget_min && lead.budget_max
      ? `${formatNumber(lead.budget_min)}–${formatNumber(lead.budget_max)} ${lead.currency || ""}`.trim()
      : null;

  const payload = {
    assistantId,
    phoneNumberId,
    customer: {
      number: lead.phone_e164,
      name: `${lead.first_name} ${lead.surname}`,
    },
    assistantOverrides: {
      firstMessage,
      transcriber,
      voice,
      variableValues: {
        lead_id: lead.id,
        salutation,
        title_code: lead.title_code,
        first_name: lead.first_name,
        surname: lead.surname,
        language: languageName,
        country: lead.country || "",
        company_name: companyName,
        property_name: property?.name || "",
        property_id: property?.id || "",
        enquiry_type: lead.enquiry_type,
        proximity_preferences: (lead.proximity_preferences || []).join(", "),
        budget: budget || "",
        timeline: lead.timeline || "",
        payment_method: lead.payment_method || "",
        customer_message: lead.message || "",
      },
    },
  };

  const response = await fetch("https://api.vapi.ai/call", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Vapi API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.id;
}

function formatNumber(n) {
  return Number(n).toLocaleString("en-US");
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}
