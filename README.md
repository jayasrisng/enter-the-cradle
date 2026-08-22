# Enter the Cradle

Enter the Cradle is a personalized immersive web experience where users upload a selfie and become part of a cinematic Niiro ride.

## Stack

- Next.js with the App Router and TypeScript
- Tailwind CSS
- Remotion
- FFmpeg and ffprobe for local media preparation

## Local setup

Install dependencies and start the web app:

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Specimen intake

The mobile-first intake flow runs entirely in the browser: begin the session, choose a selfie, process the fictional scan, and receive a persistent four-digit specimen ID. JPEG, PNG, and WebP images up to 12 MB are supported. HEIC/HEIF images display a conversion prompt rather than failing silently.

Selfies are normalized locally for preview and are not uploaded or stored by the intake experience. The final **Enter the Cradle** action opens the personalized ride preview on the same device.

## Personalized ride

The Remotion composition accepts `selfieSrc`, `specimenId`, and `outcome` inputs. It places the portrait in three authored moments: human detection, an animated containment orb during the ride, and the final verdict. The web experience passes the current local selfie and session identity directly into a Remotion Player when the user selects **Enter the Cradle**.

For a local MP4 proof, add an approved JPEG at `local-assets/test-selfie.jpg`, then run:

```bash
pnpm remotion:render:personalized
```

This creates `output/enter-the-cradle-personalized.mp4`. Both the local portrait and rendered video are ignored by Git. The server-side render/download pipeline is intentionally deferred to Prompt 6.

## Local media

Place approved original videos in `local-assets/source/`. Extracted ride clips belong in `public/ride-clips/`, and generated analysis or rendered videos belong in `output/`.

Source footage, extracted video clips, uploaded selfies, and generated videos remain local and are intentionally ignored by Git. JSON manifests and directory placeholders may be committed.

## Commands

```bash
pnpm dev                # Run the Next.js development server
pnpm build              # Create a production build
pnpm lint               # Run ESLint
pnpm typecheck          # Run TypeScript checks
pnpm media:analyze      # Analyze source footage and build contact sheets
pnpm media:extract --   # Extract and normalize a candidate clip
pnpm remotion           # Open Remotion Studio
pnpm remotion:render    # Render the placeholder composition to output/
pnpm remotion:render:personalized # Render with ignored local test props
```

The Remotion composition is only a validated placeholder in the bootstrap phase. Ride footage selection and the final personalized video are implemented in later phases.

## Source-footage analysis

Place approved footage in `local-assets/source/`, then run:

```bash
pnpm media:analyze
```

The analyzer reads every supported video, records its duration, dimensions, frame rate and codecs, extracts representative frames, creates a contact sheet, and writes `output/media-analysis/manifest.json`. All generated analysis files are ignored by Git.

To use a different number of representative frames:

```bash
pnpm media:analyze -- --frames 16
```

Extract and normalize a candidate clip with a source path, start time, end time and output name:

```bash
pnpm media:extract -- local-assets/source/ride.mov 00:01:12.500 00:01:18.000 02-drop
```

The clip is written to `public/ride-clips/02-drop.mp4` as H.264 video with AAC audio, even dimensions, 30 FPS and web-optimized MP4 metadata. Timestamps accept seconds or `HH:MM:SS.mmm` notation.

## Base ride composition

The selected 15-second edit is described by `public/ride-clips/manifest.json`. The manifest records each local clip, its duration, source timestamps and intended story role. Video files under `public/ride-clips/` remain ignored by Git.

Preview the sequence in Remotion Studio:

```bash
pnpm remotion
```

Render the 1080×1920 test ride:

```bash
pnpm remotion:render
```

The generated video is written to `output/enter-the-cradle.mp4` and remains local-only.
