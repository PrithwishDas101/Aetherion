import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiDownload,
  FiEdit3,
  FiRefreshCw,
  FiSmile,
  FiType,
  FiX,
  FiZap,
  FiZapOff,
} from "react-icons/fi";

import {
  getCameraStream,
  hasCameraSupport,
  hasTorchSupport,
  isMobileDevice,
  setTorch,
  stopCameraStream,
} from "./cameraUtils.js";

const CameraModal = ({
  isOpen,
  onClose,
  onGallery,
  onPhotoCaptured,
  onVideoCaptured,
  recipientName = "User",
}) => {
  // CAMERA STATE
  const [stream, setStream] = useState(null);
  const [mode, setMode] = useState("photo");
  const [facingMode, setFacingMode] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraRestartKey, setCameraRestartKey] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // PHOTO STATE
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState(null);
  const [capturedPhotoBlob, setCapturedPhotoBlob] = useState(null);
  const [photoCaption, setPhotoCaption] = useState("");

  // PHOTO EDITOR STATE
  const [activePhotoTool, setActivePhotoTool] = useState(null);

  // VIDEO STATE
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState(null);

  // TORCH
  const [isTorchEnabled, setIsTorchEnabled] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);

  // REFS
  const cameraVideoRef = useRef(null);
  const recordedVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const captionInputRef = useRef(null);

  const isMobile = isMobileDevice();

  // CAMERA INITIALIZATION

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
      setIsVideoReady(false);
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

        if (cancelled) {
          return;
        }

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
  }, [isOpen, mode, facingMode, cameraRestartKey]);

  // ATTACH STREAM DIRECTLY TO VIDEO
  useEffect(() => {
    const video = cameraVideoRef.current;

    if (!video || !stream) {
      return;
    }

    setIsVideoReady(false);

    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;

    const markReady = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setIsVideoReady(true);
      }
    };

    const playVideo = async () => {
      try {
        await video.play();
        markReady();
      } catch (error) {
        console.warn("Camera video autoplay was blocked:", error);
      }
    };

    video.addEventListener("loadedmetadata", markReady);
    video.addEventListener("loadeddata", markReady);
    video.addEventListener("canplay", markReady);

    playVideo();

    return () => {
      video.removeEventListener("loadedmetadata", markReady);
      video.removeEventListener("loadeddata", markReady);
      video.removeEventListener("canplay", markReady);

      if (video.srcObject === stream) {
        video.pause();
        video.srcObject = null;
      }
    };
  }, [stream]);

  // RECORDING TIMER
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

  // CLEANUP
  const cleanupCapturedPhoto = () => {
    if (capturedPhotoUrl) {
      URL.revokeObjectURL(capturedPhotoUrl);
    }

    setCapturedPhotoUrl(null);
    setCapturedPhotoBlob(null);
    setPhotoCaption("");
    setActivePhotoTool(null);
  };

  const cleanupRecordedVideo = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
    }

    setRecordedVideoUrl(null);
    setRecordedVideoBlob(null);
  };

  // CLOSE
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

    cleanupCapturedPhoto();
    cleanupRecordedVideo();

    setStream(null);
    setCameraError("");
    setIsLoading(false);
    setIsVideoReady(false);

    setIsTorchEnabled(false);
    setHasTorch(false);

    setIsRecording(false);
    setRecordingSeconds(0);

    mediaRecorderRef.current = null;
    recordedChunksRef.current = [];

    onClose?.();
  };

  // MODE
  const changeMode = (nextMode) => {
    if (
      nextMode === mode ||
      isLoading ||
      isRecording ||
      recordedVideoUrl ||
      capturedPhotoUrl
    ) {
      return;
    }

    stopCameraStream(stream);

    setStream(null);
    setIsVideoReady(false);

    setIsTorchEnabled(false);
    setHasTorch(false);

    setMode(nextMode);
  };

  // SHUTTER
  const handleShutter = () => {
    if (!stream || isLoading || !isVideoReady) {
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

  // CAMERA SWITCH
  const switchCamera = () => {
    if (
      !isMobile ||
      isLoading ||
      isRecording ||
      recordedVideoUrl ||
      capturedPhotoUrl
    ) {
      return;
    }

    stopCameraStream(stream);

    setStream(null);
    setIsVideoReady(false);

    setIsTorchEnabled(false);
    setHasTorch(false);

    setFacingMode((previous) => (previous === "user" ? "environment" : "user"));
  };

  // GALLERY
  // =========================================================

  const handleGallery = () => {
    if (isRecording || recordedVideoUrl || capturedPhotoUrl) {
      return;
    }

    onGallery?.();
  };

  // TORCH
  const toggleTorch = async () => {
    if (
      !isMobile ||
      isLoading ||
      !stream ||
      !hasTorch ||
      recordedVideoUrl ||
      capturedPhotoUrl
    ) {
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

  // VIDEO RECORDING
  const startVideoRecording = () => {
    if (
      mode !== "video" ||
      !stream ||
      !isVideoReady ||
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

        stopCameraStream(stream);

        setStream(null);
        setIsVideoReady(false);

        setIsTorchEnabled(false);
        setHasTorch(false);

        setRecordedVideoBlob(blob);
        setRecordedVideoUrl(url);

        setIsRecording(false);
        setRecordingSeconds(0);

        mediaRecorderRef.current = null;
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

  // RETAKE PHOTO
  const retakePhoto = () => {
    cleanupCapturedPhoto();

    setCameraError("");
    setIsTorchEnabled(false);
    setHasTorch(false);
    setIsVideoReady(false);

    setCameraRestartKey((previous) => previous + 1);
  };

  // RETAKE VIDEO
  const retakeVideo = () => {
    cleanupRecordedVideo();

    setRecordingSeconds(0);
    setCameraError("");
    setIsVideoReady(false);

    setCameraRestartKey((previous) => previous + 1);
  };

  // PHOTO DOWNLOAD
  const downloadPhoto = () => {
    if (!capturedPhotoUrl) {
      return;
    }

    const link = document.createElement("a");

    link.href = capturedPhotoUrl;
    link.download = `aetherion-photo-${Date.now()}.jpg`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PHOTO TOOLS
  const handlePhotoTool = (tool) => {
    setActivePhotoTool((previous) => (previous === tool ? null : tool));
  };

  const focusCaption = () => {
    requestAnimationFrame(() => {
      captionInputRef.current?.focus();
    });
  };

  // SEND PHOTO
  const sendCapturedPhoto = () => {
    if (!capturedPhotoBlob) {
      return;
    }

    onPhotoCaptured?.({
      blob: capturedPhotoBlob,
      caption: photoCaption.trim(),
    });

    closeCamera();
  };

  // SEND VIDEO
  const sendRecordedVideo = () => {
    if (!recordedVideoBlob) {
      return;
    }

    onVideoCaptured?.(recordedVideoBlob);

    closeCamera();
  };

  // CAPTURE PHOTO
  const capturePhoto = () => {
    if (mode !== "photo" || !stream || isLoading || !isVideoReady) {
      return;
    }

    const video = cameraVideoRef.current;

    if (
      !video ||
      video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
      !video.videoWidth ||
      !video.videoHeight
    ) {
      console.warn("Camera video is not ready yet.");
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

    /*
     * Mirror front camera photos so they behave like the preview.
     */
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

        setCapturedPhotoBlob(blob);
        setCapturedPhotoUrl(photoUrl);

        setPhotoCaption("");
        setActivePhotoTool(null);

        stopCameraStream(stream);

        setStream(null);
        setIsVideoReady(false);

        setIsTorchEnabled(false);
        setHasTorch(false);
      },
      "image/jpeg",
      0.92,
    );
  };

  // TIMER
  const formatRecordingTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  };

  // GUARDS
  if (!isOpen) {
    return null;
  }

  const showingCapturedPhoto = mode === "photo" && !!capturedPhotoUrl;

  const showingRecordedVideo = mode === "video" && !!recordedVideoUrl;

  const showingPreview = showingCapturedPhoto || showingRecordedVideo;

  // RENDER
  return createPortal(
    <div className="fixed inset-0 z-[100] h-[100dvh] w-full overflow-hidden bg-black">
      <div className="relative h-full min-h-0 w-full overflow-hidden bg-black">
        // PHOTO PREVIEW / EDITOR
        {showingCapturedPhoto ? (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black">
            // PHOTO
            <img
              src={capturedPhotoUrl}
              alt="Captured photo"
              className="absolute inset-0 h-full w-full object-cover"
            />
            // TOP TOOLBAR
            <div className="absolute inset-x-0 top-0 z-40 flex items-start justify-between px-4 pt-[max(12px,env(safe-area-inset-top))]">
              {/*CLOSE*/}
              <button
                type="button"
                onClick={closeCamera}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white shadow-lg backdrop-blur-xl transition active:scale-95"
                aria-label="Discard photo"
              >
                <FiX className="text-[23px]" />
              </button>
              {/* TOOLS */}
              <div className="flex items-center gap-2">
                {/* DOWNLOAD */}
                <button
                  type="button"
                  onClick={downloadPhoto}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white shadow-lg backdrop-blur-xl transition hover:bg-black/45 active:scale-95"
                  aria-label="Download photo"
                >
                  <FiDownload className="text-[21px]" />
                </button>
                {/* RETAKE */}
                <button
                  type="button"
                  onClick={retakePhoto}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white shadow-lg backdrop-blur-xl transition hover:bg-black/45 active:scale-95"
                  aria-label="Retake photo"
                >
                  <FiRefreshCw className="text-[21px]" />
                </button>
                {/* STICKER */}
                <button
                  type="button"
                  onClick={() => handlePhotoTool("sticker")}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border border-white/10 shadow-lg backdrop-blur-xl transition active:scale-95 ${
                    activePhotoTool === "sticker"
                      ? "bg-white text-black"
                      : "bg-black/30 text-white hover:bg-black/45"
                  }`}
                  aria-label="Add sticker"
                >
                  <FiSmile className="text-[21px]" />
                </button>
                {/* TEXT */}
                <button
                  type="button"
                  onClick={() => {
                    handlePhotoTool("text");
                    focusCaption();
                  }}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border border-white/10 shadow-lg backdrop-blur-xl transition active:scale-95 ${
                    activePhotoTool === "text"
                      ? "bg-white text-black"
                      : "bg-black/30 text-white hover:bg-black/45"
                  }`}
                  aria-label="Add text"
                >
                  <FiType className="text-[21px]" />
                </button>
                {/* DOODLE */}
                <button
                  type="button"
                  onClick={() => handlePhotoTool("doodle")}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border border-white/10 shadow-lg backdrop-blur-xl transition active:scale-95 ${
                    activePhotoTool === "doodle"
                      ? "bg-white text-black"
                      : "bg-black/30 text-white hover:bg-black/45"
                  }`}
                  aria-label="Draw on photo"
                >
                  <FiEdit3 className="text-[21px]" />
                </button>
              </div>
            </div>
            // TOOL MESSAGE
            {activePhotoTool === "sticker" ? (
              <div className="absolute left-1/2 top-24 z-30 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-xs font-medium text-white backdrop-blur-md">
                Stickers coming soon
              </div>
            ) : null}
            {activePhotoTool === "doodle" ? (
              <div className="absolute left-1/2 top-24 z-30 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-xs font-medium text-white backdrop-blur-md">
                Doodle tool coming soon
              </div>
            ) : null}
            // CAPTION
            <div className="absolute inset-x-0 bottom-[82px] z-30 px-3">
              <div className="mx-auto w-full max-w-xl">
                <div className="rounded-2xl border border-white/10 bg-black/45 px-4 py-2.5 shadow-2xl backdrop-blur-xl">
                  <textarea
                    ref={captionInputRef}
                    value={photoCaption}
                    onChange={(event) => setPhotoCaption(event.target.value)}
                    placeholder="Add a caption..."
                    rows={1}
                    className="scrollbar-aetherion block min-h-9 max-h-24 w-full resize-none overflow-y-auto bg-transparent py-1 text-[15px] leading-5 text-white outline-none placeholder:text-white/50"
                  />
                </div>
              </div>
            </div>
            // SEND BAR
            <div className="absolute inset-x-0 bottom-0 z-40 flex min-h-[72px] items-center justify-between gap-3 border-t border-white/10 bg-[#080d09] px-5 pb-[max(8px,env(safe-area-inset-bottom))] pt-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {recipientName}
                </p>

                <p className="text-xs text-white/45">Send photo</p>
              </div>

              <button
                type="button"
                onClick={sendCapturedPhoto}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d8f45a] text-[#10120d] shadow-lg transition hover:bg-[#e4ff6f] active:scale-95"
                aria-label="Send photo"
              >
                <span className="translate-x-[1px] text-xl">➤</span>
              </button>
            </div>
          </div>
        ) : null}
        // VIDEO PREVIEW
        {showingRecordedVideo ? (
          <div className="relative h-full w-full overflow-hidden bg-black">
            {/* TOP */}
            <div className="absolute inset-x-0 top-0 z-40 flex items-center px-4 pt-[max(10px,env(safe-area-inset-top))]">
              <button
                type="button"
                onClick={closeCamera}
                className="flex h-11 w-11 items-center justify-center rounded-full text-white active:scale-95"
                aria-label="Close video preview"
              >
                <FiX className="text-xl" />
              </button>

              <div className="flex-1" />

              <button
                type="button"
                onClick={retakeVideo}
                className="flex h-11 w-11 items-center justify-center rounded-full text-white active:scale-95"
                aria-label="Retake video"
              >
                <FiRefreshCw className="text-xl" />
              </button>
            </div>
            // VIDEO
            <div className="absolute inset-0 flex items-center justify-center">
              <video
                ref={recordedVideoRef}
                src={recordedVideoUrl}
                controls
                autoPlay
                playsInline
                className="h-full w-full object-contain"
              />
            </div>
            {/* SEND */}
            <div className="absolute inset-x-0 bottom-0 z-40 flex items-center justify-end bg-gradient-to-t from-black/90 to-transparent px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-20">
              <button
                type="button"
                onClick={sendRecordedVideo}
                className="flex h-12 items-center gap-2 rounded-full bg-[#d8f45a] px-6 font-semibold text-black active:scale-95"
              >
                <span>Send</span>
                <span>➤</span>
              </button>
            </div>
          </div>
        ) : null}
        // LIVE CAMERA
        {!showingPreview ? (
          <div className="relative h-full min-h-0 w-full overflow-hidden bg-black">
            // CAMERA VIDEO
            {stream ? (
              <video
                ref={cameraVideoRef}
                autoPlay
                muted
                playsInline
                className={`absolute inset-0 h-full w-full object-cover ${
                  facingMode === "user" ? "-scale-x-100" : ""
                }`}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black px-8 text-center">
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
            // TOP CONTROLS
            <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 pt-[max(16px,env(safe-area-inset-top))]">
              {/* CLOSE */}
              <button
                type="button"
                onClick={closeCamera}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition active:scale-95"
                aria-label="Close camera"
              >
                <FiX className="text-xl" />
              </button>
              {/* RECORD TIMING */}
              {mode === "video" ? (
                <div className="absolute left-1/2 -translate-x-1/2">
                  <div
                    className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-md ${
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
              {/* TORCH */}
              {isMobile ? (
                <button
                  type="button"
                  onClick={toggleTorch}
                  disabled={isLoading || !hasTorch}
                  className={`ml-auto flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition active:scale-95 ${
                    isTorchEnabled
                      ? "bg-white text-black"
                      : "bg-black/45 text-white"
                  } ${!hasTorch ? "cursor-not-allowed opacity-40" : ""}`}
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
            // BOTTOM CAMERA CONTROLS
            <div className="absolute inset-x-0 bottom-0 z-30 px-5 pb-[max(12px,env(safe-area-inset-bottom))] pt-20">
              {/* GRADIENT */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <div className="relative flex items-center justify-center">
                {/* GALLERY */}
                <div className="absolute left-0">
                  {isMobile ? (
                    <button
                      type="button"
                      onClick={handleGallery}
                      disabled={isRecording}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition active:scale-95 disabled:opacity-40"
                      aria-label="Open gallery"
                    >
                      <span className="text-lg">▧</span>
                    </button>
                  ) : null}
                </div>
                {/* SWITCH */}
                <button
                  type="button"
                  onClick={handleShutter}
                  disabled={!stream || isLoading || !isVideoReady}
                  className="flex h-20 w-20 items-center justify-center rounded-full border-[5px] border-white/90 transition active:scale-95 disabled:opacity-40"
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
                <div className="absolute right-0">
                  {isMobile ? (
                    <button
                      type="button"
                      onClick={switchCamera}
                      disabled={isLoading || isRecording}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition active:scale-95 disabled:opacity-40"
                      aria-label="Switch camera"
                    >
                      <FiRefreshCw className="text-xl" />
                    </button>
                  ) : null}
                </div>
              </div>
              {/* MODE */}
              <div className="relative mt-4 flex items-center justify-center gap-5">
                <button
                  type="button"
                  onClick={() => changeMode("video")}
                  disabled={isRecording}
                  className={`text-sm font-semibold ${
                    mode === "video" ? "text-white" : "text-white/45"
                  }`}
                >
                  Video
                </button>

                <button
                  type="button"
                  onClick={() => changeMode("photo")}
                  disabled={isRecording}
                  className={`text-sm font-semibold ${
                    mode === "photo" ? "text-white" : "text-white/45"
                  }`}
                >
                  Photo
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
};

export default CameraModal;
