# GoGO Pantry — Pre-Launch Checklist

> Work through each item one by one. Check the box when done.
> Items marked 🔴 are critical — must fix before going live.
> Items marked 🟡 are important — fix before real users arrive.
> Items marked 🟢 are nice to have — can do after launch.

---

## 1. CUSTOMER APP — Functional Testing

### Home Page
- [ ] 🔴 Shop list is currently **hardcoded** in `HomePage.jsx` (MSN, PS, WP, SC) — replace with a real API call to `/api/shops` so shops load from the database
- [ ] 🟡 Test shop search filter works correctly
- [ ] 🟡 Selecting a shop saves `selectedShopId` to localStorage and navigates to catalog

### Catalog Page
- [ ] 🔴 Products load correctly for the selected shop
- [ ] 🟡 Out-of-stock products show correctly and cannot be added to cart
- [ ] 🟡 Category filter works
- [ ] 🟡 Search/filter works
- [ ] 🟢 Products with `visibility = hidden` do not appear

### Product Page
- [ ] 🔴 Product detail loads correctly with price, images, and stock
- [ ] 🟡 Add to cart button works
- [ ] 🟡 18+ restricted products (`isRestricted18Plus`) show appropriate warning

### Cart Page
- [ ] 🔴 Items added to cart appear correctly
- [ ] 🟡 Quantity can be increased/decreased
- [ ] 🟡 Removing an item from cart works
- [ ] 🟡 Cart total calculates correctly
- [ ] 🟡 Empty cart shows appropriate message

### Checkout Page
- [ ] 🔴 `deliveryCity` and `deliveryZipCode` are sent as **empty strings** in `CheckoutPage.jsx` — add input fields or pull from customer profile
- [ ] 🔴 Tax rate is **hardcoded at 8%** — move to a config variable or database setting
- [ ] 🔴 Delivery fee is **hardcoded at $3.99** — move to config or shop settings
- [ ] 🔴 ShopId falls back to hardcoded `'msn'` if no `selectedShopId` in localStorage — add proper validation
- [ ] 🟡 Step 1 (Delivery/Pickup selection) works
- [ ] 🟡 Step 2 (Time slot selection) works — test slots generate correctly for next 7 days
- [ ] 🟡 Step 3 (Review & confirm) shows correct summary before placing order
- [ ] 🟡 Out-of-stock error (409 response) shows clearly to user
- [ ] 🟡 Cart clears after successful order
- [ ] 🟡 Test placing an order with delivery address
- [ ] 🟡 Test placing an order as pickup (no delivery fee)

### Order Confirmation Page
- [ ] 🔴 Confirm page shows real order ID (not fallback `'GG-1234'`)
- [ ] 🟡 Order summary displays correctly
- [ ] 🟡 Customer receives confirmation email after order

### Order Tracking Page
- [ ] 🔴 Order timeline is **hardcoded/static** in `OrderTrackPage.jsx` — connect timeline steps to real order `status` field from the database (`new`, `picking`, `ready`, `completed`)
- [ ] 🟡 Order details (items, price, address) load from API correctly
- [ ] 🟡 Test tracking page for both delivery and pickup orders

### Account Page
- [ ] 🟡 Customer can view and update their profile (name, phone, address)
- [ ] 🟡 Password change works
- [ ] 🟡 Account page shows correct customer info after login

### Orders History Page
- [ ] 🟡 Customer can see their past orders
- [ ] 🟡 Clicking an order navigates to order tracking page
- [ ] 🟡 Order statuses display correctly

### Auth (Login / Signup)
- [ ] 🔴 Test signup with valid and invalid data (wrong password format, duplicate email)
- [ ] 🔴 Test login with wrong password — lockout activates after 5 failed attempts
- [ ] 🟡 Logout works and redirects to login
- [ ] 🟡 Protected pages (`/cart`, `/checkout`, `/orders`) redirect to login if not authenticated
- [ ] 🟡 Token refresh works (session stays alive beyond 15-minute JWT expiry)
- [ ] 🟡 Password reset / forgot password flow works (if implemented)

---

## 2. STAFF APP — Functional Testing

### Staff Login
- [ ] 🔴 Staff login works with correct shop selection
- [ ] 🟡 Wrong credentials show error message
- [ ] 🟡 Staff only sees their own shop data (not other shops)
- [ ] 🟡 Admin can switch between shops

### Dashboard
- [ ] 🟡 Dashboard loads with correct stats for the selected shop
- [ ] 🟡 New orders appear on dashboard
- [ ] 🟡 Low stock alerts appear correctly

### Fulfill Orders
- [ ] 🔴 New orders appear in the fulfill screen
- [ ] 🔴 Staff can mark orders as `picking` → `ready` → `completed`
- [ ] 🟡 Order items and quantities show correctly
- [ ] 🟡 Completed orders disappear from active queue

### Receive Stock (Purchase Orders)
- [ ] 🔴 Staff can receive stock against a purchase order
- [ ] 🔴 Receiving stock updates inventory quantity correctly
- [ ] 🟡 Partial receiving works (some items received, some rejected)
- [ ] 🟡 Rejection reason can be entered

### Stock Transfer
- [ ] 🟡 Admin can transfer stock between shops
- [ ] 🟡 Source shop stock decreases, destination shop stock increases
- [ ] 🟡 Staff cannot transfer to other shops (admin only)

### Inventory Management
- [ ] 🔴 Inventory list shows correct stock levels per product
- [ ] 🟡 Stock status (ok / low / critical / out) shows correctly
- [ ] 🟡 Reorder point calculates correctly based on PAR and lead time
- [ ] 🟡 Admin can manually adjust stock

### Product Management
- [ ] 🔴 Admin can create a new product (name, category, price, supplier required)
- [ ] 🔴 Admin can edit an existing product
- [ ] 🟡 Product image upload works
- [ ] 🟡 Variable products (with variants) create correctly
- [ ] 🟡 Product visibility (hidden/visible) toggle works

### Category & Department Management
- [ ] 🟡 Admin can create/edit/delete categories
- [ ] 🟡 Admin can create/edit/delete departments

### Supplier Management
- [ ] 🟡 Admin can create/edit suppliers
- [ ] 🟡 Supplier lead time reflects correctly in reorder calculations

### Staff Management
- [ ] 🔴 Admin can create new staff accounts
- [ ] 🔴 Admin can assign staff to a shop
- [ ] 🟡 Admin can deactivate a staff account
- [ ] 🟡 Staff cannot access staff management screen (admin only)

### Shop Management
- [ ] 🟡 Admin can view and edit shop details
- [ ] 🟡 `allowStaffPO` flag toggles correctly (allows/blocks staff from creating purchase orders)

---

## 3. BACKEND / SECURITY

### Environment Variables
- [ ] 🔴 `JWT_SECRET` in `.env` is a real secret — **never commit `.env` to GitHub** (check `.gitignore` includes `.env`)
- [ ] 🔴 Set up **production `.env`** with different values: strong DB password, production `APP_URL`, real Gmail credentials
- [ ] 🔴 `GMAIL_USER` and `GMAIL_APP_PASSWORD` are still placeholders — set up real Gmail App Password before launch
- [ ] 🔴 `CORS_ORIGIN` must be updated to your production domain (not localhost)
- [ ] 🟡 `NODE_ENV=production` in production environment

### Authentication & Security
- [ ] 🔴 Token blacklist is **in-memory** — tokens are lost if server restarts. Note in `tokenBlacklist.js` says to replace with Redis. For single-server launch this is acceptable short-term, but plan Redis migration
- [ ] 🟡 Rate limiting on auth endpoints is set (20 requests per 15 min) — confirm this is appropriate
- [ ] 🟡 Helmet security headers are applied ✅ (already done)
- [ ] 🟡 Password strength validation is enforced ✅ (already done)
- [ ] 🟢 Add rate limiting to non-auth endpoints too (product search, catalog)

### Database
- [ ] 🔴 Change default DB password (`postgres`/`postgres`) in production
- [ ] 🔴 Run all migrations on production database before launch
- [ ] 🟡 Test database connection with production credentials
- [ ] 🟡 Set up automated database backups (daily minimum)

### Email
- [ ] 🔴 Test order confirmation email sends to real customer email
- [ ] 🔴 Test with Gmail SMTP (not Ethereal test account) in production
- [ ] 🟡 Check email templates look good on mobile
- [ ] 🟡 Email links use production `APP_URL` (not localhost)

### Error Handling
- [ ] 🟡 All API errors return friendly messages (no raw stack traces to users)
- [ ] 🟡 Test what happens when database is unreachable
- [ ] 🟢 Set up server error logging (e.g. write errors to a log file)

---

## 4. EDGE CASES TO TEST

- [ ] 🔴 **Two customers buy the last item simultaneously** — does the 409 conflict error work? Test by reducing a product to qty 1 and placing two orders at the same time
- [ ] 🔴 **Customer places order for more qty than in stock** — does validation block it?
- [ ] 🟡 **Order with 0 items** — does checkout block it?
- [ ] 🟡 **Customer with no address tries delivery** — does checkout warn them?
- [ ] 🟡 **Product price is 0** — does checkout handle it?
- [ ] 🟡 **Session expires mid-checkout** — what happens to the cart?
- [ ] 🟡 **Staff marks order complete that doesn't exist** — does API return proper error?

---

## 5. BROWSER & DEVICE TESTING

- [ ] 🔴 Test customer app on **Chrome** (desktop)
- [ ] 🔴 Test customer app on **Safari** (iPhone/iPad) — CSS may differ
- [ ] 🟡 Test customer app on **Firefox**
- [ ] 🟡 Test customer app on **Android Chrome** (mobile browser)
- [ ] 🟡 Test staff app on desktop Chrome and Firefox
- [ ] 🟡 Check all pages are usable on a phone screen (responsive)

---

## 6. DEPLOYMENT PREPARATION

- [ ] 🔴 Set up Railway account and deploy backend
- [ ] 🔴 Set up production PostgreSQL database on Railway or Supabase
- [ ] 🔴 Run migrations on production database
- [ ] 🔴 Seed initial data (shops, categories, products) on production
- [ ] 🔴 Deploy frontend to Vercel or Netlify
- [ ] 🔴 Update `REACT_APP_API_URL` in frontend `.env` to production API URL
- [ ] 🔴 Point `gogopantry.com` to frontend (Bluehost DNS → Vercel/Netlify)
- [ ] 🔴 Point `api.gogopantry.com` to backend (Bluehost DNS → Railway)
- [ ] 🔴 Confirm HTTPS works on both frontend and API
- [ ] 🟡 Test full order flow on production (not localhost) before announcing launch
- [ ] 🟡 Run `clear-for-uat.js` to reset test data before real users arrive

---

## 7. UAT (User Acceptance Testing)

- [ ] 🟡 Give 2-3 trusted people access to test as customers
- [ ] 🟡 Have a staff member test the fulfill/receive flow end to end
- [ ] 🟡 Collect feedback and fix critical issues
- [ ] 🟡 Test a full cycle: customer orders → staff fulfills → customer gets delivery update

---

## Summary Count

| Priority | Total Items |
|----------|------------|
| 🔴 Critical (must fix) | 30 |
| 🟡 Important | 45 |
| 🟢 Nice to have | 3 |

**Suggested order:** Fix all 🔴 items first → test edge cases → deploy to Railway → UAT → launch.
