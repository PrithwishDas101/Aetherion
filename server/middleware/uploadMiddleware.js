import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    // 50 MB — videos can easily exceed the old 5 MB limit.
    fileSize: 50 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const allowedVideoTypes = [
      "video/webm",
      "video/mp4",
      "video/ogg",
      "video/quicktime",
      "video/x-matroska",
    ];

    const allowedTypes = [
      ...allowedImageTypes,
      ...allowedVideoTypes,
    ];

    /*
     * Some browsers/devices can send a Blob as text/plain even
     * though the actual file is a video.
     *
     * Our frontend gives the uploaded video a .webm filename,
     * so use the filename extension as a fallback.
     */
    const fileName = file.originalname?.toLowerCase() || "";

    const extensionMatches =
      fileName.endsWith(".webm") ||
      fileName.endsWith(".mp4") ||
      fileName.endsWith(".ogg") ||
      fileName.endsWith(".mov") ||
      fileName.endsWith(".mkv") ||
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg") ||
      fileName.endsWith(".png") ||
      fileName.endsWith(".webp");

    console.log("📦 MULTER FILE:", {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    if (allowedTypes.includes(file.mimetype) || extensionMatches) {
      cb(null, true);
      return;
    }

    cb(
      new Error(
        `Unsupported media type: ${file.mimetype}`,
      ),
      false,
    );
  },
});

export default upload;