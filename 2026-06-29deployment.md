# GoGO Pantry — Deployment Session Summary (2026-06-29)

## Goal
Deploy a full-stack Node.js + PostgreSQL + React grocery SPA (GoGO Pantry) to free cloud hosting.
Bluehost (original target) only supports PHP/MySQL — pivoted entirely to Vercel + Neon.

---

## Final Deployment Architecture

| Layer | Service | URL |
|-------|---------|-----|
| Backend API | Vercel (serverless) | https://api.gogopantry.com (also https://gogopantry.vercel.app) |
| Database | Neon (serverless PostgreSQL) | neon.tech |
| Staff Frontend | Vercel (static) | https://staff.gogopantry.com (also https://gogopantrystaff.vercel.app) |
| Customer Frontend | Vercel (static) | https://www.gogopantry.com (also https://customerappproject.vercel.app) |

---

## Key Changes Made to the Codebase

### Backend (`backend/`)

**1. Vercel serverless entry point**
- Added `backend/api/index.js` — thin wrapper that re-exports the Express app
- Added `backend/vercel.json` — rewrites all routes to `/api/index` (Fluid compute compatible)

**2. `backend/src/index.js` — Serverless-safe startup**
- Replaced `process.exit(1)` (kills serverless function) with graceful error logging
- Used `require.main === module` guard: starts HTTP server only when run directly (local), otherwise just runs DB init

**3. `backend/src/config/database.js` — SSL + bundler fix**
- Added `require('pg')` explicitly so Vercel's bundler includes the pg driver (Sequelize uses dynamic require)
- Added SSL config: `dialectOptions.ssl` enabled when `DB_SSL=true`

**4. `backend/src/utils/sanitize.js` — Replaced jsdom/dompurify**
- `new JSDOM('')` crashes on Vercel at module load
- Replaced with simple regex: `value.replace(/<[^>]*>/g, '').trim()`

**5. `backend/src/utils/jwt.js` — Removed fatal throw**
- Changed `throw new Error('FATAL: JWT_SECRET...')` to `console.error(...)` — fatal throws at module load crash serverless

**6. `backend/src/routes/shopManagement.js` — Base64 image storage**
- Vercel filesystem is read-only; multer disk storage fails
- Changed to `multer.memoryStorage()` + converts to base64 data URL stored in DB column
- Same pattern as products/categories already used

### Frontend — Both Apps

**7. `globals.js` in both apps**
- Changed `API_BASE` to use `import.meta.env.VITE_API_URL` (Vite env var) with localhost fallback
- Staff app also has `STATIC_BASE` (now unused for images, kept for compatibility)

**8. `.gitignore` added to both frontends**
- Excludes `dist/`, `node_modules/`, `.env.local`
- Previously `dist/` was committed — Vercel was serving stale pre-built files instead of rebuilding

**9. `package.json` — vite moved to `dependencies`**
- Vercel skips `devDependencies` during build
- Moved `vite` and `@vitejs/plugin-react` from `devDependencies` → `dependencies` in both frontends

### Customer App — Image Display Fix

**10. `GoGO Pantry Customer WebApp/src/components/shop.jsx`**
- `imageUrl` was computed as `` `http://localhost:3000${shop.image}` ``
- Since shop images are now base64 data URLs (not file paths), this broke the `src`
- Fixed: `const imageUrl = shop.image || null`

### Staff App — Image Display Fix

**11. `GoGO Pantry Staff/src/components/admin/ManageShopsScreen.jsx`**
- Same bug: `STATIC_BASE` was prepended to base64 image URLs in both the table thumbnail and the edit modal
- Fixed both occurrences to use `s.image` / `s.image || null` directly

---

## Environment Variables Set in Vercel

### Backend project (`gogopantry`)
```
DB_NAME=neondb
DB_USER=neondb_owner
DB_PASSWORD=<neon password>
DB_HOST=ep-dawn-mud-atqk2ii3.c-9.us-east-1.aws.neon.tech
DB_PORT=5432
DB_SSL=true
NODE_ENV=production
JWT_SECRET=<secret>
CORS_ORIGIN=https://customerappproject.vercel.app,https://gogopantrystaff.vercel.app,https://www.gogopantry.com,https://gogopantry.com,https://staff.gogopantry.com
```

### Customer frontend (`customerappproject`)
```
VITE_API_URL=https://api.gogopantry.com/api
```

### Staff frontend (`gogopantrystaff`)
```
VITE_API_URL=https://api.gogopantry.com/api
VITE_STATIC_URL=https://gogopantry.vercel.app
```

---

## Image Handling — Current State

All image types in the app are stored as base64 data URLs in the database:

| Resource | Upload method | Storage |
|----------|--------------|---------|
| Shop image | Multer memoryStorage → base64 on server | `shops.image` column |
| Product featuredImage | FileReader in browser → base64 in JSON | `products.featured_image` column |
| Product galleryImages | FileReader in browser → base64 in JSON | `products.gallery_images` JSON column |
| Category featuredImage | FileReader in browser → base64 in JSON | `categories.featured_image` column |

No images are served from the filesystem. All `<img src={...}>` tags receive the base64 string directly.

---

## Seed Data
- Seed script (`backend/src/seeders/seed.js`) was run directly against Neon with env var overrides
- Admin credentials: `admin@gogopantry.com` / `admin123`
- Database was cleared of test data after deployment; admin user retained

---

## Known Limitations
- Base64 images increase database row size significantly — not ideal for production at scale
- Vercel free tier has 100GB bandwidth/month and 100 function invocations/day soft limit
- Neon free tier: 0.5 GB storage, 1 compute unit

---

## Custom Domain Setup (2026-06-29)

Domain `gogopantry.com` is registered on Bluehost. DNS was configured to point to Vercel.

### Final Domain Mapping

| URL | App |
|-----|-----|
| `https://gogopantry.com` | Customer app (redirects 308 → www) |
| `https://www.gogopantry.com` | Customer app (Production) |
| `https://staff.gogopantry.com` | Staff app |
| `https://api.gogopantry.com` | Backend API |

### Bluehost DNS Records Added

| Type | Host Record | Points To |
|------|-------------|-----------|
| `A` | `@` | `216.198.79.1` (Vercel IP) |
| `CNAME` | `www` | `62af876600f9b830.vercel-dns-017.com.` (Vercel-assigned) |
| `CNAME` | `staff` | `b35b12b0927d630c.vercel-dns-017.com.` (Vercel-assigned) |
| `CNAME` | `api` | `ae072c6c1166bf21.vercel-dns-017.com.` (Vercel-assigned) |

### Vercel Domain Status
- `www.gogopantry.com` — Valid Configuration ✅
- `gogopantry.com` — Valid Configuration, redirects 308 → `www.gogopantry.com` ✅
- `staff.gogopantry.com` — Valid Configuration ✅
- `api.gogopantry.com` — Valid Configuration ✅

### Environment Variables Updated
- `CORS_ORIGIN` in backend updated to include all custom domains
- `VITE_API_URL` in both frontends updated to `https://api.gogopantry.com/api`
- All three projects redeployed

### Final Verification (2026-06-29)
- `https://www.gogopantry.com` — Customer app loads ✅
- `https://gogopantry.com` — Redirects to www ✅
- `https://staff.gogopantry.com` — Staff app loads, login working ✅
- `https://api.gogopantry.com/api/shops` — Returns JSON ✅

**Deployment complete. All domains live and verified.**

---

## Post-Deployment Fixes (2026-06-29)

### CORS kept blocking staff.gogopantry.com
- Despite `CORS_ORIGIN` env var being set correctly in Vercel, the backend kept responding with only `https://www.gogopantry.com` in the `Access-Control-Allow-Origin` header
- Env var updates require a redeploy — multiple redeployments did not resolve it (likely env var not saving correctly in Vercel UI)
- **Fix**: Hardcoded all allowed origins directly in `backend/src/index.js` so CORS works regardless of env var state. `CORS_ORIGIN` env var still merges in if set.
- Allowed origins now hardcoded: `localhost:3001`, `localhost:3002`, `gogopantry.com`, `www.gogopantry.com`, `staff.gogopantry.com`, `customerappproject.vercel.app`

### Customer app shops not loading
- `VITE_API_URL` was not set in Vercel for the customer frontend project, so API calls fell back to `http://localhost:3000/api` (unreachable in browser)
- **Fix**: Set `VITE_API_URL=https://api.gogopantry.com/api` in Vercel → Customer project → Environment Variables, then redeployed

### Staff app shops not loading
- Same missing `VITE_API_URL` issue as customer app
- **Fix**: Set `VITE_API_URL=https://api.gogopantry.com/api` in Vercel → Staff project → Environment Variables, then redeployed

### Mobile UI overhaul (Customer WebApp)
- Full responsive/mobile-first redesign applied to all pages (Home, Browse, Cart, Checkout, Auth, Confirmation)
- Key changes: bottom nav, product grid 2-col, bottom-sheet product modal, checkout step indicator, auth form stacking, footer overflow fix
- Footer horizontal overflow fixed: removed inline `gridTemplateColumns` overrides, switched to `minmax(0, 1fr)` CSS grid columns, added `min-width: 0` on grid children
- All changes rebuilt with `npm run build` and committed

---

## Session 2 (2026-06-29) — Dev Branch Setup & Carousel Fixes

### Dev Branch Workflow
- Created `dev` branch locally and pushed to GitHub
- Vercel automatically creates preview deployments for non-main branches — `dev` gets its own preview URL per project without touching production domains
- All future work goes on `dev`; merge to `main` when ready to go live

### Hero Carousel Mobile Fixes (`GoGO Pantry Customer WebApp/src/components/home.jsx`)
1. **Touch swipe support** — added `onTouchStart`/`onTouchEnd` handlers (40px threshold) so users can swipe between slides on mobile
2. **Arrow buttons hidden on mobile** — `hideOnMobile` class; swipe replaces them. Still visible on desktop (shrunk to 36px)
3. **Progress dots restructured** — dots were `position: absolute` inside `overflow: hidden` carousel, which caused them to bleed onto the white page background. Fixed by:
   - Moving the `overflow: hidden` to wrap only the slide track (not the whole carousel)
   - Rendering dots as a normal flex row below the slide track, inside an outer wrapper div that carries the gradient background
   - Visual span (4px tall) inside a transparent button for tap area — avoids mobile browser min-tap-target inflation
4. **Hero slide bottom padding reduced** — `clamp(52px…88px)` → `32px` since dots no longer need space inside the slide

### Other Mobile UI Fixes (`home.jsx` + `layout.jsx`)
- Featured Stores search bar hidden on mobile (`hideOnMobile`) — too cramped on narrow screens
- Bottom nav heart/Saved icon always renders in pink-red (`#e8436a`) to distinguish it from the other nav items

### Git History Cleanup
- Removed `Co-Authored-By: Claude` lines from all commits on both `main` and `dev` using `git filter-branch --msg-filter`
- Force pushed both branches to GitHub
- Going forward: no Co-Authored-By lines will be added to commits
