import multer from "multer";
import { extname } from "node:path";
import { detectAv } from "@file-type/av";
import { detectCfbf } from "@file-type/cfbf";
import { detectPdf } from "@file-type/pdf";
import { fileTypeFromBuffer } from "file-type";

const storage = multer.memoryStorage();
const FILE_TYPES_BY_EXTENSION = {
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".webp": ["image/webp"],
  ".gif": ["image/gif"],
  ".webm": ["video/webm"],
  ".mp4": ["video/mp4"],
  ".ogg": ["video/ogg"],
  ".mov": ["video/quicktime"],
  ".mkv": ["video/x-matroska"],
  ".pdf": ["application/pdf"],
  ".doc": ["application/msword"],
  ".docx": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  ".xls": ["application/vnd.ms-excel"],
  ".xlsx": [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  ".ppt": ["application/vnd.ms-powerpoint"],
  ".pptx": [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
  ".txt": ["text/plain"],
  ".csv": ["text/csv", "application/vnd.ms-excel", "text/plain"],
  ".zip": ["application/zip", "application/x-zip-compressed"],
};

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const VIDEO_EXTENSIONS = [".webm", ".mp4", ".ogg", ".mov", ".mkv"];
const DOCUMENT_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".txt",
  ".csv",
  ".zip",
];
const MESSAGE_EXTENSIONS = Object.keys(FILE_TYPES_BY_EXTENSION);
const MESSAGE_FILE_EXTENSIONS_BY_TYPE = {
  image: IMAGE_EXTENSIONS,
  gif: [".gif"],
  video: VIDEO_EXTENSIONS,
  document: DOCUMENT_EXTENSIONS,
};
const SIGNATURE_DETECTORS = [detectPdf, detectCfbf, detectAv];

const SIGNATURE_FORMATS = {
  ".jpg": { mime: "image/jpeg", extensions: ["jpg"] },
  ".jpeg": { mime: "image/jpeg", extensions: ["jpg"] },
  ".png": { mime: "image/png", extensions: ["png"] },
  ".webp": { mime: "image/webp", extensions: ["webp"] },
  ".gif": { mime: "image/gif", extensions: ["gif"] },
  ".webm": { mime: "video/webm", extensions: ["webm"] },
  ".mp4": { mime: "video/mp4", extensions: ["mp4"] },
  ".ogg": {
    mime: "application/ogg",
    extensions: ["ogv"],
    allowedDetectedTypes: ["video/ogg"],
  },
  ".mov": { mime: "video/quicktime", extensions: ["mov"] },
  ".mkv": { mime: "video/x-matroska", extensions: ["mkv"] },
  ".pdf": { mime: "application/pdf", extensions: ["pdf"] },
  // CFBF proves the legacy Office container, not whether it is DOC/XLS/PPT.
  ".doc": { mime: "application/x-cfb", extensions: ["cfb"] },
  ".xls": { mime: "application/x-cfb", extensions: ["cfb"] },
  ".ppt": { mime: "application/x-cfb", extensions: ["cfb"] },
  ".docx": {
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    extensions: ["docx"],
  },
  ".xlsx": {
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    extensions: ["xlsx"],
  },
  ".pptx": {
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    extensions: ["pptx"],
  },
  ".zip": {
    mime: "application/zip",
    extensions: ["zip"],
    allowedDeclaredMimes: ["application/zip", "application/x-zip-compressed"],
  },
};

const FILE_SIZE_LIMIT = 50 * 1024 * 1024;

const normalizeMimeType = (mimeType) =>
  typeof mimeType === "string"
    ? mimeType.split(";", 1)[0].trim().toLowerCase()
    : "";

const createUpload = ({ fields, fieldSize, allowedExtensions }) =>
  multer({
    storage,

    limits: {
      fileSize: FILE_SIZE_LIMIT,
      files: 1,
      fields,
      parts: fields + 1,
      fieldNameSize: 100,
      fieldSize,
    },

    fileFilter: (req, file, cb) => {
      const extension = extname(file.originalname?.toLowerCase() || "");
      const declaredMime = normalizeMimeType(file.mimetype);
      const metadataMatches =
        allowedExtensions.includes(extension) &&
        FILE_TYPES_BY_EXTENSION[extension]?.includes(declaredMime);

      if (!metadataMatches) {
        req.uploadRejected = true;
        cb(null, false);
        return;
      }

      cb(null, true);
    },
  });

export const singleUpload = (upload, fieldName) => {
  const parseSingleFile = upload.single(fieldName);

  return (req, res, next) => {
    parseSingleFile(req, res, (error) => {
      if (error instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: "Upload rejected.",
        });
      }

      return error ? next(error) : next();
    });
  };
};

const rejectUpload = (res) =>
  res.status(400).json({
    success: false,
    message: "Unsupported or invalid file type.",
  });

const hasValidTextContent = (buffer) => {
  if (buffer.length === 0 || buffer.includes(0)) {
    return false;
  }

  try {
    new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    return true;
  } catch {
    return false;
  }
};

const matchesDetectedSignature = (extension, detected) => {
  if (!detected) {
    return false;
  }

  const expected = SIGNATURE_FORMATS[extension];

  if (!expected) {
    return false;
  }

  const allowedDetectedTypes =
    expected.allowedDetectedTypes || [expected.mime];

  return (
    expected.extensions.includes(detected.ext) &&
    allowedDetectedTypes.includes(detected.mime)
  );
};

const declaredMimeMatchesSignaturePolicy = (extension, declaredMime) => {
  const signaturePolicy = SIGNATURE_FORMATS[extension];

  return (
    FILE_TYPES_BY_EXTENSION[extension]?.includes(declaredMime) &&
    (!signaturePolicy?.allowedDeclaredMimes ||
      signaturePolicy.allowedDeclaredMimes.includes(declaredMime))
  );
};

const validateUploadContent = (
  allowedExtensions,
  getRequestAllowedExtensions = () => allowedExtensions,
) => async (req, res, next) => {
  if (req.uploadRejected) {
    return rejectUpload(res);
  }

  if (!req.file) {
    return next();
  }

  const extension = extname(req.file.originalname?.toLowerCase() || "");
  const declaredMime = normalizeMimeType(req.file.mimetype);
  const requestAllowedExtensions = getRequestAllowedExtensions(req);

  if (
    !requestAllowedExtensions?.includes(extension) ||
    !declaredMimeMatchesSignaturePolicy(extension, declaredMime)
  ) {
    return rejectUpload(res);
  }

  if ([".txt", ".csv"].includes(extension)) {
    // Text/CSV have no magic number; require valid UTF-8 with no binary NULs.
    return hasValidTextContent(req.file.buffer)
      ? next()
      : rejectUpload(res);
  }

  try {
    const detected = await fileTypeFromBuffer(req.file.buffer, {
      customDetectors: SIGNATURE_DETECTORS,
    });

    if (!matchesDetectedSignature(extension, detected)) {
      return rejectUpload(res);
    }

    return next();
  } catch {
    return rejectUpload(res);
  }
};

export const signupUpload = createUpload({
  fields: 4,
  fieldSize: 64 * 1024,
  allowedExtensions: IMAGE_EXTENSIONS,
});

export const validateProfileImageUpload = validateUploadContent(IMAGE_EXTENSIONS);

export const profilePictureUpload = createUpload({
  fields: 0,
  fieldSize: 64 * 1024,
  allowedExtensions: IMAGE_EXTENSIONS,
});

export const profileBannerUpload = createUpload({
  fields: 0,
  fieldSize: 64 * 1024,
  allowedExtensions: IMAGE_EXTENSIONS,
});

export const messageUpload = createUpload({
  fields: 4,
  fieldSize: 1024 * 1024,
  allowedExtensions: MESSAGE_EXTENSIONS,
});

export const validateMessageUpload = validateUploadContent(
  MESSAGE_EXTENSIONS,
  (req) => MESSAGE_FILE_EXTENSIONS_BY_TYPE[req.body?.type || "text"],
);
