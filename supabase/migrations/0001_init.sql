-- Real Estate Vapi Call: initial schema
-- Tables: properties, leads, calls
-- RLS: anon can only read available properties; leads/calls are service-role only

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- properties
-- ─────────────────────────────────────────────────────────────────────────
create table properties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  location text,
  country text,
  property_type text,
  bedrooms int,
  bathrooms int,
  size_value numeric,
  size_unit text check (size_unit in ('sqm', 'sqft')),
  price numeric,
  currency text,
  listing_type text check (listing_type in ('sale', 'rent')),
  payment_terms text,
  terms_and_conditions text,
  status text not null default 'available' check (status in ('available', 'reserved', 'sold', 'rented')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- leads
-- ─────────────────────────────────────────────────────────────────────────
create table leads (
  id uuid primary key default gen_random_uuid(),
  title_code text not null check (title_code in ('mr', 'mrs', 'ms', 'dr', 'prof', 'none')),
  first_name text not null,
  surname text not null,
  email text not null,
  phone_e164 text not null,
  country text,
  language text not null,
  enquiry_type text not null check (enquiry_type in ('buy', 'rent', 'invest', 'general')),
  property_id uuid references properties(id),
  preferred_locations text,
  property_type text,
  bedrooms text,
  budget_min numeric,
  budget_max numeric,
  currency text,
  timeline text,
  payment_method text,
  message text,
  consent_given boolean not null default false,
  consent_at timestamptz,
  status text not null default 'new' check (
    status in ('new', 'call_placed', 'call_failed', 'contacted', 'qualified', 'inspection_booked', 'closed_won', 'closed_lost')
  ),
  lead_score int,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_phone_created_idx on leads (phone_e164, created_at desc);

-- ─────────────────────────────────────────────────────────────────────────
-- calls
-- ─────────────────────────────────────────────────────────────────────────
create table calls (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id),
  vapi_call_id text,
  direction text not null default 'outbound' check (direction in ('outbound', 'inbound')),
  status text,
  summary text,
  transcript text,
  recording_url text,
  structured_data jsonb,
  ended_reason text,
  created_at timestamptz not null default now()
);

create index calls_lead_id_idx on calls (lead_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────
alter table properties enable row level security;
alter table leads enable row level security;
alter table calls enable row level security;

-- anon (public) may read only available properties
create policy "public can read available properties"
  on properties for select
  to anon
  using (status = 'available');

-- leads and calls: no policies for anon/authenticated -> only the service role
-- (which bypasses RLS) can read/write them from the Edge Function.

-- ─────────────────────────────────────────────────────────────────────────
-- Seed data: 5 sample properties across different countries
-- ─────────────────────────────────────────────────────────────────────────
insert into properties
  (name, description, location, country, property_type, bedrooms, bathrooms, size_value, size_unit, price, currency, listing_type, payment_terms, terms_and_conditions, status)
values
  (
    'Marina Bay Residence',
    'Modern 2-bedroom apartment with sea views and access to a private marina.',
    'Dubai Marina',
    'United Arab Emirates',
    'Apartment',
    2,
    2,
    120,
    'sqm',
    1850000,
    'AED',
    'sale',
    '80% on completion, 20% payment plan over 12 months',
    'Standard UAE off-plan sale terms apply. Subject to DLD fees.',
    'available'
  ),
  (
    'Chelsea Garden Mews',
    'Elegant 3-bedroom townhouse in a quiet mews close to the King''s Road.',
    'Chelsea, London',
    'United Kingdom',
    'House',
    3,
    3,
    160,
    'sqm',
    2950000,
    'GBP',
    'sale',
    'Cash or mortgage, standard UK conveyancing',
    'Subject to contract. Stamp duty payable by buyer.',
    'available'
  ),
  (
    'Lekki Phase 1 Villa',
    'Spacious 5-bedroom detached villa with a private pool and staff quarters.',
    'Lekki Phase 1, Lagos',
    'Nigeria',
    'House',
    5,
    5,
    450,
    'sqm',
    250000000,
    'NGN',
    'sale',
    'Outright payment or 6-month instalment plan',
    'Governor''s consent to be obtained by seller.',
    'available'
  ),
  (
    'Côte d''Azur Penthouse',
    'Sea-facing penthouse with a wraparound terrace close to Promenade des Anglais.',
    'Nice',
    'France',
    'Apartment',
    4,
    3,
    210,
    'sqm',
    3200000,
    'EUR',
    'sale',
    'Cash preferred, mortgage possible for EU residents',
    'Notaire fees payable by buyer as per French law.',
    'available'
  ),
  (
    'Palma Old Town Loft',
    'Restored 1-bedroom loft in a historic building in Palma''s old town, available for long-term rent.',
    'Palma de Mallorca',
    'Spain',
    'Apartment',
    1,
    1,
    75,
    'sqm',
    2200,
    'EUR',
    'rent',
    'Monthly rent, 2 months deposit',
    'Minimum 12-month lease.',
    'available'
  );
