const getMediaType = (file) => {
  const mimeType = file?.type || "";

  if (mimeType === "image/gif") {
    return "gif";
  }

  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (mimeType.startsWith("video/")) {
    return "video";
  }

  return "unknown";
};

export const createGalleryMediaItems = (files = []) => {
  return Array.from(files)
    .filter(Boolean)
    .map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${file.size}-${index}`,

      file,

      name: file.name,

      size: file.size,

      type: getMediaType(file),

      mimeType: file.type,

      previewUrl: URL.createObjectURL(file),

      lastModified: file.lastModified,
    }));
};

export const revokeMediaPreviewUrls = (items = []) => {
  items.forEach((item) => {
    if (
      item?.previewUrl &&
      typeof item.previewUrl === "string" &&
      item.previewUrl.startsWith("blob:")
    ) {
      URL.revokeObjectURL(item.previewUrl);
    }
  });
};

export const filterGalleryMediaItems = (
  mediaItems = [],
  folderFilter = "all",
) => {
  if (folderFilter === "all") {
    return mediaItems;
  }

  return mediaItems.filter((item) => item.type === folderFilter);
};

export const createGalleryFoldersFromMedia = (mediaItems = []) => {
  const folders = [
    {
      id: "recent",
      name: "Recents",
      filter: "all",
    },
  ];

  const hasImages = mediaItems.some((item) => item.type === "image");

  const hasVideos = mediaItems.some((item) => item.type === "video");

  const hasGifs = mediaItems.some((item) => item.type === "gif");

  if (hasImages) {
    folders.push({
      id: "images",
      name: "Images",
      filter: "image",
    });
  }

  if (hasVideos) {
    folders.push({
      id: "videos",
      name: "Videos",
      filter: "video",
    });
  }

  if (hasGifs) {
    folders.push({
      id: "gifs",
      name: "GIFs",
      filter: "gif",
    });
  }

  return folders;
};
