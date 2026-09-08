export const MAX_GALLERY_SELECTION = 20;

export const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50 MB

export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const ACCEPTED_VIDEO_TYPES = [
  "video/webm",
  "video/mp4",
  "video/ogg",
  "video/quicktime",
  "video/x-matroska",
];

export const ACCEPTED_MEDIA_TYPES = [
  ...ACCEPTED_IMAGE_TYPES,
  ...ACCEPTED_VIDEO_TYPES,
];

export const DEFAULT_GALLERY_FOLDERS = [
  {
    id: "recents",
    name: "Recents",
  },
  {
    id: "camera",
    name: "Camera",
  },
  {
    id: "videos",
    name: "Videos",
  },
  {
    id: "screenshots",
    name: "Screenshots",
  },
  {
    id: "downloads",
    name: "Downloads",
  },
];
