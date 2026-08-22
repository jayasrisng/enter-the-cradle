import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { CSSProperties } from "react";
import type { CradleCompositionProps } from "../../lib/specimen";
import rideManifest from "../../public/ride-clips/manifest.json";

const clipDurations = rideManifest.clips.map((clip) =>
  Math.round(clip.durationSeconds * rideManifest.fps),
);

const edgeLabel: CSSProperties = {
  color: "#9bc8c7",
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSize: 22,
  letterSpacing: 8,
  textTransform: "uppercase",
};

function Face({ selfieSrc, style }: { selfieSrc: string; style?: CSSProperties }) {
  if (!selfieSrc) {
    return (
      <AbsoluteFill style={{ alignItems: "center", background: "#141011", color: "#746e68", display: "flex", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 22, justifyContent: "center", letterSpacing: 5, ...style }}>
        HUMAN IMAGE
      </AbsoluteFill>
    );
  }
  return <Img src={selfieSrc} style={{ height: "100%", objectFit: "cover", width: "100%", ...style }} />;
}

function Scanner({ selfieSrc, specimenId }: Pick<CradleCompositionProps, "selfieSrc" | "specimenId">) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const arrival = spring({ frame, fps, config: { damping: 18, stiffness: 110 } });
  const scanY = interpolate(frame % 42, [0, 21, 42], [-20, 460, -20]);
  const rotation = frame * 1.1;

  return (
    <AbsoluteFill style={{ alignItems: "center", display: "flex", justifyContent: "center" }}>
      <div style={{ alignItems: "center", display: "flex", height: 650, justifyContent: "center", opacity: arrival, position: "relative", transform: `scale(${interpolate(arrival, [0, 1], [0.72, 1])})`, width: 650 }}>
        <div style={{ position: "absolute", inset: 0, border: "2px solid rgba(155,200,199,.42)", borderRadius: "50%", transform: `rotate(${rotation}deg)`, boxShadow: "0 0 90px rgba(155,200,199,.13)" }} />
        <div style={{ position: "absolute", inset: 45, border: "2px dashed rgba(165,43,37,.7)", borderRadius: "50%", transform: `rotate(${-rotation * 0.7}deg)` }} />
        <div style={{ position: "relative", width: 490, height: 490, borderRadius: "50%", overflow: "hidden", filter: "saturate(.65) contrast(1.1)" }}>
          <Face selfieSrc={selfieSrc} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle, transparent 48%, rgba(5,5,6,.75) 100%), repeating-linear-gradient(0deg, transparent 0 7px, rgba(155,200,199,.08) 8px)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: scanY, height: 55, background: "linear-gradient(180deg, transparent, rgba(155,200,199,.72), transparent)", mixBlendMode: "screen" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 76, right: 76, bottom: 178, fontFamily: "Arial, Helvetica, sans-serif" }}>
        <div style={{ color: "#e8e0d5", fontSize: 74, fontWeight: 600, letterSpacing: -3, lineHeight: 1 }}>HUMAN DETECTED</div>
        <div style={{ ...edgeLabel, marginTop: 24 }}>SPECIMEN #{specimenId}</div>
      </div>
    </AbsoluteFill>
  );
}

function ContainmentOrb({ selfieSrc, specimenId }: Pick<CradleCompositionProps, "selfieSrc" | "specimenId">) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const arrival = spring({ frame, fps, config: { damping: 14, stiffness: 150 } });
  const pulse = 1 + Math.sin(frame / 4) * 0.018;
  const shakeX = Math.sin(frame * 1.7) * interpolate(frame, [0, 90], [2, 14], { extrapolateRight: "clamp" });
  const shakeY = Math.cos(frame * 1.31) * 7;
  const glitch = frame % 29 < 3 ? `translateX(${frame % 2 === 0 ? 16 : -12}px)` : "none";

  return (
    <AbsoluteFill style={{ alignItems: "center", display: "flex", justifyContent: "center", perspective: 1000 }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 47%, transparent 0 18%, rgba(5,5,6,.16) 43%, rgba(5,5,6,.48) 100%)" }} />
      <div style={{ position: "relative", width: 610, height: 610, transform: `translate(${shakeX}px, ${shakeY}px) rotate(${Math.sin(frame / 17) * 7}deg) scale(${arrival * pulse})` }}>
        <div style={{ position: "absolute", inset: -34, border: "6px solid rgba(232,224,213,.65)", borderLeftColor: "rgba(165,43,37,.9)", borderRadius: "50%", transform: `rotate(${frame * 2.4}deg)`, boxShadow: "0 0 65px rgba(155,200,199,.25), inset 0 0 50px rgba(155,200,199,.18)" }} />
        <div style={{ position: "absolute", inset: -8, overflow: "hidden", borderRadius: "50%", background: "rgba(5,5,6,.72)", transform: glitch }}>
          <Face selfieSrc={selfieSrc} style={{ filter: "saturate(.78) contrast(1.12)" }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 45% 35%, rgba(255,255,255,.16), transparent 24%), radial-gradient(circle, transparent 50%, rgba(5,5,6,.62) 83%, rgba(155,200,199,.26))", mixBlendMode: "screen" }} />
        </div>
        <div style={{ position: "absolute", inset: -78, border: "2px dashed rgba(155,200,199,.5)", borderRadius: "50%", transform: `rotate(${-frame * 1.2}deg)` }} />
      </div>
      <div style={{ ...edgeLabel, position: "absolute", left: 68, bottom: 92, color: "#e8e0d5" }}>CONTAINMENT // {specimenId}</div>
      <div style={{ ...edgeLabel, position: "absolute", right: 68, top: 92, color: "#a52b25", transform: "rotate(90deg)", transformOrigin: "right top" }}>DO NOT RELEASE</div>
    </AbsoluteFill>
  );
}

function Verdict({ selfieSrc, specimenId, outcome }: CradleCompositionProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const arrival = spring({ frame, fps, config: { damping: 20, stiffness: 95 } });
  const flicker = frame < 8 && frame % 2 === 0 ? 0.3 : 1;
  const dangerous = outcome === "REJECTED" || outcome === "CONSUMED";

  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,5,6,.72), #050506 62%)", fontFamily: "Arial, Helvetica, sans-serif", opacity: flicker }}>
      <div style={{ position: "absolute", inset: 48, border: "2px solid rgba(232,224,213,.16)" }} />
      <div style={{ position: "absolute", left: 88, right: 88, top: 134, display: "flex", justifyContent: "space-between", ...edgeLabel }}><span>CRADLE VERDICT</span><span>FINAL</span></div>
      <div style={{ position: "absolute", top: 345, left: 50, right: 50, display: "flex", flexDirection: "column", alignItems: "center", transform: `translateY(${interpolate(arrival, [0, 1], [55, 0])}px)`, opacity: arrival }}>
        <div style={{ position: "relative", width: 470, height: 470, borderRadius: "50%", overflow: "hidden", border: "3px solid rgba(155,200,199,.55)", boxShadow: "0 0 100px rgba(155,200,199,.15)" }}>
          <Face selfieSrc={selfieSrc} style={{ filter: "saturate(.64) contrast(1.12)" }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle, transparent 48%, rgba(5,5,6,.65) 100%)" }} />
        </div>
        <div style={{ ...edgeLabel, marginTop: 76 }}>SPECIMEN #{specimenId}</div>
        <div style={{ color: "#e8e0d5", fontSize: 104, fontWeight: 700, letterSpacing: -5, lineHeight: 1, marginTop: 32, textAlign: "center" }}>VERDICT:</div>
        <div style={{ color: dangerous ? "#b63831" : "#9bc8c7", fontSize: 118, fontWeight: 700, letterSpacing: -6, lineHeight: 1, marginTop: 12, textAlign: "center", textShadow: "0 0 48px currentColor" }}>{outcome}</div>
      </div>
    </AbsoluteFill>
  );
}

export const CradleComposition = ({ selfieSrc, specimenId, outcome }: CradleCompositionProps) => {
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
      <Sequence from={0} durationInFrames={60} name="Human detection"><Scanner selfieSrc={selfieSrc} specimenId={specimenId} /></Sequence>
      <Sequence from={150} durationInFrames={150} name="Specimen containment"><ContainmentOrb selfieSrc={selfieSrc} specimenId={specimenId} /></Sequence>
      <Sequence from={390} durationInFrames={60} name="Final verdict"><Verdict selfieSrc={selfieSrc} specimenId={specimenId} outcome={outcome} /></Sequence>
      <AbsoluteFill style={{ pointerEvents: "none", background: "repeating-linear-gradient(0deg, transparent 0 5px, rgba(255,255,255,.022) 6px)", mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};
