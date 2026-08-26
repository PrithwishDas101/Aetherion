export const getCameraStream = async ({
  facingMode = "user",
  mode = "photo",
} = {}) => {
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    throw new Error("Camera access is not supported by this browser.");
  }

  return navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: {
        ideal: facingMode,
      },
      aspectRatio: {
        ideal: 9 / 16,
      },
      width: {
        ideal: 1080,
      },
      height: {
        ideal: 1920,
      },
    },
    video: {
      facingMode: {
        ideal: facingMode,
      },
      aspectRatio: {
        ideal: 9 / 16,
      },
      width: {
        ideal: 1080,
      },
      height: {
        ideal: 1920,
      },
    },
    audio: mode === "video",
  });
};

export const stopCameraStream = (stream) => {
  if (!stream) {
    return;
  }

  stream.getTracks().forEach((track) => {
    track.stop();
  });
};

export const hasCameraSupport = () => {
  return (
    typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia
  );
};

export const isMobileDevice = () => {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent =
    navigator.userAgent || navigator.vendor || window.opera || "";

  const mobileUserAgent = /Android|iPhone|iPad|iPod|Windows Phone/i.test(
    userAgent,
  );

  const mobileViewport = window.matchMedia("(max-width: 767px)").matches;

  return mobileUserAgent || mobileViewport;
};

export const hasTorchSupport = (stream) => {
  if (!stream) {
    return false;
  }

  const videoTrack = stream.getVideoTracks?.()[0];

  if (!videoTrack) {
    return false;
  }

  if (!videoTrack.getCapabilities) {
    return false;
  }

  const capabilities = videoTrack.getCapabilities();

  return capabilities?.torch === true;
};

export const setTorch = async (stream, enabled) => {
  if (!stream) {
    return false;
  }

  const videoTrack = stream.getVideoTracks?.()[0];

  if (!videoTrack) {
    return false;
  }

  if (!videoTrack.applyConstraints) {
    return false;
  }

  const capabilities = videoTrack.getCapabilities?.();

  if (capabilities?.torch !== true) {
    return false;
  }

  try {
    await videoTrack.applyConstraints({
      advanced: [{ torch: enabled }],
    });

    return true;
  } catch (error) {
    return;

    return false;
  }
};
