// Supabase access for the submit-enquiry function, kept in one file so
// future functions (Vapi tools, end-of-call webhook, admin dashboard) can
// reuse the same service-role client and helpers.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function getServiceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

// Duplicate protection: same phone number submitted in the last 10 minutes.
export async function findRecentLeadByPhone(supabase, phoneE164, withinMinutes = 10) {
  const cutoff = new Date(Date.now() - withinMinutes * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("leads")
    .select("id, created_at")
    .eq("phone_e164", phoneE164)
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
}

export async function insertLead(supabase, leadRow) {
  const { data, error } = await supabase
    .from("leads")
    .insert(leadRow)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPropertyById(supabase, propertyId) {
  if (!propertyId) return null;
  const { data, error } = await supabase
    .from("properties")
    .select("id, name")
    .eq("id", propertyId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateLeadStatus(supabase, leadId, fields) {
  const { error } = await supabase
    .from("leads")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", leadId);

  if (error) throw error;
}

export async function insertCall(supabase, callRow) {
  const { error } = await supabase.from("calls").insert(callRow);
  if (error) throw error;
}
