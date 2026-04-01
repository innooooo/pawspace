# PawSpace

**PawSpace** is a mobile-first web application that helps people in **Nairobi, Kenya** find homes for pets and connect with adopters. The product is designed for real-world constraints: most users browse on **Android phones** over **mobile data**, so the UI and API prioritize small payloads, fast lists, and clear flows.

The community angle is simple: pet profiles with photos, adoption status, interest requests, and likes—**a warm, local “social layer” around adoption**, not a generic classifieds site.

---

## Features

### MVP (current focus)

- User accounts with **JWT** authentication (register, login, session)
- **Pet listings** with Nairobi area, species, size, health flags, and adoption status
- **Photo uploads** (local disk in development; S3-compatible storage planned for production)
- **Adoption interests** so adopters can reach out; owners can accept or reject
- **Likes** on pet profiles (toggle + counts)
- **Browse and filter** pets (species, status, area) with pagination

### V1 (roadmap)

- Richer social engagement (comments, notifications)
- Moderation basics and reporting
- PWA polish and performance pass for slow networks
- Saved searches or favorites (optional)

### V2 (roadmap)

- **M-Pesa** for optional donations or structured rehoming fees (compliance-dependent)
- **English / Swahili** UI copy where it matters most
- Deeper Nairobi-specific discovery (e.g. maps or neighborhood autocomplete)

---

## Tech stack

| Layer | Technology |
|--------|------------|
| Frontend | React (Vite), TypeScript, Tailwind CSS, React Router |
| Backend | Node.js, Express 5 REST API |
| Database | PostgreSQL 15 |
| Auth | JWT (`jsonwebtoken`), passwords with `bcryptjs` |
| Uploads | `multer` (local `uploads/` → object storage in production) |
| Deployment | [Render](https://render.com/) or [Railway](https://railway.app/) (typical: web service + managed Postgres) |

**AI-assisted development:** Cursor **agents** (e.g. backend, database, technical writer) are configured to speed up consistent implementation and documentation.

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
│   │   ├── middleware/   # auth, validation
│   │   ├── routes/
│   │   └── index.js
│   ├── uploads/          # Local image storage (dev)
│   └── package.json
├── database/               # SQL migrations & seeds
│   ├── schema.sql
│   └── seed.sql
└── README.md
```

---

## Getting started

### Prerequisites

- **Node.js** 20+ (recommended)
- **PostgreSQL** 15+ with extensions available: `citext`, `pgcrypto`
- `psql` or any Postgres client to run SQL files

### 1. Clone the repository

```bash
git clone <your-repo-url> Pawspace
cd Pawspace
```

### 2. Database setup

Create a database and apply the schema, then (optionally) seed sample data:

```bash
createdb pawspace   # or use your host’s UI / Railway / Render Postgres

psql "$DATABASE_URL" -f database/schema.sql
psql "$DATABASE_URL" -f database/seed.sql
```

### 3. Backend (`server/`)

```bash
cd server
```

Create `server/.env` with at least `DATABASE_URL` and `JWT_SECRET` (see [Environment variables](#environment-variables)).

```bash
npm install
npm run dev
```

The API listens on **port `3000`** by default (`PORT` overrides).

### 4. Frontend (`client/`)

```bash
cd ../client
npm install
npm run dev
```

Vite runs the dev server (default **5173**). Point the client at your API base URL (e.g. via `VITE_API_URL` or your chosen proxy) so requests hit `http://localhost:3000` during development.

### 5. Production build (client)

```bash
cd client
npm run build
npm run preview   # optional local preview of the build
```

---

## API reference

Base URL: `/api` (e.g. `http://localhost:3000/api`).

All JSON responses use a consistent envelope:

```json
{ "data": null, "error": null, "meta": null }
```

- **`data`** — payload on success  
- **`error`** — string message on failure  
- **`meta`** — pagination or extra fields (e.g. `page`, `limit`, `total`, `hasMore`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | No | Register user (`name`, `email`, `password`, `nairobi_area`, optional `phone`). Returns user + JWT. |
| `POST` | `/api/auth/login` | No | Login; returns user + JWT. |
| `GET` | `/api/auth/me` | Bearer | Current user profile. |
| `GET` | `/api/pets` | No | List pets with optional filters (`species`, `adoption_status`, `nairobi_area`) and `page` (12 per page). |
| `POST` | `/api/pets` | Bearer | Create pet (owner or `both` role). |
| `GET` | `/api/pets/:id` | No | Pet detail with owner and photos. |
| `PATCH` | `/api/pets/:id` | Bearer | Update pet (owner only). |
| `DELETE` | `/api/pets/:id` | Bearer | Delete pet (owner only); cascades related rows. |
| `POST` | `/api/pets/:id/photos` | Bearer | Upload images (`multipart` field `photos`, max 5 files, 5MB each). |
| `DELETE` | `/api/pets/:id/photos/:photoId` | Bearer | Delete photo (owner only). |
| `PATCH` | `/api/pets/:id/photos/:photoId/primary` | Bearer | Set primary photo (owner only). |
| `POST` | `/api/pets/:id/interests` | Bearer | Express interest (not owner; one per adopter per pet). |
| `GET` | `/api/pets/:id/interests` | Bearer | List interests for a pet (owner only). |
| `GET` | `/api/users/me/interests` | Bearer | Interests the current user has submitted. |
| `PATCH` | `/api/interests/:id` | Bearer | Update interest status (`accepted` or `rejected`; pet owner only). |
| `POST` | `/api/pets/:id/like` | Bearer | Toggle like on a pet. |
| `GET` | `/api/pets/:id/likes` | Optional | Like count and whether the current user liked (if `Authorization` present). |

**Authentication header:** `Authorization: Bearer <jwt>`

---

## Environment variables

### Server (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string. |
| `JWT_SECRET` | Yes (prod) | Secret for signing JWTs. |
| `JWT_EXPIRES_IN` | No | JWT lifetime (default `7d`). |
| `PORT` | No | HTTP port (default `3000`). |
| `PUBLIC_API_URL` or `API_BASE_URL` | No | Public base URL for absolute photo URLs in API responses. If unset, derived from the incoming request. |

### Client (`client/.env` — optional)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base URL for API calls (e.g. `http://localhost:3000` in dev). Configure to match your deployment. |

---

## Contributing

1. **Fork** the repository and create a **feature branch** from `main`.
2. Keep changes **focused** (one concern per PR when possible).
3. Match existing **code style** and patterns in `client/` and `server/`.
4. For API changes, update this **README** and any relevant SQL under `database/`.
5. Open a **pull request** with a short description of what changed and why.

Bug reports and feature ideas are welcome via **issues** before large refactors.

---

## License

MIT © PawSpace contributors — see [LICENSE](./LICENSE).

---

*Built with Nairobi’s pet community in mind—clear listings, respectful adoption flow, and room to grow.*
