import multer, { FileFilterCallback, StorageEngine } from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";
import { AppError } from "./app-error.util";
import { AppStatus } from "../types/app.type";

export type ImageFormat = "webp" | "jpeg" | "png";

export interface ImageResizeOptions {
  width: number;
  height: number;
  fit?: keyof sharp.FitEnum;
  position?: string;
  quality?: number;
  format?: ImageFormat;
}

export interface UploadOptions {
  destination: string;
  allowedMimeTypes: readonly string[];
  maxSizeMb?: number;
  imageResize?: ImageResizeOptions;
}

export interface SavedFile {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

// ─── MIME Types ───────────────────────────────────────────────────────────────

export const MIME_TYPES = {
  images: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  documents: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  spreadsheets: [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  videos: ["video/mp4", "video/webm", "video/ogg"],
  audio: ["audio/mpeg", "audio/ogg", "audio/wav"],
} as const;

// ─── Path Helpers ─────────────────────────────────────────────────────────────

const PUBLIC_DIR = "public";
const UPLOAD_DIR = "upload";
const MAX_FILE_SIZE_MB = 5;

const getAbsPath = (destination: string): string =>
  path.join(process.cwd(), PUBLIC_DIR, UPLOAD_DIR, destination);

/**
 * URL publik yang disimpan ke DB.
 * e.g. getPublicUrl("avatars", "abc.webp") → "/upload/avatars/abc.webp"
 *
 * Harus konsisten dengan cara Express serve static files:
 *   app.use("/upload", express.static(path.join(cwd, "public", "upload")))
 */
const getPublicUrl = (destination: string, filename: string): string =>
  `/${UPLOAD_DIR}/${destination}/${filename}`;

/**
 * Konversi public URL kembali ke absolute disk path untuk keperluan delete.
 * e.g. "/upload/avatars/abc.webp" → "D:\www\project\public\upload\avatars\abc.webp"
 */
const urlToAbsPath = (publicUrl: string): string => {
  // Strip leading slash → "upload/avatars/abc.webp"
  const relative = publicUrl.startsWith("/") ? publicUrl.slice(1) : publicUrl;
  return path.join(process.cwd(), PUBLIC_DIR, relative);
};

// ─── Directory Helper ─────────────────────────────────────────────────────────

export const ensureDir = async (destination: string): Promise<void> => {
  await fs.mkdir(getAbsPath(destination), { recursive: true });
};

export const ensureUploadDirs = async (
  destinations: string[] = ["avatars"],
): Promise<void> => {
  await Promise.all(destinations.map(ensureDir));
};

// ─── Multer Factory ───────────────────────────────────────────────────────────

export const createUploader = (options: UploadOptions) => {
  const { destination, allowedMimeTypes, maxSizeMb, imageResize } = options;
  const maxBytes = (maxSizeMb ?? MAX_FILE_SIZE_MB) * 1024 * 1024;

  const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          `File type not allowed. Accepted: ${allowedMimeTypes.join(", ")}`,
          400,
          AppStatus.VALIDATION_ERROR,
        ),
      );
    }
  };

  // imageResize → memoryStorage (butuh buffer untuk sharp)
  // non-image    → diskStorage (langsung tulis ke disk)
  const storage: StorageEngine = imageResize
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: async (_req, _file, cb) => {
          const dir = getAbsPath(destination);
          await fs.mkdir(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname).toLowerCase();
          cb(null, `${uuidv4()}${ext}`);
        },
      });

  return multer({
    storage,
    limits: { fileSize: maxBytes, files: 1 },
    fileFilter,
  });
};

// ─── File Processor ───────────────────────────────────────────────────────────

export const saveFile = async (
  file: Express.Multer.File,
  options: UploadOptions,
  oldFileUrl?: string | null,
): Promise<SavedFile> => {
  const { destination, imageResize } = options;

  // Hapus file lama sebelum simpan baru — error diabaikan (file mungkin sudah tidak ada)
  if (oldFileUrl) {
    await deleteFile(oldFileUrl).catch(() => {});
  }

  let filename: string;
  let size: number;
  let mimetype: string;

  if (imageResize) {
    // ── Image: proses buffer dengan sharp ─────────────────────────────────────
    if (!file.buffer) {
      throw new AppError(
        "File buffer is empty. Ensure multer uses memoryStorage for image uploads.",
        500,
      );
    }

    const fmt = imageResize.format ?? "webp";
    filename = `${uuidv4()}.${fmt}`;

    await ensureDir(destination);
    const outputPath = path.join(getAbsPath(destination), filename);

    const sharpInstance = sharp(file.buffer).resize(
      imageResize.width,
      imageResize.height,
      {
        fit: imageResize.fit ?? "cover",
        position: imageResize.position ?? "center",
        withoutEnlargement: true,
      },
    );

    const quality = imageResize.quality ?? 85;
    switch (fmt) {
      case "webp":
        sharpInstance.webp({ quality });
        break;
      case "jpeg":
        sharpInstance.jpeg({ quality, mozjpeg: true });
        break;
      case "png":
        sharpInstance.png({ quality, compressionLevel: 9 });
        break;
    }

    const { size: outputSize } = await sharpInstance.toFile(outputPath);
    size = outputSize;
    mimetype = `image/${fmt}`;
  } else {
    // ── Non-image: sudah tersimpan oleh diskStorage ───────────────────────────
    if (!file.path || !file.filename) {
      throw new AppError(
        "File path is missing. Ensure multer uses diskStorage for non-image uploads.",
        500,
      );
    }
    filename = file.filename;
    size = file.size;
    mimetype = file.mimetype;
  }

  return {
    url: getPublicUrl(destination, filename),
    filename,
    mimetype,
    size,
  };
};

// ─── Delete Helper ────────────────────────────────────────────────────────────

/**
 * Hapus file dari disk berdasarkan public URL yang tersimpan di DB.
 * Melempar error jika file tidak ditemukan — wrap dengan .catch(() => {})
 * jika ingin diabaikan (misal saat replace avatar).
 */
export const deleteFile = async (fileUrl: string): Promise<void> => {
  const fullPath = urlToAbsPath(fileUrl);
  await fs.unlink(fullPath);
};

// ─── Preset Uploaders ─────────────────────────────────────────────────────────

export const avatarUploadOptions: UploadOptions = {
  destination: "avatars",
  allowedMimeTypes: MIME_TYPES.images,
  maxSizeMb: 5,
  imageResize: { width: 200, height: 200, format: "webp", quality: 85 },
};

// export const documentUploadOptions: UploadOptions = {
//   destination: "documents",
//   allowedMimeTypes: [...MIME_TYPES.documents, ...MIME_TYPES.spreadsheets],
//   maxSizeMb: 10,
// };

// export const thumbnailUploadOptions: UploadOptions = {
//   destination: "thumbnails",
//   allowedMimeTypes: MIME_TYPES.images,
//   maxSizeMb: 2,
//   imageResize: { width: 400, height: 300, format: "webp", quality: 80, fit: "inside" },
// };

export const avatarUploader = createUploader(avatarUploadOptions);
// export const documentUploader = createUploader(documentUploadOptions);
// export const thumbnailUploader = createUploader(thumbnailUploadOptions);
