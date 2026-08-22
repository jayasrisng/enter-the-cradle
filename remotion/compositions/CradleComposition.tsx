import { AbsoluteFill, OffthreadVideo, Sequence, staticFile } from "remotion";
import rideManifest from "../../public/ride-clips/manifest.json";

const clipDurations = rideManifest.clips.map((clip) =>
  Math.round(clip.durationSeconds * rideManifest.fps),
);

export const CradleComposition = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#050506" }}>
      {rideManifest.clips.map((clip, index) => {
        const durationInFrames = clipDurations[index];
        const sequenceStart = clipDurations
          .slice(0, index)
          .reduce((total, duration) => total + duration, 0);

        return (
          <Sequence
            key={clip.filename}
            from={sequenceStart}
            durationInFrames={durationInFrames}
            name={clip.role}
          >
            <OffthreadVideo
              src={staticFile(`ride-clips/${clip.filename}`)}
              style={{
                height: "100%",
                objectFit: "cover",
                width: "100%",
              }}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
