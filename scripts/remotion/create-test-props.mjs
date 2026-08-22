import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const selfiePath = path.join(projectRoot, "local-assets", "test-selfie.jpg");
const propsPath = path.join(projectRoot, "output", "personalized-test-props.json");

let selfie;
try {
  selfie = await readFile(selfiePath);
} catch {
  throw new Error(
    "Missing local-assets/test-selfie.jpg. Add an approved local JPEG before rendering the personalized test.",
  );
}

await mkdir(path.dirname(propsPath), { recursive: true });
await writeFile(
  propsPath,
  JSON.stringify({
    selfieSrc: `data:image/jpeg;base64,${selfie.toString("base64")}`,
    specimenId: "0317",
    outcome: "ASCENDED",
  }),
);

console.log(`Created ignored test props at ${propsPath}`);
