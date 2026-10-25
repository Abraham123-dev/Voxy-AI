-- Add detailed location columns to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS lga TEXT,
ADD COLUMN IF NOT EXISTS street_address TEXT;
