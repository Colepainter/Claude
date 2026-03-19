# EV Primitive

Tesla-inspired electric vehicle website with a full CMS backend, Google Drive media integration, and Framer Motion animations.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# → edit .env with your admin credentials & Drive settings

# 3. Seed the database
npm run seed

# 4. Start the server
npm start
# → http://localhost:3000       (live site)
# → http://localhost:3000/admin (CMS dashboard)
```

---

## Project Structure

```
ev-primitive/
├── index.html              # Homepage (Tesla-style scroll-snap heroes)
├── pages/                  # Vehicle & section pages
│   ├── model-y.html
│   ├── model-3.html
│   ├── model-s.html
│   ├── model-x.html
│   ├── cybertruck.html
│   ├── energy.html
│   └── charging.html
├── css/                    # Design system CSS
│   ├── main.css            # Tokens, reset, buttons
│   ├── nav.css             # Navigation
│   ├── hero.css            # Full-viewport heroes
│   ├── models.css          # Feature grid + compare table
│   ├── features.css        # Why EV + CTA banner
│   ├── footer.css          # Footer
│   └── model-page.css      # Detail page layout
├── js/
│   ├── main.js             # Scroll, nav, lazy-load
│   ├── model-page.js       # Configurator + price calculator
│   └── framer-animations.jsx  # React + Framer Motion layer
├── admin/                  # CMS Dashboard
│   ├── index.html
│   ├── css/admin.css
│   └── js/admin.js
├── server/                 # Node.js / Express backend
│   ├── index.js            # Entry point & routes
│   ├── routes/
│   │   ├── auth.js         # JWT login / logout
│   │   ├── vehicles.js     # CRUD for vehicle data
│   │   ├── content.js      # Heroes + content blocks + settings
│   │   ├── media.js        # Upload + Google Drive import
│   │   └── leads.js        # Lead capture & management
│   ├── middleware/auth.js  # JWT verification
│   ├── services/
│   │   └── googleDrive.js  # Drive list/download
│   └── db/
│       ├── database.js     # SQLite connection
│       ├── schema.sql      # Full schema
│       └── seed.js         # Initial data seed
├── public/uploads/         # Uploaded media files
├── images/                 # Static hero images (add yours here)
├── package.json
├── vite.config.js          # Bundles Framer Motion animations
└── .env.example
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | — | Sign in, get JWT |
| GET  | `/api/auth/me` | ✓ | Current user |
| GET  | `/api/vehicles` | — | List all vehicles |
| GET  | `/api/vehicles/:slug` | — | Get vehicle detail |
| POST | `/api/vehicles` | ✓ | Create vehicle |
| PUT  | `/api/vehicles/:id` | ✓ | Update vehicle |
| DELETE | `/api/vehicles/:id` | admin | Delete vehicle |
| GET  | `/api/content/heroes` | — | List hero sections |
| PUT  | `/api/content/heroes/:id` | ✓ | Update hero |
| GET  | `/api/content/blocks` | — | List content blocks |
| PUT  | `/api/content/blocks/:page/:key` | ✓ | Upsert content block |
| GET  | `/api/content/settings` | ✓ | Site settings |
| PUT  | `/api/content/settings` | ✓ | Update settings |
| GET  | `/api/media` | ✓ | List media |
| POST | `/api/media/upload` | ✓ | Upload files |
| POST | `/api/media/from-drive` | ✓ | Import from Google Drive |
| GET  | `/api/media/drive-folders` | ✓ | Browse Drive folder |
| DELETE | `/api/media/:id` | ✓ | Delete media |
| POST | `/api/leads` | — | Submit lead/quote |
| GET  | `/api/leads` | ✓ | List leads |
| PATCH | `/api/leads/:id` | ✓ | Update lead status |
| GET  | `/api/chargers` | — | Supercharger locations |
| GET  | `/api/health` | — | Health check |

---

## Adding Hero Images

Place your images in `/images/` with these names (or update via CMS):

```
images/model-y-hero.jpg
images/model-3-hero.jpg
images/model-s-hero.jpg
images/model-x-hero.jpg
images/cybertruck-hero.jpg
images/solar-hero.jpg
images/powerwall-hero.jpg
```

Or upload via **CMS → Media Library → Upload Files / Import from Drive**.

---

## Google Drive Integration

1. Create a Google Cloud project and enable the Drive API
2. Create a Service Account and download the JSON key
3. Share your Drive folder with the service account email
4. Set in `.env`:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./server/google-service-account.json
   GOOGLE_DRIVE_FOLDER_ID=your_folder_id
   ```
5. Install the googleapis package: `npm install googleapis`

---

## Framer Motion Animations

The animation layer (`js/framer-animations.jsx`) provides:

- **`ParallaxHero`** — scroll-driven background parallax
- **`HeroTitle`** — word-by-word reveal on load
- **`StatCounter`** — animated number counting on enter
- **`FadeUpGroup`** — staggered fade-up for child elements
- **`FeatureRow`** — slide-in from left/right on scroll
- **`PageTransition`** — smooth opacity+y page transitions

Build the animation bundle:
```bash
npm run build:animations
# outputs → js/dist/framer-animations.iife.js
```

Then load in your HTML:
```html
<script src="/js/dist/framer-animations.iife.js"></script>
```

---

## CMS Features

- **Hero Sections** — edit title, subtitle, background image, CTAs
- **Vehicles** — add/edit/delete vehicle specs and pricing
- **Media Library** — drag-and-drop upload + Google Drive browser
- **Leads** — view solar quote & test drive requests, update status
- **Content Blocks** — edit any CMS-managed copy across all pages
- **Settings** — site name, accent color, tax credit display toggle

Default admin: `admin@evprimitive.com` / `ChangeMe123!` (change in `.env` before deploying)
