# Marketing Studio — The Branded Ad Workflow

Marketing Studio is the highest-leverage piece of Higgsfield. It chains products, avatars, hooks, settings, ad references, brand kits, and mode-specific staging into one workflow. Get the orchestration right and the output is professional. Get it wrong and you waste credits.

## Concepts

- **Avatar** — the presenter face. Preset (curated by Higgsfield) or custom (uploaded photos). Optional for some UGC modes (backend synthesizes a Soul Character if missing).
- **Product** — a specific physical/sellable item the video should advertise (e.g., a sneaker, a candle, a bottle).
- **Webproduct** — a website, app, or service being advertised as a whole (App Store listings, SaaS landing pages, brand homepages without a single SKU).
- **Hook** — a reusable opening angle. Hook text is prepended to the user's prompt.
- **Setting** — a reusable environment / scene context.
- **Ad reference** — an existing video used as inspiration. Can be bound to an avatar and/or product.
- **Brand kit** — captures brand identity (name, logo, hero images, colors, fonts, tone). Created by handing in a website URL.
- **Ad format** — visual structure preset (`headline`, `bullet-points`, etc.). REQUIRED for `dtc-ads`.

## The two mutually exclusive paths

The user either:
- **Path A: Reference-driven.** Provides an existing video as an ad reference. The model mimics structure and style.
- **Path B: Composed from blocks.** Picks a hook and/or setting to compose a fresh ad.

**Never both.** If the user has an ad reference, do not offer hooks. If they picked a hook, do not offer ad references.

## Modes and hook/setting compatibility

| `mode` slug | Best for | Hooks/settings valid? |
|---|---|---|
| `ugc` | Default. Casual, organic-feel content from a presenter | ✅ |
| `ugc_how_to` | Tutorial / explainer | ✅ |
| `ugc_unboxing` | Unboxing reveal | ✅ |
| `product_showcase` | Clean product highlight, polished | ❌ |
| `product_review` | Presenter giving an opinion | ✅ |
| `tv_spot` | Broadcast-style commercial | ❌ |
| `wild_card` | Experimental, model picks the vibe | ❌ |
| `ugc_virtual_try_on` | Trying on clothing/accessories — UGC vibe | ✅ |
| `virtual_try_on` | Trying on clothing — polished, model-driven | ❌ |

If the user wants to use a hook or setting, they must pick a mode from the ✅ list. Default to `ugc` if undecided.

## Quick-ad video workflow

```
Step 1: Get or create the product

Existing product:
  show_marketing_studio(action='list', type='product')
  → user picks from library, capture product_id

From URL (one paste):
  show_marketing_studio(action='fetch', url=<product_url>)
  → server fetches asynchronously, widget polls

From uploaded image(s):
  1. media_upload for each image
  2. PUT bytes
  3. media_confirm
  4. show_marketing_studio(action='create',
                          type='product',
                          medias=[{value: '<media_id>', url: '<cdn_url>', type: 'media_input'}],
                          title='Optional')

Step 2: Pick avatar (or skip)

Preset:
  show_marketing_studio(action='list', type='avatar')
  → user picks, capture avatar_id with type='preset'

Custom (from uploaded photos):
  show_marketing_studio(action='create',
                       type='avatar',
                       avatars=[{name: 'Founder', medias: [{value: '<media_id>', type: 'media_input', url: '<cdn_url>'}]}])

OR skip avatar entirely for UGC modes — backend synthesizes a Soul Character if the brief mentions a person.

Step 3: Optionally pick hook and/or setting (only if mode is in the ✅ list above)

  show_marketing_studio(action='list', type='hook')
  show_marketing_studio(action='list', type='setting')

Step 4: Generate

  generate_video(params={
    model: 'marketing_studio_video',
    prompt: '<short brief, or omit for URL-driven>',
    mode: 'ugc',
    duration: 15,
    resolution: '720p',
    aspect_ratio: '9:16',
    avatars: [{id: '<avatar_id>', type: 'preset'}],
    product_ids: ['<product_id>'],
    hook_id: '<hook_id>',         // only if mode supports it
    setting_id: '<setting_id>'    // only if mode supports it
  })
```

## URL-driven Click-to-Ad (the shortcut)

When the user pastes a product URL and wants a video, skip product fetch as a separate step:

```
Step 1: Trigger fetch (optional — server can also infer from generate_video URL)
  show_marketing_studio(action='fetch', url=<url>)

Step 2: Generate directly with URL
  generate_video(params={
    model: 'marketing_studio_video',
    url: <same url>,
    mode: 'ugc',
    duration: 15,
    aspect_ratio: '9:16'
  })

Backend dedupes by URL. Repeated runs reuse the existing entity.
```

This is the fastest path from "I have a product page" to "I have an ad."

## Marketing Studio image workflow

Same structure but model is `marketing_studio_image`:

```
generate_image(params={
  model: 'marketing_studio_image',
  prompt: '<short brief>',
  aspect_ratio: '1:1',  // or 4:5, 9:16 etc.
  avatars: [{id: '<avatar_id>', type: 'preset'}],
  product_ids: ['<product_id>']
})
```

Image generation does not accept `hook_id` or `setting_id`. Those are video-only.

## Brand kits

For brand-consistent visuals across multiple generations:

```
1. show_marketing_studio(action='fetch', type='brand_kit', scrap_url='<website_url>')
   → server fetches site, extracts colors, fonts, tone, logo, hero images, products

2. show_marketing_studio(action='get', type='brand_kit', brand_kit_id='<id>')
   → review the extracted data

3. Use the brand_kit_id in DTC Ads generation (see below)
```

Brand kits persist across sessions. Train once per brand, reuse forever.

## DTC Ads (the polished image ad format)

`dtc-ads` is a specialized image generation flow that requires:
- `brand_kit_id` (mandatory)
- `format_id` (one from `show_marketing_studio(action='list', type='ad_format')` — mandatory)
- Optional: avatar, product, ad references

Server rejects without `format_id`. Always ask the user to pick from the format list before generating.

## Cost preflight for Marketing Studio

Marketing Studio runs are credit-expensive. Always preflight on the first run for a brand:

```
generate_video(params={
  ...,
  get_cost: true
})
→ returns credit cost without submitting
```

Surface: "This 15-second UGC ad will cost ~X credits. Proceed?"

## Common errors

- **`Hook not valid for mode`** — User picked a hook with `tv_spot`, `product_showcase`, `wild_card`, or `virtual_try_on`. Drop the hook or switch to a ✅ mode.
- **`product_ids must be plural array, not bare UUID`** — Pass `product_ids: ['<uuid>']`, not `product_id: '<uuid>'`.
- **`format_id required for dtc-ads`** — Always pick from `ad-formats list` before calling.
- **`Mutually exclusive: ad_reference + hook`** — User has both selected. Pick one path.
- **`Avatar URL not on allowed CDN`** — Custom avatar media must be from `cloudfront.net` or `cdn.higgsfield.ai`. Use `media_upload` flow which returns the right URL.

## Prompt patterns by mode

Even though Marketing Studio handles most prompt assembly, the user's prompt still matters. Patterns by mode:

**`ugc`:** "I just discovered this and I'm obsessed. [product] is changing the way I [activity]. Genuine reaction, casual phone-shot, daytime kitchen lighting."

**`ugc_unboxing`:** "Opening this package. First impression. Pulling out the [product]. Reaction shot. Camera handheld, natural lighting."

**`product_review`:** "After using [product] for [time period], here's my honest take. Pros, cons, who it's for. Direct address to camera, well-lit desk setup."

**`tv_spot`:** "30-second broadcast-quality spot. Hero shot of [product]. Cinematic music cue. Tagline reveal. Polished agency look."

**`wild_card`:** Leave the prompt loose. The model interprets liberally. Good for ideation.

## Recovery patterns

**User pasted URL but Marketing Studio shows wrong product type.** If the URL is an App Store / Google Play / SaaS landing page, the server should infer `webproduct`. If it picked `product`, override with `type='webproduct'` on the next call.

**Generated ad is too generic / off-brand.** Add a brand kit and re-run. The RAG layer pulls brand visuals automatically.

**Custom avatar looks nothing like the source.** Check that the source photos meet the avatar guidelines (clear face, single subject, good lighting). Re-create with better photos.
