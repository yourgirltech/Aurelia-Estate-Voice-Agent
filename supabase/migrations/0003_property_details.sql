-- Property detail columns + seed data expansion so Precious (the Vapi voice
-- assistant) can search and describe live listings during a call.
-- Safe to run once, either via `supabase db push` or pasted into the
-- Supabase SQL Editor.

create extension if not exists pg_trgm;

alter table properties
  add column building_name text,
  add column city text,
  add column area text,
  add column address text,
  add column features text[] not null default '{}',
  add column nearby text[] not null default '{}',
  add column year_built int,
  add column completion_status text check (completion_status in ('ready', 'off_plan')),
  add column virtual_tour_available boolean not null default true,
  add column discounted_price numeric generated always as (round(price * 0.98, 2)) stored;

create index properties_status_idx on properties (status);
create index properties_city_idx on properties (city);
create index properties_area_idx on properties (area);
create index properties_property_type_idx on properties (property_type);
create index properties_bedrooms_idx on properties (bedrooms);
create index properties_price_idx on properties (price);
-- Trigram index so "search_properties" can fuzzy-match building names fast.
create index properties_building_name_trgm_idx
  on properties using gin (lower(building_name) gin_trgm_ops);

-- ─────────────────────────────────────────────────────────────────────────
-- Backfill the 5 properties from 0001_init.sql with the new columns.
-- ─────────────────────────────────────────────────────────────────────────
update properties set
  building_name = 'Marina Bay Residence',
  city = 'Dubai',
  area = 'Dubai Marina',
  address = '12 Marina Promenade, Dubai Marina, Dubai, UAE',
  features = ARRAY['gym', 'covered parking', 'pool', 'sea view', 'balcony'],
  nearby = ARRAY[
    'Dubai Marina Mall (5 min walk)',
    'Emirates International School (10 min drive)',
    'Marina Mosque (3 min walk)',
    'Dubai Marina Metro Station (7 min walk)',
    'Jumeirah Beach (10 min walk)'
  ],
  year_built = 2019,
  completion_status = 'ready',
  virtual_tour_available = true
where name = 'Marina Bay Residence';

update properties set
  building_name = 'Chelsea Garden Mews',
  city = 'London',
  area = 'Chelsea',
  address = '14 Anderson Mews, Chelsea, London SW3, UK',
  features = ARRAY['garden', 'garage', 'fireplace', 'period features'],
  nearby = ARRAY[
    'King''s Road shops (5 min walk)',
    'Chelsea and Westminster Hospital (8 min walk)',
    'St Luke''s Church (4 min walk)',
    'Sloane Square Underground (6 min walk)',
    'A4 main road (5 min drive)'
  ],
  year_built = 1890,
  completion_status = 'ready',
  virtual_tour_available = true
where name = 'Chelsea Garden Mews';

update properties set
  building_name = 'Lekki Phase 1 Villa',
  city = 'Lagos',
  area = 'Lekki Phase 1',
  address = '9 Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
  features = ARRAY['swimming pool', 'staff quarters', 'generator', 'security', 'garden'],
  nearby = ARRAY[
    'Lekki-Epe Expressway (2 min drive)',
    'Reddington Hospital (10 min drive)',
    'Lekki Market (5 min drive)',
    'Chevron Mosque (8 min drive)',
    'Murtala Muhammed Airport (45 min drive)'
  ],
  year_built = 2015,
  completion_status = 'ready',
  virtual_tour_available = true
where name = 'Lekki Phase 1 Villa';

update properties set
  building_name = 'Le Panorama',
  city = 'Nice',
  area = 'Promenade des Anglais',
  address = '8 Promenade des Anglais, Nice, France',
  features = ARRAY['rooftop terrace', 'sea view', 'private elevator', 'wine cellar'],
  nearby = ARRAY[
    'Nice Côte d''Azur Airport (15 min drive)',
    'Promenade beach (2 min walk)',
    'Nice Lycée International (12 min drive)',
    'Saint-Nicolas Cathedral (10 min walk)',
    'Tram station (5 min walk)'
  ],
  year_built = 2021,
  completion_status = 'ready',
  virtual_tour_available = true
where name = 'Côte d''Azur Penthouse';

update properties set
  building_name = 'Casa Antigua',
  city = 'Palma de Mallorca',
  area = 'Old Town',
  address = 'Calle Sant Jaume 5, Palma de Mallorca, Spain',
  features = ARRAY['exposed beams', 'roof terrace', 'historic building'],
  nearby = ARRAY[
    'Palma Cathedral (5 min walk)',
    'Palma beach (10 min walk)',
    'Santa Catalina Market (8 min walk)',
    'Palma Airport (20 min drive)',
    'Bus station (6 min walk)'
  ],
  year_built = 1750,
  completion_status = 'ready',
  virtual_tour_available = false
where name = 'Palma Old Town Loft';

-- ─────────────────────────────────────────────────────────────────────────
-- 7 new properties (12 total): 4 Dubai (one reserved), 2 London, 2 Lagos,
-- 1 Paris, 1 Marbella. At least 2 rentals overall (Palma above + Canary
-- Wharf below).
-- ─────────────────────────────────────────────────────────────────────────
insert into properties
  (name, description, location, country, property_type, bedrooms, bathrooms,
   size_value, size_unit, price, currency, listing_type, payment_terms,
   terms_and_conditions, status, building_name, city, area, address,
   features, nearby, year_built, completion_status, virtual_tour_available)
values
  (
    'Burj Vista Residence',
    'Compact 1-bedroom apartment with Burj Khalifa views in the heart of Downtown Dubai.',
    'Downtown Dubai',
    'United Arab Emirates',
    'Apartment',
    1, 1, 65, 'sqm',
    950000, 'AED', 'sale',
    '20% down payment, 80% on handover',
    'Standard UAE off-plan sale terms apply. Subject to DLD fees.',
    'available',
    'Burj Vista Residence', 'Dubai', 'Downtown Dubai',
    'Burj Vista Tower 2, Downtown Dubai, Dubai, UAE',
    ARRAY['gym', 'pool', 'concierge', 'Burj Khalifa view', 'balcony'],
    ARRAY[
      'Dubai Mall (5 min walk)',
      'Burj Khalifa Metro Station (7 min walk)',
      'Downtown Dubai Mosque (4 min walk)',
      'GEMS World Academy (15 min drive)',
      'Dubai International Airport (18 min drive)'
    ],
    2020, 'ready', true
  ),
  (
    'Palm Signature Villa',
    'Beachfront 3-bedroom signature villa on a private Palm Jumeirah frond.',
    'Palm Jumeirah',
    'United Arab Emirates',
    'Villa',
    3, 4, 320, 'sqm',
    3500000, 'AED', 'sale',
    'Cash or mortgage, standard Dubai conveyancing',
    'Subject to Nakheel lease terms. DLD fees payable by buyer.',
    'reserved',
    'Palm Signature Villa', 'Dubai', 'Palm Jumeirah',
    'Frond K, Palm Jumeirah, Dubai, UAE',
    ARRAY['private beach', 'pool', 'garden', 'maid''s room', 'sea view'],
    ARRAY[
      'Atlantis The Palm (10 min drive)',
      'Palm Jumeirah Monorail (5 min drive)',
      'Nakheel Mall (8 min drive)',
      'Palm Jumeirah beach (1 min walk)',
      'Sofitel Mosque (10 min drive)'
    ],
    2017, 'ready', true
  ),
  (
    'Belgravia Heights',
    'Affordable 1-bedroom apartment in the family-friendly Jumeirah Village Circle.',
    'Jumeirah Village Circle',
    'United Arab Emirates',
    'Apartment',
    1, 1, 68, 'sqm',
    780000, 'AED', 'sale',
    '10% down payment, balance on handover',
    'Standard UAE off-plan sale terms apply. Subject to DLD fees.',
    'available',
    'Belgravia Heights', 'Dubai', 'Jumeirah Village Circle',
    'Belgravia Heights 2, JVC, Dubai, UAE',
    ARRAY['gym', 'pool', 'covered parking', 'balcony'],
    ARRAY[
      'Circle Mall (6 min walk)',
      'JSS International School (10 min drive)',
      'JVC Mosque (5 min walk)',
      'Al Khail Road (3 min drive)',
      'Dubai Marina (15 min drive)'
    ],
    2022, 'ready', true
  ),
  (
    'Landmark Pinnacle',
    '2-bedroom riverside apartment in Canary Wharf, available for long-term rent.',
    'Canary Wharf',
    'United Kingdom',
    'Apartment',
    2, 2, 85, 'sqm',
    42000, 'GBP', 'rent',
    'Yearly rent, payable quarterly, 6 weeks deposit',
    'Minimum 12-month tenancy.',
    'available',
    'Landmark Pinnacle', 'London', 'Canary Wharf',
    '10 Marsh Wall, Canary Wharf, London E14, UK',
    ARRAY['concierge', 'gym', 'river view', 'balcony'],
    ARRAY[
      'Canary Wharf Elizabeth Line station (4 min walk)',
      'Crossrail Place shops (5 min walk)',
      'Barts Health Hospital (12 min drive)',
      'Museum of London Docklands (6 min walk)',
      'Thames waterfront (3 min walk)'
    ],
    2021, 'ready', true
  ),
  (
    'Bourdillon Court',
    'Secure 3-bedroom apartment in the prestigious Ikoyi district.',
    'Ikoyi',
    'Nigeria',
    'Apartment',
    3, 3, 210, 'sqm',
    180000000, 'NGN', 'sale',
    'Outright payment or 6-month instalment plan',
    'Governor''s consent to be obtained by seller.',
    'available',
    'Bourdillon Court', 'Lagos', 'Ikoyi',
    'Bourdillon Road, Ikoyi, Lagos, Nigeria',
    ARRAY['swimming pool', 'gym', 'generator', 'security', 'balcony'],
    ARRAY[
      'Falomo Shopping Mall (5 min drive)',
      'Reddington Hospital (7 min drive)',
      'Ikoyi Club (10 min walk)',
      'Christ Church Cathedral (8 min drive)',
      'Third Mainland Bridge (15 min drive)'
    ],
    2018, 'ready', true
  ),
  (
    'Hôtel Particulier',
    'Characterful 2-bedroom apartment with exposed beams in Le Marais.',
    'Le Marais',
    'France',
    'Apartment',
    2, 1, 95, 'sqm',
    1450000, 'EUR', 'sale',
    'Cash preferred, mortgage possible for EU residents',
    'Notaire fees payable by buyer as per French law.',
    'available',
    'Hôtel Particulier', 'Paris', 'Le Marais',
    '22 Rue des Rosiers, Le Marais, Paris, France',
    ARRAY['exposed beams', 'high ceilings', 'balcony', 'wine cellar'],
    ARRAY[
      'Saint-Paul Métro station (3 min walk)',
      'BHV Marais department store (5 min walk)',
      'Hôpital Saint-Louis (10 min walk)',
      'Saint-Paul Saint-Louis Church (2 min walk)',
      'Seine riverbank (12 min walk)'
    ],
    1750, 'ready', false
  ),
  (
    'Villa Serena',
    'Elegant 4-bedroom villa with a private pool on Marbella''s Golden Mile.',
    'Golden Mile',
    'Spain',
    'Villa',
    4, 5, 450, 'sqm',
    4200000, 'EUR', 'sale',
    'Cash or mortgage, standard Spanish conveyancing',
    'Notary and registration fees payable by buyer as per Spanish law.',
    'available',
    'Villa Serena', 'Marbella', 'Golden Mile',
    'Urbanización Golden Mile, Marbella, Spain',
    ARRAY['private pool', 'sea view', 'garden', 'staff quarters', 'home cinema'],
    ARRAY[
      'Puerto Banús marina (8 min drive)',
      'Marbella beach (5 min walk)',
      'Marbella International School (12 min drive)',
      'Nuestra Señora del Carmen Church (10 min drive)',
      'AP-7 highway (3 min drive)'
    ],
    2019, 'ready', true
  );
