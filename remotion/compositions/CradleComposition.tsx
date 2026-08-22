import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const CradleComposition = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 18, 72, 89], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        backgroundColor: "#050506",
        color: "#e6e0d6",
        display: "flex",
        fontFamily: "Arial, Helvetica, sans-serif",
        justifyContent: "center",
      }}
    >
      <div style={{ opacity, textAlign: "center" }}>
        <div
          style={{
            color: "#8dbfc1",
            fontSize: 22,
            letterSpacing: 8,
            marginBottom: 42,
          }}
        >
          NIIRO // SYSTEM TEST
        </div>
        <div style={{ fontSize: 88, letterSpacing: -5 }}>ENTER THE CRADLE</div>
      </div>
    </AbsoluteFill>
  );
};
