import { spawnSync } from "node:child_process";
import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "../..");
const supportedExtensions = new Set([
  ".avi",
  ".m4v",
  ".mkv",
  ".mov",
  ".mp4",
  ".mpeg",
  ".mpg",
  ".webm",
]);

function readOption(name, fallback) {
  const optionIndex = process.argv.indexOf(name);
  return optionIndex === -1 ? fallback : process.argv[optionIndex + 1];
}

function run(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.status !== 0) {
    throw new Error(
      `${command} failed:\n${result.stderr.trim() || result.stdout.trim()}`,
    );
  }

  return result.stdout;
}

function parseFrameRate(value) {
  if (!value || value === "0/0") return null;
  const [numerator, denominator = "1"] = value.split("/").map(Number);
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return null;
  }
  return Number((numerator / denominator).toFixed(3));
}

function safeDirectoryName(filename) {
  return path
    .basename(filename, path.extname(filename))
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "video";
}

function projectRelative(filePath) {
  return path.relative(projectRoot, filePath).split(path.sep).join("/");
}

async function analyzeVideo(sourceDirectory, outputDirectory, filename, frameCount) {
  const sourcePath = path.join(sourceDirectory, filename);
  const probe = JSON.parse(
    run("ffprobe", [
      "-v",
      "error",
      "-show_streams",
      "-show_format",
      "-of",
      "json",
      sourcePath,
    ]),
  );

  const videoStream = probe.streams.find((stream) => stream.codec_type === "video");
  const audioStream = probe.streams.find((stream) => stream.codec_type === "audio");
  const duration = Number(probe.format?.duration ?? videoStream?.duration);

  if (!videoStream || !Number.isFinite(duration) || duration <= 0) {
    throw new Error(`Could not read a valid video stream from ${filename}`);
  }

  const analysisDirectory = path.join(outputDirectory, safeDirectoryName(filename));
  const framesDirectory = path.join(analysisDirectory, "frames");
  await mkdir(framesDirectory, { recursive: true });

  const oldFrames = (await readdir(framesDirectory)).filter((file) =>
    /^frame-\d+\.jpg$/i.test(file),
  );
  for (const oldFrame of oldFrames) {
    await unlink(path.join(framesDirectory, oldFrame));
  }

  const frameTimestamps = Array.from({ length: frameCount }, (_, index) =>
    Number((((index + 0.5) / frameCount) * duration).toFixed(3)),
  );

  for (const [index, timestamp] of frameTimestamps.entries()) {
    const framePath = path.join(
      framesDirectory,
      `frame-${String(index + 1).padStart(3, "0")}.jpg`,
    );
    run("ffmpeg", [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-ss",
      String(timestamp),
      "-i",
      sourcePath,
      "-frames:v",
      "1",
      "-vf",
      "scale=640:360:force_original_aspect_ratio=decrease,pad=640:360:(ow-iw)/2:(oh-ih)/2:color=0x050506",
      "-q:v",
      "2",
      framePath,
    ]);
  }

  const columns = Math.min(4, frameCount);
  const rows = Math.ceil(frameCount / columns);
  const contactSheetPath = path.join(analysisDirectory, "contact-sheet.jpg");
  run("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-framerate",
    "1",
    "-start_number",
    "1",
    "-i",
    path.join(framesDirectory, "frame-%03d.jpg"),
    "-frames:v",
    "1",
    "-vf",
    `tile=${columns}x${rows}:padding=8:margin=8:color=0x050506`,
    "-q:v",
    "2",
    contactSheetPath,
  ]);

  return {
    filename,
    sourcePath: projectRelative(sourcePath),
    durationSeconds: Number(duration.toFixed(3)),
    resolution: {
      width: videoStream.width,
      height: videoStream.height,
    },
    fps: parseFrameRate(videoStream.avg_frame_rate || videoStream.r_frame_rate),
    videoCodec: videoStream.codec_name ?? null,
    audioCodec: audioStream?.codec_name ?? null,
    frameTimestamps,
    framesDirectory: projectRelative(framesDirectory),
    contactSheetPath: projectRelative(contactSheetPath),
  };
}

async function main() {
  run("ffmpeg", ["-version"]);
  run("ffprobe", ["-version"]);

  const sourceDirectory = path.resolve(
    projectRoot,
    readOption("--source", "local-assets/source"),
  );
  const outputDirectory = path.resolve(
    projectRoot,
    readOption("--output", "output/media-analysis"),
  );
  const frameCount = Number.parseInt(readOption("--frames", "12"), 10);

  if (!Number.isInteger(frameCount) || frameCount < 1 || frameCount > 40) {
    throw new Error("--frames must be an integer between 1 and 40");
  }

  await mkdir(sourceDirectory, { recursive: true });
  await mkdir(outputDirectory, { recursive: true });

  const sourceFiles = (await readdir(sourceDirectory))
    .filter((filename) => supportedExtensions.has(path.extname(filename).toLowerCase()))
    .sort((a, b) => a.localeCompare(b));

  const videos = [];
  for (const filename of sourceFiles) {
    console.log(`Analyzing ${filename}...`);
    videos.push(
      await analyzeVideo(sourceDirectory, outputDirectory, filename, frameCount),
    );
  }

  const manifestPath = path.join(outputDirectory, "manifest.json");
  await writeFile(
    manifestPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        sourceDirectory: projectRelative(sourceDirectory),
        videos,
      },
      null,
      2,
    )}\n`,
  );

  if (videos.length === 0) {
    console.log(`No source videos found in ${projectRelative(sourceDirectory)}.`);
  } else {
    console.log(`Analyzed ${videos.length} video${videos.length === 1 ? "" : "s"}.`);
  }
  console.log(`Manifest: ${projectRelative(manifestPath)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
