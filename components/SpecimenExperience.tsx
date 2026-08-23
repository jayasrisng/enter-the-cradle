"use client";

import Image from "next/image";
import { Player } from "@remotion/player";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties } from "react";
import { SPECIMEN_OUTCOMES } from "@/lib/specimen";
import type { SpecimenOutcome } from "@/lib/specimen";
import { CRADLE_DURATION_IN_FRAMES, CradleComposition } from "@/remotion/compositions/CradleComposition";

type Stage = "landing" | "upload" | "scanning" | "acquired" | "ride";
type SpecimenIdentity = { specimenId: string; outcome: SpecimenOutcome };

const SESSION_KEY = "enter-the-cradle:specimen";
const MAX_FILE_SIZE = 12 * 1024 * 1024;
const MAX_IMAGE_EDGE = 2048;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
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
    outcome: SPECIMEN_OUTCOMES[randomValues[1] % SPECIMEN_OUTCOMES.length],
  };
}

function getSessionIdentity(): SpecimenIdentity {
  const storedIdentity = sessionStorage.getItem(SESSION_KEY);
  if (storedIdentity) {
    try {
      const parsedIdentity = JSON.parse(storedIdentity) as SpecimenIdentity;
      if (
        /^\d{4}$/.test(parsedIdentity.specimenId) &&
        SPECIMEN_OUTCOMES.includes(parsedIdentity.outcome)
      ) return parsedIdentity;
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
  const cropSize = Math.max(1, Math.round(Math.min(image.width, image.height) * 0.58));
  const cropX = Math.max(0, Math.round((image.width - cropSize) / 2));
  const targetFaceY = image.height * (image.height > image.width ? 0.35 : 0.45);
  const cropY = Math.max(0, Math.min(image.height - cropSize, Math.round(targetFaceY - cropSize / 2)));
  const outputSize = Math.min(MAX_IMAGE_EDGE, 1200);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    image.release();
    throw new Error("This browser could not prepare the image.");
  }
  canvas.width = outputSize;
  canvas.height = outputSize;
  context.fillStyle = "#050506";
  context.fillRect(0, 0, outputSize, outputSize);
  context.drawImage(image.source, cropX, cropY, cropSize, cropSize, 0, 0, outputSize, outputSize);
  image.release();
  return canvasToBlob(canvas);
}

export function SpecimenExperience() {
  const [stage, setStage] = useState<Stage>("landing");
  const [identity, setIdentity] = useState<SpecimenIdentity | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [normalizedSelfie, setNormalizedSelfie] = useState<Blob | null>(null);
  const [shareStatus, setShareStatus] = useState("");
  const [isRenderingVideo, setIsRenderingVideo] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPreparingImage, setIsPreparingImage] = useState(false);
  const [rideRun, setRideRun] = useState(0);
  const previewUrlRef = useRef<string | null>(null);
  const renderedVideoRef = useRef<Blob | null>(null);
  const cameraPreviewRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  async function renderPersonalizedVideo() {
    if (renderedVideoRef.current) return renderedVideoRef.current;
    if (!previewUrl || !identity) throw new Error("Specimen unavailable.");
    setIsRenderingVideo(true);
    setShareStatus("PREPARING VIDEO // 0%");
    try {
      const { canRenderMediaOnWeb, renderMediaOnWeb } = await import("@remotion/web-renderer");
      const support = await canRenderMediaOnWeb({ container: "mp4", videoCodec: "h264", audioCodec: "aac", width: 540, height: 960 });
      if (!support.canRender) throw new Error(support.issues.map((issue) => issue.message).join(" "));
      const result = await renderMediaOnWeb({
        composition: {
          component: CradleComposition,
          id: "EnterTheCradleDownload",
          width: 1080,
          height: 1920,
          fps: 30,
          durationInFrames: CRADLE_DURATION_IN_FRAMES,
          defaultProps: { selfieSrc: previewUrl, specimenId: identity.specimenId, outcome: identity.outcome },
        },
        inputProps: { selfieSrc: previewUrl, specimenId: identity.specimenId, outcome: identity.outcome },
        container: "mp4",
        videoCodec: "h264",
        audioCodec: "aac",
        videoBitrate: "medium",
        audioBitrate: "medium",
        hardwareAcceleration: "prefer-hardware",
        scale: 0.5,
        onProgress: ({ progress }) => setShareStatus(`PREPARING VIDEO // ${Math.round(progress * 100)}%`),
      });
      const blob = await result.getBlob();
      renderedVideoRef.current = blob;
      setShareStatus("VIDEO READY");
      return blob;
    } finally {
      setIsRenderingVideo(false);
    }
  }

  async function downloadSpecimenVideo() {
    try {
      const blob = await renderPersonalizedVideo();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `enter-the-cradle-${identity?.specimenId ?? "specimen"}.mp4`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setShareStatus("PERSONALIZED VIDEO DOWNLOADED");
    } catch {
      setShareStatus("THIS BROWSER CANNOT ENCODE VIDEO — OPEN THIS PAGE IN CHROME TO DOWNLOAD");
    }
  }

  async function shareExperienceLink(text: string) {
    if (navigator.share) {
      await navigator.share({ title: "Enter the Cradle", text, url: window.location.href });
      setShareStatus("EXPERIENCE LINK SHARED");
      return;
    }
    await navigator.clipboard.writeText(`${text} ${window.location.href}`);
    setShareStatus("EXPERIENCE LINK COPIED");
  }

  async function shareSpecimen() {
    const text = `Human detected at the Pomegranate premiere show — Specimen #${identity?.specimenId}.`;
    try {
      if (!renderedVideoRef.current) {
        try {
          await renderPersonalizedVideo();
          setShareStatus("VIDEO READY — TAP SHARE AGAIN");
          return;
        } catch {
          await shareExperienceLink(text);
          return;
        }
      }
      const file = new File([renderedVideoRef.current], `enter-the-cradle-${identity?.specimenId}.mp4`, { type: "video/mp4" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: "Enter the Cradle", text, files: [file] });
      } else if (navigator.share) {
        await navigator.share({ title: "Enter the Cradle", text, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(`${text} ${window.location.href}`);
        setShareStatus("SHARE LINK COPIED");
        return;
      }
      setShareStatus("VIDEO TRANSMISSION SHARED");
    } catch (error) {
      if ((error as Error).name !== "AbortError") setShareStatus("SHARE FAILED — TRY AGAIN");
    }
  }
  const scanTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      if (scanTimerRef.current) window.clearTimeout(scanTimerRef.current);
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    const video = cameraPreviewRef.current;
    const stream = cameraStreamRef.current;
    if (!isCameraOpen || !video || !stream) return;
    video.srcObject = stream;
    void video.play();
  }, [isCameraOpen]);

  function beginIntake() {
    setIdentity(getSessionIdentity());
    setStage("upload");
  }

  function stopCamera() {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    if (cameraPreviewRef.current) cameraPreviewRef.current.srcObject = null;
    setIsCameraOpen(false);
  }

  async function openCamera() {
    setUploadError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setUploadError("Live camera is unavailable in this browser. Use Choose Photo instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: "user", width: { ideal: 1080 }, height: { ideal: 1350 } },
      });
      cameraStreamRef.current = stream;
      setIsCameraOpen(true);
    } catch {
      stopCamera();
      setUploadError("Camera access was blocked. Allow camera permission, or use Choose Photo.");
    }
  }

  async function prepareImage(file: File) {
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
      applyPreparedImage(normalizedImage);
    } catch {
      setUploadError("The image could not be read. Try exporting it as a standard JPEG and upload it again.");
    } finally {
      setIsPreparingImage(false);
    }
  }

  function applyPreparedImage(image: Blob) {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const nextPreviewUrl = URL.createObjectURL(image);
    previewUrlRef.current = nextPreviewUrl;
    setPreviewUrl(nextPreviewUrl);
    setNormalizedSelfie(image);
    renderedVideoRef.current = null;
    setShareStatus("");
  }

  async function handleImageSelection(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) await prepareImage(file);
  }

  async function captureSelfie() {
    const video = cameraPreviewRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setUploadError("The camera is still starting. Try capture again in a moment.");
      return;
    }
    const displayWidth = video.clientWidth;
    const displayHeight = video.clientHeight;
    const scale = Math.max(displayWidth / video.videoWidth, displayHeight / video.videoHeight);
    const renderedWidth = video.videoWidth * scale;
    const renderedHeight = video.videoHeight * scale;
    const hiddenX = (renderedWidth - displayWidth) / 2;
    const hiddenY = (renderedHeight - displayHeight) / 2;
    const guideSize = displayWidth * 0.72;
    const guideX = displayWidth * 0.14;
    const guideY = displayHeight * 0.12;
    const sourceX = (hiddenX + guideX) / scale;
    const sourceY = (hiddenY + guideY) / scale;
    const sourceSize = guideSize / scale;
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1200;
    const context = canvas.getContext("2d");
    if (!context) {
      setUploadError("This browser could not capture the camera frame.");
      return;
    }
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, sourceX, sourceY, sourceSize, sourceSize, 0, 0, canvas.width, canvas.height);
    const blob = await canvasToBlob(canvas);
    stopCamera();
    applyPreparedImage(blob);
  }

  function processSpecimen() {
    if (!normalizedSelfie || !previewUrl) return;
    stopCamera();
    setStage("scanning");
    scanTimerRef.current = window.setTimeout(() => {
      setStage("acquired");
      scanTimerRef.current = null;
    }, 3600);
  }

  function enterRide() {
    setRideRun((run) => run + 1);
    setShareStatus("");
    setStage("ride");
  }

  function returnToVerdict() {
    setShareStatus("");
    setStage("acquired");
  }

  function resetSelfie() {
    stopCamera();
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setPreviewUrl(null);
    setNormalizedSelfie(null);
    renderedVideoRef.current = null;
    setShareStatus("");
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
              <h1>TAKE YOUR PLACE.</h1>
              <p>Center your face and look toward the camera. Your face will appear inside the specimen helmet.</p>
            </div>
            <div className={`selfie-port ${previewUrl ? "has-image" : ""}`}>
              {isCameraOpen ? (
                <>
                  <video ref={cameraPreviewRef} className="camera-preview" autoPlay muted playsInline aria-label="Live selfie camera preview" />
                  <div className="camera-alignment" aria-hidden="true"><div className="camera-oval"><span className="alignment-eye eye-left" /><span className="alignment-eye eye-right" /></div><span>ALIGN FACE INSIDE OVAL</span></div>
                </>
              ) : previewUrl ? (
                <Image src={previewUrl} alt="Selected selfie preview" fill sizes="(max-width: 640px) 76vw, 360px" unoptimized style={{ objectFit: "cover" }} />
              ) : (
                <div className="port-empty" aria-hidden="true"><div className="face-guide"><span className="guide-eye guide-eye-left" /><span className="guide-eye guide-eye-right" /></div><span>ALIGN HUMAN FACE</span></div>
              )}
              <span className="corner corner-one" /><span className="corner corner-two" /><span className="corner corner-three" /><span className="corner corner-four" />
            </div>
            <div className="upload-actions">
              {isCameraOpen ? (
                <>
                  <button className="secondary-action" type="button" onClick={captureSelfie}>CAPTURE FACE</button>
                  <button className="text-action" type="button" onClick={stopCamera}>CANCEL</button>
                </>
              ) : (
                <button className="secondary-action" type="button" onClick={openCamera} disabled={isPreparingImage}>{isPreparingImage ? "PREPARING IMAGE…" : "TAKE SELFIE"}</button>
              )}
              <label className="secondary-action" htmlFor="selfie-upload">CHOOSE PHOTO</label>
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
            <button className="primary-action" type="button" onClick={enterRide}><span>ENTER THE CRADLE</span><b aria-hidden="true">↘</b></button>
          </div>
        )}

        {stage === "ride" && previewUrl && identity && (
          <div className="screen screen-ride">
            <div className="ride-heading">
              <p className="overline">LIVE CRADLE LINK</p>
              <p>{`SPECIMEN #${identity.specimenId} // VERDICT SEALED`}</p>
            </div>
            <div className="ride-player-shell">
              <Player
                key={rideRun}
                component={CradleComposition}
                inputProps={{
                  selfieSrc: previewUrl,
                  specimenId: identity.specimenId,
                  outcome: identity.outcome,
                }}
                durationInFrames={CRADLE_DURATION_IN_FRAMES}
                compositionWidth={1080}
                compositionHeight={1920}
                fps={30}
                autoPlay
                controls
                style={{ height: "100%", width: "100%" }}
              />
            </div>
            <p className="ride-note">YOUR IMAGE REMAINS ON THIS DEVICE</p>
            <div className="ride-actions">
              <button className="secondary-action" type="button" onClick={downloadSpecimenVideo} disabled={isRenderingVideo}>{isRenderingVideo ? "RENDERING…" : "DOWNLOAD VIDEO"}</button>
              <button className="secondary-action" type="button" onClick={shareSpecimen} disabled={isRenderingVideo}>SHARE VIDEO</button>
            </div>
            {shareStatus && <p className="ride-share-status" role="status">{shareStatus}</p>}
            <button className="secondary-action ride-again" type="button" onClick={returnToVerdict}>RETURN TO VERDICT GATE</button>
          </div>
        )}
      </section>

      <footer className="system-footer"><span>SESSION // {identity?.specimenId ?? "UNASSIGNED"}</span><span>LOCAL UNTIL SHARED</span></footer>
    </main>
  );
}
