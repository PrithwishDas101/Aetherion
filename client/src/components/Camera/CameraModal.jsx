import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiCamera,
  FiImage,
  FiRefreshCw,
  FiZap,
  FiZapOff,
  FiX,
} from "react-icons/fi";

import CameraPreview from "./CameraPreview.jsx";
import {
  getCameraStream,
  hasCameraSupport,
  hasTorchSupport,
  isMobileDevice,
  setTorch,
  stopCameraStream,
} from "./cameraUtils.js";

const CameraModal = ({ isOpen, onClose, onGallery }) => {
  const [stream, setStream] = useState(null);
  const [mode, setMode] = useState("photo");
  const [facingMode, setFacingMode] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isTorchEnabled, setIsTorchEnabled] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);

  const isMobile = isMobileDevice();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let cancelled = false;
    let currentStream = null;

    const initializeCamera = async () => {
      if (!hasCameraSupport()) {
        setCameraError("Camera access is not supported by this browser.");
        return;
      }

      setIsLoading(true);
      setCameraError("");

      try {
        const newStream = await getCameraStream({
          facingMode,
          mode,
        });

        if (cancelled) {
          stopCameraStream(newStream);
          return;
        }

        currentStream = newStream;

        setStream(newStream);

        setIsTorchEnabled(false);
        setHasTorch(hasTorchSupport(newStream));
      } catch (error) {
        console.error("Camera access error:", error);

        if (error?.name === "NotAllowedError") {
          setCameraError(
            "Camera access was denied. Please allow camera access in your browser settings.",
          );
        } else if (error?.name === "NotFoundError") {
          setCameraError("No camera was found on this device.");
        } else if (error?.name === "NotReadableError") {
          setCameraError(
            "Your camera is currently being used by another application.",
          );
        } else if (error?.name === "OverconstrainedError") {
          setCameraError("The selected camera is not available.");
        } else {
          setCameraError("Unable to access the camera.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    initializeCamera();

    return () => {
      cancelled = true;
      stopCameraStream(currentStream);
    };
  }, [isOpen, mode, facingMode]);

  const closeCamera = () => {
    stopCameraStream(stream);

    setStream(null);
    setCameraError("");
    setIsLoading(false);
    setIsTorchEnabled(false);

    onClose?.();
  };

  const changeMode = (nextMode) => {
    if (nextMode === mode || isLoading) {
      return;
    }

    stopCameraStream(stream);

    setStream(null);
    setIsTorchEnabled(false);
    setMode(nextMode);
  };

  const switchCamera = () => {
    if (!isMobile || isLoading) {
      return;
    }

    stopCameraStream(stream);

    setStream(null);
    setIsTorchEnabled(false);

    setFacingMode((previous) => (previous === "user" ? "environment" : "user"));
  };

  const handleGallery = () => {
    onGallery?.();
  };

  const toggleTorch = async () => {
    if (!isMobile || isLoading || !stream || !hasTorch) {
      return;
    }

    const nextState = !isTorchEnabled;

    const success = await setTorch(stream, nextState);

    if (!success) {
      setIsTorchEnabled(false);

      return;
    }

    setIsTorchEnabled(nextState);
  };

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] h-[100dvh] w-full bg-black">
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-black">
        {/* VIEWFINDER */}

        <div className="absolute inset-0 z-0 overflow-hidden bg-black">
          {stream ? (
            <CameraPreview stream={stream} mirrored={facingMode === "user"} />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-8 text-center">
              {isLoading ? (
                <div className="space-y-3">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />

                  <p className="text-sm text-white/60">Starting camera...</p>
                </div>
              ) : (
                <p className="max-w-sm text-sm leading-6 text-white/60">
                  {cameraError || "Camera unavailable."}
                </p>
              )}
            </div>
          )}
        </div>

        {/* TOP CONTROLS */}

        <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-5 py-5 sm:px-7 sm:py-7">
          {/* CLOSE */}

          <button
            type="button"
            onClick={closeCamera}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:bg-black/65 active:scale-95"
            aria-label="Close camera"
          >
            <FiX className="text-xl" />
          </button>

          {/* MOBILE TORCH */}

          {isMobile ? (
            <button
              type="button"
              onClick={toggleTorch}
              disabled={isLoading || !hasTorch}
              className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition active:scale-95 ${
                isTorchEnabled
                  ? "bg-white text-black"
                  : "bg-black/45 text-white"
              } ${
                !hasTorch
                  ? "cursor-not-allowed opacity-40"
                  : "hover:bg-black/65"
              }`}
              aria-label={
                !hasTorch
                  ? "Torch unavailable"
                  : isTorchEnabled
                    ? "Turn torch off"
                    : "Turn torch on"
              }
            >
              {isTorchEnabled ? (
                <FiZap className="text-xl" />
              ) : (
                <FiZapOff className="text-xl" />
              )}
            </button>
          ) : null}
        </div>

        {/* BOTTOM UI */}
        <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-[max(12px,env(safe-area-inset-bottom))] pt-16 sm:px-8 sm:pb-6  ">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
          {/* CONTROLS */}
          <div className="flex items-center justify-center">
            {/* MOBILE GALLERY */}

            <div className="absolute left-5 flex items-center sm:left-8">
              {isMobile ? (
                <button
                  type="button"
                  onClick={handleGallery}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:bg-black/65 active:scale-95"
                  aria-label="Open gallery"
                >
                  <FiImage className="text-xl" />
                </button>
              ) : null}
            </div>

            {/* SHUTTER */}

            <button
              type="button"
              disabled={!stream || isLoading}
              className="flex h-20 w-20 items-center justify-center rounded-full border-[5px] border-white/90 bg-transparent transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={mode === "photo" ? "Take photo" : "Start recording"}
            >
              <span
                className={`block transition-all ${
                  mode === "photo"
                    ? "h-14 w-14 rounded-full bg-white"
                    : "h-12 w-12 rounded-xl bg-red-500"
                }`}
              />
            </button>

            {/* MOBILE CAMERA SWITCH */}

            <div className="absolute right-5 flex items-center sm:right-8">
              {isMobile ? (
                <button
                  type="button"
                  onClick={switchCamera}
                  disabled={isLoading}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:bg-black/65 active:scale-95 disabled:opacity-50"
                  aria-label="Switch camera"
                >
                  <FiRefreshCw className="text-xl" />
                </button>
              ) : null}
            </div>
          </div>
          {/* MODE SELECTOR */}
          <div className="relative mt-4 flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={() => changeMode("video")}
              className={`text-sm font-semibold transition ${
                mode === "video"
                  ? "text-white"
                  : "text-white/45 hover:text-white/70"
              }`}
            >
              Video
            </button>

            <button
              type="button"
              onClick={() => changeMode("photo")}
              className={`text-sm font-semibold transition ${
                mode === "photo"
                  ? "text-white"
                  : "text-white/45 hover:text-white/70"
              }`}
            >
              Photo
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default CameraModal;
