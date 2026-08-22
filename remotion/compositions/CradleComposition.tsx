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
import type { CSSProperties } from "react";
import type { CradleCompositionProps } from "../../lib/specimen";
import rideManifest from "../../public/ride-clips/manifest.json";
import { LivingSpecimen } from "../components/LivingSpecimen";

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

function Assembly({ selfieSrc, specimenId }: Pick<CradleCompositionProps, "selfieSrc" | "specimenId">) {
  const frame = useCurrentFrame();
  const scanY = interpolate(frame % 40, [0, 20, 40], [260, 1130, 260]);
  const linkedOpacity = interpolate(frame, [24, 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,5,6,.12), rgba(5,5,6,.72))", alignItems: "center", display: "flex", justifyContent: "center" }}>
      <div style={{ transform: "scale(.92) translateY(-20px)" }}>
        <LivingSpecimen selfieSrc={selfieSrc} specimenId={specimenId} mode="assembly" />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: scanY, height: 80, background: "linear-gradient(180deg, transparent, rgba(155,200,199,.65), transparent)", mixBlendMode: "screen" }} />
      <div style={{ position: "absolute", left: 72, right: 72, bottom: 140, fontFamily: "Arial, Helvetica, sans-serif" }}>
        <div style={{ color: "#e8e0d5", fontSize: 76, fontWeight: 650, letterSpacing: -4, lineHeight: 1 }}>HUMAN DETECTED</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, ...edgeLabel }}>
          <span>SPECIMEN #{specimenId}</span>
          <span style={{ opacity: linkedOpacity }}>BIO-SUIT LINKED</span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

function Descent({ selfieSrc, specimenId }: Pick<CradleCompositionProps, "selfieSrc" | "specimenId">) {
  const frame = useCurrentFrame();
  const travel = interpolate(frame, [0, 90], [-210, 250], { extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, 70], [0.62, 1.02], { extrapolateRight: "clamp" });
  const blur = interpolate(frame, [0, 12, 76, 90], [9, 1, 1, 7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", display: "flex", justifyContent: "center", perspective: 1200 }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, transparent 8%, rgba(5,5,6,.34) 70%)" }} />
      <div style={{ transform: `translateY(${travel}px) scale(${scale})`, filter: `drop-shadow(0 40px 34px rgba(0,0,0,.55)) blur(${blur}px)` }}>
        <LivingSpecimen selfieSrc={selfieSrc} specimenId={specimenId} mode="descent" />
      </div>
      <div style={{ ...edgeLabel, position: "absolute", left: 62, top: 100, color: "#e8e0d5" }}>GRAVITY LOCK // FAILED</div>
      <div style={{ ...edgeLabel, position: "absolute", right: 52, bottom: 88, color: "#a52b25", transform: "rotate(-90deg)", transformOrigin: "right bottom" }}>HUMAN IN TRANSIT</div>
    </AbsoluteFill>
  );
}

function ImpactBrace({ selfieSrc, specimenId }: Pick<CradleCompositionProps, "selfieSrc" | "specimenId">) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const arrival = spring({ frame, fps, config: { damping: 10, stiffness: 185 } });
  const recoil = frame < 20 ? interpolate(frame, [0, 5, 20], [130, -54, 0]) : Math.sin(frame / 3) * 5;
  const flash = frame < 8 ? interpolate(frame, [0, 2, 8], [0, 0.68, 0]) : 0;

  return (
    <AbsoluteFill style={{ alignItems: "center", display: "flex", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 52% 46%, transparent 20%, rgba(5,5,6,.5) 90%)" }} />
      <div style={{ transform: `translateX(${recoil}px) scale(${0.9 + arrival * 0.13})` }}>
        <LivingSpecimen selfieSrc={selfieSrc} specimenId={specimenId} mode="brace" />
      </div>
      <div style={{ position: "absolute", inset: 0, background: `rgba(232,224,213,${flash})`, mixBlendMode: "screen" }} />
      <div style={{ ...edgeLabel, position: "absolute", left: 68, bottom: 98, color: "#e8e0d5" }}>IMPACT RESPONSE // BRACE</div>
    </AbsoluteFill>
  );
}

function Containment({ selfieSrc, specimenId }: Pick<CradleCompositionProps, "selfieSrc" | "specimenId">) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const arrival = spring({ frame, fps, config: { damping: 14, stiffness: 145 } });
  const pulse = 1 + Math.sin(frame / 4) * 0.018;

  return (
    <AbsoluteFill style={{ alignItems: "center", display: "flex", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 48%, transparent 0 27%, rgba(5,5,6,.18) 48%, rgba(5,5,6,.58) 100%)" }} />
      <div style={{ position: "relative", width: 760, height: 760, borderRadius: "50%", overflow: "hidden", border: "5px solid rgba(232,224,213,.62)", boxShadow: "0 0 70px rgba(155,200,199,.28), inset 0 0 70px rgba(155,200,199,.22)", transform: `scale(${arrival * pulse})` }}>
        <div style={{ position: "absolute", left: 110, top: -64, transform: "scale(.98)" }}>
          <LivingSpecimen selfieSrc={selfieSrc} specimenId={specimenId} mode="contained" />
        </div>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 38% 28%, rgba(255,255,255,.2), transparent 23%), radial-gradient(circle, transparent 52%, rgba(5,5,6,.48) 83%)", mixBlendMode: "screen" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: interpolate(frame % 36, [0, 18, 36], [-30, 720, -30]), height: 54, background: "linear-gradient(180deg, transparent, rgba(155,200,199,.62), transparent)", mixBlendMode: "screen" }} />
      </div>
      <div style={{ position: "absolute", width: 860, height: 860, borderRadius: "50%", border: "3px dashed rgba(155,200,199,.6)", transform: `rotate(${frame * 1.5}deg)` }} />
      <div style={{ ...edgeLabel, position: "absolute", left: 68, bottom: 92, color: "#e8e0d5" }}>CONTAINMENT // {specimenId}</div>
      <div style={{ ...edgeLabel, position: "absolute", right: 68, top: 92, color: "#a52b25", transform: "rotate(90deg)", transformOrigin: "right top" }}>DO NOT RELEASE</div>
    </AbsoluteFill>
  );
}

function Climax({ selfieSrc, specimenId }: Pick<CradleCompositionProps, "selfieSrc" | "specimenId">) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 5, 35, 58], [0, 0.95, 0.7, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, 60], [0.7, 1.28]);
  return (
    <AbsoluteFill style={{ alignItems: "center", display: "flex", justifyContent: "center", opacity }}>
      <div style={{ transform: `translateY(${Math.sin(frame / 4) * 16}px) scale(${scale})`, filter: "contrast(1.25) saturate(.6) drop-shadow(0 0 42px rgba(165,43,37,.5))" }}>
        <LivingSpecimen selfieSrc={selfieSrc} specimenId={specimenId} mode="contained" />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(165,43,37,.22), transparent 40% 60%, rgba(155,200,199,.2))", mixBlendMode: "screen" }} />
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
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,5,6,.68), #050506 72%)", fontFamily: "Arial, Helvetica, sans-serif", opacity: flicker, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 48, border: "2px solid rgba(232,224,213,.16)" }} />
      <div style={{ position: "absolute", left: 88, right: 88, top: 118, display: "flex", justifyContent: "space-between", ...edgeLabel }}><span>CRADLE VERDICT</span><span>FINAL</span></div>
      <div style={{ position: "absolute", top: 170, left: 270, width: 540, height: 890, overflow: "hidden", transform: `translateY(${interpolate(arrival, [0, 1], [55, 0])}px) scale(.82)`, transformOrigin: "top center", opacity: arrival }}>
        <LivingSpecimen selfieSrc={selfieSrc} specimenId={specimenId} mode="verdict" />
      </div>
      <div style={{ position: "absolute", left: 58, right: 58, bottom: 185, textAlign: "center", opacity: arrival }}>
        <div style={{ ...edgeLabel }}>{`SPECIMEN #${specimenId} // BIO-SUIT SYNCHRONIZED`}</div>
        <div style={{ color: "#e8e0d5", fontSize: 92, fontWeight: 700, letterSpacing: -5, lineHeight: 1, marginTop: 30 }}>VERDICT:</div>
        <div style={{ color: dangerous ? "#b63831" : "#9bc8c7", fontSize: 116, fontWeight: 700, letterSpacing: -6, lineHeight: 1, marginTop: 12, textShadow: "0 0 48px currentColor" }}>{outcome}</div>
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
      <Sequence from={0} durationInFrames={60} name="Bio-suit assembly"><Assembly selfieSrc={selfieSrc} specimenId={specimenId} /></Sequence>
      <Sequence from={60} durationInFrames={90} name="Character descent"><Descent selfieSrc={selfieSrc} specimenId={specimenId} /></Sequence>
      <Sequence from={150} durationInFrames={90} name="Impact brace"><ImpactBrace selfieSrc={selfieSrc} specimenId={specimenId} /></Sequence>
      <Sequence from={240} durationInFrames={90} name="Character containment"><Containment selfieSrc={selfieSrc} specimenId={specimenId} /></Sequence>
      <Sequence from={330} durationInFrames={60} name="Climax glimpse"><Climax selfieSrc={selfieSrc} specimenId={specimenId} /></Sequence>
      <Sequence from={390} durationInFrames={60} name="Final verdict"><Verdict selfieSrc={selfieSrc} specimenId={specimenId} outcome={outcome} /></Sequence>
      <AbsoluteFill style={{ pointerEvents: "none", background: "repeating-linear-gradient(0deg, transparent 0 5px, rgba(255,255,255,.022) 6px)", mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};
