import "@fontsource/pirata-one";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { CradleCompositionProps } from "../../lib/specimen";
import rideManifest from "../../public/ride-clips/manifest.json";
import { AstronautSpecimen } from "../components/AstronautSpecimen";
import type { AstronautPose } from "../components/AstronautSpecimen";

const clipDurations = rideManifest.clips.map((clip) =>
  Math.round(clip.durationSeconds * rideManifest.fps),
);

type CameoProps = Pick<CradleCompositionProps, "selfieSrc" | "specimenId"> & {
  side: "left" | "right";
  duration: number;
  pose: AstronautPose;
  scale: number;
  bottom: number;
  edge: number;
  followsBall?: boolean;
};

function GroundedAstronaut({ selfieSrc, specimenId, side, duration, pose, scale, bottom, edge, followsBall = false }: CameoProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const arrival = spring({ frame, fps, config: { damping: 18, stiffness: 110 } });
  const opacity = interpolate(frame, [0, 8, duration - 12, duration], [0, 0.9, 0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const settleY = interpolate(arrival, [0, 1], [42, 0]);
  const ballTrack = followsBall
    ? interpolate(frame, [0, 24, 50, duration], [0, 82, 225, 132], { extrapolateRight: "clamp" })
    : 0;
  const faceTrack = followsBall ? interpolate(ballTrack, [0, 225], [-2, 3]) : 0;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          [side]: edge,
          bottom,
          opacity,
          transform: `translate(${side === "left" ? ballTrack : -ballTrack}px, ${settleY}px) scale(${scale})`,
          transformOrigin: `50% 100%`,
          filter: "saturate(.82) contrast(1.05)",
        }}
      >
        <AstronautSpecimen selfieSrc={selfieSrc} specimenId={specimenId} pose={pose} lookX={faceTrack} />
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: opacity * 0.12, background: side === "left" ? "linear-gradient(90deg, rgba(155,200,199,.42), transparent 38%)" : "linear-gradient(270deg, rgba(165,43,37,.38), transparent 38%)", mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
}

function FinalDetection({ selfieSrc, specimenId }: Pick<CradleCompositionProps, "selfieSrc" | "specimenId">) {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 56], [0.56, 4.15], { extrapolateRight: "clamp" });
  const helmetX = interpolate(frame, [0, 48], [790, 540], { extrapolateRight: "clamp" });
  const helmetY = interpolate(frame, [0, 48], [1575, 610], { extrapolateRight: "clamp" });
  const shade = interpolate(frame, [4, 36], [0.08, 0.74], { extrapolateRight: "clamp" });
  const copyOpacity = interpolate(frame, [30, 43], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const copyY = interpolate(frame, [30, 45], [28, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flash = frame > 54 ? interpolate(frame, [54, 57, 60], [0, 0.72, 0], { extrapolateRight: "clamp" }) : 0;

  return (
    <AbsoluteFill style={{ overflow: "hidden", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div style={{ position: "absolute", inset: 0, background: `rgba(5,5,6,${shade})` }} />
      <div
        style={{
          position: "absolute",
          left: helmetX - 240,
          top: helmetY - 100,
          transform: `scale(${zoom})`,
          transformOrigin: "240px 100px",
        }}
      >
        <AstronautSpecimen selfieSrc={selfieSrc} specimenId={specimenId} />
      </div>

      <div style={{ position: "absolute", zIndex: 10, left: 54, right: 54, bottom: 112, opacity: copyOpacity, transform: `translateY(${copyY}px)`, textAlign: "center", textShadow: "0 4px 24px rgba(0,0,0,.85)" }}>
        <div style={{ color: "#f0ede5", fontFamily: '"Pirata One", serif', fontSize: 112, lineHeight: 0.82, letterSpacing: 1 }}>HUMAN DETECTED</div>
        <div style={{ marginTop: 28, color: "#a9caca", fontSize: 20, letterSpacing: 8 }}>AT</div>
        <div style={{ marginTop: 12, color: "#f0ede5", fontFamily: '"Pirata One", serif', fontSize: 142, lineHeight: 0.82, letterSpacing: 1 }}>POMEGRANATE</div>
        <div style={{ marginTop: 22, color: "#d9d4cc", fontSize: 24, letterSpacing: 10 }}>PREMIERE SHOW // SPECIMEN #{specimenId}</div>
      </div>
      <div style={{ position: "absolute", inset: 0, background: `rgba(232,224,213,${flash})`, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
}

export const CradleComposition = ({ selfieSrc, specimenId }: CradleCompositionProps) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#050506" }}>
      {rideManifest.clips.map((clip, index) => {
        const durationInFrames = clipDurations[index];
        const sequenceStart = clipDurations.slice(0, index).reduce((total, duration) => total + duration, 0);
        return (
          <Sequence key={clip.filename} from={sequenceStart} durationInFrames={durationInFrames} name={clip.role}>
            <OffthreadVideo src={staticFile(`ride-clips/${clip.filename}`)} style={{ height: "100%", objectFit: "cover", width: "100%" }} />
          </Sequence>
        );
      })}

      <Sequence from={150} durationInFrames={75} name="Grounded battlefield astronaut"><GroundedAstronaut selfieSrc={selfieSrc} specimenId={specimenId} side="left" duration={75} pose="kneeling" scale={0.55} bottom={20} edge={18} /></Sequence>
      <Sequence from={228} durationInFrames={87} name="Prone astronaut follows pinball"><GroundedAstronaut selfieSrc={selfieSrc} specimenId={specimenId} side="left" duration={87} pose="prone" scale={0.62} bottom={72} edge={-150} followsBall /></Sequence>
      <Sequence from={330} durationInFrames={56} name="Grounded creature battlefield astronaut"><GroundedAstronaut selfieSrc={selfieSrc} specimenId={specimenId} side="right" duration={56} pose="kneeling" scale={0.56} bottom={8} edge={14} /></Sequence>
      <Sequence from={390} durationInFrames={60} name="Pomegranate human detection"><FinalDetection selfieSrc={selfieSrc} specimenId={specimenId} /></Sequence>

      <AbsoluteFill style={{ pointerEvents: "none", background: "repeating-linear-gradient(0deg, transparent 0 5px, rgba(255,255,255,.018) 6px)", mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};
