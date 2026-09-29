import multer from "multer";
import { extname } from "node:path";

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

const FILE_SIZE_LIMIT = 50 * 1024 * 1024;

const createUpload = ({ fields, fieldSize }) => multer({
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
    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    const allowedVideoTypes = [
      "video/webm",
      "video/mp4",
      "video/ogg",
      "video/quicktime",
      "video/x-matroska",
    ];

    const allowedDocumentTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "text/csv",
      "application/zip",
      "application/x-zip-compressed",
    ];

    const allowedTypes = [
      ...allowedImageTypes,
      ...allowedVideoTypes,
      ...allowedDocumentTypes,
    ];

    const fileName = file.originalname?.toLowerCase() || "";
    const extension = extname(fileName);
    const allowedExtensions = Object.keys(FILE_TYPES_BY_EXTENSION);
    const allowedFileExtensions =
      file.fieldname === "media"
        ? allowedExtensions
        : IMAGE_EXTENSIONS;

    const extensionMatches = allowedExtensions.includes(extension);

    console.log("📦 MULTER FILE:", {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
    });

    const isGenericMimeType = [
      "application/octet-stream",
      "binary/octet-stream",
    ].includes(file.mimetype?.toLowerCase());
    const isAllowedMimeType =
      allowedTypes.includes(file.mimetype?.toLowerCase()) || isGenericMimeType;

    if (
      extensionMatches &&
      allowedFileExtensions.includes(extension) &&
      isAllowedMimeType &&
      (FILE_TYPES_BY_EXTENSION[extension]?.includes(file.mimetype?.toLowerCase()) ||
        isGenericMimeType)
    ) {
      cb(null, true);

      return;
    }

    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  },
});

export const signupUpload = createUpload({
  fields: 4,
  fieldSize: 64 * 1024,
});

export const profilePictureUpload = createUpload({
  fields: 0,
  fieldSize: 64 * 1024,
});

export const profileBannerUpload = createUpload({
  fields: 0,
  fieldSize: 64 * 1024,
});

export const messageUpload = createUpload({
  fields: 4,
  fieldSize: 1024 * 1024,
});
