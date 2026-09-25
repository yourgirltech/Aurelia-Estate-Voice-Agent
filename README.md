# Real Estate Enquiry → Instant AI Voice Call

A customer fills in a property enquiry form, and within about a minute an AI voice
agent (via [Vapi](https://vapi.ai)) calls them, greets them by the correct title
and name, and speaks their preferred language.

## How it works

1. Customer submits the form (React app).
2. The form calls a Supabase Edge Function, `submit-enquiry`.
3. The function validates the data, checks for duplicate submissions, saves the
   lead to Postgres, then calls the Vapi API to place the outbound call.
4. The Vapi private key never touches the browser — it lives only as a Supabase
   secret used inside the Edge Function.

## Folder structure

```
frontend/                          React + Vite + Tailwind app (deploy to Netlify)
supabase/migrations/               SQL: tables, RLS policies, seed properties
supabase/functions/submit-enquiry/ The Edge Function that saves leads and calls Vapi
```

---

## 1. Create the Supabase project and tables

1. Go to [supabase.com](https://supabase.com) and create a new project. Note your
   **Project URL** and **anon public key** (Project Settings → API) — you'll need
   them in step 4.
2. Install the Supabase CLI if you don't have it:
   ```bash
   npm install -g supabase
   ```
3. Log in and link the CLI to your project:
   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   (Find `YOUR_PROJECT_REF` in your project's URL: `https://YOUR_PROJECT_REF.supabase.co`)
4. Run the migration to create the tables, RLS policies and sample properties:
   ```bash
   supabase db push
   ```
   This runs `supabase/migrations/0001_init.sql` against your database. You can
   confirm it worked by checking the Table Editor in the Supabase dashboard —
   you should see `properties`, `leads` and `calls`, with 5 sample rows in
   `properties`.

## 2. Get your Vapi credentials

You'll need, from your [Vapi dashboard](https://dashboard.vapi.ai):
- A private **API key**
- An **Assistant ID** (the assistant that will make the call — set its prompt up
  in Vapi first)
- A **Phone Number ID** (a phone number you've bought/connected in Vapi)
- A **Voice ID** you want the assistant to use

## 3. Set the Edge Function secrets

These are stored securely by Supabase and are only readable by the Edge
Function — never by the frontend.

```bash
supabase secrets set VAPI_API_KEY=your_key_here
supabase secrets set VAPI_ASSISTANT_ID=your_assistant_id
supabase secrets set VAPI_PHONE_NUMBER_ID=your_phone_number_id
supabase secrets set VAPI_VOICE_ID=your_voice_id
supabase secrets set COMPANY_NAME="Your Company Name"
```

(See `supabase/functions/submit-enquiry/.env.example` for the full list — it's
a reference only, not a file that gets loaded automatically.)

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically to
every Edge Function by Supabase, so you don't need to set those yourself.

## 4. Deploy the Edge Function

```bash
supabase functions deploy submit-enquiry --no-verify-jwt
```

`--no-verify-jwt` is used because the form is public (anyone submitting an
enquiry isn't a logged-in user). The function still only accepts a valid
Supabase `apikey`/`Authorization` header, which the frontend sends
automatically.

### CORS

The function already handles CORS (see `CORS_HEADERS` in `index.js`) and
defaults to allowing any origin (`*`). Once you know your production Netlify
URL, lock it down:

```bash
supabase secrets set ALLOWED_ORIGIN=https://your-site.netlify.app
```

Then redeploy the function so it picks up the new secret:

```bash
supabase functions deploy submit-enquiry --no-verify-jwt
```

## 5. Run the frontend locally

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `frontend/.env` and fill in:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key
```

Then start the dev server:

```bash
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`) in your browser.

## 6. Deploy the frontend to Netlify

**Option A — via the Netlify dashboard (easiest for beginners):**
1. Push this repo to GitHub.
2. In Netlify, click "Add new site" → "Import an existing project" → pick your repo.
3. Set the **Base directory** to `frontend`.
4. Build command: `npm run build`. Publish directory: `frontend/dist`.
5. Under Site settings → Environment variables, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Deploy.

**Option B — via the Netlify CLI:**
```bash
npm install -g netlify-cli
cd frontend
netlify deploy --prod
```
(Set the same two environment variables in the Netlify site settings first.)

`frontend/netlify.toml` already configures the build command, publish
directory, and a redirect rule so client-side routing works.

## 7. Test it with your own phone number

1. Open the deployed (or local) site.
2. Fill in the form using **your own phone number** in international format
   (the phone field handles this for you — just make sure your country is
   selected).
3. Tick the consent checkbox and submit.
4. You should see the thank-you screen, and your phone should ring within
   about a minute.
5. If it doesn't ring, check:
   - The `leads` table in Supabase — was a row created? What's its `status`?
     If it's `call_failed`, check the `last_error` column.
   - The Edge Function logs: `supabase functions logs submit-enquiry`
   - That your Vapi assistant/phone number/voice IDs are correct and that your
     Vapi account has calling credit.

Submitting the same phone number again within 10 minutes will save a new lead
row but will **not** place another call (duplicate protection).

## 8. Talk to Precious (web calls)

Some visitors won't want to fill in the form — they can click **"Talk to
Precious"** to start a live voice call right in the browser (using their
microphone), or call the phone number shown next to it. This uses the
**Vapi Web SDK**, and needs a separate Vapi assistant set up for *inbound*
conversations (as opposed to the outbound assistant the Edge Function calls
after someone submits the form).

1. **Find your Vapi public key.** In the [Vapi dashboard](https://dashboard.vapi.ai),
   go to your account/API keys settings. You'll see two keys: a **private**
   key (server-side only — this is the one already used by the Edge
   Function's `VAPI_API_KEY` secret, never put it in the frontend) and a
   **public** key. Copy the **public** key — it's designed to be used in
   browser code.
2. **Find (or create) the `Precious – Inbound` assistant.** In Vapi, create a
   second assistant for people calling in live (separate from the outbound
   one), give it a prompt suited to a caller who initiated the conversation,
   and copy its **Assistant ID** from the assistant's settings page.
3. **Add the four new variables** to `frontend/.env` (see
   `frontend/.env.example` for the full list with comments):
   ```
   VITE_VAPI_PUBLIC_KEY=your_public_key
   VITE_VAPI_INBOUND_ASSISTANT_ID=your_inbound_assistant_id
   VITE_PHONE_DISPLAY=+1 (415) 555 0123
   VITE_PHONE_E164=+14155550123
   ```
   Then restart the dev server (`npm run dev`) — Vite only reads `.env` on
   startup, so changes won't apply to an already-running server.

   If any of the Vapi variables are missing, the "Talk to Precious" button
   simply doesn't render (no crash). If the phone variables are missing, the
   phone number doesn't render. Both are independent — you can ship with
   just one.
4. **Test it:** click "Talk to Precious", allow microphone access when your
   browser asks, and speak. You should see the call move through
   Connecting → Live (with a timer and audio visualiser) → Ended when you
   hang up. Try denying the microphone permission once too, so you can see
   the friendly error state.
5. **Where it works:** browsers only allow microphone access on secure
   contexts — that's `https://` sites, or `http://localhost` during local
   development. It will **not** work if you serve the site over plain
   `http://` from any other address (e.g. a LAN IP for testing on your
   phone) — deploy to Netlify (HTTPS by default) or use `localhost` instead.

## 9. Precious's property tools

Precious (the Vapi voice assistant) can check **live property availability**
mid-call using two custom tools backed by a new Edge Function, `vapi-tools`.
When a customer describes what they want, Precious calls `search_properties`
and answers with real matches (or the closest alternatives) in a couple of
seconds; `get_property_details` lets her describe one property fully.

All of this is in Windows PowerShell, using `npx supabase` (so you don't
need the CLI installed globally).

### 1. Run the migration

The earlier migrations in this project were run by pasting them into the
Supabase SQL Editor, not with `supabase db push` — do the same here for
consistency:

1. Open your project in the [Supabase dashboard](https://supabase.com/dashboard) → **SQL Editor**.
2. Open `supabase/migrations/0003_property_details.sql` in your editor, copy
   the whole file, paste it into a new SQL Editor query, and click **Run**.
3. Confirm it worked: the `properties` table should now have 12 rows and the
   new columns (`building_name`, `city`, `area`, `features`, `nearby`, etc.)
   in the Table Editor.

### 2. Set the shared secret

Vapi can't send a Supabase login token when it calls this function, so it's
protected by a shared secret instead — Vapi sends it in an `x-vapi-secret`
header, and the function checks it against `VAPI_TOOLS_SECRET`.

Generate a long random string in PowerShell:

```powershell
[guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N")
```

Copy the output, then set it as a secret:

```powershell
npx supabase secrets set VAPI_TOOLS_SECRET=paste_the_string_here
```

### 3. Deploy the function

```powershell
npx supabase functions deploy vapi-tools --no-verify-jwt
```

`--no-verify-jwt` is used for the same reason as `submit-enquiry` — Vapi
isn't a logged-in Supabase user. The shared secret from step 2 is what
actually protects it.

### 4. The function URL

```
https://<project-ref>.supabase.co/functions/v1/vapi-tools
```

Find `<project-ref>` in your Supabase project URL (Project Settings → API),
the same one you used for `VITE_SUPABASE_URL`.

### 5. Test it from PowerShell

```powershell
$body = @{
  message = @{
    type = "tool-calls"
    toolCallList = @(
      @{ id = "test1"; name = "search_properties"; arguments = @{ city = "Dubai"; bedrooms = 2 } }
    )
  }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod `
  -Uri "https://YOUR_PROJECT_REF.supabase.co/functions/v1/vapi-tools" `
  -Method Post `
  -Headers @{ "x-vapi-secret" = "YOUR_SECRET" } `
  -ContentType "application/json" `
  -Body $body
```

You should get back something like:

```json
{ "results": [ { "toolCallId": "test1", "result": "FOUND 2 MATCHES:\n1) [id: ...] ..." } ] }
```

If you prefer `curl.exe` (note the escaped quotes — PowerShell needs them
for an inline JSON string):

```powershell
curl.exe -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/vapi-tools" `
  -H "x-vapi-secret: YOUR_SECRET" `
  -H "Content-Type: application/json" `
  -d '{\"message\":{\"type\":\"tool-calls\",\"toolCallList\":[{\"id\":\"test1\",\"name\":\"search_properties\",\"arguments\":{\"city\":\"Dubai\"}}]}}'
```

Try a request without the `x-vapi-secret` header too — you should get `401`.

### 6. Create the two tools in the Vapi dashboard

Go to **Tools → Create Tool → Custom Tool** and create each of these:

**Tool 1 — `search_properties`**

- **Name:** `search_properties`
- **Description:** Searches Aurelia Estates' live property listings by
  location, type, budget and features. Returns up to 3 matching or
  closest-alternative properties as short spoken text.
- **Parameters (JSON schema):**
  ```json
  {
    "type": "object",
    "properties": {
      "query": { "type": "string", "description": "Free text such as a building name or area, e.g. 'Marina Crest' or 'Lekki'." },
      "city": { "type": "string" },
      "area": { "type": "string" },
      "property_type": {
        "type": "string",
        "enum": ["apartment", "house", "villa", "detached", "semi-detached", "terraced", "bungalow", "land", "commercial"]
      },
      "bedrooms": { "type": "integer" },
      "listing_type": { "type": "string", "enum": ["sale", "rent"] },
      "max_budget": { "type": "number" },
      "currency": { "type": "string", "description": "e.g. AED, USD, GBP, EUR, NGN" },
      "features": { "type": "array", "items": { "type": "string" }, "description": "e.g. [\"gym\", \"parking\"]" },
      "near": { "type": "array", "items": { "type": "string" }, "description": "e.g. [\"school\", \"hospital\", \"main road\"]" }
    }
  }
  ```

**Tool 2 — `get_property_details`**

- **Name:** `get_property_details`
- **Description:** Gets full details for one specific Aurelia Estates
  property by ID or name, so Precious can describe it to the customer.
- **Parameters (JSON schema):**
  ```json
  {
    "type": "object",
    "properties": {
      "property_id": { "type": "string", "description": "The property's UUID, if known (e.g. from a previous search result)." },
      "property_name": { "type": "string", "description": "The building or property name, if the ID isn't known." }
    }
  }
  ```

**For both tools, set:**
- **Server URL:** `https://<project-ref>.supabase.co/functions/v1/vapi-tools`
- **Header:** `x-vapi-secret: YOUR_SECRET`
- **Request Start message:** "Give me a moment while I check our listings."
- **Request Failed message:** "I'm having trouble reaching our listings right now. I'll have a consultant send you options."
- **Timeout:** 10 seconds

### 7. Attach both tools to both Precious assistants

Open each of your two Vapi assistants — the **outbound** one that
`submit-enquiry` calls after a form submission, and the **inbound** one used
for live browser/phone calls (see "Talk to Precious" above) — and add both
`search_properties` and `get_property_details` under that assistant's
**Tools** section. Both assistants need both tools so Precious can look
things up regardless of who started the call.

---

## Notes for extending this later

- **Vapi tools during the call**: done — see "Precious's property tools"
  above. `book_inspection`, `transfer_to_consultant` and recognising
  returning callers are still open for later.
- **End-of-call webhook**: add a new Edge Function (e.g. `vapi-webhook`) that
  updates the `calls` table (`status`, `summary`, `transcript`,
  `recording_url`, `structured_data`, `ended_reason`) using the helpers in
  `supabase/functions/submit-enquiry/supabaseHelpers.js` as a starting point.
- **Admin dashboard**: query `leads` and `calls` with the service role from a
  separate authenticated app/section — the current RLS policies already keep
  those tables locked down from the public.
- **More languages**: add an entry to `frontend/src/config/languages.js`, plus
  matching entries in `salutations.js`, `firstMessages.js` and
  `voiceConfig.js` under `supabase/functions/submit-enquiry/`, **and** in
  `frontend/src/lib/salutations.js` (a duplicate used by "Talk to Precious" so the
  browser can build the same salutation without calling the Edge Function).
  The `firstMessages.js` file has a reminder comment that every message needs
  native-speaker review before going live.
