# Grato shop and referral programme: setup

The website now has an online shop (`/shop`), a customer account page (`/account`),
a referral programme (`/referral`) and an admin dashboard (`/admin`).
Each has a French version under `/fr/...`.

The shop runs on a small API (the `server/` folder). On Vercel it runs as one
serverless function (`api/index.js`) at `api.gratoglobal.com`; the data is stored in
MongoDB Atlas. The pages are hosted on Hostinger (see "Hosting" below).

## 1. Create the database (MongoDB Atlas, free tier is fine to start)

1. Sign in at https://cloud.mongodb.com and create a cluster.
2. Database Access: add a database user with a strong password.
3. Network Access: allow `0.0.0.0/0` (Vercel functions have no fixed IP).
4. Connect → Drivers: copy the connection string (`mongodb+srv://...`).

## 2. Set the environment variables

Copy `.env.example` to `.env` for your computer, and add the same values in
Vercel → Project → Settings → Environment Variables.

| Variable | What to put |
|---|---|
| `MONGODB_URI` | The Atlas connection string |
| `MONGODB_DB` | `grato` |
| `JWT_SECRET` | A random string of at least 32 characters (keeps sign-ins secure) |
| `SITE_URL` | `https://gratoglobal.com` (the Hostinger pages, no trailing slash) |
| `FLW_SECRET_KEY` | Flutterwave secret key (Dashboard → Settings → API keys) |
| `FLW_SECRET_HASH` | Any secret phrase; enter the same phrase in Flutterwave → Settings → Webhooks |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | The first admin login (password at least 10 characters). Used only by `npm run seed`. |

Without `FLW_SECRET_KEY` the shop runs in **test mode**: the payment step shows a
"simulate payment" screen and no money moves. Test mode is refused on the live site
unless `ALLOW_TEST_PAYMENTS=true` is set, so never set that in production.

In Flutterwave, set the webhook URL to `https://api.gratoglobal.com/api/webhooks/flutterwave`.
Make sure your Flutterwave account is enabled for both NGN and XAF.

## 3. Install, seed and run

```
npm install
npm run seed      # creates the admin account and 23 starter products
npm run dev:all   # website on http://localhost:5173, API on port 3001
```

Then sign in at `/admin` with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

To go live, follow "Hosting" below. Run `npm run seed` once from your computer with
`.env` pointing at the Atlas database.

## 4. Before launch

- **Replace the sample prices.** The starter products have placeholder prices.
  Admin → Overview shows how many are left; edit each product (or tick
  "Prices confirmed"). Add real photos in the same form.
- Check the pickup points, delivery cities and fees in Admin → Settings.
- Check the commission tiers (Bronze 3%, Silver 5%, Gold 7%) and payout minimums.
- Have someone review the referral programme terms shown on `/referral`.

## Hosting: pages on Hostinger, API on Vercel

The website pages are static files hosted on Hostinger at **gratoglobal.com**; the API
(shop, accounts, forms, admin) runs on Vercel at **api.gratoglobal.com**.

### 1. Put the API on Vercel with its own address

1. Push the project to GitHub and import it in Vercel. `vercel.json` makes it an
   API-only project (no website build); opening the API's home address redirects to the site.
2. Add the environment variables in Vercel (see `.env.example`), with
   `SITE_URL=https://gratoglobal.com`.
3. Vercel → Project → Settings → Domains → add `api.gratoglobal.com`. Vercel shows a
   **CNAME** record (usually `cname.vercel-dns.com`).
4. Hostinger hPanel → Domains → DNS / Nameservers → add that record:
   type `CNAME`, name `api`, target as shown by Vercel. Wait until Vercel shows the domain as valid.
5. Check `https://api.gratoglobal.com/api/health` shows `{"ok":true}`.
6. Flutterwave webhook URL: `https://api.gratoglobal.com/api/webhooks/flutterwave`.

Keeping the API on a gratoglobal.com subdomain matters: sign-in cookies then count as
"same site" and work in every browser. (A `*.vercel.app` address would need
`COOKIE_SAMESITE=none` and is blocked by some browsers, such as Safari.)

### 2. Build the pages and upload them to Hostinger

1. On your computer, in the project folder: `npm run build`. This reads
   `.env.production` (`VITE_API_URL=https://api.gratoglobal.com`) and writes the site to `dist/`.
2. Hostinger hPanel → Websites → gratoglobal.com → File Manager → `public_html`.
   Delete the old site files (keep nothing you still need), then upload **the contents of**
   `dist/` (not the folder itself). Tip: zip the contents of `dist`, upload the zip, then
   use *Extract* in File Manager.
3. Make sure `.htaccess` is in `public_html` (File Manager may hide dot files; enable
   "Show hidden files"). It sends every page address, such as `/fr/projects`, to `index.html`.
4. hPanel → Security → SSL: make sure SSL is active and **Force HTTPS** is on.
5. Open `https://gratoglobal.com`, sign in at `/admin`, and try the quote form.

Repeat step 2 whenever the pages change. Changes made in the admin dashboard (products,
news, projects…) need no upload; they are stored by the API.

## How orders work

- **Pay online**: items with a price, collected or delivered for a flat fee, can be
  paid immediately by card, bank transfer or mobile money (Flutterwave).
- **Quote / invoice**: generators and other "quote" items, or site delivery, go to
  Admin → Orders as "Quote requested". Enter prices and the delivery fee, save the
  quote, and send the customer their order link (Copy link / Send on WhatsApp).
  They can pay online from that page, or pay by bank transfer and you click
  "Mark paid (offline)" with the reference.
- Move paid orders through Processing → Ready → Completed. Stock is taken when an
  order is paid and returned if it is refunded.

## How the referral programme works

1. Someone creates an account at `/referral` and applies.
2. Admin → Referrers: approve them. They get a code and a link like `/shop?ref=CODE`.
3. A buyer who opens the link is linked to them for 30 days (changeable in Settings).
4. When that buyer's order is **paid**, a commission is created at the referrer's
   tier for the month (based on goods value, excluding delivery). Self-referrals are ignored.
5. When you mark the order **Completed**, the commission becomes available.
6. The referrer requests a payout; you pay them by bank or mobile money and record the
   reference in Admin → Payouts.
7. If an order is cancelled or refunded, its commission is reversed (or clawed back
   from the next payout if it was already paid).

## Managing the website from the admin dashboard

Besides the shop, the dashboard (`/admin`) now runs the rest of the site:

| Tab | What it does |
|---|---|
| Quote requests | Requests from the Contact / Get a quote form, with attached files. Set a status, add notes, reply by email or WhatsApp, download files. |
| Careers & CVs | Job applications with their CVs (download, status, notes), and the job openings shown on the Careers page. |
| News | Add, edit, hide or delete stories. A story with a "full story" gets its own page. |
| Projects | Projects and case studies: photos, challenge / solution / result, key figures, client. |
| Partners & clients | Names, descriptions and logos shown on the Partners and home pages. |
| Offices | Addresses, phones, emails and opening hours (Contact page and footer). |

The first time the site runs with the database, the current news, projects, jobs,
partners, clients and offices are copied into it, so nothing changes until you edit.
Changes show on the site within about 30 seconds.

Files are stored in Cloudinary when `CLOUDINARY_URL` is set (recommended), otherwise in
MongoDB Atlas. See "File storage (Cloudinary)" below. `VITE_FORM_ENDPOINT` is no longer used.

## File storage (Cloudinary)

With Cloudinary set up, every file goes straight from the browser to Cloudinary; the
site's server only signs each upload, so large files are never limited by Vercel.

| What | Where in Cloudinary | Who can open it |
|---|---|---|
| Photos uploaded in the admin dashboard (products, news, projects, logos) | `grato/photos` | Public, served optimised (`f_auto,q_auto`) |
| CVs from the careers form | `grato/cvs/<file id>/<name>` | Private: only through a 10-minute download link from the admin dashboard |
| Quote request attachments | `grato/quotes/<file id>/<name>` | Private, as above |

Setup:

1. Create a Cloudinary account and open Settings → API Keys.
2. Copy the **API environment variable** (`cloudinary://<key>:<secret>@<cloud name>`) into
   `CLOUDINARY_URL` in `.env` and in Vercel, then redeploy.
3. In Cloudinary Settings → Security, turn on **Allow delivery of PDF and ZIP files** if CV
   downloads are refused.

Deleting a quote request or job application in the dashboard also deletes its files from
Cloudinary. Photos and files uploaded before Cloudinary was set up stay in MongoDB and keep
working.

## Not included yet

- Email notifications (customers and Grato are not emailed automatically yet;
  use the order link and WhatsApp buttons in the admin).
- The admin dashboard is in English only.
