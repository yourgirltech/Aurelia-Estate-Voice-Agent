import { createClient } from "@supabase/supabase-js";

// Anon key only — safe for the browser. It can only read `properties`
// where status = 'available' (enforced by RLS); it cannot write leads/calls.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchAvailableProperties() {
  const { data, error } = await supabase
    .from("properties")
    .select("id, name, location, country, property_type, bedrooms, price, currency")
    .eq("status", "available")
    .order("name");

  if (error) throw error;
  return data;
}

// Calls the submit-enquiry Edge Function directly (not supabase.functions.invoke,
// so the exact JSON shape sent is explicit and easy to follow).
export async function submitEnquiry(payload) {
  const response = await fetch(`${supabaseUrl}/functions/v1/submit-enquiry`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to submit enquiry.");
  }
  return data;
}
