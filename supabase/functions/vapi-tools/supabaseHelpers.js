// Service-role Supabase client for the vapi-tools function. Created once at
// module scope (not per-request) so it's reused across warm invocations.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false } }
);
