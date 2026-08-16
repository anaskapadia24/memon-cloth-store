# Memon Cloth Store

Full-stack e-commerce platform: a shared Express/MongoDB API with two separate frontends — a Next.js customer storefront and a Vite + React admin panel.

## Project structure

```
memon-cloth-store/
├── backend/    # Express + MongoDB API (used by both frontends)
├── web/        # Next.js 16 customer storefront (App Router)
└── admin/      # Vite + React + TypeScript admin panel
```

## Stack

- **API**: Express, Mongoose/MongoDB, JWT auth, Google Sign-In, Razorpay, Cloudinary (image uploads), Shiprocket (shipping), Nodemailer (order emails), PDFKit (invoices)
- **Storefront** (`web/`): Next.js 16 App Router, TypeScript, Server Actions for auth/orders/payment/reviews, on-demand ISR
- **Admin** (`admin/`): Vite, React, TypeScript, no server-side rendering (not needed — internal tool, no SEO requirement)

## Local setup

Each app has its own dependencies and env file. Copy the `.env.example` in each and fill it in before starting.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, etc.
npm run dev             # nodemon, http://localhost:5000
```

Required env vars are documented inline in `backend/.env.example`: `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`/`ADMIN_URL` (CORS allowlist), Razorpay keys, Gmail SMTP creds, Cloudinary creds, Shiprocket creds, `GOOGLE_CLIENT_ID`, and the storefront revalidation secret.

There is no self-serve "become admin" flow by design. To get an admin account: register normally through the storefront, then set `role: 'admin'` on that user's document directly in MongoDB.

### 2. Storefront (`web/`)

```bash
cd web
npm install
cp .env.local.example .env.local   # points at the backend above
npm run dev                         # http://localhost:3000
```

### 3. Admin panel (`admin/`)

```bash
cd admin
npm install
cp .env.example .env
npm run dev   # Vite dev server, proxies /api to the backend
```

## API overview

All routes are mounted under `/api` in `backend/server.js`:

- `/api/auth` — register, login, admin-login, Google sign-in, profile, password, addresses
- `/api/products`, `/api/categories`, `/api/reviews`, `/api/promos` — public reads, admin-only writes
- `/api/orders` — create/list orders, public tracking by AWB/order code, admin status updates + PDF invoices
- `/api/users` — profile, soft-delete account (`DELETE /api/users/me`)
- `/api/payment` — Razorpay order creation/verification
- `/api/settings`, `/api/admin/stats`, `/api/admin/export`, `/api/admin/import`, `/api/admin/reset` — admin-only

Admin-only endpoints require a `Bearer <JWT>` from `/api/auth/admin-login`, checked by `middleware/auth.js`'s `adminAuth`.

## Formatting

Prettier is configured at the repo root and covers all three apps:

```bash
npm install
npx prettier --write "backend/**/*.js" "web/src/**/*.{ts,tsx,css}" "admin/src/**/*.{ts,tsx,css}"
```

## Deployment notes

- The backend is a single stateless Express app — deploy it anywhere that runs Node (its own MongoDB URI, no bundled frontend).
- `web/` and `admin/` are independent static/SSR deploys that both call the backend via `NEXT_PUBLIC_API_BASE` / `VITE_API_BASE`.
- Set `FRONTEND_URL` and `ADMIN_URL` on the backend in production so CORS only allows those two origins.
- Product/category writes in `admin/` trigger on-demand revalidation on `web/` via `POST /api/revalidate`, authenticated with `REVALIDATE_SECRET` (must match in `backend/.env` and `web/.env.local`).
