import { getMediaCategory } from "./galleryValidation.js";

export const createMediaId = (file, index = 0) => {
  return [file.name, file.size, file.lastModified, index].join("-");
};

export const createGalleryMediaItem = (file, index = 0) => {
  const category = getMediaCategory(file);

  return {
    id: createMediaId(file, index),

    file,

    name: file.name,

    size: file.size,

    type: category,

    mimeType: file.type,

    lastModified: file.lastModified,

    previewUrl: URL.createObjectURL(file),
  };
};

export const createGalleryMediaItems = (files = []) => {
  return files.map((file, index) => createGalleryMediaItem(file, index));
};

export const revokeMediaPreviewUrl = (item) => {
  if (!item?.previewUrl) {
    return;
  }

  URL.revokeObjectURL(item.previewUrl);
};

export const revokeMediaPreviewUrls = (items = []) => {
  items.forEach((item) => {
    revokeMediaPreviewUrl(item);
  });
};
