// vapi-tools Edge Function
//
// Handles Vapi custom-tool calls for Precious (the voice assistant) so she
// can search live property listings and describe one in detail during a
// call. Vapi can't send a Supabase login token, so this is protected by a
// shared secret instead (x-vapi-secret header) and deployed with
// --no-verify-jwt. See supabase/config.toml for the entrypoint override —
// this file is .js, not .ts.

import { searchProperties } from "./searchProperties.js";
import { getPropertyDetails } from "./propertyDetails.js";

// Read once at module scope, not per-request.
const VAPI_TOOLS_SECRET = Deno.env.get("VAPI_TOOLS_SECRET");

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const providedSecret = req.headers.get("x-vapi-secret");
  if (!VAPI_TOOLS_SECRET || providedSecret !== VAPI_TOOLS_SECRET) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const toolCallList = body?.message?.toolCallList || [];
  const results = [];

  for (const call of toolCallList) {
    const startedAt = performance.now();
    let result;
    try {
      result = await runTool(call.name, parseArguments(call.arguments));
    } catch (err) {
      console.error(`vapi-tools: "${call.name}" failed:`, err);
      result = "The listings system is unavailable right now.";
    }
    console.log(`vapi-tools: "${call.name}" (${call.id}) took ${Math.round(performance.now() - startedAt)}ms`);
    results.push({ toolCallId: call.id, result });
  }

  // Always 200 with this shape — Vapi expects a result for every tool call,
  // even ones that failed or found nothing (the "result" text explains why).
  return jsonResponse({ results }, 200);
});

async function runTool(name, args) {
  if (name === "search_properties") return searchProperties(args);
  if (name === "get_property_details") return getPropertyDetails(args);
  return `Unknown tool: ${name}.`;
}

// Vapi sends tool arguments as either a plain object or a JSON string.
function parseArguments(raw) {
  if (raw == null) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return raw;
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
