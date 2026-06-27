# New Primitive — Brand & Higgsfield Content Setup

> Single source of truth for producing on-brand content for **New Primitive** in
> Higgsfield. Captures brand identity, products, and the IDs of every asset set up
> in the Higgsfield workspace.

_Last updated: 2026-06-27_

---

## 1. Company

**New Primitive** — Utah-based design & modular product company crafting high-end
saunas, cold plunges, and sub-200 sq ft wellness structures for residential and
commercial spaces. Bridges ancient thermal traditions with modern design and
craftsmanship. B2C + B2B at premium price points ($15K–$80K+).

- Website: https://www.newprimitive.co/
- Founder / brand face: Cole Painter
- Build/manufacturing partner: Qontrast · Lead time ~6–8 weeks · Crane delivery
- Volume: historically 35–45 projects/yr, scaling toward 50 → 3–5x

## 2. Positioning & Voice

**Tagline (signature):** _Peace is an Inside Job_
Alternates: "Reconnect. Transform. Thrive." · "Bridge the Old with the New."

**Short description:** Luxury saunas and cold plunge sanctuaries that bridge
ancient wellness rituals with modern design — built for grounding, recovery, and
intentional living.

**Brand pillars / values**
1. Reconnection with the self
2. Bridging the ancient with the modern
3. Sanctuaries for transformation
4. Community & collaboration
5. Sustainability & stewardship

**Tone of voice:** Authentic & grounded · Inspiring & empowering · Spiritual but
accessible · Calm & intentional.

**Aesthetics:** Earthy & natural · Modern minimalist · "Modern primitive" · Warm &
grounded · Cinematic in nature (saunas nestled in mountains, forests, lakes;
humans in calm, mindful states).

## 3. Visual Identity

**Fonts:** Neue Haas Grotesk Display Pro (display) · Helvetica Neue (primary) ·
Montserrat (web body)

**Color palette**

| Hex | Use |
|------|-----|
| `#5C6965` | Primary — sage green |
| `#BDB7A2` | Secondary — warm taupe |
| `#F3D1B6` | Accent — warm sand |
| `#F9F3E3` | Background — cream |
| `#BAC0C1` | Cool stone |
| `#A3A8A7` | Neutral grey |
| `#464646` | Charcoal |
| `#2E2929` | Text — near black |

## 4. Products

- **NP1°** — all-in-one sauna + cold plunge (signature; Western Red Cedar interior,
  HUUM heater, dual glass doors, panoramic windows, accommodates 6–8)
- **Thermal Suite** — enclosed outdoor traditional sauna + cold plunge suite
- Custom outdoor saunas · Custom enclosed cold plunges · Indoor home saunas
- Modular wellness structures & sanctuaries ("The Nook", etc.)

## 5. Higgsfield Workspace — Asset IDs

**Brand Kit:** `60824f04-6848-45db-9edc-4cea883594c9` (logo + full brand data set)

**Products (Marketing Studio)**

| Product | ID |
|---------|----|
| The Nook — Compact Sauna (2–4) | `26f54832-c011-421e-9d4e-72aabed5d985` |
| The 212 — Flagship Sauna (4–8) | `c7df5afd-6b32-4576-b09a-c269c2230454` |
| Thermal Suite | `d65b23f3-50bb-4456-a06e-745a906d82ea` |
| Custom Wellness Space — Sauna & Cold Plunge Install | `065af6c6-790e-4b1c-9928-11c6631bbcb7` |
| Luxury Sauna & Cold Plunge Spaces | `da5ee2d7-1a9d-40e6-b3f0-5ce5eb9c5cd9` |

**Elements (reusable references)**

| Element | Category | ID |
|---------|----------|----|
| Thermal-Suite | prop | `f30ad71e-ffd9-4686-bb94-24ebbde8ac08` |
| NP-Sauna-Plunge-Spaces | environment | `a2d21b3c-c1fb-4f88-9584-a35bd457338d` |
| NP-Experience-Visuals | environment | `597d12ad-3b11-4f68-98bb-2f43d1e9c116` |
| NP-Signage-Infographics | prop | `24b4ecfa-b4b4-4fe7-bc9d-04dd595cc705` |

**Soul (brand face — trained identity)**

| Soul | ID |
|------|----|
| Cole — New Primitive Founder | `421aad92-6b9d-49bf-b1f8-612bc9ffc59a` |

Trained from 15 founder-shoot photos. Usable only with `soul_2` (Soul V2) and
`soul_cinema_studio` — pass the `soul_id`, e.g. generate_image with
`model: 'soul_2'` + `soul_id` for on-brand portraits of Cole.

All product/signage media imported server-side from the link-shared Drive folders
(`uc?export=download` URLs) — the direct `upload.higgsfield.ai` path is blocked by
the egress policy, but server-side import via `media_import_url` works.

**Using Elements in generation:** embed `<<<element_id>>>` in an image/video prompt
to lock the real product into the shot, e.g.
`"Cinematic dawn shot of <<<f30ad71e-ffd9-4686-bb94-24ebbde8ac08>>> beside an alpine lake, mist rising"`.

Plan: Higgsfield **Plus** · ~1,036 credits at setup time.

## 6. Outstanding (needs your action / input)

- [x] **Soul (brand face)** — trained as "Cole — New Primitive Founder" from the
      founder shoot (folders shared 2026-06-27).
- [ ] **Social links** — site is behind bot protection (403), so handles couldn't be
      auto-read. Add Instagram/TikTok/YouTube to the Brand Kit manually.
- [ ] **Primitive Retreat (outdoor plunge)** — source photos are 54–88 MB each, over
      the 50 MB import cap. Re-export smaller (<25 MB) and I'll add it as a product.
- [ ] **NP Horizon / NP Tower** (standalone cold plunges) — no standalone photos under
      the size cap were found; add product photos and I'll create these products.

## 7. Content direction (first up)

Product/space **hero shots** and **social/UGC video**. Marketing Studio presets
worth using: Product Showcase, Camera POV, Hyper Motion, TV Spot, Direct-to-Camera,
Selfie Testimonial, Before & After.

## 8. Content Engine (Notion)

Source-of-truth content system lives in Notion → MARKETING & SALES → **CONTENT
ENGINE**: PRINCIPLES (5 core ideas) → LIBRARY (long-form essays) → MATRIX
(atomized pieces). Generated visual content should trace back to a principle.
