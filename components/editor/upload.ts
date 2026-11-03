"use client";

import { registerMedia } from "@/app/admin/editor-actions";
import { ACCEPTED_UPLOAD_TYPES, MAX_UPLOAD_BYTES } from "@/lib/cms";
import type { MediaItem } from "@/lib/editor-types";
import { getBrowserClient } from "@/lib/supabase/browser";
import { MEDIA_BUCKET, supabaseKey, supabaseUrl } from "@/lib/supabase/config";

/** The longest edge kept for the web. Plenty for full-screen display on retina laptops. */
const MAX_EDGE = 3600;
/** Files already web-ready and under this size are uploaded untouched. */
const PASSTHROUGH_BYTES = 8 * 1024 * 1024;

export const FILE_INPUT_ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif";

export type UploadStage = "preparing" | "uploading" | "saving";
export type UploadProgress = { stage: UploadStage; percent: number };

type Prepared = { blob: Blob; width: number; height: number; mimeType: string };

const isHeic = (file: File) => /image\/hei[cf]/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);

async function decode(source: Blob) {
  return createImageBitmap(source, { imageOrientation: "from-image" });
}

/**
 * Turns whatever the phone or camera gave us into a web-friendly JPEG, PNG or
 * WebP. HEIC is converted (natively where the browser can, otherwise with a
 * converter loaded only when needed) and very large photos are scaled down so
 * uploads stay quick on mobile data. The original file on the device is never changed.
 */
export async function prepareImage(file: File): Promise<Prepared> {
  let source: Blob = file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await decode(source);
  } catch {
    if (!isHeic(file)) throw new Error(`${file.name} isn't a photo this browser can open. Try a JPEG, PNG or WebP.`);
    const { default: heic2any } = await import("heic2any");
    const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
    source = Array.isArray(converted) ? converted[0] : converted;
    bitmap = await decode(source);
  }

  const { width, height } = bitmap;
  const accepted = (ACCEPTED_UPLOAD_TYPES as readonly string[]).includes(source.type);
  if (accepted && Math.max(width, height) <= MAX_EDGE && source.size <= PASSTHROUGH_BYTES) {
    bitmap.close();
    return { blob: source, width, height, mimeType: source.type };
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser couldn't process the photo.");
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // PNGs may be logos with transparency, so they become WebP rather than JPEG.
  const mimeType = source.type === "image/png" ? "image/webp" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mimeType, 0.9));
  if (!blob) throw new Error("This browser couldn't process the photo.");
  return { blob, width: canvas.width, height: canvas.height, mimeType: blob.type || mimeType };
}

const EXTENSIONS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

function storageName(originalName: string, mimeType: string) {
  const base =
    originalName
      .replace(/\.[^.]*$/, "")
      .normalize("NFKD")
      .replace(/[^A-Za-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "photo";
  return `${base}.${EXTENSIONS[mimeType] ?? "jpg"}`;
}

function send(path: string, blob: Blob, token: string, onProgress: (percent: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    const encoded = path.split("/").map(encodeURIComponent).join("/");
    request.open("POST", `${supabaseUrl}/storage/v1/object/${MEDIA_BUCKET}/${encoded}`);
    request.setRequestHeader("Authorization", `Bearer ${token}`);
    request.setRequestHeader("apikey", supabaseKey);
    request.setRequestHeader("Content-Type", blob.type);
    // Each upload has its own folder, so a long cache is safe and existing files are never replaced.
    request.setRequestHeader("Cache-Control", "max-age=31536000");
    request.setRequestHeader("x-upsert", "false");
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) return resolve();
      let message = `Upload failed (${request.status}).`;
      try {
        const body = JSON.parse(request.responseText) as { message?: string; error?: string };
        message = body.message ?? body.error ?? message;
      } catch {}
      reject(new Error(message));
    };
    request.onerror = () => reject(new Error("The upload was interrupted. Check your connection and try again."));
    request.send(blob);
  });
}

/** Prepares, uploads and registers one photo in the media library. */
export async function uploadPhoto(file: File, onProgress: (progress: UploadProgress) => void): Promise<MediaItem> {
  onProgress({ stage: "preparing", percent: 0 });
  const prepared = await prepareImage(file);
  if (prepared.blob.size > MAX_UPLOAD_BYTES) throw new Error(`${file.name} is too large, even after compressing.`);

  const { data } = await getBrowserClient().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Your session has ended. Please log in again.");

  const filename = storageName(file.name, prepared.mimeType);
  const storagePath = `uploads/${crypto.randomUUID()}/${filename}`;
  onProgress({ stage: "uploading", percent: 0 });
  await send(storagePath, prepared.blob, token, (percent) => onProgress({ stage: "uploading", percent }));

  onProgress({ stage: "saving", percent: 100 });
  const result = await registerMedia({
    storagePath,
    filename: file.name.replace(/\.(heic|heif)$/i, `.${EXTENSIONS[prepared.mimeType]}`),
    mimeType: prepared.mimeType,
    width: prepared.width,
    height: prepared.height,
    sizeBytes: prepared.blob.size,
  });
  if (!result.ok) throw new Error(result.error);
  return result.data;
}
