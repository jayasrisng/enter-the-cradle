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
pnpm remotion           # Open Remotion Studio
pnpm remotion:render    # Render the placeholder composition to output/
```

The Remotion composition is only a validated placeholder in the bootstrap phase. Ride footage selection and the final personalized video are implemented in later phases.
