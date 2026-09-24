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

## 8. Talk to Ada (web calls)

Some visitors won't want to fill in the form — they can click **"Talk to
Ada"** to start a live voice call right in the browser (using their
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
2. **Find (or create) the `Ada – Inbound` assistant.** In Vapi, create a
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

   If any of the Vapi variables are missing, the "Talk to Ada" button simply
   doesn't render (no crash). If the phone variables are missing, the phone
   number doesn't render. Both are independent — you can ship with just one.
4. **Test it:** click "Talk to Ada", allow microphone access when your
   browser asks, and speak. You should see the call move through
   Connecting → Live (with a timer and audio visualiser) → Ended when you
   hang up. Try denying the microphone permission once too, so you can see
   the friendly error state.
5. **Where it works:** browsers only allow microphone access on secure
   contexts — that's `https://` sites, or `http://localhost` during local
   development. It will **not** work if you serve the site over plain
   `http://` from any other address (e.g. a LAN IP for testing on your
   phone) — deploy to Netlify (HTTPS by default) or use `localhost` instead.

---

## Notes for extending this later

- **Vapi tools during the call** (e.g. looking up properties live): add them to
  your Vapi assistant config; the `property_id` / `property_name` variables are
  already passed into the call so a tool can use them.
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
  `frontend/src/lib/salutations.js` (a duplicate used by "Talk to Ada" so the
  browser can build the same salutation without calling the Edge Function).
  The `firstMessages.js` file has a reminder comment that every message needs
  native-speaker review before going live.
