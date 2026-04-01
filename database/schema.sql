-- PawSpace — initial schema (PostgreSQL 15+)
-- Run on a fresh database: psql $DATABASE_URL -f database/schema.sql
--
-- Extensions must run outside a transaction block (PostgreSQL requirement).

CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

BEGIN;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  email           CITEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  phone           TEXT,
  role            TEXT NOT NULL CHECK (role IN ('owner', 'adopter', 'both')),
  avatar_url      TEXT,
  bio             TEXT,
  nairobi_area    TEXT NOT NULL CHECK (nairobi_area IN (
                    'Westlands', 'Kilimani', 'Karen', 'Lavington', 'Parklands', 'Kasarani',
                    'Embakasi', 'Langata', 'South B', 'South C', 'Kibera', 'Ruaka', 'Kileleshwa', 'Other'
                  )),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX users_phone_unique_nonnull ON users (phone) WHERE phone IS NOT NULL;

COMMENT ON TABLE users IS 'Pet owners and adopters; phone reserved for M-Pesa / SMS contact later';

-- ---------------------------------------------------------------------------
-- pets
-- ---------------------------------------------------------------------------

CREATE TABLE pets (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id           UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name               TEXT NOT NULL,
  species            TEXT NOT NULL CHECK (species IN ('dog', 'cat', 'rabbit', 'bird', 'other')),
  breed              TEXT,
  age_years          SMALLINT CHECK (age_years IS NULL OR (age_years >= 0 AND age_years <= 40)),
  age_months         SMALLINT CHECK (age_months IS NULL OR (age_months >= 0 AND age_months <= 11)),
  sex                TEXT NOT NULL CHECK (sex IN ('male', 'female', 'unknown')),
  size               TEXT NOT NULL CHECK (size IN ('small', 'medium', 'large')),
  description        TEXT NOT NULL,
  adoption_status    TEXT NOT NULL CHECK (adoption_status IN ('available', 'pending', 'adopted')),
  nairobi_area       TEXT NOT NULL CHECK (nairobi_area IN (
                       'Westlands', 'Kilimani', 'Karen', 'Lavington', 'Parklands', 'Kasarani',
                       'Embakasi', 'Langata', 'South B', 'South C', 'Kibera', 'Ruaka', 'Kileleshwa', 'Other'
                     )),
  is_vaccinated      BOOLEAN NOT NULL DEFAULT false,
  is_neutered        BOOLEAN NOT NULL DEFAULT false,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Browse / filter + sort (typical mobile list query)
CREATE INDEX idx_pets_browse ON pets (species, adoption_status, nairobi_area, created_at DESC);

CREATE INDEX idx_pets_owner_id ON pets (owner_id);

-- ---------------------------------------------------------------------------
-- pet_photos
-- ---------------------------------------------------------------------------

CREATE TABLE pet_photos (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id         UUID NOT NULL REFERENCES pets (id) ON DELETE CASCADE,
  url            TEXT NOT NULL,
  storage_key    TEXT NOT NULL,
  display_order  SMALLINT NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  is_primary     BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- At most one primary image per pet (partial unique index)
CREATE UNIQUE INDEX pet_photos_one_primary_per_pet ON pet_photos (pet_id) WHERE is_primary;

CREATE INDEX idx_pet_photos_pet_id_order ON pet_photos (pet_id, display_order);

-- ---------------------------------------------------------------------------
-- adoption_interests
-- ---------------------------------------------------------------------------

CREATE TABLE adoption_interests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id      UUID NOT NULL REFERENCES pets (id) ON DELETE CASCADE,
  adopter_id  UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  message     TEXT,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT adoption_interests_one_per_adopter_pet UNIQUE (pet_id, adopter_id)
);

CREATE INDEX idx_adoption_interests_pet_id ON adoption_interests (pet_id);
CREATE INDEX idx_adoption_interests_adopter_id ON adoption_interests (adopter_id);

-- ---------------------------------------------------------------------------
-- pet_likes (V1-ready)
-- ---------------------------------------------------------------------------

CREATE TABLE pet_likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id     UUID NOT NULL REFERENCES pets (id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pet_likes_one_per_user_pet UNIQUE (pet_id, user_id)
);

CREATE INDEX idx_pet_likes_pet_id ON pet_likes (pet_id);
CREATE INDEX idx_pet_likes_user_id ON pet_likes (user_id);

-- ---------------------------------------------------------------------------
-- Business rule: owner cannot express adoption interest on own pet
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION adoption_interests_reject_owner()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
  v_owner UUID;
BEGIN
  SELECT owner_id INTO v_owner FROM pets WHERE id = NEW.pet_id;
  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'Pet % not found', NEW.pet_id;
  END IF;
  IF NEW.adopter_id = v_owner THEN
    RAISE EXCEPTION 'Owner cannot create adoption interest on own pet';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_adoption_interests_reject_owner
  BEFORE INSERT OR UPDATE OF pet_id, adopter_id ON adoption_interests
  FOR EACH ROW
  EXECUTE PROCEDURE adoption_interests_reject_owner();

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER trg_pets_updated_at
  BEFORE UPDATE ON pets
  FOR EACH ROW
  EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER trg_adoption_interests_updated_at
  BEFORE UPDATE ON adoption_interests
  FOR EACH ROW
  EXECUTE PROCEDURE set_updated_at();

COMMIT;
