-- Migration 001: Add pet_comments
-- Run: psql $DATABASE_URL -f database/migrations/001_add_comments.sql

BEGIN;

CREATE TABLE pet_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id      UUID NOT NULL REFERENCES pets (id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  parent_id   UUID REFERENCES pet_comments (id) ON DELETE CASCADE,
  body        TEXT NOT NULL CHECK (char_length(body) >= 1 AND char_length(body) <= 1000),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pet_comments_pet_id ON pet_comments (pet_id, created_at DESC);
CREATE INDEX idx_pet_comments_user_id ON pet_comments (user_id);
CREATE INDEX idx_pet_comments_parent_id ON pet_comments (parent_id);

-- updated_at trigger
CREATE TRIGGER trg_pet_comments_updated_at
  BEFORE UPDATE ON pet_comments
  FOR EACH ROW
  EXECUTE PROCEDURE set_updated_at();

COMMIT;