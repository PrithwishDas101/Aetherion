const GIPHY_MEDIA_HOST = /^media\d*\.giphy\.com$/;

export const isAllowedGiphyMediaUrl = (value) => {
  if (typeof value !== "string" || value.length > 2048) {
    return false;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      GIPHY_MEDIA_HOST.test(url.hostname) &&
      url.pathname.startsWith("/media/")
    );
  } catch {
    return false;
  }
};
