"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties } from "react";

type Stage = "landing" | "upload" | "scanning" | "acquired";
type Outcome = "ACCEPTED" | "ASCENDED" | "CONSUMED" | "REJECTED";
type SpecimenIdentity = { specimenId: string; outcome: Outcome };

const SESSION_KEY = "enter-the-cradle:specimen";
const MAX_FILE_SIZE = 12 * 1024 * 1024;
const MAX_IMAGE_EDGE = 2048;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
const OUTCOMES: Outcome[] = ["ACCEPTED", "ASCENDED", "CONSUMED", "REJECTED"];
const diagnostics = [
  ["CRANIUM", "ACCEPTABLE"],
  ["MEMORIES", "QUESTIONABLE"],
  ["GOSSIP INDEX", "93%"],
  ["SURVIVAL", "4%"],
] as const;

function createIdentity(): SpecimenIdentity {
  const randomValues = new Uint32Array(2);
  crypto.getRandomValues(randomValues);
  return {
    specimenId: String(randomValues[0] % 10000).padStart(4, "0"),
    outcome: OUTCOMES[randomValues[1] % OUTCOMES.length],
  };
}

function getSessionIdentity(): SpecimenIdentity {
  const storedIdentity = sessionStorage.getItem(SESSION_KEY);
  if (storedIdentity) {
    try {
      const parsedIdentity = JSON.parse(storedIdentity) as SpecimenIdentity;
      if (/^\d{4}$/.test(parsedIdentity.specimenId)) return parsedIdentity;
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }
  const identity = createIdentity();
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(identity));
  return identity;
}

function fileExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Image conversion failed."))),
      "image/jpeg",
      0.9,
    );
  });
}

async function decodeImage(file: File) {
  if ("createImageBitmap" in window) {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return {
        source: bitmap as CanvasImageSource,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close(),
      };
    } catch {
      // Fall through to the image-element decoder used by older Safari versions.
    }
  }

  const sourceUrl = URL.createObjectURL(file);
  const image = new window.Image();
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Image decoding failed."));
      image.src = sourceUrl;
    });
    return {
      source: image as CanvasImageSource,
      width: image.naturalWidth,
      height: image.naturalHeight,
      release: () => URL.revokeObjectURL(sourceUrl),
    };
  } catch (error) {
    URL.revokeObjectURL(sourceUrl);
    throw error;
  }
}

async function normalizeImage(file: File) {
  const image = await decodeImage(file);
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    image.release();
    throw new Error("This browser could not prepare the image.");
  }
  canvas.width = width;
  canvas.height = height;
  context.fillStyle = "#050506";
  context.fillRect(0, 0, width, height);
  context.drawImage(image.source, 0, 0, width, height);
  image.release();
  return canvasToBlob(canvas);
}

export function SpecimenExperience() {
  const [stage, setStage] = useState<Stage>("landing");
  const [identity, setIdentity] = useState<SpecimenIdentity | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [normalizedSelfie, setNormalizedSelfie] = useState<Blob | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPreparingImage, setIsPreparingImage] = useState(false);
  const [entryAcknowledged, setEntryAcknowledged] = useState(false);
  const previewUrlRef = useRef<string | null>(null);
  const scanTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      if (scanTimerRef.current) window.clearTimeout(scanTimerRef.current);
    };
  }, []);

  function beginIntake() {
    setIdentity(getSessionIdentity());
    setStage("upload");
  }

  async function handleImageSelection(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploadError(null);
    const extension = fileExtension(file.name);
    const isHeic = ["heic", "heif"].includes(extension) || ["image/heic", "image/heif"].includes(file.type);
    if (isHeic) {
      setUploadError("HEIC/HEIF is not supported yet. On iPhone, choose Most Compatible or upload a JPEG, PNG, or WebP image.");
      return;
    }
    if (!ALLOWED_TYPES.has(file.type) && !ALLOWED_EXTENSIONS.has(extension)) {
      setUploadError("Choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("That image is larger than 12 MB. Choose a smaller selfie.");
      return;
    }
    setIsPreparingImage(true);
    try {
      const normalizedImage = await normalizeImage(file);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      const nextPreviewUrl = URL.createObjectURL(normalizedImage);
      previewUrlRef.current = nextPreviewUrl;
      setPreviewUrl(nextPreviewUrl);
      setNormalizedSelfie(normalizedImage);
    } catch {
      setUploadError("The image could not be read. Try exporting it as a standard JPEG and upload it again.");
    } finally {
      setIsPreparingImage(false);
    }
  }

  function processSpecimen() {
    if (!normalizedSelfie || !previewUrl) return;
    setEntryAcknowledged(false);
    setStage("scanning");
    scanTimerRef.current = window.setTimeout(() => {
      setStage("acquired");
      scanTimerRef.current = null;
    }, 3600);
  }

  function resetSelfie() {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setPreviewUrl(null);
    setNormalizedSelfie(null);
    setUploadError(null);
  }

  return (
    <main className="experience-shell">
      <div className="atmosphere atmosphere-red" aria-hidden="true" />
      <div className="atmosphere atmosphere-cyan" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <header className="system-header">
        <span>NIIRO // CRADLE INTERFACE</span>
        <span className="system-status"><i aria-hidden="true" /> LOCAL LINK</span>
      </header>

      <section className={`experience-stage stage-${stage}`}>
        {stage === "landing" && (
          <div className="screen screen-landing">
            <div className="machine-mark" aria-hidden="true"><span /><span /><span /></div>
            <p className="overline">INTAKE PROTOCOL 01</p>
            <h1>THE CRADLE REQUIRES A HUMAN.</h1>
            <p className="screen-note">Identity is processed on this device.</p>
            <button className="primary-action" type="button" onClick={beginIntake}><span>BEGIN</span><b aria-hidden="true">↘</b></button>
          </div>
        )}

        {stage === "upload" && (
          <div className="screen screen-upload">
            <div className="screen-heading">
              <p className="overline">HUMAN MATERIAL REQUIRED</p>
              <h1>OFFER YOUR FACE.</h1>
              <p>One clear, front-facing image. It never leaves this device.</p>
            </div>
            <div className={`selfie-port ${previewUrl ? "has-image" : ""}`}>
              {previewUrl ? (
                <Image src={previewUrl} alt="Selected selfie preview" fill sizes="(max-width: 640px) 76vw, 360px" unoptimized style={{ objectFit: "cover" }} />
              ) : (
                <div className="port-empty" aria-hidden="true"><div className="face-guide"><span className="guide-eye guide-eye-left" /><span className="guide-eye guide-eye-right" /></div><span>ALIGN HUMAN FACE</span></div>
              )}
              <span className="corner corner-one" /><span className="corner corner-two" /><span className="corner corner-three" /><span className="corner corner-four" />
            </div>
            <div className="upload-actions">
              <label className="secondary-action" htmlFor="selfie-upload">{isPreparingImage ? "PREPARING IMAGE…" : previewUrl ? "CHOOSE ANOTHER" : "SELECT SELFIE"}</label>
              <input id="selfie-upload" className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={handleImageSelection} disabled={isPreparingImage} />
              {previewUrl && <button className="text-action" type="button" onClick={resetSelfie}>REMOVE</button>}
            </div>
            {uploadError && <p className="upload-error" role="alert">{uploadError}</p>}
            <button className="primary-action" type="button" onClick={processSpecimen} disabled={!normalizedSelfie || isPreparingImage}><span>PROCESS SPECIMEN</span><b aria-hidden="true">↘</b></button>
          </div>
        )}

        {stage === "scanning" && previewUrl && (
          <div className="screen screen-scan" aria-live="polite">
            <p className="overline">ANALYSIS IN PROGRESS</p>
            <div className="scanner">
              <div className="scanner-orbit orbit-outer" /><div className="scanner-orbit orbit-inner" />
              <div className="scanner-image"><Image src={previewUrl} alt="Selfie being analyzed" fill sizes="(max-width: 640px) 64vw, 330px" unoptimized style={{ objectFit: "cover" }} /><div className="scan-beam" aria-hidden="true" /></div>
              <span className="scanner-tick tick-one" /><span className="scanner-tick tick-two" /><span className="scanner-tick tick-three" /><span className="scanner-tick tick-four" />
            </div>
            <div className="diagnostics">
              {diagnostics.map(([label, value], index) => (
                <div key={label} style={{ "--row-delay": `${index * 0.38}s` } as CSSProperties}><span>{label}</span><i aria-hidden="true" /><strong>{value}</strong></div>
              ))}
            </div>
            <p className="specimen-number">SPECIMEN #{identity?.specimenId ?? "----"}</p>
          </div>
        )}

        {stage === "acquired" && previewUrl && (
          <div className="screen screen-acquired">
            <p className="overline">INTAKE COMPLETE</p>
            <div className="acquired-portrait"><Image src={previewUrl} alt="Acquired specimen portrait" fill sizes="(max-width: 640px) 44vw, 240px" unoptimized style={{ objectFit: "cover" }} /><div className="portrait-reticle" aria-hidden="true" /></div>
            <p className="specimen-number">SPECIMEN #{identity?.specimenId ?? "----"}</p>
            <h1>SPECIMEN ACQUIRED</h1>
            <p className="ready-question">READY TO ENTER THE CRADLE?</p>
            <button className="primary-action" type="button" onClick={() => setEntryAcknowledged(true)}><span>{entryAcknowledged ? "CRADLE LINK READY" : "ENTER THE CRADLE"}</span><b aria-hidden="true">↘</b></button>
            {entryAcknowledged && <p className="handoff-status" role="status">RIDE CONNECTION RESERVED // PERSONALIZATION FOLLOWS</p>}
          </div>
        )}
      </section>

      <footer className="system-footer"><span>SESSION // {identity?.specimenId ?? "UNASSIGNED"}</span><span>NO NETWORK TRANSFER</span></footer>
    </main>
  );
}
