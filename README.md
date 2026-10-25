# Grato Engineering — website (React)

Bilingual (English / French) company website for Grato Engineering Global Limited, built with React 18, React Router 6 and Vite 5. It implements the *Grato Engineering — Website Blueprint*.

## Quick start

Requires Node.js 18 or newer.

```bash
npm install
npm run dev        # local development at http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the production build locally
```

## What's included

| Area | Details |
| --- | --- |
| Pages | Home, About, Services overview, 6 service pages (including Generator Sales with a sizing tool), Projects, 6 case studies, Partners, News, Careers, Contact, Request a quote, 404 |
| Languages | English at `/…`, French at `/fr/…`; the EN/FR switch keeps the visitor on the same page |
| Motion | Hero slideshow (autoplay, pause, swipe, arrow keys), project and news carousels (drag, swipe, arrows, dots), rotating testimonials, logo strips, rollout timeline autoplay, animated map pins, counters, scroll reveals, photo-band parallax |
| Forms | 4-step quote form with file upload and per-field checks; careers form with CV upload |
| Accessibility | Keyboard-usable menus, carousels, map and dialogs; screen-reader labels; motion switched off for visitors who ask for reduced motion |
| SEO | Page titles, meta description, Open Graph tags, Organization structured data, `sitemap.xml` with EN/FR alternates, `robots.txt` |

## Project structure

```
public/
  img/              photos (960px + 480px phone versions) and img/logos/
  .htaccess         Apache/cPanel rewrite so deep links work
  _redirects        same, for Netlify
  sitemap.xml, robots.txt
src/
  data/content.js   ALL text (EN + FR) and structured content: services, projects,
                    partners, news, jobs, licences, offices, hero slides, testimonials
  data/icons.js     line-icon set
  data/map.js       Nigeria/Cameroon map shapes and pin positions
  components/       Header, Footer/CTA, HeroCarousel, Carousels, Rollout,
                    FootprintMap, Projects (cards, lightbox, logos), Forms
  pages/            one file per page group
  lib/              language/routing helpers, UI helpers, form sending
  styles/global.css design tokens (colours, type) and all styles
```

## Editing content

Almost everything is in **`src/data/content.js`**:

- `STRINGS.en` / `STRINGS.fr` hold the page copy.
- `SVCS`, `PROJECTS`, `PARTNERS`, `NEWS`, `JOBS`, `LICS`, `OFFICES`, `HERO`, `TESTI` hold the structured content. Each entry has an English and a French version.
- Text wrapped in `[[double brackets]]` is a **placeholder** and shows with a dashed orange outline. Replace the text and remove the brackets.

Common tasks:

- **Add a project:** put the photo in `public/img/` (a 960px `.webp`, plus an optional `-480.webp` phone version, and list it in `HAS480`), then add an entry to `PROJECTS` with a unique `slug` and `case: true` to give it a case-study page.
- **Add a news story:** add an entry at the top of `NEWS`.
- **Change contact numbers:** edit `CONTACT` in `src/lib/helpers.js` and `OFFICES` in `content.js`.
- **Add a logo:** put a `.webp` in `public/img/logos/` and map the company name to it in `LOGO`.
- **Colours and fonts:** edit the tokens at the top of `src/styles/global.css`.

## Connecting the forms

The quote and careers forms post to the URL in `VITE_FORM_ENDPOINT`. Copy `.env.example` to `.env` and set it, then rebuild. Any service that accepts multipart form posts works, for example Formspree, Basin, Getform or your own API. Files are sent as `attachments`.

Without an endpoint, the forms run in demo mode and say clearly that nothing was sent.

## Deploying

Run `npm run build` and upload the contents of `dist/`.

- **cPanel / Apache (current host):** upload `dist/` into `public_html/`. The included `.htaccess` makes links such as `/services/energy` work when opened directly.
- **Netlify:** build command `npm run build`, publish directory `dist`. `_redirects` is included.
- **Vercel:** import the repo; `vercel.json` is included.
- **Hosts without URL rewriting:** set `VITE_ROUTER=hash` in `.env` (URLs become `/#/services/energy`).
- **Subfolder hosting:** build with `VITE_BASE=/folder/ npm run build`.

## Before launch

- [ ] Replace every `[[placeholder]]` in `src/data/content.js` (tower figures, licence references, dates, case-study results, testimonials, job openings, reply time)
- [ ] Set `VITE_PLACEHOLDER_BANNER=false`
- [ ] Set `VITE_FORM_ENDPOINT` and send a test quote and a test application
- [ ] Confirm phone numbers, opening hours and social-media links (footer)
- [ ] Get permission to display each partner and client logo; add the Orbit Fabrication logo
- [ ] Replace profile visuals on the Connectivity and Managed Services pages with real photos
- [ ] Add the company profile PDF to `public/docs/` and link it on the About page
- [ ] Have a native French speaker review the French copy
- [ ] Check the old-URL redirects in `public/.htaccess` (`/who-we-are/` → `/about`, `/our-services/` → `/services`)
- [ ] Submit `sitemap.xml` in Google Search Console
