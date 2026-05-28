# PawSpace

**PawSpace** is a mobile-first web application that helps people in **Nairobi, Kenya** find homes for pets and connect with adopters. The product is designed for real-world constraints: most users browse on **Android phones** over **mobile data**, so the UI and API prioritize small payloads, fast lists, and clear flows.

The community angle is simple: pet profiles with photos, adoption status, interest requests, and likes—**a warm, local "social layer" around adoption**, not a generic classifieds site.

---

## Roadmap

### MVP (shipped)

- User accounts with **JWT** authentication (register, login, session)
- **Pet listings** with Nairobi area, species, size, health flags, and adoption status
- **Photo uploads** (local disk in development; S3-compatible storage in production)
- **Adoption interests** so adopters can reach out; owners can accept or reject
- **Likes** on pet profiles (toggle + counts)
- **Browse and filter** pets (species, status, area) with pagination

---

### Phase 1 (current development target)

Phase 1 responds directly to post-launch feedback and focuses on **trust, lifecycle clarity, and communication**. Every feature below maps to a specific gap identified from real user questions.

#### 1. Listing Lifecycle Management

**Problem:** Users asked whether listings can be edited, deleted, or archived, and how to signal a successful adoption.

**Spec:**
- Owners can **edit** any field on their listing at any time (already wired via `PATCH /api/pets/:id`; UI flow needs completing).
- Owners can **archive** a listing. Archived listings are hidden from browse/search but remain accessible to the owner under "My Listings." This preserves history without polluting active results. Archived status is distinct from `adopted`.
- Owners can **mark a pet as adopted** with an optional short success note (max 300 characters) and an optional photo. This triggers a success state on the profile visible to anyone who liked or expressed interest.
- Owners can **delete** a listing permanently with a confirmation step that warns the action is irreversible.
- Status flow: `available → adopted | archived`. From `archived`, owners can re-activate to `available`.

**New DB fields:**
- `pets.archived_at TIMESTAMPTZ` — null when not archived
- `pets.success_note VARCHAR(300)` — optional adoption story
- `pets.success_photo_url TEXT` — optional photo from new owner

**New/updated endpoints:**
- `PATCH /api/pets/:id/archive` — toggle archive state (owner only)
- `PATCH /api/pets/:id/adopt` — mark adopted with optional body `{ success_note, success_photo }` (owner only)

---

#### 2. Phone Verification for Listers

**Problem:** Users asked how ownership is ascertained. Full KYC is not realistic for Phase 1, but an unverified phone number is a meaningful trust signal and a deterrent against throwaway accounts.

**Spec:**
- On registration or from the profile settings page, users can verify their phone number via **SMS OTP**.
- OTP provider: **Africa's Talking** (Kenyan SMS gateway, affordable local rates, straightforward Node.js SDK).
- Verified users receive a **"Verified" badge** displayed on their profile and on any pet listings they own.
- Listings from unverified accounts display a **"Unverified lister"** label in the card and detail view.
- Phone verification is not mandatory to list but is surfaced as a strong prompt during the listing creation flow.
- OTPs expire after **10 minutes**. Rate-limited to 3 attempts per phone number per hour.

**New DB fields:**
- `users.phone_verified BOOLEAN DEFAULT FALSE`
- `users.phone_verified_at TIMESTAMPTZ`
- `users.otp_hash TEXT` — bcrypt hash of the current OTP
- `users.otp_expires_at TIMESTAMPTZ`

**New endpoints:**
- `POST /api/auth/phone/send-otp` — sends OTP to the user's stored phone number (Bearer required)
- `POST /api/auth/phone/verify-otp` — accepts `{ otp }`, validates, marks `phone_verified = true` (Bearer required)

---

#### 3. Shelter and Rescue Organisation Accounts

**Problem:** Users asked whether shelters and rescues that charge adoption fees can be accommodated. A flat individual-user model does not cover this.

**Spec:**
- Add an `organisation` account type alongside the existing `adopter` / `owner` / `both` roles.
- Organisation accounts have an extended profile: organisation name, registration number (optional, for KSPCA-affiliated bodies), description, website, and a verified badge (manually granted by PawSpace admin for Phase 1).
- Listings from organisation accounts display the organisation name and logo in place of an individual username.
- Organisation accounts can set an **adoption fee** on each listing (stored in KES, integer). Fee is displayed prominently on the listing with a note: *"This is a rehoming/care fee charged by the rescue or shelter."*
- Fee field is optional and only visible on listings owned by an organisation account.
- Payment processing is **not** handled in Phase 1. The fee is informational — correspondence and payment happen off-platform. M-Pesa integration is scoped for Phase 2.

**New DB fields:**
- `users.account_type VARCHAR(20) DEFAULT 'individual'` — values: `individual`, `organisation`
- `users.org_name VARCHAR(200)`
- `users.org_registration VARCHAR(100)`
- `users.org_description TEXT`
- `users.org_website VARCHAR(500)`
- `users.org_verified BOOLEAN DEFAULT FALSE` — admin-set
- `pets.adoption_fee_kes INTEGER` — null means no fee

---

#### 4. In-Platform Messaging

**Problem:** Users asked for private messaging so correspondence does not leak to personal phone numbers or email prematurely.

**Spec:**
- Messaging is **gated behind an accepted interest**. A conversation thread opens automatically when a pet owner accepts an adopter's interest request. This prevents cold-message spam.
- Each accepted interest maps 1:1 to a conversation thread.
- Messages are text-only for Phase 1 (max 1,000 characters per message). Photo sharing is Phase 2.
- No real-time WebSocket in Phase 1. The UI polls for new messages every 30 seconds when a conversation is open (acceptable given mobile data constraints; WebSocket upgrade is Phase 2).
- Users can see all their active conversation threads under a **Messages** tab.
- Unread message count is shown in the nav badge.

**New DB tables:**

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interest_id UUID NOT NULL REFERENCES adoption_interests(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id),
  adopter_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(interest_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  body TEXT NOT NULL CHECK (char_length(body) <= 1000),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**New endpoints:**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/conversations` | Bearer | List all conversations for the current user |
| `GET` | `/api/conversations/:id` | Bearer | Conversation detail with participants |
| `GET` | `/api/conversations/:id/messages` | Bearer | Paginated message history (50 per page) |
| `POST` | `/api/conversations/:id/messages` | Bearer | Send a message |
| `PATCH` | `/api/conversations/:id/messages/read` | Bearer | Mark all messages in conversation as read |

---

#### 5. Notification System

**Problem:** Users asked for alerts to ensure no messages or interest requests are missed. On mobile data, missed notifications mean abandoned adoptions.

**Spec:**
- **In-app notifications** stored in the database and surfaced via a bell icon in the nav.
- **Email notifications** for high-priority events (new interest, interest accepted, new message). Provider: **Resend** (generous free tier, simple Node.js SDK).
- Users can control email notification preferences from their profile settings (on/off per event type).
- In-app notifications are cleared after 30 days.

**Notification triggers:**

| Event | Recipient | Channel |
|-------|-----------|---------|
| New adoption interest on your pet | Pet owner | In-app + email |
| Your interest was accepted | Adopter | In-app + email |
| Your interest was rejected | Adopter | In-app only |
| New message in a conversation | Other party | In-app + email (if no read in 5 min) |
| Your pet was liked (digest, not per-like) | Pet owner | Email (daily digest, off by default) |

**New DB table:**

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT,
  entity_type VARCHAR(50),
  entity_id UUID,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**New endpoints:**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/notifications` | Bearer | Paginated list (20 per page), unread first |
| `PATCH` | `/api/notifications/:id/read` | Bearer | Mark single notification read |
| `PATCH` | `/api/notifications/read-all` | Bearer | Mark all read |
| `GET` | `/api/users/me/notification-preferences` | Bearer | Get email preference settings |
| `PATCH` | `/api/users/me/notification-preferences` | Bearer | Update email preferences |

---

#### 6. Listing Report and Moderation Queue

**Problem:** Users raised the risk of stolen pets being listed for sale — a concern KSPCA and Kenyan police are already trying to address on platforms like Jiji. PawSpace needs a mechanism to receive and act on community reports.

**Spec:**
- Any logged-in user can **report a listing** with a reason (stolen pet, fraud, abuse, other) and an optional note (max 500 characters).
- One report per user per listing. A user cannot report their own listing.
- Reports land in a **moderation queue** accessible via an admin-only route (`/api/admin/reports`).
- When a listing receives 3 or more reports, it is **automatically flagged** and a warning banner is shown on the listing detail view: *"This listing has been reported and is under review."* The listing remains visible but flagged.
- Admin can `dismiss` a report (no action), `warn` the lister (email sent), or `remove` the listing.
- Lister is not notified of individual reports, only of admin action.
- Phase 1 admin is a manually set `is_admin BOOLEAN` on the users table. No admin UI is built — actions are taken via API directly.

**New DB tables:**

```sql
CREATE TABLE listing_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES users(id),
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('stolen_pet','fraud','abuse','other')),
  note VARCHAR(500),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','dismissed','actioned')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pet_id, reporter_id)
);
```

**New field on `pets`:** `pets.flagged BOOLEAN DEFAULT FALSE`

**New endpoints:**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/pets/:id/report` | Bearer | Submit a report |
| `GET` | `/api/admin/reports` | Bearer + admin | List all pending reports |
| `PATCH` | `/api/admin/reports/:id` | Bearer + admin | Update report status and take action |

---

#### 7. Approximate Location Pin

**Problem:** Users asked for maps or directions to a lister's location or agreed meet point.

**Spec:**
- Listers can set an **approximate location pin** during listing creation or editing. This is neighbourhood-level precision (not street address) to protect lister privacy.
- Frontend uses **Leaflet.js** (open-source, no API key, no per-request cost — critical for a Nairobi-data-cost context).
- The map tile provider is **OpenStreetMap** (free).
- On the listing detail view, the map shows the pinned neighbourhood with a circle radius of ~500m to indicate the general area without exposing an exact address.
- Listers can type a neighbourhood name and the frontend geocodes it using the **Nominatim API** (free, rate-limited — one request per second is acceptable for this use case).
- Exact coordinates are stored but the API response rounds to 3 decimal places (~100m precision) before returning to clients.

**New DB fields:**
- `pets.location_lat DECIMAL(8,6)`
- `pets.location_lng DECIMAL(9,6)`
- `pets.location_label VARCHAR(200)` — human-readable name, e.g. "Westlands, Nairobi"

---

### Phase 2 (roadmap)

- **M-Pesa** integration for adoption fee payments via Daraja API (compliance-dependent)
- **Real-time messaging** upgrade via WebSockets
- **English / Swahili** UI localisation
- **Full KYC** with national ID capture for listers (third-party verification service TBD)
- **Photo watermarking** with PawSpace branding to deter stolen-pet listings
- **PWA** manifest and service worker for offline browse
- Saved searches and favourites
- Deeper neighbourhood discovery (autocomplete from Nairobi ward data)
- Admin dashboard UI (currently API-only)
- Comments on pet profiles

---

## Tech stack

| Layer | Technology |
|--------|------------|
| Frontend | React (Vite), TypeScript, Tailwind CSS, React Router, Leaflet.js |
| Backend | Node.js, Express 5 REST API |
| Database | PostgreSQL 15 |
| Auth | JWT (`jsonwebtoken`), passwords with `bcryptjs` |
| Uploads | `multer` (local `uploads/` in dev; object storage in production) |
| SMS OTP | Africa's Talking |
| Email | Resend |
| Maps | Leaflet + OpenStreetMap + Nominatim |
| Deployment | Render (backend + Postgres), Vercel (frontend) |

---

## Project structure (monorepo)

```text
Pawspace/
├── client/                 # React (Vite) SPA
│   ├── src/
│   ├── vite.config.ts
│   └── package.json
├── server/                 # Express API
│   ├── src/
│   │   ├── config/       # DB pool, etc.
│   │   ├── controllers/
│   │   ├── middleware/   # auth, validation, admin
│   │   ├── routes/
│   │   └── index.js
│   ├── uploads/          # Local image storage (dev)
│   └── package.json
├── database/               # SQL migrations & seeds
│   ├── schema.sql
│   ├── migrations/       # Incremental migration files for Phase 1
│   └── seed.sql
└── README.md
```

---

## Git workflow

PawSpace uses a three-branch model to keep production stable.

```
master      → live production (Render + Vercel). Never commit directly.
develop     → integration branch. All features merge here first.
feature/*   → short-lived branches cut from develop.
```

**Rules:**

- `master` only receives pull requests from `develop`, after manual review and passing tests.
- `develop` should always be deployable but is not necessarily production-ready.
- Feature branches are created from `develop` and deleted after merge.
- Never merge a `feature/*` branch directly into `master`.

**Branch naming:** `feature/`, `fix/`, `chore/` prefixes — e.g. `feature/phase1-messaging`, `fix/like-toggle-race`, `chore/update-readme`.

**Pull request checklist before merging develop → master:**
- [ ] No console.log statements left in production paths
- [ ] All new environment variables documented in this README
- [ ] Database migration file added under `database/migrations/`
- [ ] API table in this README updated if endpoints changed

---

## Getting started

### Prerequisites

- **Node.js** 20+
- **PostgreSQL** 15+ with `citext`, `pgcrypto` extensions
- `psql` or any Postgres client

### 1. Clone the repository

```bash
git clone <your-repo-url> Pawspace
cd Pawspace
```

### 2. Database setup

```bash
createdb pawspace
psql "$DATABASE_URL" -f database/schema.sql
psql "$DATABASE_URL" -f database/seed.sql
```

For Phase 1 features, apply incremental migrations after the base schema:

```bash
for f in database/migrations/*.sql; do psql "$DATABASE_URL" -f "$f"; done
```

### 3. Backend

```bash
cd server
# create server/.env — see Environment variables below
npm install
npm run dev
```

API listens on **port 3000** by default.

### 4. Frontend

```bash
cd ../client
npm install
npm run dev
```

Vite runs on **5173** by default. Set `VITE_API_URL` to point at your backend.

### 5. Production build (client)

```bash
cd client
npm run build
npm run preview
```

---

## API reference

Base URL: `/api`.

All JSON responses use a consistent envelope:

```json
{ "data": null, "error": null, "meta": null }
```

- **`data`** — payload on success
- **`error`** — string message on failure
- **`meta`** — pagination or extra fields (`page`, `limit`, `total`, `hasMore`)

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | No | Register user. Returns user + JWT. |
| `POST` | `/api/auth/login` | No | Login. Returns user + JWT. |
| `GET` | `/api/auth/me` | Bearer | Current user profile. |
| `POST` | `/api/auth/phone/send-otp` | Bearer | Send SMS OTP to user's phone number. |
| `POST` | `/api/auth/phone/verify-otp` | Bearer | Verify OTP, mark phone as verified. |

### Pets

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/pets` | No | List pets with filters (`species`, `adoption_status`, `nairobi_area`, `flagged`) and `page`. |
| `POST` | `/api/pets` | Bearer | Create pet listing. |
| `GET` | `/api/pets/:id` | No | Pet detail with owner, photos, and approximate location. |
| `PATCH` | `/api/pets/:id` | Bearer | Update pet (owner only). |
| `DELETE` | `/api/pets/:id` | Bearer | Delete pet (owner only). Cascades. |
| `PATCH` | `/api/pets/:id/archive` | Bearer | Toggle archive state (owner only). |
| `PATCH` | `/api/pets/:id/adopt` | Bearer | Mark as adopted with optional `{ success_note, success_photo }` (owner only). |
| `POST` | `/api/pets/:id/report` | Bearer | Report a listing. |

### Photos

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/pets/:id/photos` | Bearer | Upload images (`multipart`, field `photos`, max 5 files, 5 MB each). |
| `DELETE` | `/api/pets/:id/photos/:photoId` | Bearer | Delete photo (owner only). |
| `PATCH` | `/api/pets/:id/photos/:photoId/primary` | Bearer | Set primary photo (owner only). |

### Interests

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/pets/:id/interests` | Bearer | Express interest (one per adopter per pet). |
| `GET` | `/api/pets/:id/interests` | Bearer | List interests for a pet (owner only). |
| `GET` | `/api/users/me/interests` | Bearer | Interests the current user has submitted. |
| `PATCH` | `/api/interests/:id` | Bearer | Accept or reject an interest (pet owner only). Accepting auto-creates a conversation. |

### Likes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/pets/:id/like` | Bearer | Toggle like. |
| `GET` | `/api/pets/:id/likes` | Optional | Like count + current user's like state. |

### Conversations and messages

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/conversations` | Bearer | All conversations for current user, unread count per thread. |
| `GET` | `/api/conversations/:id` | Bearer | Conversation detail. |
| `GET` | `/api/conversations/:id/messages` | Bearer | Message history (50 per page). |
| `POST` | `/api/conversations/:id/messages` | Bearer | Send a message. |
| `PATCH` | `/api/conversations/:id/messages/read` | Bearer | Mark all messages in thread as read. |

### Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/notifications` | Bearer | Paginated notifications (20 per page), unread first. |
| `PATCH` | `/api/notifications/:id/read` | Bearer | Mark one notification read. |
| `PATCH` | `/api/notifications/read-all` | Bearer | Mark all read. |
| `GET` | `/api/users/me/notification-preferences` | Bearer | Email preference settings. |
| `PATCH` | `/api/users/me/notification-preferences` | Bearer | Update email preferences. |

### Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/reports` | Bearer + admin | List all pending listing reports. |
| `PATCH` | `/api/admin/reports/:id` | Bearer + admin | Update report status (`dismissed`, `actioned`) and trigger lister warning or listing removal. |

**Authentication header:** `Authorization: Bearer <jwt>`

---

## Environment variables

### Server (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string. |
| `JWT_SECRET` | Yes | Secret for signing JWTs. |
| `JWT_EXPIRES_IN` | No | JWT lifetime (default `7d`). |
| `PORT` | No | HTTP port (default `3000`). |
| `PUBLIC_API_URL` | No | Public base URL for absolute photo URLs. Derived from request if unset. |
| `AFRICASTALKING_API_KEY` | Phase 1 | Africa's Talking API key for SMS OTP. |
| `AFRICASTALKING_USERNAME` | Phase 1 | Africa's Talking account username. |
| `RESEND_API_KEY` | Phase 1 | Resend API key for transactional email. |
| `EMAIL_FROM` | Phase 1 | Sender address for transactional emails (e.g. `hello@pawspace.co.ke`). |

### Client (`client/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base URL for API calls (e.g. `http://localhost:3000` in dev). |

---

## Contributing

1. **Fork** the repo and cut a **feature branch from `develop`**, not `main`.
2. Keep changes focused — one concern per PR.
3. Match existing code style in `client/` and `server/`.
4. For API changes: update this README and add a migration file under `database/migrations/`.
5. Open a PR into `develop` with a short description of what changed and why.
6. PRs into `master` are opened from `develop` only, after integration testing.

Bug reports and feature ideas are welcome via issues before large refactors.

---

## License

MIT © PawSpace contributors — see [LICENSE](./LICENSE).

---

*Built with Nairobi's pet community in mind — clear listings, respectful adoption flow, and room to grow.*
