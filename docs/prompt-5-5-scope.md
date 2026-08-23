# Prompt 5.5 Scope — Silent Astronaut Cameo

## Objective

Make the uploaded person feel present inside the Niiro ride without replacing or interrupting the approved film. The complete ride continues playing while a silent astronaut containing the user's recognizable face briefly drops into selected scenes, stands near a lower corner, and fades away.

## What We Are Building

- A reusable astronaut specimen made from an original transparent suit plate and the existing selfie input.
- A face-only crop placed inside the astronaut helmet so one selfie is sufficient and body ambiguity is avoided.
- Four short, silent corner cameos timed to relevant moments in the ride.
- A restrained drop-in, idle breathing drift, scene-matched lighting, and fade-out for each cameo.
- A final cinematic zoom toward the astronaut and helmet while the underlying ride continues.
- The approved end message in a tall Gothic display style:
  - `HUMAN DETECTED`
  - `AT`
  - `POMEGRANATE`
  - `PREMIERE SHOW // SPECIMEN #[ID]`
- A selfie-first intake action, browser preview, and verified 1080×1920 MP4 test render.

## Explicit Non-Goals

- A talking avatar, lip sync, face swap, or generated human performance.
- Reconstructing the user's body, clothing, pose, or movement from the selfie.
- Re-editing, replacing, or shortening the approved Niiro footage.
- Letting the astronaut obscure Niiro or the primary action.
- External image/video-generation calls during a user's session.
- Server rendering, storage, download delivery, and production render infrastructure; those remain Prompt 6.

## Product Constraints

- The face must remain recognizable and may only be cropped, scaled, and subtly color-treated.
- The astronaut is fictional protective equipment, not a representation of the user's real body.
- The astronaut is silent and stays near a lower screen corner during ride cameos.
- Uploaded images remain local during Prompt 5.5.
- Existing source footage, test selfies, and rendered output remain ignored by Git.
- The ride remains approximately 15 seconds at 1080×1920 and 30 FPS.

## Definition of Done

Prompt 5.5 is complete when one local selfie produces a ride in which:

1. The approved source video remains continuously visible and audible.
2. The same astronaut drops in and fades out during four selected scenes.
3. The astronaut never blocks the scene's main subject.
4. The ending zooms into the astronaut and presents the approved Pomegranate detection message.
5. The experience plays in the browser and renders successfully to MP4.
