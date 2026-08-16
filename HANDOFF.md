# Session Handoff — Memon Cloth Store Migration

Written 2026-08-13, end of a single continuous session. Nothing in this repo
has been committed to git yet — everything described below is in the working
tree, uncommitted. Read this whole file before touching anything.

## The original ask

Owner wants to move off the current plain-HTML/Express site to a
production-grade setup: Next.js storefront (for SEO), React+TypeScript admin
panel, security hardening, India IT Rules 2021 / DPDP legal compliance, and a
visual redesign — done in **stages**, keeping the existing Express+MongoDB API
as the one backend both new frontends call.

The full staged plan (approved by the user before work started) lives at:
`/home/king/.claude/plans/ok-i-want-this-vast-graham.md` — read that first for
the architecture reasoning. Short version:

- **Stage 1**: harden the existing Express/Mongo backend + ship legal pages. No framework change.
- **Stage 2**: Next.js customer storefront (`web/`), calling the same Express API.
- **Stage 3**: React + TypeScript admin panel, **not started**.

## What's actually done

### Stage 1 — backend hardening (complete)
All in `backend/`:
- `helmet`, `morgan`, `express-rate-limit` added to `server.js` (global + strict limiter on `/api/auth` and `/api/payment`).
- CORS now allowlists `FRONTEND_URL`/`ADMIN_URL` env vars instead of accepting any origin.
- **Fixed a real vulnerability**: admin auth used to accept a hardcoded password (`memon2403`) sent as a fake Bearer token, readable in `frontend/admin.html`'s source. Replaced with `POST /api/auth/admin-login`, reusing the existing `User` model's `role: 'admin'` + bcrypt + real JWT. `middleware/auth.js`'s bypass branch is deleted.
- Soft-delete account flow: `DELETE /api/users/me`, `User.deletedAt` field, scrubs PII but leaves `Order` records intact (India tax retention — orders snapshot customer info independently already).
- Order creation (`routes/orders.js`) now recomputes `total` server-side from submitted items instead of trusting the client — closes a price-tampering hole.
- Dead code removed: `backend/uploads/` (61MB, orphaned — Cloudinary handles uploads now), a commented-out old Product schema, unused `Review.verified` field, duplicated rating-recalc and stock-adjust logic (now shared helpers).
- Legal pages as real static routes: `frontend/privacy-policy.html`, `terms-of-service.html`, `shipping-policy.html`, `return-refund-policy.html` (+ shared `frontend/legal.css`). Privacy policy names the Grievance Officer as **Anas Kapadia** (confirmed by the owner) with IT Rules 2021 language.
- `frontend/sitemap.xml`, `frontend/robots.txt` added — **domain in them is still a placeholder** (`www.memonclothstore.com`), needs to be swapped for the real production domain before launch.
- `backend/.env.example` documents every var actually used now.

**Not yet done in Stage 1**: bootstrapping an actual admin user. There's no
self-serve "become admin" endpoint by design — someone needs to register a
normal account, then manually set `role: 'admin'` on that user document in
MongoDB.

### Stage 2 — Next.js storefront (complete, then heavily revised)
Lives entirely in `web/` (Next.js 16, App Router, TypeScript). Talks to the
Express API via `NEXT_PUBLIC_API_BASE`. Key pieces:
- Pages: `/`, `/category/[slug]`, `/product/[slug]`, `/cart`, `/checkout`, `/login`, `/account`, `/account/orders`, plus the 4 legal pages ported into real Next routes.
- Auth: httpOnly cookie session (`web/src/lib/session.ts`), Server Actions in `web/src/lib/actions/*.ts` for login/register/orders/payment/reviews/wishlist — no separate REST layer, actions call the Express API directly with the token from the cookie.
- Cart: client-side, localStorage, same key (`memon_cart`) shape as the legacy site.
- Checkout: COD + Razorpay (test keys recommended for further testing — see below).
- On-demand ISR: `POST /api/revalidate` route handler in `web/`, called by `backend/routes/products.js` / `categories.js` (`backend/utils/revalidate.js`) after admin mutations, using `revalidateTag(tag, { expire: 0 })` — verified against this Next version's actual docs in `node_modules/next/dist/docs/`, since Next 16 changed this API's signature from what's commonly documented online.

**Important mid-session pivot**: the first version of `web/` shipped with an
original design system (its own color/type tokens, a "stitched thread" motif,
etc). The owner didn't like it — said it "feels AI" — and asked to match the
**existing live site's actual look** (`frontend/index.html`) instead. So the
whole design layer was ripped out and replaced with a faithful port of
`frontend/index.html`'s CSS: same navy/gold palette, same class names
(`.hero`, `.navbar`, `.product-card`, `.footer`, etc.), same hero carousel
(images copied from `frontend/images/hero/` to `web/public/images/hero/`),
same fonts loaded via `next/font` instead of a `<link>` tag. All of that CSS
now lives in one file: `web/src/app/globals.css` (global classes, not CSS
modules — deliberate, to keep 1:1 parity with the legacy markup easy to
verify).

### Bugs found and fixed this session (all verified with real screenshots, not guesses)
Screenshotting method that worked, in case you need it again — this
environment has no `claude-in-chrome` tool; instead:
```
mkdir -p /tmp/shot && cd /tmp/shot && npm install playwright-core --no-save
# then a small node script using chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox","--disable-gpu"] })
# take a fullPage:true screenshot, then crop with PIL since the hero's 100vh
# makes single-viewport screenshots useless for anything below the fold
```

1. **Product cards looked "overlapping"**: `.product-img` is rendered as a Next.js `<Link>` (an `<a>` tag). Plain anchors default to `display: inline`, which silently ignores CSS `height`. The 280px image box was collapsing to near-nothing. Fix: `display: block` added to `.product-img`.
2. **Product detail page was essentially unstyled**: I'd read the legacy CSS for `.product-details-grid`, `.size-selector`, `.reviews-section` etc. during investigation but never actually pasted it into `globals.css` before writing the page component. Added the full missing block (search `PRODUCT DETAILS PAGE` in `globals.css`).
3. **Price typography + discount display**: prices were using the serif display font (looks inconsistent for digits); switched to the sans body font with `font-variant-numeric: tabular-nums`. Added a proper discount system — strikethrough original price + a `30% OFF · Save ₹500` tag — on both product cards and the detail page (`.price-block`/`.price-now`/`.discount-tag` and the `-large` variants for the detail page).
4. **Hero "Happy Customers" stat row**: added icon badges + vertical dividers (was a flat generic number-over-label row). Then found a real alignment bug — `.hero p { margin-bottom: 40px }` (styling for the hero's intro paragraph) was leaking into `.hero-stat p` because it's nested inside `.hero` too, and the more specific `.hero-stat p` rule never explicitly zeroed `margin-bottom`, so the inherited 40px silently applied. Diagnosed by measuring actual `getBoundingClientRect()` values via Playwright, not by eyeballing — the numbers made the bug obvious (a wrapper div was 83px tall when its visible content only needed ~44px). Fixed by explicitly setting `margin-bottom: 0` in `.hero-stat p`.

**Lesson for whoever continues this**: when something "looks off" visually in
this codebase, don't guess-and-check with source-reading alone — take an
actual screenshot (or measure bounding boxes) before proposing a fix. Several
"looks fine to me" earlier this session turned out to have real, measurable
bugs once actually rendered.

### Stage 3 — Admin panel (not started)
`frontend/admin.html` is still the live admin panel, now using the new
`/api/auth/admin-login` flow (that part was patched in Stage 1). The planned
Vite + React + TS rebuild (see the plan file for the reasoning: no SEO need,
so no reason for Next.js here) has not been started at all.

## Known gaps / things to tell the owner about, not yet fixed

- **Real domain still a placeholder** in `frontend/sitemap.xml`, `frontend/robots.txt`, `backend/.env.example`, and `web/.env.local.example` (`www.memonclothstore.com`). Needs the real domain before launch.
- **Two seed/demo products have dead Unsplash image URLs** (404s) — this is data, not code; needs re-uploading via admin panel, not a code fix.
- **Currently, every real product in the live Atlas DB shows "Sold Out"** — confirmed this is real stock data, not a rendering bug.
- Wishlist has backend routes and Server Actions (`web/src/lib/actions/wishlist.ts`) but **no UI wired up yet** in `web/` — no wishlist page, no heart icon on cards. Flagged, not built (wasn't asked for explicitly).
- `README.md` at repo root is now stale (references the old `ADMIN_PASSWORD` flow, doesn't mention `web/` at all). Should be rewritten before this ships — I didn't touch it this session, only this HANDOFF.md.
- GST invoice fields, WhatsApp order-confirmation alternative, abandoned-cart handling, low-stock alerts, backups/monitoring, CI, Sentry, cookie-consent-if-analytics-added, Razorpay webhook signature verification — all flagged as cross-cutting gaps in the original plan file, still open, not in scope of what was asked this session.

## Local dev environment state (as of end of session)

Both dev servers were left **running** for the owner to check live:
- Backend on `:5000` — `backend/.env` currently points at the **real production MongoDB Atlas cluster** with **real, live Razorpay keys** (the owner pasted these in mid-session to check real data). ⚠️ Don't run checkout's "Pay Online" path against this without knowing it's live money. COD and everything else is safe.
- Next.js dev server on `:3000` — `web/.env.local` points `NEXT_PUBLIC_API_BASE` at that same `localhost:5000`.

If either isn't running when you pick this up:
```bash
cd backend && node server.js          # needs backend/.env — see backend/.env.example
cd web && npm run dev                 # needs web/.env.local — see web/.env.local.example
```

If `backend/.env` doesn't exist and you don't have the real Atlas credentials,
you can stand up a throwaway local Mongo instead (what I did before the owner
gave me the real ones):
```bash
mkdir -p /tmp/mongodata
mongod --dbpath /tmp/mongodata --port 27017 --bind_ip 127.0.0.1 --fork --logpath /tmp/mongod.log
# backend/.env: MONGO_URI=mongodb://127.0.0.1:27017/memon-store, JWT_SECRET=anything, dummy RAZORPAY_KEY_ID/SECRET (SDK throws at boot without them)
# then seed it:
cd backend && node -e "require('dotenv').config(); const c=require('./config/db'); const s=require('./config/seed'); (async()=>{await c();await s();process.exit(0)})()"
```

## Nothing is committed

`git status` shows ~55 changed/new files, zero commits made this session.
Before doing anything destructive (`git checkout`, `git reset`, etc.),
**stash or commit first** — this is genuinely all uncommitted work.
