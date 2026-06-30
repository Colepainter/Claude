# Model Catalog

The full lineup of Higgsfield models, mapped to MCP tool calls. Pick by intent, not surface keyword. When two could apply, the more specific entry wins.

Always verify constraints before submitting:
```
models_explore(action='get', model_id='<id>')
```
Returns the model's accepted aspect ratios, durations, parameters, and media roles.

## Image models

| Model ID | What it's for | Accepts reference media |
|---|---|---|
| `gpt_image_2` | **Default high-fidelity image.** Graphic design, UI, banners, typography, anything with on-image text. Works with Elements. | yes |
| `nano_banana_2` (display: Nano Banana Pro in some contexts; legacy `nano_banana_flash` is Nano Banana 2) | **Character / cartoon / stylized.** Works with Elements. | yes |
| `nano_banana_pro` | Higher-fidelity Nano Banana for harder briefs. Works with Elements. | yes |
| `soul_2` | **Aesthetic UGC / fashion editorial / portraits.** ONLY model that accepts `soul_id`. | yes (Soul or image) |
| `soul_cinema_studio` | **Cinematic stills, film-grade lighting.** Accepts `soul_id`. | yes (Soul or image) |
| `soul_cast` | Distinctive personas, no reference photo. Text-only. | no |
| `soul_location` | **Environments and locations.** Best in class for places with no people. Text-only. | no |
| `seedream_v4_5` | Vector illustrations OR face edit into complex scene. Works with Elements. | yes |
| `seedream_v5_lite` | Faster Seedream for visual reasoning and instruction edits. | yes |
| `z_image` | **Fastest.** Drafts, iteration, LoRA stylization. Text-only. | no |
| `flux_2` | Precise prompt adherence with multiple variants. | yes |
| `flux_kontext_max` | Anime, stylized, typography remix. | yes |
| `cinematic_studio_2_5` | Cinematic still frames up to 4K. Works with Elements. | yes |
| `marketing_studio_image` | **Branded image ads.** RAG over user's avatars and products. | yes |

## Video models

| Model ID | What it's for | Notes |
|---|---|---|
| `seedance_2_0` | **Default serious video.** Multi-shot, consistent identity, motion-heavy. 4 to 15s. Accepts image, start_image, end_image, video, audio. Works with Elements. | SOTA all-purpose |
| `kling3_0` | Cheaper Seedance substitute for single-plane scenes. Accepts start_image, end_image. Works with Elements. | Image-to-video go-to for budget |
| `kling2_6` | Earlier Kling release, advanced physics. Accepts start_image. | |
| `seedance_1_5_pro` | Budget Seedance for clean single-take shots. | |
| `cinema_studio_video_3` | **Cinema-grade highest fidelity.** Film look. | Works with Elements |
| `cinema_studio_video` | Earlier Cinema Studio. Works with Elements. | Prefer v3 |
| `veo_3_1` | Ultra-realistic Google Veo. Accepts start_image only (max 1). Aspect 16:9 or 9:16. Duration 4, 6, or 8 only. | Format-bound |
| `veo_3_1_lite` | **Fast and cheap Veo.** Volume work. | |
| `veo_3` | Reliable cinematic with audio support. Accepts image (max 1). | |
| `minimax_hailuo` | **Cheap with strong physics.** No audio. | |
| `wan_2_7` | Synchronized audio with character-consistent video. | |
| `wan_2_6` | Stylized experimental. Cheap. | |
| `marketing_studio_video` | **All advertising / commercial video.** UGC, unboxing, TV spot, product review. | See marketing-studio.md |

## Analysis

| Model ID | Tool | Purpose |
|---|---|---|
| `virality_predictor` | `virality_predictor(action='create')` | Scores video hook strength, attention, retention, distraction risk, and creative score. Returns interactive dashboard URL. |

## The decision flow

### Image — what to pick

1. **Product visual for ecommerce / paid social / Pinterest / hero banner / lifestyle / ad pack** → `marketing_studio_image`. The Marketing Studio image pipeline applies brand-specific enhancement.
2. **Branded ad image with avatar + product** → `marketing_studio_image` with Marketing Studio inputs.
3. **Generated product concept with brand name or label text** → `gpt_image_2`. Best in class for on-image text.
4. **Aesthetic UGC / fashion editorial / lifestyle portrait** → `soul_2`.
5. **Cinematic still frame** → `soul_cinema_studio`.
6. **Distinctive creative persona, text-only** → `soul_cast`.
7. **Locations / environments / no people** → `soul_location`. Nothing else matches.
8. **Vector illustrations or face edit into complex scene** → `seedream_v4_5`.
9. **Identity-faithful portrait with trained Soul** → `soul_2` or `soul_cinema_studio` with `soul_id`.
10. **Character or cartoon work** → `nano_banana_2`, step up to `nano_banana_pro` on harder briefs.
11. **Anime / stylized non-default** → `flux_kontext_max`.
12. **Fast and cheap iteration** → `z_image`.
13. **Default everything else** → `gpt_image_2`.

### Video — what to pick

1. **All advertising / commercial / UGC / unboxing / TV spot / product showcase** → `marketing_studio_video`.
2. **Default serious video, multi-shot, motion-heavy, image-to-video, 4 to 15s** → `seedance_2_0`.
3. **Single-plane scene, cheaper than Seedance** → `kling3_0`.
4. **Cheap clean shot without cuts, only when budget is explicit** → `seedance_1_5_pro`.
5. **Cinema-grade highest fidelity** → `cinema_studio_video_3`.
6. **Strong physics, no audio needed** → `minimax_hailuo`.
7. **Fast batch / volume** → `veo_3_1_lite`.
8. **Veo-format-bound work** → `veo_3_1` (aspect 16:9 / 9:16 only, duration 4/6/8s only).
9. **Stylized animation work** → `wan_2_7`.

## Common gotchas

- **Do not invent model names.** If `models_explore(action='list')` does not return it, the model does not exist. Server returns `unknown model "..."`.
- **Do not downgrade for schema convenience.** If Seedance 2.0 fits the brief, use it. Do not pick Seedance 1.5 just because its duration enum is simpler.
- **Prompt-only models reject media.** `z_image`, `soul_cast`, `soul_location` accept no `medias[]`. Server rejects.
- **Single-image video models reject extras.** `veo_3`, `veo_3_1`, `kling2_6` accept exactly one reference image. Server rejects more.
- **Seedance audio is via medias.** Pass audio with `role='audio'`. Do NOT pass `generate_audio: true` to Seedance — it does not declare that param.
- **Soul + non-Soul model = reject.** Only `soul_2` and `soul_cinema_studio` accept `soul_id`. Everything else rejects.

## Aspect ratios and durations

Model-specific. Always confirm:
```
models_explore(action='get', model_id='<id>')
```

Common patterns:
- **Seedance 2.0:** `auto`, `21:9`, `16:9`, `4:3`, `1:1`, `3:4`, `9:16`. Duration 4 to 15s.
- **Kling 3.0:** `16:9`, `9:16`, `1:1`. Duration 3 to 15s.
- **Soul 2.0:** `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`. Quality `1.5k` or `2k`.
- **Soul Cinema:** same as Soul 2.0 plus `21:9`.
- **Veo 3.1:** `16:9` or `9:16` only. Duration 4, 6, or 8 only.
- **Marketing Studio Video:** `auto`, `21:9`, `16:9`, `4:3`, `1:1`, `3:4`, `9:16`. Resolution `480p` or `720p`.

When you pass an unsupported value, the server may either coerce (returns `adjustments` in response) or reject (returns structured error). Coerce is fine to surface. Reject means pick again.
