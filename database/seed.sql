-- PawSpace — sample data for local development
-- Run after schema.sql: psql $DATABASE_URL -f database/seed.sql
--
-- Test login (bcrypt): password = "password123"
-- Hash generated with bcrypt cost 10 (compatible with bcryptjs on the API).

BEGIN;

INSERT INTO users (
  id,
  name,
  email,
  password_hash,
  phone,
  role,
  avatar_url,
  bio,
  nairobi_area
) VALUES
  (
    'a1000000-0000-4000-8000-000000000001',
    'Wanjiku Mwangi',
    'wanjiku@example.test',
    '$2b$10$p7q6XI.cLLf8LQcQHQMUZOUAWFuQfa9r6tXb.8Vy3W.p.tQPhj.6S',
    '+254712000001',
    'both',
    NULL,
    'Dog lover in Kilimani; fostering when I can.',
    'Kilimani'
  ),
  (
    'a2000000-0000-4000-8000-000000000002',
    'David Otieno',
    'david@example.test',
    '$2b$10$p7q6XI.cLLf8LQcQHQMUZOUAWFuQfa9r6tXb.8Vy3W.p.tQPhj.6S',
    NULL,
    'adopter',
    NULL,
    'Looking to adopt a small dog in Westlands.',
    'Westlands'
  );

INSERT INTO pets (
  id,
  owner_id,
  name,
  species,
  breed,
  age_years,
  age_months,
  sex,
  size,
  description,
  adoption_status,
  nairobi_area,
  is_vaccinated,
  is_neutered
) VALUES
  (
    'b1000000-0000-4000-8000-000000000001',
    'a1000000-0000-4000-8000-000000000001',
    'Simba',
    'dog',
    'Mixed breed',
    2,
    3,
    'male',
    'medium',
    'Friendly, good with kids. Needs a yard or daily walks. Rehoming due to relocation.',
    'available',
    'Kilimani',
    true,
    true
  ),
  (
    'b2000000-0000-4000-8000-000000000002',
    'a1000000-0000-4000-8000-000000000001',
    'Shadow',
    'cat',
    'Domestic shorthair',
    NULL,
    8,
    'female',
    'small',
    'Indoor cat, litter trained. Calm temperament.',
    'pending',
    'Kilimani',
    true,
    true
  ),
  (
    'b3000000-0000-4000-8000-000000000003',
    'a1000000-0000-4000-8000-000000000001',
    'Kiwi',
    'bird',
    'Budgie',
    NULL,
    NULL,
    'unknown',
    'small',
    'Comes with cage and supplies. Good for a quiet home.',
    'available',
    'Kilimani',
    false,
    false
  );

INSERT INTO pet_photos (
  id,
  pet_id,
  url,
  storage_key,
  display_order,
  is_primary
) VALUES
  (
    'c1000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000001',
    'https://placehold.co/800x600/e8d5c4/333333?text=Simba',
    'dev/local/pets/b1000000-0000-4000-8000-000000000001/primary.jpg',
    0,
    true
  ),
  (
    'c2000000-0000-4000-8000-000000000002',
    'b2000000-0000-4000-8000-000000000002',
    'https://placehold.co/800x600/c4d5e8/333333?text=Shadow',
    'dev/local/pets/b2000000-0000-4000-8000-000000000002/primary.jpg',
    0,
    true
  ),
  (
    'c3000000-0000-4000-8000-000000000003',
    'b3000000-0000-4000-8000-000000000003',
    'https://placehold.co/800x600/d5e8c4/333333?text=Kiwi',
    'dev/local/pets/b3000000-0000-4000-8000-000000000003/primary.jpg',
    0,
    true
  );

INSERT INTO adoption_interests (
  id,
  pet_id,
  adopter_id,
  message,
  status
) VALUES (
  'd1000000-0000-4000-8000-000000000001',
  'b1000000-0000-4000-8000-000000000001',
  'a2000000-0000-4000-8000-000000000002',
  'Hi — I live near Yaya and can offer daily walks. Would love to meet Simba.',
  'pending'
);

INSERT INTO pet_likes (
  id,
  pet_id,
  user_id
) VALUES (
  'e1000000-0000-4000-8000-000000000001',
  'b2000000-0000-4000-8000-000000000002',
  'a2000000-0000-4000-8000-000000000002'
);

COMMIT;
