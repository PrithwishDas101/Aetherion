import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 50 * 1024 * 1024,
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

    const allowedExtensions = [
      ".webm",
      ".mp4",
      ".ogg",
      ".mov",
      ".mkv",

      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".gif",

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

    const extensionMatches = allowedExtensions.some((extension) =>
      fileName.endsWith(extension),
    );

    console.log("📦 MULTER FILE:", {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
    });

    if (allowedTypes.includes(file.mimetype) || extensionMatches) {
      cb(null, true);

      return;
    }

    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  },
});

export default upload;
