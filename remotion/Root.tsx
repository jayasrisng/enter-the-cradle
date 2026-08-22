import { Composition } from "remotion";
import rideManifest from "../public/ride-clips/manifest.json";
import { CradleComposition } from "./compositions/CradleComposition";

export const RemotionRoot = () => {
  return (
    <Composition
      id="EnterTheCradle"
      component={CradleComposition}
      durationInFrames={Math.round(
        rideManifest.durationSeconds * rideManifest.fps,
      )}
      fps={rideManifest.fps}
      width={rideManifest.width}
      height={rideManifest.height}
    />
  );
};
