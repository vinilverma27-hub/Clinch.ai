ALTER TABLE influencers
  ADD COLUMN IF NOT EXISTS niche TEXT;

ALTER TABLE crm_entries
  ADD COLUMN IF NOT EXISTS score_breakdown JSONB;
