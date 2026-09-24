-- Adds proximity preferences to leads: what the customer wants nearby
-- (school, main road, hospital, etc.), captured as multi-select chips.

alter table leads
  add column proximity_preferences text[] not null default '{}';
