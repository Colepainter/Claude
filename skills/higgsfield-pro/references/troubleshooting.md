# Troubleshooting

## Recovery tool pattern

The Higgsfield MCP returns structured recovery hints in some failure modes. When a tool response includes `structuredContent.recovery_tool='show_plans_and_credits'`, immediately call:

```
show_plans_and_credits(<recovery_tool_args from response>)
```

Do NOT explain the error or summarize. Just call the recovery tool. The widget handles the rest.

## Authentication

- **Higgsfield MCP not connected.** Tool calls fail with "tool not available." Tell the user once to connect the Higgsfield MCP from the connector registry, then stop. Do not retry.

## Validation errors

### `Missing required params: prompt`
User did not provide a prompt. Ask for one. Exception: `virality_predictor` does not need a prompt — pass `medias=[{role: 'video', id: '<video_id>'}]` instead.

### `Missing required params: medias`
Virality Predictor needs exactly one video. Pass via `medias=[{role: 'video', id: '<id>'}]`.

### `Invalid values: aspect_ratio=99:99 (allowed: ...)`
Server returns the allowed enum. Pick one from the list. Or call `models_explore(action='get', model_id='<id>')` for the model's full constraint set.

### `Unknown params: <name>`
Schema does not accept that field. Run `models_explore(action='get')` and check `parameters[].name`. Common culprits:
- `generate_audio` on `seedance_2_0` (use `medias` with `role='audio'` instead)
- `hook_id` on a non-✅ Marketing Studio mode
- `setting_id` on a non-✅ Marketing Studio mode
- `soul_id` on a non-Soul model

### `Soul ID not compatible with model`
User passed `soul_id` to something other than `soul_2` or `soul_cinema_studio`. Fixes:
1. Switch model to `soul_2` or `soul_cinema_studio`.
2. Create an Element from a training photo instead, use `<<<element_id>>>` in prompt.

### `Hook not valid for mode`
User picked a hook with a mode that does not support hooks. Fixes:
1. Drop the hook.
2. Switch mode to `ugc`, `ugc_how_to`, `ugc_unboxing`, `product_review`, or `ugc_virtual_try_on`.

### `Model accepts only one image reference`
User passed multiple images to a single-ref video model (`veo_3`, `veo_3_1`, `kling2_6`). Drop to one image or switch model.

### `Model does not accept media inputs`
Prompt-only model (`z_image`, `soul_cast`, `soul_location`). Drop all `medias`.

### `Unknown media role "<role>"`
Role not in this model's `medias[].roles`. Run `models_explore(action='get')` and check accepted roles. Common: `start_image` for video models that only declare `image`.

### `product_ids must be plural array`
Pass `product_ids: ['<uuid>']`, not `product_id: '<uuid>'`.

### `Avatar URL not on allowed CDN`
Custom avatar must use Higgsfield's CDN (`cloudfront.net` or `cdn.higgsfield.ai`). Always go through `media_upload` → PUT → `media_confirm` for uploads.

## Job lifecycle errors

### `Job ended with status "failed"`
Server-side failure. Often:
- Prompt content (rephrase)
- Schema mismatch the CLI missed
- Transient backend issue (retry once)

### `nsfw` / `ip_detected`
Content policy rejection. Rephrase to avoid:
- Named real public figures
- Trademarks (Mickey Mouse, Pokémon)
- Sexual content
- Branded characters from copyrighted IP

### Timeout
Server is slow. Bump `wait_timeout` if available, or retry after 30s.

## Rate limits

- **HTTP 429** — backed off. Wait 30 to 60 seconds before retry.
- **CloudFlare / DataDome captcha** — anti-bot fired. Wait 30s and retry. If persistent, the user's network may be flagged; suggest switching networks.

## Cost surprises

Marketing Studio video and long Seedance runs can cost 50+ credits. If the user complains about credit drain:

1. Always preflight with `get_cost: true` before submitting.
2. Suggest cheaper alternatives: `kling3_0` instead of `seedance_2_0` for single-plane shots, `veo_3_1_lite` for batch work, `z_image` for fast iteration.
3. Use smaller `count` values during iteration. Bump to `count=4` only when the direction is confirmed.

## Common UX mistakes to avoid

### Batch-asking
Bad: "What product, what avatar, what mode, what aspect ratio, what duration?"
Good: Pick sane defaults. Ask only the gap that matters most.

### Surfacing UUIDs
Bad: "Generated. Job ID: abc-123-def-456. Media URL: https://..."
Good: "Ready: https://..."

### Pasting JSON
Bad: Showing the user the full tool response including arrays and metadata.
Good: Extract the URL and short summary.

### Re-describing the input
Bad: For image-to-image, "a man in a leather jacket holding coffee, made into anime."
Good: "transform into anime style, cel shading."

### Inventing model names
Bad: Guessing "seedance_3_0" because Seedance 2.0 sounds outdated.
Good: Verify with `models_explore(action='list')` if uncertain.

### Skipping Soul vs Element disambiguation
Bad: Silently training a Soul when the user says "use my face."
Good: Ask which path. See `soul-vs-elements.md`.

### Passing hooks to incompatible modes
Bad: `mode='tv_spot', hook_id='<id>'` — server rejects.
Good: Check the mode table before adding hooks.

### Pasting the rewritten prompt back to the user
Bad: "I rewrote your prompt as: 'a red fox in golden hour forest with 85mm lens...'"
Good: Just generate. User wants the result, not your prompt engineering homework.

## When something is genuinely broken

If a generation fails twice with the same error after the fix:
1. Run `models_explore(action='get', model_id='<id>')` to see live schema.
2. Compare your call to the schema.
3. If still failing, fall back to a simpler model (`gpt_image_2` for images, `kling3_0` for video).
4. If the MCP itself returns 5xx, the backend may be down. Try in 5 minutes.
