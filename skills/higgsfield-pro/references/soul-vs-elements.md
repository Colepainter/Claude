# Soul vs Elements — The Disambiguation Guide

This is the single most common failure point for Higgsfield users. The MCP exposes two completely different identity systems with different constraints, and they look interchangeable until you hit the wall.

## The 30-second version

**Soul Character** is a *trained model* of one person's face. Reusable across thousands of generations. Requires 5 to 20 photos and ~10 minutes of training. Works with only 2 models: `soul_2` and `soul_cinema_studio`. ONE soul per generation.

**Element** is a *saved reference image* used as a pointer inside prompts. Instant. Works with 10+ models. Multiple elements per prompt. The way you do multi-character shots.

## Decision matrix

| Signal | Path |
|---|---|
| "Train my Soul," "digital twin," "reusable identity," "create me as a character" | **Soul** |
| User has 5 to 20 well-lit, varied photos of the same person | **Soul** (preferred if they want to reuse) |
| User wants the result in `soul_2` (Soul V2), `soul_cinema_studio` (Soul Cinema) | **Soul** (it's the only option) |
| User has ONE good photo and wants an instant result | **Element** |
| User wants multiple people in one shot ("me and my wife," "me and my dog") | **Element** (Soul cannot do this) |
| User wants to use a non-person subject (a chair, a car, a product) as reference | **Element** |
| User wants the result in Nano Banana, Seedream, Kling, Cinema Studio, Seedance | **Element** (Soul does not work here) |
| User says "save this as a reusable reference" but does not say "Soul" or "train" | **Element** |

## When ambiguous, ASK

User says: "Can you make a video of me dancing on a rooftop?"

Wrong: silently start training a Soul.

Right: "Quick question before I start. I can do this two ways:
1. **Train a Soul.** Reusable forever, super identity-faithful, but needs 5 to 20 of your photos and takes about 10 minutes. Works in Soul V2 and Soul Cinema only.
2. **Save as an Element.** Instant. One photo. Works in more models. Less identity-faithful on hard angles.

Which do you want?"

## The constraints you cannot break

### Soul

- ONE soul_id per `generate_image` or `generate_video` call. Pass two and it rejects.
- Only `soul_2` and `soul_cinema_studio` accept `soul_id`. Any other model rejects with "Soul ID not compatible."
- Training takes 5 to 15 minutes. Non-blocking. Widget polls.
- Requires a paid plan (Basic+ tier).
- Multi-subject scenes ("me and my friend laughing") are impossible with Soul alone. Use Element for the friend.

### Element

- Embed `<<<element_id>>>` directly inside `params.prompt`. The backend auto-injects the image and rewrites to `@element_name`.
- Multiple placeholders per prompt allowed. Example: `"<<<abc>>> handing coffee to <<<def>>> in a Paris cafe"`.
- Works with: `nano_banana_2`, `nano_banana_pro` (technically `nano_banana_flash`), `gpt_image_2`, `seedream_v4_5`, `seedream_v5_lite`, `cinematic_studio_2_5`, plus video models `seedance_2_0`, `kling3_0`, `cinema_studio_video`, `cinema_studio_video_3`.
- Does NOT work with `soul_2` or `soul_cinema_studio` — those want soul_id, not placeholders.
- CDN constraint: Element source URLs must be on Higgsfield's CloudFront (`d20rwh69pn04qo.cloudfront.net` or `cdn.higgsfield.ai`). Use the `media_upload` → `media_confirm` flow which returns the right URL automatically.

## Workflows

### Soul training (one-time)

```
1. show_characters(action='train',
                   name='founder',
                   medias=[
                     {value: '<media_id_1>', role: 'image'},
                     {value: '<media_id_2>', role: 'image'},
                     ...
                   ],
                   type='soul_2')

2. Wait ~10 minutes. Widget polls automatically.

3. On ready, returned soul_id is permanent.

4. Generate:
   generate_image(params={
     model: 'soul_2',
     prompt: 'editorial portrait, golden hour, 85mm',
     soul_id: '<soul_id>',
     aspect_ratio: '3:4'
   })
```

### Element creation (instant)

```
1. media_upload({filename: 'me.jpg', content_type: 'image/jpeg'})
   → returns upload_url + media_id

2. PUT image bytes to upload_url

3. media_confirm({media_id: '<media_id>', type: 'image'})
   → returns confirmed media + CDN url

4. show_reference_elements(action='create',
                           medias=[{
                             id: '<media_id>',
                             url: '<cdn_url>',
                             type: 'media_input'
                           }],
                           category='auto')
   → returns element_id (instant)

5. Generate:
   generate_image(params={
     model: 'nano_banana_2',
     prompt: '<<<element_id>>> as an astronaut on Mars, cinematic, 8K'
   })
```

### Multi-character shot (Elements only)

```
1. Create element A (person 1)
2. Create element B (person 2)
3. generate_image(params={
     model: 'gpt_image_2',
     prompt: '<<<element_a>>> shaking hands with <<<element_b>>> at a tech conference, photojournalism, natural light'
   })
```

## Photo guide for Soul training

If the user chooses Soul, the photos matter more than the model. Coach them:

**Good photos:**
- 5 to 20 of the same person, no other people in frame
- Varied angles: straight on, 3/4, profile
- Varied lighting: outdoor daylight, indoor, soft, hard
- Different expressions: neutral, smiling, serious
- Clear face, no heavy filters, no sunglasses
- At least 1024x1024 each

**Bad photos:**
- Group photos (Soul does not know which face is the subject)
- Heavy filters / Instagram presets
- Sunglasses, masks, hats covering the face
- Blurry, low-resolution, dark
- All from the same angle (no 3D understanding)

If the user only has 1 to 4 photos, do NOT train Soul. Suggest Element instead.

## Recovery when the user picked wrong

**User trained Soul but wants Nano Banana output.** Solution: create an Element from one of the training photos. Suggest: "Soul V2 will give the most identity-faithful result. If you want Nano Banana's specific style, I can create an Element instead — instant, no retraining."

**User wants multiple people, picked Soul.** Solution: keep the Soul for the primary subject, create Elements for the others. Compose with `soul_id` for the primary AND `<<<element_id>>>` for the others. NOTE: this only works in models that accept both — verify with `models_explore(action='get')` first.

**User created an Element but their result lacks identity fidelity.** Solution: if they will reuse this person more than 3 times, train a Soul. The investment pays off.
