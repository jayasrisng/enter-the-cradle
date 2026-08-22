import { spawnSync } from "node:child_process";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "../..");

function parseTimestamp(value) {
  if (/^\d+(\.\d+)?$/.test(value)) return Number(value);

  const parts = value.split(":").map(Number);
  if (
    parts.length < 2 ||
    parts.length > 3 ||
    parts.some((part) => !Number.isFinite(part) || part < 0)
  ) {
    throw new Error(`Invalid timestamp: ${value}`);
  }

  const [hours, minutes, seconds] =
    parts.length === 3 ? parts : [0, parts[0], parts[1]];
  if (minutes >= 60 || seconds >= 60) {
    throw new Error(`Invalid timestamp: ${value}`);
  }
  return hours * 3600 + minutes * 60 + seconds;
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
}

async function main() {
  const argumentsList = process.argv.slice(2);
  if (argumentsList[0] === "--") argumentsList.shift();
  const outputOptionIndex = argumentsList.indexOf("--output-dir");
  const outputDirectoryArgument =
    outputOptionIndex === -1
      ? "public/ride-clips"
      : argumentsList.splice(outputOptionIndex, 2)[1];

  if (!outputDirectoryArgument || argumentsList.length !== 4) {
    throw new Error(
      "Usage: pnpm media:extract -- <source> <start> <end> <output-name> [--output-dir <directory>]",
    );
  }

  const [sourceArgument, startArgument, endArgument, outputNameArgument] =
    argumentsList;
  const sourcePath = path.resolve(projectRoot, sourceArgument);
  const sourceStats = await stat(sourcePath).catch(() => null);
  if (!sourceStats?.isFile()) {
    throw new Error(`Source video not found: ${sourceArgument}`);
  }

  const start = parseTimestamp(startArgument);
  const end = parseTimestamp(endArgument);
  if (end <= start) {
    throw new Error("The end timestamp must be later than the start timestamp.");
  }

  const safeOutputName = path
    .basename(outputNameArgument, path.extname(outputNameArgument))
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!safeOutputName) {
    throw new Error("Output name must contain letters or numbers.");
  }

  const outputDirectory = path.resolve(projectRoot, outputDirectoryArgument);
  const outputPath = path.join(outputDirectory, `${safeOutputName}.mp4`);
  await mkdir(outputDirectory, { recursive: true });

  run("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-ss",
    String(start),
    "-i",
    sourcePath,
    "-t",
    String(end - start),
    "-map",
    "0:v:0",
    "-map",
    "0:a?",
    "-vf",
    "scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=30",
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "18",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-movflags",
    "+faststart",
    outputPath,
  ]);

  console.log(`Created ${path.relative(projectRoot, outputPath)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
