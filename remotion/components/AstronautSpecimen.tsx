import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";

type AstronautSpecimenProps = {
  selfieSrc: string;
  specimenId: string;
};

export function AstronautSpecimen({ selfieSrc, specimenId }: AstronautSpecimenProps) {
  const frame = useCurrentFrame();
  const breath = 1 + Math.sin(frame / 10) * 0.007;
  const faceShiftX = Math.sin(frame / 15) * 1.5;
  const faceShiftY = Math.cos(frame / 12) * 1.2;
  const signal = interpolate(Math.sin(frame / 4), [-1, 1], [0.35, 0.85]);

  return (
    <div
      style={{
        position: "relative",
        width: 480,
        height: 720,
        transform: `scaleY(${breath})`,
        transformOrigin: "50% 86%",
        filter: "drop-shadow(0 22px 28px rgba(0,0,0,.55))",
      }}
    >
      <Img
        src={staticFile("overlays/astronaut-specimen.png")}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", zIndex: 1 }}
      />

      <div
        style={{
          position: "absolute",
          zIndex: 2,
          left: 161,
          top: 34,
          width: 158,
          height: 158,
          overflow: "hidden",
          borderRadius: "48%",
          background: "#050506",
          transform: `translate(${faceShiftX}px, ${faceShiftY}px)`,
        }}
      >
        {selfieSrc ? (
          <Img
            src={selfieSrc}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "50% 36%",
              transform: "scale(1.48)",
              transformOrigin: "50% 36%",
              filter: "saturate(.82) contrast(1.08)",
            }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "radial-gradient(circle, #302a2a, #050506 72%)" }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(118deg, rgba(255,255,255,.16), transparent 24% 70%, rgba(155,200,199,.18)), radial-gradient(circle, transparent 52%, rgba(5,5,6,.52) 100%)" }} />
      </div>

      <div style={{ position: "absolute", zIndex: 3, left: 153, top: 26, width: 174, height: 174, borderRadius: "50%", border: "3px solid rgba(214,224,219,.44)", boxShadow: `inset 0 0 24px rgba(155,200,199,${signal}), 0 0 18px rgba(155,200,199,.2)` }} />
      <div style={{ position: "absolute", zIndex: 4, left: 207, top: 364, color: "rgba(230,224,214,.72)", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 9, letterSpacing: 2.3, transform: "rotate(-1deg)" }}>{specimenId}</div>
    </div>
  );
}
