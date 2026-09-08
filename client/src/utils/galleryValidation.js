import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  MAX_GALLERY_SELECTION,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
} from "../components/Gallery/galleryConstants.js";

export const getMediaCategory = (file) => {
  if (!file) {
    return null;
  }

  if (ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "image";
  }

  if (ACCEPTED_VIDEO_TYPES.includes(file.type)) {
    return "video";
  }

  return null;
};

export const validateGalleryFile = (file) => {
  if (!file) {
    return {
      valid: false,
      error: "No media file was provided.",
    };
  }

  const category = getMediaCategory(file);

  if (!category) {
    return {
      valid: false,
      error: "This media type is not supported.",
    };
  }

  if (category === "image" && file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: "This image is too large. Maximum size is 50 MB.",
    };
  }

  if (category === "video" && file.size > MAX_VIDEO_SIZE) {
    return {
      valid: false,
      error: "This video is too large. Maximum size is 50 MB.",
    };
  }

  return {
    valid: true,
    error: null,
    category,
  };
};

export const validateGallerySelection = ({
  file,
  selectedCount,
}) => {
  const fileValidation = validateGalleryFile(file);

  if (!fileValidation.valid) {
    return fileValidation;
  }

  if (selectedCount >= MAX_GALLERY_SELECTION) {
    return {
      valid: false,
      error: `You can select a maximum of ${MAX_GALLERY_SELECTION} items.`,
    };
  }

  return {
    valid: true,
    error: null,
    category: fileValidation.category,
  };
};