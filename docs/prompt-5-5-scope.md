# Prompt 5.5 Scope — Living Specimen Character

## Objective

Make the uploaded person feel like an active character inside the ride using a deterministic 2.5D character rig that can be previewed and rendered locally.

The experience should deliver the emotional impression of “that is me inside the machine” without claiming photorealistic face replacement or generating a new performance from a single photograph.

## What We Are Building

- A reusable biomechanical character rig driven by the existing selfie input.
- A film-world costume made from procedural Remotion layers: helmet, face aperture, collar, shoulders, torso shell, harness, cables, chest reactor, and diagnostic markings.
- Independent motion for the head, torso, limbs, cables, and lighting so the character appears to breathe, brace, fall, and react.
- Scene-specific character appearances during detection, descent, impact/containment, and final verdict.
- Lighting, blur, shake, scale, rotation, occlusion, scan lines, and glitch effects matched to the ride footage.
- The same specimen ID and outcome throughout the interface and composition.
- A browser preview and a verified 1080×1920 MP4 test render.

## Explicit Non-Goals

- Photorealistic face swap, talking avatar, lip sync, or newly generated facial expressions.
- Fully reconstructed 3D body, pose estimation, motion capture, or camera tracking.
- External image/video generation APIs, paid services, accounts, or cloud storage.
- A promise that the generated body exactly matches the user’s body, clothing, gender presentation, or physical traits.
- Server-side user rendering, download delivery, and production rendering infrastructure; those remain Prompt 6.

## Product Constraints

- The face must stay recognizable and must not be heavily warped.
- The costume is fictional protective equipment, not a claim about the user’s real appearance.
- The feature must work with one front-facing selfie.
- Uploaded images remain local during Prompt 5.5.
- Existing source footage and generated videos remain ignored by Git.
- The complete ride remains approximately 15 seconds at 1080×1920 and 30 FPS.

## Definition of Done

Prompt 5.5 is complete when a local selfie produces a ride in which the same recognizable character:

1. Is assembled/scanned in costume.
2. Falls or braces inside the ride with multi-part body motion.
3. Appears contained during an intense source clip with scene-matched effects.
4. Returns in costume on the final verdict screen.
5. Plays through the existing web experience and renders successfully to MP4.
