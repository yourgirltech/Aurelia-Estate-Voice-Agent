# Build: Live Property Lookup Tools for Precious (Vapi → Supabase)

## Context
You already built this project: a React enquiry form, Supabase tables (`properties`, `leads`, `calls`) and the `submit-enquiry` Edge Function that places Vapi calls.

Precious is our Vapi voice assistant for Aurelia Estates. She now needs to **check live property availability during a phone call**. When a customer says what they want ("a 2-bedroom apartment in Dubai Marina", or names a specific building), Precious says "Give me a moment while I check our listings…", calls a tool, and within 1–2 seconds answers with what's available or with the closest alternatives.

Keep everything simple, in JavaScript, and consistent with the existing code. Do NOT change the form, `submit-enquiry`, or the existing RLS rules on `leads` and `calls`.

## Part 1: Database migration
Create a new migration file: `supabase/migrations/0003_property_details.sql` (0001 and 0002 already exist; do not edit them).

Add these columns to `properties`:
| Column | Type | Notes |
|---|---|---|
| `building_name` | text | e.g. "Marina Crest Tower" |
| `city` | text | e.g. "Dubai" |
| `area` | text | neighbourhood, e.g. "Dubai Marina" |
| `address` | text | full address, used for inspections |
| `features` | text[] | e.g. `{"gym","covered parking","pool","sea view","balcony"}` |
| `nearby` | text[] | e.g. `{"Dubai Marina Mall (5 min walk)","Emirates International School (10 min drive)","Metro station (7 min walk)"}` |
| `year_built` | int | |
| `completion_status` | text | `ready` or `off_plan` |
| `virtual_tour_available` | boolean | default true |
| `discounted_price` | numeric | **generated column**: `round(price * 0.98, 2)` stored |

Add indexes on: `status`, `city`, `area`, `property_type`, `bedrooms`, `price`, and a trigram or lower() index on `building_name` for name search (enable `pg_trgm` if you use trigram).

**Seed data:** update the existing 5 properties with values for all new columns, and add 7 more so there are 12 in total, including:
- at least 4 in Dubai (different areas, 1–3 bedrooms, apartments and a villa, prices in AED from about 750,000 to 3,500,000, one of them `reserved` so we can test "not available")
- at least 2 in London (GBP), 2 in Lagos (NGN), 1 in Paris (EUR), 1 in Marbella (EUR)
- at least 2 rentals (`listing_type = 'rent'`, price = yearly rent)
- realistic features and nearby places for each; make sure the `nearby` lists mention things like schools, hospitals, main roads, shopping malls, airports, public transport, places of worship and waterfront/beach, so they match the form's "Close to" options

The SQL must be safe to paste into the Supabase SQL Editor and run once.

## Part 2: Edge Function `vapi-tools`
Create `supabase/functions/vapi-tools/index.js`. One function handles all of Precious's tools.

### Config
The function file is `index.js`, not `index.ts`. Add a section to `supabase/config.toml`, the same way `submit-enquiry` is set up:
```toml
[functions.vapi-tools]
entrypoint = "./functions/vapi-tools/index.js"
verify_jwt = false
```

### Security
- Vapi cannot send a Supabase login token, so this function is deployed with `--no-verify-jwt`.
- Instead, protect it with a shared secret: Vapi sends a header `x-vapi-secret`. The function compares it with the Supabase secret `VAPI_TOOLS_SECRET` and returns 401 if it doesn't match.
- Use the service role key inside the function to read `properties`.

### Request format from Vapi
```json
{
  "message": {
    "type": "tool-calls",
    "toolCallList": [
      { "id": "toolu_123", "name": "search_properties", "arguments": { "city": "Dubai", "bedrooms": 2 } }
    ]
  }
}
```
- `toolCallList` can contain more than one call. Handle each one.
- `arguments` might arrive as an object or as a JSON string. Handle both.

### Response format to Vapi
```json
{ "results": [ { "toolCallId": "toolu_123", "result": "…short text…" } ] }
```
- Always respond with HTTP 200 and this shape, even when nothing is found or an error happens (put a short, speakable error message in `result`, e.g. "The listings system is unavailable right now.").
- `result` must be **short plain text** that a voice assistant can read: max 3 properties, one line each. No long JSON.

### Tool 1: `search_properties`
Arguments (all optional):
- `query`: free text such as a building name or area ("Marina Crest", "Lekki")
- `city`, `area`
- `property_type`: apartment | house | villa | detached | semi-detached | terraced | bungalow | land | commercial
- `bedrooms`: number
- `listing_type`: sale | rent
- `max_budget`: number
- `currency`: e.g. AED, USD, GBP, EUR, NGN
- `features`: array of strings, e.g. ["gym", "parking"]
- `near`: array of strings, e.g. ["school", "hospital", "main road"]

Logic:
1. Search only `status = 'available'`.
2. If `query` is given, match it case-insensitively against `building_name`, `name` and `area`.
3. Apply the other filters that were provided. Treat `features` and `near` as "nice to have": rank properties higher when more of them match (`features` against the `features` column, `near` against the `nearby` column, case-insensitive partial match), but don't exclude on them.
4. Budget: only apply `max_budget` when `currency` matches the listing currency. If the currencies differ, don't filter on budget, and add a note in the result that prices are in the listing currency.
5. **If exact matches exist:** return up to 3, best match first (then cheapest), in this format:
   `FOUND 2 MATCHES:`
   `1) [id: …] Marina Crest Tower, Dubai Marina – 2-bed apartment – 1,450,000 AED – gym, covered parking, sea view – near: school (10 min drive)`
6. **If a specific building was asked for but is reserved/sold/rented:** say so first: `Marina Crest Tower is currently reserved.` then give alternatives.
7. **If no exact match:** relax filters step by step (first bedrooms ±1, then budget up to +20%, then same city any area) and return up to 3 as:
   `NO EXACT MATCH. CLOSEST ALTERNATIVES:` followed by the same line format, each with a short reason, e.g. `(slightly above budget)` or `(3 bedrooms instead of 2)`.
8. **If still nothing:** `NO PROPERTIES AVAILABLE for this search. Offer to have a consultant send options.`

### Tool 2: `get_property_details`
Arguments: `property_id` (preferred) or `property_name`.
Return one short paragraph with: name, building, area, city, type, bedrooms, bathrooms, size with unit, price and currency, `discounted_price` (labelled "discounted price, only mention if the customer asks about discounts"), listing type, completion status, payment terms, features, nearby places, virtual tour available yes/no, availability status. Keep the terms and conditions out of the spoken result, but include one line: "Full terms and conditions will be sent by email."

### Performance
- Aim to respond in under 500 ms.
- Create the Supabase client once, outside the request handler.
- Select only the columns you need.
- Log the time each tool call took (`console.log`) so I can check speed in the Supabase logs.

## Part 3: README update
Add a section "Precious's property tools" explaining, for a beginner (Windows PowerShell, using `npx supabase`):
1. How to run the new migration by pasting `0003_property_details.sql` into the Supabase SQL Editor (NOT `supabase db push`, because the earlier migrations were run in the SQL Editor)
2. How to set the secret: `npx supabase secrets set VAPI_TOOLS_SECRET=<a long random string>` (show a PowerShell-friendly way to generate one)
3. How to deploy: `npx supabase functions deploy vapi-tools --no-verify-jwt`
4. The function URL format: `https://<project-ref>.supabase.co/functions/v1/vapi-tools`
5. A test command for `search_properties` that works in Windows PowerShell (use `Invoke-RestMethod` or `curl.exe`), including the `x-vapi-secret` header
6. How to create the two tools in the Vapi dashboard (Tools → Create Tool → Custom Tool), with:
   - the exact tool name, description and parameters JSON schema for each tool
   - the server URL and the `x-vapi-secret` header
   - Request Start message: "Give me a moment while I check our listings."
   - Request Failed message: "I'm having trouble reaching our listings right now. I'll have a consultant send you options."
   - timeout: 10 seconds
7. How to attach both tools to both Precious assistants (outbound and inbound)

## Out of scope for now
- `book_inspection`, `transfer_to_consultant`, emails, the end-of-call webhook, recognising returning callers

Before writing code, briefly confirm the plan, then build it. When done, list the files you created or changed.
