import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiImage, FiRefreshCw, FiZap, FiZapOff, FiX } from "react-icons/fi";

import CameraPreview from "./CameraPreview.jsx";
import {
  getCameraStream,
  hasCameraSupport,
  hasTorchSupport,
  isMobileDevice,
  setTorch,
  stopCameraStream,
} from "./cameraUtils.js";

const CameraModal = ({ isOpen, onClose, onGallery, onVideoCaptured }) => {
  const [stream, setStream] = useState(null);
  const [mode, setMode] = useState("photo");
  const [facingMode, setFacingMode] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const [isTorchEnabled, setIsTorchEnabled] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState(null);

  const cameraVideoRef = useRef(null);
  const recordedVideoRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const recordingTimerRef = useRef(null);

  const isMobile = isMobileDevice();

  /*
   * ---------------------------------------------------------
   * CAMERA INITIALIZATION
   * ---------------------------------------------------------
   */

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

  /*
   * ---------------------------------------------------------
   * RECORDING TIMER
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!isRecording) {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      return;
    }

    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((previous) => previous + 1);
    }, 1000);

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    };
  }, [isRecording]);

  /*
   * ---------------------------------------------------------
   * CLEANUP
   * ---------------------------------------------------------
   */

  const cleanupRecordedVideo = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
    }

    setRecordedVideoUrl(null);
    setRecordedVideoBlob(null);
  };

  const closeCamera = () => {
    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    stopCameraStream(stream);

    cleanupRecordedVideo();

    setStream(null);
    setCameraError("");
    setIsLoading(false);
    setIsTorchEnabled(false);
    setIsRecording(false);
    setRecordingSeconds(0);

    mediaRecorderRef.current = null;
    recordedChunksRef.current = [];

    onClose?.();
  };

  /*
   * ---------------------------------------------------------
   * MODE
   * ---------------------------------------------------------
   */

  const changeMode = (nextMode) => {
    if (nextMode === mode || isLoading || isRecording || recordedVideoUrl) {
      return;
    }

    stopCameraStream(stream);

    setStream(null);
    setIsTorchEnabled(false);

    setMode(nextMode);
  };

  /*
   * ---------------------------------------------------------
   * SHUTTER
   * ---------------------------------------------------------
   */

  const handleShutter = () => {
    if (!stream || isLoading) {
      return;
    }

    if (mode === "photo") {
      capturePhoto();
      return;
    }

    if (isRecording) {
      stopVideoRecording();
      return;
    }

    startVideoRecording();
  };

  /*
   * ---------------------------------------------------------
   * CAMERA SWITCH
   * ---------------------------------------------------------
   */

  const switchCamera = () => {
    if (!isMobile || isLoading || isRecording || recordedVideoUrl) {
      return;
    }

    stopCameraStream(stream);

    setStream(null);
    setIsTorchEnabled(false);

    setFacingMode((previous) => (previous === "user" ? "environment" : "user"));
  };

  /*
   * ---------------------------------------------------------
   * GALLERY
   * ---------------------------------------------------------
   */

  const handleGallery = () => {
    if (isRecording || recordedVideoUrl) {
      return;
    }

    onGallery?.();
  };

  /*
   * ---------------------------------------------------------
   * TORCH
   * ---------------------------------------------------------
   */

  const toggleTorch = async () => {
    if (!isMobile || isLoading || !stream || !hasTorch || recordedVideoUrl) {
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

  /*
   * ---------------------------------------------------------
   * VIDEO RECORDING
   * ---------------------------------------------------------
   */

  const startVideoRecording = () => {
    if (
      mode !== "video" ||
      !stream ||
      isLoading ||
      isRecording ||
      recordedVideoUrl
    ) {
      return;
    }

    if (!window.MediaRecorder) {
      setCameraError("Video recording is not supported by this browser.");
      return;
    }

    const videoTrack = stream.getVideoTracks?.()[0];

    if (!videoTrack) {
      setCameraError("Camera video track is unavailable.");
      return;
    }

    recordedChunksRef.current = [];
    setRecordingSeconds(0);
    setCameraError("");

    let mimeType = "";

    const supportedTypes = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4",
    ];

    for (const type of supportedTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        mimeType = type;
        break;
      }
    }

    try {
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const chunks = recordedChunksRef.current;

        if (!chunks.length) {
          setCameraError("No video data was recorded.");
          setIsRecording(false);
          mediaRecorderRef.current = null;
          return;
        }

        const blob = new Blob(chunks, {
          type: recorder.mimeType || "video/webm",
        });

        const url = URL.createObjectURL(blob);

        recordedChunksRef.current = [];

        setRecordedVideoBlob(blob);
        setRecordedVideoUrl(url);
        setIsRecording(false);
        setRecordingSeconds(0);

        mediaRecorderRef.current = null;

        console.log("VIDEO RECORDED:", {
          blob,
          url,
          type: blob.type,
          size: blob.size,
        });
      };

      recorder.onerror = (event) => {
        console.error("Video recording error:", event.error);

        setCameraError("Unable to record video.");
        setIsRecording(false);
        setRecordingSeconds(0);
        mediaRecorderRef.current = null;
      };

      recorder.start(1000);

      setIsRecording(true);
    } catch (error) {
      console.error("Start video recording error:", error);

      setCameraError("Unable to start video recording.");
      setIsRecording(false);
    }
  };

  const stopVideoRecording = () => {
    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state === "inactive") {
      return;
    }

    recorder.stop();
  };

  /*
   * ---------------------------------------------------------
   * RETAKE VIDEO
   * ---------------------------------------------------------
   */

  const retakeVideo = () => {
    cleanupRecordedVideo();

    setRecordingSeconds(0);
    setCameraError("");
  };

  /*
   * ---------------------------------------------------------
   * USE VIDEO
   * ---------------------------------------------------------
   */

  const useRecordedVideo = () => {
    if (!recordedVideoBlob) {
      return;
    }

    console.log("VIDEO READY TO SEND:", {
      blob: recordedVideoBlob,
      type: recordedVideoBlob.type,
      size: recordedVideoBlob.size,
    });

    onVideoCaptured?.(recordedVideoBlob);

    closeCamera();
  };

  /*
   * ---------------------------------------------------------
   * PHOTO CAPTURE
   * ---------------------------------------------------------
   */

  const capturePhoto = () => {
    if (mode !== "photo" || !stream || isLoading) {
      return;
    }

    const video = cameraVideoRef.current;

    if (!video || video.readyState < 2) {
      console.error("Camera video is not ready.");
      return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      console.error("Unable to create canvas context.");
      return;
    }

    if (facingMode === "user") {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error("Unable to create captured image.");
          return;
        }

        const photoUrl = URL.createObjectURL(blob);

        console.log("PHOTO CAPTURED:", {
          blob,
          photoUrl,
          width: canvas.width,
          height: canvas.height,
        });

        // Temporary verification.
        window.open(photoUrl, "_blank");

        setTimeout(() => {
          URL.revokeObjectURL(photoUrl);
        }, 60_000);
      },
      "image/jpeg",
      0.92,
    );
  };

  /*
   * ---------------------------------------------------------
   * TIMER FORMAT
   * ---------------------------------------------------------
   */

  const formatRecordingTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  };

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  if (!isOpen) {
    return null;
  }

  const showingRecordedVideo = mode === "video" && !!recordedVideoUrl;

  return createPortal(
    <div className="fixed inset-0 z-[100] h-[100dvh] w-full bg-black">
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-black">
        {/* VIEWFINDER / RECORDED VIDEO */}

        <div className="absolute inset-0 z-0 overflow-hidden bg-black">
          {showingRecordedVideo ? (
            <video
              ref={recordedVideoRef}
              src={recordedVideoUrl}
              controls
              autoPlay
              playsInline
              className="absolute inset-0 h-full w-full object-contain bg-black"
            />
          ) : stream ? (
            <CameraPreview
              ref={cameraVideoRef}
              stream={stream}
              mirrored={facingMode === "user"}
            />
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

          {/* RECORDING TIMER */}

          {mode === "video" && !showingRecordedVideo ? (
            <div className="absolute left-1/2 -translate-x-1/2">
              <div
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-colors ${
                  isRecording ? "bg-red-500/90" : "bg-black/45"
                }`}
              >
                {isRecording ? (
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                ) : null}

                <span>{formatRecordingTime(recordingSeconds)}</span>
              </div>
            </div>
          ) : null}

          {/* RECORDED VIDEO STATE */}

          {showingRecordedVideo ? (
            <div className="absolute left-1/2 -translate-x-1/2">
              <div className="rounded-full bg-black/55 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-md">
                Preview
              </div>
            </div>
          ) : null}

          {/* TORCH */}

          {isMobile && !showingRecordedVideo ? (
            <button
              type="button"
              onClick={toggleTorch}
              disabled={isLoading || !hasTorch}
              className={`ml-auto flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition active:scale-95 ${
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

        {/* RECORDED VIDEO ACTIONS */}

        {showingRecordedVideo ? (
          <div className="absolute inset-x-0 bottom-0 z-30 px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-24 sm:px-8">
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={retakeVideo}
                className="rounded-full bg-black/60 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-black/80 active:scale-95"
              >
                Retake
              </button>

              <button
                type="button"
                onClick={useRecordedVideo}
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90 active:scale-95"
              >
                Use video
              </button>
            </div>
          </div>
        ) : (
          /* NORMAL BOTTOM UI */

          <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-[max(12px,env(safe-area-inset-bottom))] pt-16 sm:px-8 sm:pb-6">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />

            <div className="relative flex items-center justify-center">
              {/* GALLERY */}

              <div className="absolute left-0 flex items-center sm:left-3">
                {isMobile ? (
                  <button
                    type="button"
                    onClick={handleGallery}
                    disabled={isRecording}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:bg-black/65 active:scale-95 disabled:opacity-40"
                    aria-label="Open gallery"
                  >
                    <FiImage className="text-xl" />
                  </button>
                ) : null}
              </div>

              {/* SHUTTER */}

              <button
                type="button"
                onClick={handleShutter}
                disabled={!stream || isLoading}
                className="flex h-20 w-20 items-center justify-center rounded-full border-[5px] border-white/90 bg-transparent transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={
                  mode === "photo"
                    ? "Take photo"
                    : isRecording
                      ? "Stop recording"
                      : "Start recording"
                }
              >
                <span
                  className={`block transition-all duration-200 ${
                    mode === "photo"
                      ? "h-14 w-14 rounded-full bg-white"
                      : isRecording
                        ? "h-9 w-9 rounded-lg bg-red-500"
                        : "h-12 w-12 rounded-xl bg-red-500"
                  }`}
                />
              </button>

              {/* CAMERA SWITCH */}

              <div className="absolute right-0 flex items-center sm:right-3">
                {isMobile ? (
                  <button
                    type="button"
                    onClick={switchCamera}
                    disabled={isLoading || isRecording}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:bg-black/65 active:scale-95 disabled:opacity-40"
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
                disabled={isRecording}
                className={`text-sm font-semibold transition disabled:opacity-40 ${
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
                disabled={isRecording}
                className={`text-sm font-semibold transition disabled:opacity-40 ${
                  mode === "photo"
                    ? "text-white"
                    : "text-white/45 hover:text-white/70"
                }`}
              >
                Photo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default CameraModal;
