import { Composition } from "remotion";
import rideManifest from "../public/ride-clips/manifest.json";
import type { CradleCompositionProps } from "../lib/specimen";
import { CRADLE_DURATION_IN_FRAMES, CradleComposition } from "./compositions/CradleComposition";

export const RemotionRoot = () => {
  return (
    <Composition
      id="EnterTheCradle"
      component={CradleComposition}
      durationInFrames={CRADLE_DURATION_IN_FRAMES}
      fps={rideManifest.fps}
      width={rideManifest.width}
      height={rideManifest.height}
      defaultProps={
        {
          selfieSrc: "",
          specimenId: "0317",
          outcome: "ASCENDED",
        } satisfies CradleCompositionProps
      }
    />
  );
};
