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
