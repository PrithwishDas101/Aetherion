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
    console.log("TORCH DEBUG: No video track found.");
    return false;
  }

  if (!videoTrack.getCapabilities) {
    console.log("TORCH DEBUG: getCapabilities() unavailable.");
    return false;
  }

  const capabilities = videoTrack.getCapabilities();

  console.log("TORCH DEBUG: track:", videoTrack);
  console.log("TORCH DEBUG: capabilities:", capabilities);
  console.log("TORCH DEBUG: torch:", capabilities?.torch);

  return capabilities?.torch === true;
};

export const setTorch = async (stream, enabled) => {
  if (!stream) {
    console.log("TORCH DEBUG: No stream.");
    return false;
  }

  const videoTrack = stream.getVideoTracks?.()[0];

  if (!videoTrack) {
    console.log("TORCH DEBUG: No video track.");
    return false;
  }

  if (!videoTrack.applyConstraints) {
    console.log("TORCH DEBUG: applyConstraints() unavailable.");
    return false;
  }

  const capabilities = videoTrack.getCapabilities?.();

  console.log("TORCH DEBUG: Trying torch:", enabled);
  console.log("TORCH DEBUG: capabilities:", capabilities);

  if (capabilities?.torch !== true) {
    console.log("TORCH DEBUG: This camera reports no torch support.");
    return false;
  }

  try {
    await videoTrack.applyConstraints({
      advanced: [{ torch: enabled }],
    });

    console.log(`TORCH DEBUG: Torch ${enabled ? "ON" : "OFF"} successful.`);

    return true;
  } catch (error) {
    console.error("TORCH DEBUG: applyConstraints failed:", error);

    return false;
  }
};
