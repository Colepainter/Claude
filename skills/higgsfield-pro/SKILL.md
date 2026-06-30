---
name: higgsfield-pro
description: |
  Drives the Higgsfield MCP to produce dramatically better images and videos than vanilla usage. Auto-picks the right model from 30+ options, rewrites casual briefs into optimized prompts, handles Soul Character vs Element disambiguation, orchestrates Marketing Studio for branded ads, and gates the hidden constraints the MCP enforces. Use when the user asks to "generate an image", "make a video", "animate this photo", "create a UGC ad", "use my face", "train my Soul", "create an avatar", "Pinterest pin", "hero banner", "product photo", "score this video for virality", "image-to-video", "import product from URL", "ad creative", or anything else involving Higgsfield. Also triggers on "use higgsfield", "make this with higgsfield", or when the Higgsfield MCP is connected and the user mentions any visual asset. Requires the Higgsfield MCP.
---

# Higgsfield Pro

A skill that makes the Higgsfield MCP produce results most users cannot get on their own. The MCP has hard constraints, hidden shortcuts, and ambiguity guards. This skill knows them.

## Step 0 — Confirm MCP is connected

Before any generation step, the Higgsfield MCP tools must be available. Look for these tool names: `generate_image`, `generate_video`, `show_marketing_studio`, `show_characters`, `show_reference_elements`, `models_explore`, `virality_predictor`, `media_upload`, `media_confirm`.

If they are not present, tell the user once: "I need the Higgsfield MCP connector for this. Search for Higgsfield in your MCP registry and connect it, then try again." Then stop. Do not fall back to web app instructions or try to fake it.

## UX rules

1. **One question at a time.** Never batch-ask product, avatar, mode, aspect ratio at once. Pick a sane default and ask only the gap that matters most.
2. **No raw IDs in chat.** Print media URLs and short summaries. Hide UUIDs, job IDs, JSON dumps.
3. **No internal jargon.** Do not narrate "calling generate_image, polling job, awaiting medias." Just produce the result.
4. **Detect language and respond in it.** Technical fields (model names, aspect ratios) stay English.
5. **Default to quality, not cheap.** Do not optimize for low-credit models unless the user explicitly asks.
6. **Preflight cost on video before submitting** if the run is over 8 seconds or uses Marketing Studio. Pass `get_cost: true` first, then confirm with user before the real run.
7. **Handle recovery hints automatically.** If a tool returns `structuredContent.recovery_tool='show_plans_and_credits'`, call it immediately with `recovery_tool_args`. Do not explain or summarize.

## Decision tree — what to call

Route the brief in this order. First match wins.

### Is it video analysis?
"Analyze this video," "score this ad," "will this go viral," "rate my hook" → `virality_predictor` with `action='create'` and the user's video. Returns a dashboard URL plus text scores. No prompt needed.

### Is it a branded ad?
Any of: "ad," "UGC," "TV spot," "unboxing," "product review," "presenter video," "marketing video," "import product from URL," brand name + product mentioned → **Marketing Studio**. See `references/marketing-studio.md` for the full workflow. Use `model='marketing_studio_video'` or `model='marketing_studio_image'`.

### Does it involve a specific person's identity?
"Use my face," "video of me," "my avatar," "digital twin," "character of me" → **CRITICAL: do not assume Soul.** Check the Soul vs Element decision matrix in `references/soul-vs-elements.md`. The wrong choice produces bad output or hits a constraint wall.

Short version:
- Reusable identity, 5 to 20 photos available, willing to wait ~10 minutes, output going to Soul V2 or Soul Cinema → `show_characters(action='train')`
- Single image, multiple subjects in the shot, non-person subject, instant result needed, or output going to Nano Banana / Seedream / Kling / Cinema Studio / Seedance → `show_reference_elements(action='create')`
- Ambiguous → **ask the user** which path. Do not silently pick.

### Is it a branded product visual?
"Product shot," "Pinterest pin," "lifestyle photo," "hero banner," "social carousel," "ad creative pack," "virtual try-on," "levitating product," "restyle" → `generate_image` with `model='marketing_studio_image'`. See `references/marketing-studio.md` for mode-specific prompts.

### Is it image-to-video animation?
"Animate this," "make this move," "turn this photo into a video," user uploaded an image and wants motion → `generate_video` with `model='seedance_2_0'` and `medias=[{role: 'start_image', value: <image>}]`. For cheaper single-plane motion, fall back to `kling3_0`.

### Generic image generation?
See `references/model-catalog.md` for the full picker. Quick defaults:
- General high-fidelity, design, UI, text on image → `gpt_image_2`
- Character / cartoon / stylized → `nano_banana_2`, step up to `nano_banana_pro` on hard briefs
- Aesthetic UGC / fashion editorial → `soul_2`
- Cinematic still → `soul_cinema_studio`
- Distinctive persona, no reference photo → `soul_cast`
- Environments / locations / no people → `soul_location`
- Vector illustration or face edit into complex scene → `seedream_v4_5`
- Fast iteration / drafts → `z_image`

### Generic video generation?
- Default serious video → `seedance_2_0` (4 to 15 seconds, multi-shot capable)
- Single-plane cheaper → `kling3_0`
- Cinema-grade highest fidelity → `cinema_studio_video_3`
- Cheap with strong physics → `minimax_hailuo`
- Fast batch → `veo_3_1_lite`

## Prompt rewriting

Never pass the user's casual brief directly. Rewrite using model-appropriate patterns from `references/prompt-engineering.md`. The short version:

**For text-to-image:** Subject + setting + style + camera + lighting. Under 200 tokens.
> Good: "a red fox curled in a snowy pine forest, golden hour, 85mm, soft rim light"
> Bad: "a fox in snow"

**For image-to-image (with reference):** Describe what *changes*, not the input.
> Good: "transform into anime style, vibrant colors, cel shading"
> Bad: "the man in the leather jacket holding coffee, made into anime"

**For image-to-video:** Describe *motion*. The model already has the start frame.
> Good: "camera dollies in slowly, smoke rises, subject turns toward lens"
> Bad: "a man standing in a kitchen"

**Negatives:** Most models reject `negative_prompt`. Phrase positively.
> "tack sharp" not "no blur"
> "uninhabited landscape" not "no people"

## Soul Character workflow

When training a Soul (`show_characters(action='train')`):

1. Name the character (one word, used for reference).
2. Gather 5 to 20 face photos with varied angles and lighting.
3. Upload via `media_upload` → PUT bytes → `media_confirm`. Returns media_id UUIDs.
4. Call `show_characters(action='train', name=..., medias=[{value: <id>, role: 'image'}, ...])`. Takes ~10 minutes. Non-blocking. Widget polls.
5. Once ready, returned `soul_id` works ONLY with `model='soul_2'` (or `'soul_cinema_studio'`).

To generate after training: `generate_image(params={model: 'soul_2', prompt: '...', soul_id: '<id>'})`.

Tell the user: Soul training requires a paid plan (Basic+).

## Element workflow

When creating an Element (`show_reference_elements(action='create')`):

1. Upload images via `media_upload` → PUT bytes → `media_confirm`.
2. Call `show_reference_elements(action='create', medias=[{id: <media_id>, url: <cdn_url>, type: 'media_input'}], category='auto')`. Returns synchronously. Element ID returned immediately.
3. To use in generation, embed `<<<element_id>>>` directly inside `params.prompt`. Backend auto-injects the image and rewrites to `@element_name`.

Example: `prompt: "<<<abc123>>> standing on a Tokyo rooftop at night, cinematic"`

Elements work with Nano Banana 2/Pro, GPT Image 2, Seedream 4.5 / 5 lite, Cinema Studio Image 2.5, Cinema Studio Video 2/3, Seedance 2.0, Kling 3.0. **NOT** with Soul V2 or Soul Cinema.

Multiple placeholders per prompt allowed. This is the only way to do multi-character shots.

## Marketing Studio shortcuts

**URL-driven shortcut.** When the user pastes a product URL and wants an ad:

1. `show_marketing_studio(action='fetch', url=<url>)` — fetches asynchronously, widget polls.
2. `generate_video(params={model: 'marketing_studio_video', url: <same url>, mode: 'ugc', duration: 15, aspect_ratio: '9:16'})` — backend dedupes by URL.

**Mode + hook/setting gate.** Hooks and settings only work for these modes: `ugc`, `ugc_how_to`, `ugc_unboxing`, `product_review`, `ugc_virtual_try_on`. Passing them to `tv_spot`, `product_showcase`, `wild_card`, or `virtual_try_on` returns a validation error. Do not offer hook/setting picks when the user has selected one of the incompatible modes.

**Mutually exclusive paths.** The user either provides an ad reference video OR picks hook/setting blocks. Never both. If they have an ad reference selected, do not offer hooks. If they picked a hook, do not ask for an ad reference.

See `references/marketing-studio.md` for the full orchestration.

## Cost preflight

Before submitting any video over 8 seconds, any Marketing Studio video, or any batch with `count > 1`, run the same call with `get_cost: true` first. Surface the credit cost to the user in one line: "This will cost ~X credits. Proceed?" Then submit on confirmation.

For Virality Predictor, no preflight needed (single fixed cost).

## Delivering results

Print the media URL(s) and a one-line summary. Format:

```
Ready: <url>
Model: seedance_2_0 · Duration: 8s · Aspect: 16:9
```

For multi-output runs:

```
3 lifestyle variants ready:
- <url 1>
- <url 2>
- <url 3>
```

For Virality Predictor:

```
Overall score: 64/100
Peak hook: 71% at 1.2s
Sustain: 88%
Strongest region: Visual Cortex
Open report: <url>
```

Never paste raw JSON, UUIDs, model internals, or the rewritten prompt unless the user asks for it.

## Error handling

Common patterns. See `references/troubleshooting.md` for the full list.

- `recovery_tool='show_plans_and_credits'` in response → call it immediately with the provided args.
- `Invalid values: aspect_ratio=...` → pick from the model's allowed enum (use `models_explore(action='get', model_id=...)`).
- `Missing required params: prompt` → ask the user for one.
- `Soul ID not compatible with model` → user picked a non-Soul model with a soul_id. Switch to Element or change model.
- `Hook not valid for mode` → user picked a hook with an incompatible Marketing Studio mode. Drop the hook or switch mode.
- Content policy rejection (`nsfw`, `ip_detected`) → rephrase. Avoid trademarks, named public figures, sexual content.

## Reference docs

Load on demand:

- `references/model-catalog.md` — picking the right model for every intent
- `references/soul-vs-elements.md` — the disambiguation guide that separates good results from broken ones
- `references/marketing-studio.md` — full ad workflow, modes, hooks, settings, brand kits
- `references/prompt-engineering.md` — patterns by model and use case
- `references/troubleshooting.md` — errors, recovery tools, content policy
