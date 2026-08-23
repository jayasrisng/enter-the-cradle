import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";

export type AstronautPose = "standing" | "kneeling" | "prone";

type AstronautSpecimenProps = {
  selfieSrc: string;
  specimenId: string;
  pose?: AstronautPose;
  lookX?: number;
};

const poses = {
  standing: {
    src: "overlays/astronaut-specimen.png",
    width: 480,
    height: 720,
    face: { left: 186, top: 30, width: 108, height: 70, rotate: 0, imageScale: 1.45 },
    id: { left: 207, top: 364 },
  },
  kneeling: {
    src: "overlays/astronaut-kneel.png",
    width: 480,
    height: 720,
    face: { left: 181, top: 60, width: 120, height: 105, rotate: 0, imageScale: 1.45 },
    id: { left: 218, top: 376 },
  },
  prone: {
    src: "overlays/astronaut-prone.png",
    width: 900,
    height: 600,
    face: { left: 613, top: 115, width: 128, height: 106, rotate: 3, imageScale: 1.45 },
    id: { left: 499, top: 350 },
  },
} as const;

export function AstronautSpecimen({ selfieSrc, specimenId, pose = "standing", lookX = 0 }: AstronautSpecimenProps) {
  const frame = useCurrentFrame();
  const config = poses[pose];
  const breath = 1 + Math.sin(frame / 10) * 0.005;
  const faceShiftX = Math.sin(frame / 15) * 0.8 + lookX;
  const faceShiftY = Math.cos(frame / 12) * 0.6;
  const signal = interpolate(Math.sin(frame / 4), [-1, 1], [0.24, 0.58]);

  return (
    <div
      style={{
        position: "relative",
        width: config.width,
        height: config.height,
        transform: `scaleY(${breath})`,
        transformOrigin: "50% 92%",
        filter: "drop-shadow(0 18px 22px rgba(0,0,0,.62))",
      }}
    >
      <Img
        src={staticFile(config.src)}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", zIndex: 1 }}
      />

      <div
        style={{
          position: "absolute",
          zIndex: 2,
          left: config.face.left,
          top: config.face.top,
          width: config.face.width,
          height: config.face.height,
          overflow: "hidden",
          clipPath: "ellipse(46% 44% at 50% 50%)",
          background: "#050506",
          transform: `translate(${faceShiftX}px, ${faceShiftY}px) rotate(${config.face.rotate}deg)`,
          boxShadow: `inset 0 0 20px rgba(155,200,199,${signal})`,
        }}
      >
        {selfieSrc ? (
          <Img
            src={selfieSrc}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "72% 25%",
              transform: `scale(${config.face.imageScale})`,
              transformOrigin: "50% 42%",
              filter: "saturate(.82) contrast(1.06)",
            }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "radial-gradient(circle, #302a2a, #050506 72%)" }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(118deg, rgba(255,255,255,.18), transparent 23% 72%, rgba(155,200,199,.2)), radial-gradient(ellipse, transparent 55%, rgba(5,5,6,.58) 100%)" }} />
      </div>

      <div style={{ position: "absolute", zIndex: 4, left: config.id.left, top: config.id.top, color: "rgba(230,224,214,.72)", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 9, letterSpacing: 2.3 }}>{specimenId}</div>
    </div>
  );
}
