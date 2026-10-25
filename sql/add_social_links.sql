-- Add social_links column to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;
