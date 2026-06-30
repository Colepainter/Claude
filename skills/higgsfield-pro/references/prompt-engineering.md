# Prompt Engineering for Higgsfield

Models reward concrete sensory prompts. Vague briefs produce vague outputs.

## The universal structure

**Subject + setting + style + camera + lighting.** Under 200 tokens.

Bad: "a fox in snow"
Good: "a red fox curled in a snowy pine forest, golden hour, 85mm lens, soft rim light, cinematic"

Each element does a job:
- **Subject**: who or what
- **Setting**: where, when, atmosphere
- **Style**: medium, aesthetic, era
- **Camera**: lens (35mm, 50mm, 85mm), angle (low, overhead, dutch), motion (dolly in, tracking, whip pan)
- **Lighting**: source (rim, key, fill, neon, candlelight, golden hour, moonlight)

## Image-to-image (with reference)

Describe what *changes*, not the input. The model already sees the reference.

Bad: "a man with brown hair in a leather jacket holding coffee, made into anime"
Good: "transform into anime style, vibrant colors, cel shading, expressive eyes"

This applies to:
- Style transfer
- Aesthetic shifts
- Outfit/scene changes
- Restyle / season changes

## Image-to-video

Describe *motion*. The model already has the start frame.

Bad: "a man standing in a kitchen"
Good: "camera dollies in slowly, steam rises from the coffee cup, subject turns toward lens"

Useful verbs:
- **Camera**: dollies in, dollies out, pans left, pans right, tilts up, tilts down, tracks, orbits, pulls back, push in, whip pan, crash zoom
- **Subject motion**: turns, walks, spins, gestures, reaches, sits, stands, leans
- **Atmospheric**: smoke rises, dust swirls, leaves fall, rain begins, light shifts

## Negative phrasing

Most Higgsfield models reject `negative_prompt`. Phrase positively.

- "no blur" → "tack sharp"
- "no people" → "uninhabited landscape"
- "no text" → "clean composition"
- "not cartoon" → "photorealistic"
- "not dark" → "well-lit, even exposure"

## Aspect ratio guidance

- `16:9` — landscape, cinematic, hero banner, YouTube thumbnail
- `9:16` — vertical, TikTok, Reels, Stories, Shorts
- `1:1` — square, profile, Instagram feed, ad creative
- `4:5` — Instagram portrait, optimal feed real estate
- `2:3` / `3:4` — Pinterest pin, editorial portrait
- `21:9` — ultrawide cinematic
- `4:3` — vintage, retro, classic photography

## Model-specific notes

### `gpt_image_2`

- Best in class for **text on image**. If the brief needs readable text (logos, signage, typography), use this.
- Handles graphic design, UI mockups, banners.
- Accepts multiple references via `medias[]`.
- Works with Elements (`<<<element_id>>>` syntax).

### `nano_banana_2` / `nano_banana_pro`

- Strong on character, cartoon, stylized work.
- Reference-image-driven. Good with one or two refs.
- Step up to `nano_banana_pro` on hard briefs where Nano Banana 2 is missing detail.

### `soul_2` (Soul V2)

- Aesthetic UGC, fashion editorial, lifestyle character.
- The ONLY model (with `soul_cinema_studio`) that accepts `soul_id` from trained Souls.
- Aspect ratios: `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`.
- Quality: `1.5k` or `2k`.

### `soul_cinema_studio`

- Cinematic stills, film-grade lighting, concept-art mood.
- Accepts `soul_id`.
- Additional `21:9` aspect ratio.

### `soul_location`

- Best-in-class for environments and locations.
- Text-only — reject media references.
- No quality selector — dimensions fixed by aspect ratio.

### `seedance_2_0`

- Default for serious video. Multi-shot, motion-heavy, image-to-video.
- Duration 4 to 15 seconds (12s is valid).
- Accepts: `image`, `start_image`, `end_image`, `video`, `audio`.
- Audio via `medias` with `role='audio'`. Do NOT use `generate_audio` param.
- Works with Elements.

### `kling3_0`

- Cheaper Seedance substitute for single-plane scenes.
- Accepts `start_image` and `end_image` for transitions.
- Aspect: `16:9`, `9:16`, `1:1`. Duration 3 to 15s.

### `veo_3_1`

- Format-bound: aspect `16:9` or `9:16` ONLY. Duration `4`, `6`, or `8` seconds ONLY.
- Accepts single `start_image`.
- Quality tiers: `basic`, `high`, `ultra`.

### `marketing_studio_video`

- Prompt is often optional. The mode + product + avatar + hook do the heavy lifting.
- When you provide a prompt, keep it short and brief-style.
- See `marketing-studio.md` for the full workflow.

## Prompt patterns by intent

### Cinematic portrait

```
Editorial portrait of [subject], shot on Hasselblad medium format, 80mm,
shallow depth of field, golden hour rim lighting, neutral linen background,
moody and contemplative, magazine-cover composition
```

### Product hero shot

```
Hero product photograph of [product], floating in soft studio light,
seamless light gray gradient background, dramatic side lighting,
ultra-high detail, commercial catalog style, 8K
```

### UGC selfie video

```
First-person handheld phone footage of [subject] using [product] in
[setting], natural daylight through window, casual phone-shot aesthetic,
slight camera movement, authentic and unpolished
```

### Cinematic motion (image-to-video)

```
Camera slowly dollies in toward subject, subtle ambient motion in the
background, [subject] turns head slightly toward camera, atmospheric
particles drift through light beams, cinematic and contemplative pacing
```

### Pinterest moodboard

```
Aesthetic Pinterest pin featuring [product] arranged on [surface],
soft natural window light, [aesthetic] mood, vertical 2:3 composition,
moodboard styling, muted earth tones, real-photograph feel
```

### Anime stylization (image-to-image)

```
Transform into anime style, vibrant saturated colors, soft cel shading,
expressive eyes, dynamic line work, studio Ghibli influence
```

### Restyle (seasonal / aesthetic shift)

```
Restyle as Christmas version, warm candle light, evergreen accents,
quiet luxury aesthetic, preserve product placement and composition,
swap surrounding props and lighting only
```

## Safety guardrails

Higgsfield rejects prompts with these terminal statuses:
- `nsfw` — sexual content
- `ip_detected` — trademarks, branded characters, real public figures by name

Avoid:
- Naming real public figures ("Taylor Swift," "Elon Musk")
- Brand-trademarked characters ("Mickey Mouse," "Pikachu")
- Sexual or explicit descriptions
- Violent or graphic content

When a user wants a "person like X," describe the look instead of naming them: "a woman with platinum blonde hair, red lip, evening gown, paparazzi flash" rather than "Marilyn Monroe."
