-- Migration: Add filter columns to logements table
ALTER TABLE logements
  ADD COLUMN IF NOT EXISTS type_logement VARCHAR(50),
  ADD COLUMN IF NOT EXISTS surface NUMERIC(6,1),
  ADD COLUMN IF NOT EXISTS nb_pieces SMALLINT,
  ADD COLUMN IF NOT EXISTS meuble BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS disponible_le DATE,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS adresse TEXT;

-- Add indexes for commonly filtered columns
CREATE INDEX IF NOT EXISTS idx_logements_type ON logements(type_logement);
CREATE INDEX IF NOT EXISTS idx_logements_meuble ON logements(meuble);
CREATE INDEX IF NOT EXISTS idx_logements_surface ON logements(surface);
CREATE INDEX IF NOT EXISTS idx_logements_disponible ON logements(disponible_le);
