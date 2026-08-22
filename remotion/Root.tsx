import { Composition } from "remotion";
import { CradleComposition } from "./compositions/CradleComposition";

export const RemotionRoot = () => {
  return (
    <Composition
      id="EnterTheCradle"
      component={CradleComposition}
      durationInFrames={90}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
