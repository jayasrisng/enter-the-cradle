# Product Requirements — Silent Astronaut Cameo

## Product Summary

Enter the Cradle places the participant inside the existing cinematic Niiro ride as a silent astronaut specimen. The full approved film remains the experience. At selected beats, an astronaut with the participant's cropped face drops into a lower corner, observes the scene, and fades away. The finale zooms into the astronaut and identifies the participant as a human detected at the Pomegranate premiere show.

## User Problem

A moving portrait still feels like an overlay. The participant needs a clear film-world role, but generating a convincing full-body performance from one selfie would add cost, latency, and visual uncertainty.

## Desired Experience

The participant should instantly think, “that astronaut is me,” while Niiro and the ride remain the focus. The appearances should feel like mysterious sightings rather than a competing protagonist.

## Primary User Story

As a participant, I want my face to appear inside a recurring astronaut character so I feel present in the film and receive a memorable personalized ending.

### Acceptance Criteria

- The intake asks the participant to take a selfie and also permits choosing an existing photo.
- Only the face is used inside an original fictional astronaut suit.
- The face stays recognizable in every appearance.
- The approved ride plays continuously with its original audio.
- The astronaut is silent and appears in four short, lower-corner cameos.
- Each cameo drops in, holds with restrained motion, and fades out.
- The astronaut does not obscure Niiro or primary scene action.
- The finale zooms into the same astronaut and shows the persistent specimen ID.

## Experience Sequence

### 1. Ride Begins — 0–2 seconds

The approved ride opens without an astronaut overlay, allowing the film world to establish itself.

### 2. First Sighting — approximately 2–4 seconds

The astronaut drops into the lower-right corner, stands silently with subtle breathing motion, and fades before the next beat.

### 3. Alternating Sightings — approximately 5–11 seconds

Three additional appearances alternate between lower corners and align with visually relevant scenes. Scale and lighting change slightly to sit naturally within each shot.

### 4. Human Detection Finale — approximately 13–15 seconds

The astronaut returns and the camera progressively zooms toward the helmet. A darkened diagnostic treatment and the approved Gothic typography introduce:

- `HUMAN DETECTED`
- `AT`
- `POMEGRANATE`
- `PREMIERE SHOW // SPECIMEN #[ID]`

## Interaction Requirements

- The participant can use **Take selfie** on supported mobile devices or **Choose photo**.
- Existing validation, local image normalization, scan, and persistent specimen ID behavior remain available.
- Selecting **Enter the Cradle** plays the personalized astronaut composition.
- Playback controls remain available in the local preview.
- No costume, body-type, voice, or motion selection is required.

## Edge Cases

- If no selfie source is available, the composition uses its existing neutral placeholder rather than crashing.
- Wide or tall photos are cropped into the helmet using `object-fit: cover`.
- A face near the edge of a photo may be imperfectly centered; automated face detection is a later enhancement.
- The astronaut is kept within safe lower-corner bounds on the 9:16 canvas.

## Privacy and Safety

- Prompt 5.5 does not upload the selfie or call an external model at runtime.
- The astronaut plate is original project artwork; it does not infer the participant's body.
- Source footage, local test selfies, render props, and generated videos remain ignored by Git.

## Success Criteria

- A test viewer can identify the participant in every astronaut appearance.
- The ride remains visually dominant and uninterrupted.
- Four cameos and the final helmet zoom are readable at phone size.
- The final Pomegranate message is screenshot-ready.
- A complete 15-second MP4 renders at 1080×1920, 30 FPS with valid audio and video.

## Later Enhancements

- Face-aware crop positioning and segmentation.
- Multiple original astronaut suit variants.
- Per-scene masking for deeper foreground integration.
- Cloud render workers and downloadable transmissions in Prompt 6.
