export const MAX_GALLERY_SELECTION = 20;

export const MAX_IMAGE_SIZE = 50 * 1024 * 1024;

export const MAX_GIF_SIZE = 50 * 1024 * 1024;

export const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

export const MAX_GALLERY_FILE_SIZE = 50 * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const ACCEPTED_GIF_TYPES = ["image/gif"];

export const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-matroska",
];

export const ACCEPTED_MEDIA_TYPES = [
  ...ACCEPTED_IMAGE_TYPES,
  ...ACCEPTED_GIF_TYPES,
  ...ACCEPTED_VIDEO_TYPES,
];

export const GALLERY_PERMISSION_STORAGE_KEY = "aetherion_gallery_permission";

export const GALLERY_PERMISSION = {
  ASK: "ask",
  GRANTED: "granted",
  DENIED: "denied",
};

export const DEFAULT_GALLERY_FOLDERS = [
  {
    id: "recent",
    name: "Recents",
    filter: "all",
  },
  {
    id: "images",
    name: "Images",
    filter: "image",
  },
  {
    id: "videos",
    name: "Videos",
    filter: "video",
  },
  {
    id: "gifs",
    name: "GIFs",
    filter: "gif",
  },
];
