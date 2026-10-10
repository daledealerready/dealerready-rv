import { createClient } from "@supabase/supabase-js";

export const MAX_SELL_PHOTOS = 20;
export const MAX_SELL_VIDEOS = 2;
export const MAX_VIDEO_BYTES = 45 * 1024 * 1024;

export type SellMediaKind = "photo" | "video";

export type PreparedSellFile = {
  path: string;
  kind: SellMediaKind;
  name: string;
  body: Blob;
  contentType: string;
};

const PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const VIDEO_TYPES = new Set(["video/mp4", "video/quicktime", "video/webm"]);

function safeName(name: string) {
  const base = name.split(/[/\\]/).pop() || "file";
  const cleaned = base.replace(/[^A-Za-z0-9._-]/g, "-").replace(/-+/g, "-");
  return cleaned.slice(0, 80) || "file";
}

function resizePhoto(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const maxEdge = 1600;
      const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        resolve(null);
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          resolve(blob);
        },
        "image/jpeg",
        0.82,
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    image.src = url;
  });
}

export function classifySellFile(file: File): SellMediaKind | null {
  if (file.type.startsWith("image/") || PHOTO_TYPES.has(file.type)) return "photo";
  if (file.type.startsWith("video/") || VIDEO_TYPES.has(file.type)) return "video";
  const lower = file.name.toLowerCase();
  if (/\.(jpe?g|png|webp|heic|heif)$/.test(lower)) return "photo";
  if (/\.(mp4|mov|webm)$/.test(lower)) return "video";
  return null;
}

export async function prepareSellUpload(
  folderId: string,
  file: File,
  kind: SellMediaKind,
): Promise<PreparedSellFile> {
  if (kind === "video") {
    if (file.size > MAX_VIDEO_BYTES) {
      throw new Error(
        `${file.name} is too large. Keep each video under 45 MB. A one to two minute phone video is enough.`,
      );
    }
    return {
      path: `${folderId}/${crypto.randomUUID()}-${safeName(file.name)}`,
      kind,
      name: file.name,
      body: file,
      contentType: file.type || "video/mp4",
    };
  }

  const resized = await resizePhoto(file);
  const body = resized || file;
  if (!resized && file.size > 12 * 1024 * 1024) {
    throw new Error(`${file.name} is too large. Use a smaller photo.`);
  }
  const extension = resized ? "jpg" : safeName(file.name).split(".").pop() || "jpg";
  return {
    path: `${folderId}/${crypto.randomUUID()}.${extension}`,
    kind,
    name: file.name,
    body,
    contentType: resized ? "image/jpeg" : file.type || "image/jpeg",
  };
}

export async function uploadSellFile(file: PreparedSellFile) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Photo storage is not configured yet.");
  }
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await supabase.storage.from("sell-media").upload(file.path, file.body, {
    contentType: file.contentType,
    upsert: false,
  });
  if (error) {
    const message = error.message.toLowerCase();
    if (
      message.includes("bucket") ||
      message.includes("row-level security") ||
      message.includes("not found") ||
      message.includes("violates")
    ) {
      throw new Error(
        "Photo and video storage is not turned on yet. Run sell_media.sql in Supabase, then try again.",
      );
    }
    throw new Error(error.message || "Could not upload that file.");
  }
}
