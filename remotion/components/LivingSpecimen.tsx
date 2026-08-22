import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { CSSProperties } from "react";

type CharacterMode = "assembly" | "descent" | "brace" | "contained" | "verdict";

type LivingSpecimenProps = {
  selfieSrc: string;
  specimenId: string;
  mode: CharacterMode;
};

const bone = "#ded7cc";
const navy = "#111a2a";
const red = "#9f2f29";
const cyan = "#9bc8c7";

function FacePlate({ selfieSrc }: { selfieSrc: string }) {
  return (
    <div style={{ position: "absolute", inset: 20, overflow: "hidden", borderRadius: "44% 44% 40% 40%", background: "#151112" }}>
      {selfieSrc ? (
        <Img src={selfieSrc} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(.72) contrast(1.08)" }} />
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#77716a", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 16, letterSpacing: 4 }}>HUMAN</div>
      )}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(112deg, rgba(255,255,255,.22), transparent 23% 66%, rgba(155,200,199,.2)), radial-gradient(circle at 50% 42%, transparent 38%, rgba(5,5,6,.45) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: "48%", height: 2, background: "rgba(155,200,199,.55)", boxShadow: "0 0 18px rgba(155,200,199,.8)" }} />
    </div>
  );
}

function SuitPanel({ style }: { style: CSSProperties }) {
  return <div style={{ position: "absolute", background: bone, border: "3px solid rgba(25,22,23,.7)", boxShadow: "inset 0 -20px 28px rgba(30,24,25,.25), 0 10px 24px rgba(0,0,0,.34)", ...style }} />;
}

export function LivingSpecimen({ selfieSrc, specimenId, mode }: LivingSpecimenProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrance = spring({ frame, fps, config: { damping: 17, stiffness: 125 } });
  const breath = 1 + Math.sin(frame / 9) * 0.018;
  const urgency = mode === "brace" || mode === "contained" ? 2.2 : 1;
  const headTurn = Math.sin(frame / 11) * 3.5 * urgency;
  const headBob = Math.sin(frame / 7) * 5 * urgency;
  const torsoTilt = mode === "descent" ? Math.sin(frame / 8) * 7 : mode === "brace" ? -10 + Math.sin(frame / 3) * 2.5 : Math.sin(frame / 20) * 1.8;
  const leftArm = mode === "brace" ? -58 + Math.sin(frame / 4) * 5 : mode === "descent" ? -18 + Math.sin(frame / 6) * 14 : -5;
  const rightArm = mode === "brace" ? 54 - Math.cos(frame / 4) * 5 : mode === "descent" ? 22 - Math.cos(frame / 6) * 14 : 5;
  const assemblyClip = mode === "assembly" ? interpolate(frame, [0, 42], [100, 0], { extrapolateRight: "clamp" }) : 0;
  const shakeX = mode === "contained" ? Math.sin(frame * 1.8) * 7 : 0;
  const shakeY = mode === "contained" ? Math.cos(frame * 1.35) * 5 : 0;
  const descentSpin = mode === "descent" ? interpolate(frame, [0, 90], [-12, 16], { extrapolateRight: "clamp" }) : 0;
  const glow = 0.55 + Math.sin(frame / 5) * 0.28;

  return (
    <div
      style={{
        position: "relative",
        width: 540,
        height: 900,
        opacity: entrance,
        clipPath: `inset(${assemblyClip}% 0 0 0)`,
        transform: `translate(${shakeX}px, ${shakeY}px) rotate(${torsoTilt + descentSpin}deg) scale(${entrance})`,
        transformOrigin: "50% 62%",
        filter: mode === "contained" && frame % 31 < 3 ? "blur(2px) contrast(1.3)" : "none",
      }}
    >
      <div style={{ position: "absolute", left: 49, top: 360, width: 86, height: 370, transform: `rotate(${leftArm}deg)`, transformOrigin: "70% 5%" }}>
        <SuitPanel style={{ inset: 0, clipPath: "polygon(18% 0, 92% 5%, 72% 100%, 0 94%)", borderRadius: "38px 22px 55px 36px" }} />
        <div style={{ position: "absolute", left: 18, top: 120, width: 48, height: 160, background: navy, border: "3px solid #2f3642", borderRadius: 30 }} />
      </div>
      <div style={{ position: "absolute", right: 49, top: 360, width: 86, height: 370, transform: `rotate(${rightArm}deg)`, transformOrigin: "30% 5%" }}>
        <SuitPanel style={{ inset: 0, clipPath: "polygon(8% 5%, 82% 0, 100% 94%, 28% 100%)", borderRadius: "22px 38px 36px 55px" }} />
        <div style={{ position: "absolute", right: 18, top: 120, width: 48, height: 160, background: navy, border: "3px solid #2f3642", borderRadius: 30 }} />
      </div>

      <div style={{ position: "absolute", left: 72, top: 320, width: 396, height: 500, transform: `scaleY(${breath})`, transformOrigin: "50% 0" }}>
        <SuitPanel style={{ left: 0, top: 0, width: 396, height: 190, clipPath: "polygon(12% 0, 88% 0, 100% 45%, 81% 100%, 19% 100%, 0 45%)", borderRadius: 70 }} />
        <div style={{ position: "absolute", left: 68, top: 102, width: 260, height: 356, background: `linear-gradient(90deg, ${navy}, #202941 48%, ${navy})`, border: "5px solid #22242a", clipPath: "polygon(9% 0, 91% 0, 100% 100%, 0 100%)", boxShadow: "inset 0 0 60px rgba(0,0,0,.48)" }} />
        <SuitPanel style={{ left: 78, top: 78, width: 92, height: 260, clipPath: "polygon(0 0, 100% 12%, 78% 100%, 8% 88%)", borderRadius: 18 }} />
        <SuitPanel style={{ right: 78, top: 78, width: 92, height: 260, clipPath: "polygon(0 12%, 100% 0, 92% 88%, 22% 100%)", borderRadius: 18 }} />
        <div style={{ position: "absolute", left: 183, top: 135, width: 30, height: 270, background: red, boxShadow: "0 0 20px rgba(159,47,41,.55)", clipPath: "polygon(25% 0, 75% 0, 100% 100%, 0 100%)" }} />
        <div style={{ position: "absolute", left: 151, top: 170, width: 94, height: 94, borderRadius: "50%", background: "#17191e", border: `6px solid ${bone}`, boxShadow: `0 0 ${35 + glow * 25}px rgba(155,200,199,${glow})` }}>
          <div style={{ position: "absolute", inset: 18, borderRadius: "50%", background: cyan, opacity: glow, boxShadow: "0 0 24px #9bc8c7" }} />
        </div>
        <div style={{ position: "absolute", left: 103, top: 294, color: "rgba(232,224,213,.78)", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 15, letterSpacing: 4 }}>{`SPECIMEN // ${specimenId}`}</div>
        <div style={{ position: "absolute", left: 132, bottom: -55, width: 132, height: 120, background: navy, border: "5px solid #232832", clipPath: "polygon(8% 0, 92% 0, 76% 100%, 24% 100%)" }} />
      </div>

      <div style={{ position: "absolute", left: 176, top: 266, width: 188, height: 104, borderRadius: "24px 24px 70px 70px", background: bone, border: "5px solid #2a2526", boxShadow: "inset 0 12px 20px rgba(255,255,255,.16)" }} />

      <div style={{ position: "absolute", left: 150, top: 25, width: 240, height: 300, transform: `translateY(${headBob}px) rotate(${headTurn}deg)`, transformOrigin: "50% 88%" }}>
        <div style={{ position: "absolute", inset: -20, border: `8px solid ${bone}`, borderTopColor: red, borderRadius: "48% 48% 42% 42%", boxShadow: "0 0 34px rgba(0,0,0,.6), inset 0 0 25px rgba(155,200,199,.18)" }} />
        <div style={{ position: "absolute", inset: -42, border: "3px dashed rgba(155,200,199,.6)", borderRadius: "50%", transform: `rotate(${frame * 0.8}deg)`, opacity: mode === "assembly" || mode === "contained" ? 1 : 0.35 }} />
        <FacePlate selfieSrc={selfieSrc} />
        <div style={{ position: "absolute", left: -34, top: 94, width: 38, height: 116, borderRadius: "18px 4px 4px 18px", background: red, border: "4px solid #292426" }} />
        <div style={{ position: "absolute", right: -34, top: 94, width: 38, height: 116, borderRadius: "4px 18px 18px 4px", background: red, border: "4px solid #292426" }} />
      </div>

      <div style={{ position: "absolute", left: 108, top: 252, width: 146, height: 190, borderTop: `7px solid ${red}`, borderLeft: "4px solid rgba(155,200,199,.55)", borderRadius: "70% 0 0 0", transform: `rotate(${Math.sin(frame / 8) * 3}deg)`, transformOrigin: "100% 100%" }} />
      <div style={{ position: "absolute", right: 106, top: 252, width: 142, height: 210, borderTop: `7px solid ${red}`, borderRight: "4px solid rgba(155,200,199,.55)", borderRadius: "0 70% 0 0", transform: `rotate(${-Math.cos(frame / 8) * 3}deg)`, transformOrigin: "0 100%" }} />

      <div style={{ position: "absolute", left: 64, right: 64, bottom: 6, display: "flex", justifyContent: "space-between" }}>
        <div style={{ width: 180, height: 108, background: navy, border: "5px solid #242933", clipPath: "polygon(5% 0, 95% 0, 82% 100%, 0 100%)" }} />
        <div style={{ width: 180, height: 108, background: navy, border: "5px solid #242933", clipPath: "polygon(5% 0, 95% 0, 100% 100%, 18% 100%)" }} />
      </div>

      <div style={{ position: "absolute", inset: -28, border: `2px solid rgba(155,200,199,${mode === "contained" ? 0.55 : 0.15})`, borderRadius: "48%", transform: `rotate(${frame * 0.45}deg)`, pointerEvents: "none" }} />
    </div>
  );
}
