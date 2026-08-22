# Product Requirements — Living Specimen Character

## Product Summary

Enter the Cradle turns one uploaded selfie into a stylized “living specimen” character inside the existing cinematic ride. The user’s face remains authentic and recognizable while a procedural biomechanical costume and animated body rig create the illusion that they are being scanned, dropped, contained, and judged by the fictional machine.

## User Problem

The current personalization presents the selfie as a moving framed image. It confirms identity but does not yet create the emotional payoff that the user is physically present in the ride.

## Desired Experience

The user should recognize their face immediately, then see “their character” react to the environment. The experience should feel authored for the film world rather than like a sticker, slideshow, or generic avatar generator.

## Primary User Story

As a participant, I want my selfie to become a costumed character that moves inside the ride so the final video feels like an immersive scene starring me.

### Acceptance Criteria

- The character uses the selfie selected in the intake flow.
- The face stays recognizable during every character appearance.
- The character wears a consistent fictional biomechanical flight/containment suit.
- At least the head and torso move independently.
- At least one scene includes a readable full or three-quarter body silhouette.
- Character motion responds to the ride through falling, bracing, recoil, or containment motion.
- The final verdict shows the same character, specimen ID, and assigned outcome.

## Experience Sequence

### 1. Specimen Assembly — 0–2 seconds

The machine constructs a costumed bust around the uploaded face. Helmet rings, shoulder armor, chest hardware, and scan light appear around the user.

Visible information:

- `HUMAN DETECTED`
- `SPECIMEN #[ID]`
- `BIO-SUIT LINKED`

### 2. Descent Character — approximately 2–5 seconds

The character appears in a readable body silhouette and is pulled through the environment. Head, torso, arms, and cables react at different rates. Scale, rotation, and motion blur create depth.

### 3. Impact and Containment — approximately 5–10 seconds

The character braces and recoils, then is trapped inside a containment field. Scene-matched cyan/red lighting, shake, occlusion, and short glitches integrate the rig with the footage.

### 4. Climax Glimpse — approximately 10–13 seconds

The character is briefly overwhelmed by the environment. The face remains recognizable but the composition may partially occlude the body for tension.

### 5. Final Verdict — approximately 13–15 seconds

The costumed character returns in a clean, screenshot-ready portrait with the persistent specimen ID and outcome.

## Interaction Requirements

- The existing upload and scan flow remains unchanged.
- Selecting **Enter the Cradle** plays the enhanced character composition.
- Playback controls remain available in the local preview.
- Returning to the verdict gate must not change the specimen ID or outcome.
- No additional photo, body-type, or costume-selection step is required.

## Edge Cases

- If no selfie source is available, the composition renders a neutral “human image” placeholder rather than crashing.
- Very wide or tall selfies are cropped into the helmet aperture using `object-fit: cover`.
- Faces positioned near an image edge may be imperfectly centered; manual face detection is out of scope.
- Reduced-performance mobile devices may show simpler motion through the existing Remotion Player, but the composition must remain usable.
- A failed local MP4 render must not expose filesystem paths in the web UI; render error handling belongs to Prompt 6.

## Privacy and Safety

- Prompt 5.5 does not upload the selfie or call an external model.
- The generated body is explicitly stylized fictional armor and should not imply an accurate reconstruction of the user.
- Source footage, test selfies, input props, and rendered videos stay ignored by Git.

## Success Criteria

- A test viewer can identify the same person in detection, ride, containment, and verdict moments.
- The character reads as one consistent costume across scenes.
- The character contains at least three independently animated layers.
- A complete 15-second MP4 renders at 1080×1920, 30 FPS with valid audio/video streams.
- The final 1–2 seconds are suitable for a screenshot.

## Later Enhancements

- Optional AI-generated costume stills or image-to-video performances with explicit consent.
- Face-aware crop positioning and segmentation.
- Multiple costume archetypes.
- Cloud render workers and downloadable transmissions.
