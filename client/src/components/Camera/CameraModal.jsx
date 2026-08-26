import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiRefreshCw, FiX, FiZap, FiZapOff } from "react-icons/fi";

import {
  getCameraStream,
  hasCameraSupport,
  hasTorchSupport,
  isMobileDevice,
  setTorch,
  stopCameraStream,
} from "./cameraUtils.js";

import CameraPreview from "./CameraPreview.jsx";
import PhotoPreview from "./PhotoPreview.jsx";
import VideoPreview from "./VideoPreview.jsx";

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
  const [downloadMessage, setDownloadMessage] = useState("");
  const [activePhotoTool, setActivePhotoTool] = useState(null);

  // VIDEO STATE
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState(null);
  const [videoCaption, setVideoCaption] = useState("");
  const [activeVideoTool, setActiveVideoTool] = useState(null);

  // TORCH
  const [isTorchEnabled, setIsTorchEnabled] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);

  // REFS
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const cameraPreviewRef = useRef(null);

  const isMobile = isMobileDevice();

  /*
   * CAMERA INITIALIZATION
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

  /*
   * RECORDING TIMER
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
   * CLEANUP PHOTO
   */
  const cleanupCapturedPhoto = () => {
    if (capturedPhotoUrl) {
      URL.revokeObjectURL(capturedPhotoUrl);
    }

    setCapturedPhotoUrl(null);
    setCapturedPhotoBlob(null);
    setPhotoCaption("");
    setActivePhotoTool(null);
  };

  /*
   * CLEANUP VIDEO
   */
  const cleanupRecordedVideo = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
    }

    setRecordedVideoUrl(null);
    setRecordedVideoBlob(null);
    setVideoCaption("");
    setActiveVideoTool(null);
  };

  /*
   * CLOSE CAMERA
   */
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

  /*
   * CAMERA MODE
   */
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

  /*
   * SHUTTER
   */
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

  /*
   * CAMERA SWITCH
   */
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

  /*
   * GALLERY
   */
  const handleGallery = () => {
    if (isRecording || recordedVideoUrl || capturedPhotoUrl) {
      return;
    }

    onGallery?.();
  };

  /*
   * TORCH
   */
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

  /*
   * PHOTO TOOL
   */
  const handlePhotoTool = (toolOrUpdater) => {
    setActivePhotoTool((previous) => {
      if (typeof toolOrUpdater === "function") {
        return toolOrUpdater(previous);
      }

      return previous === toolOrUpdater ? null : toolOrUpdater;
    });
  };

  /*
   * VIDEO TOOL
   */
  const handleVideoTool = (toolOrUpdater) => {
    setActiveVideoTool((previous) => {
      if (typeof toolOrUpdater === "function") {
        return toolOrUpdater(previous);
      }

      return previous === toolOrUpdater ? null : toolOrUpdater;
    });
  };

  /*
   * VIDEO RECORDING
   */
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
        ? new MediaRecorder(stream, {
            mimeType,
          })
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

        setVideoCaption("");
        setActiveVideoTool(null);

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

  /*
   * RETAKE PHOTO
   */
  const retakePhoto = () => {
    cleanupCapturedPhoto();

    setCameraError("");
    setIsTorchEnabled(false);
    setHasTorch(false);
    setIsVideoReady(false);

    setCameraRestartKey((previous) => previous + 1);
  };

  /*
   * RETAKE VIDEO
   */
  const retakeVideo = () => {
    cleanupRecordedVideo();

    setRecordingSeconds(0);
    setCameraError("");
    setIsVideoReady(false);

    setCameraRestartKey((previous) => previous + 1);
  };

  // DOWNLOAD PHOTO
  const downloadPhoto = (photoBlob = capturedPhotoBlob) => {
    if (!photoBlob) {
      return;
    }

    try {
      const downloadUrl = URL.createObjectURL(photoBlob);

      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = `aetherion-photo-${Date.now()}.jpg`;
      link.style.display = "none";

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      setDownloadMessage("Photo download started");

      setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
      }, 1000);

      setTimeout(() => {
        setDownloadMessage("");
      }, 2200);
    } catch (error) {
      console.error("Photo download error:", error);

      setDownloadMessage("Unable to download photo");

      setTimeout(() => {
        setDownloadMessage("");
      }, 2200);
    }
  };

  const downloadVideo = (videoBlob = recordedVideoBlob) => {
    if (!videoBlob) {
      return;
    }

    try {
      const downloadUrl = URL.createObjectURL(videoBlob);

      const link = document.createElement("a");

      link.href = downloadUrl;
      const extension = videoBlob.type.includes("mp4") ? "mp4" : "webm";

      link.download = `aetherion-video-${Date.now()}.${extension}`;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadMessage("Video download started");

      setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
      }, 1000);

      setTimeout(() => {
        setDownloadMessage("");
      }, 2200);
    } catch (error) {
      console.error("Video download error:", error);

      setDownloadMessage("Unable to download video");

      setTimeout(() => {
        setDownloadMessage("");
      }, 2200);
    }
  };

  // SEND PHOTO

  const sendCapturedPhoto = (composedBlob) => {
    if (!composedBlob) {
      return;
    }

    onPhotoCaptured?.({
      blob: composedBlob,
      caption: photoCaption.trim(),
    });

    closeCamera();
  };

  /*
   * SEND VIDEO
   */
  const sendRecordedVideo = () => {
    if (!recordedVideoBlob) {
      return;
    }

    onVideoCaptured?.({
      blob: recordedVideoBlob,
      caption: videoCaption.trim(),
    });

    closeCamera();
  };

  /*
   * CAPTURE PHOTO
   */
  const capturePhoto = () => {
    if (mode !== "photo" || !stream || isLoading || !isVideoReady) {
      return;
    }

    /*
     * CameraPreview is now responsible for
     * rendering the actual camera element.
     *
     * We still need access to that element
     * when capturing the frame, so locate it
     * from the modal DOM.
     */
    const video = cameraPreviewRef.current;

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
     * Mirror front camera photos so they
     * behave like the preview.
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

        setCapturedPhotoUrl(photoUrl);
        setCapturedPhotoBlob(blob);
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

  /*
   * RECORDING TIME
   */
  const formatRecordingTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);

    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  };

  /*
   * GUARDS
   */
  if (!isOpen) {
    return null;
  }

  const showingCapturedPhoto = mode === "photo" && !!capturedPhotoUrl;

  const showingRecordedVideo = mode === "video" && !!recordedVideoUrl;

  const showingPreview = showingCapturedPhoto || showingRecordedVideo;

  return createPortal(
    <div className="fixed inset-0 z-[100] h-[100dvh] w-full overflow-hidden bg-black">
      <div className="relative h-full min-h-0 w-full overflow-hidden bg-black">
        {/* PHOTO PREVIEW */}

        {showingCapturedPhoto ? (
          <PhotoPreview
            photoUrl={capturedPhotoUrl}
            activeTool={activePhotoTool}
            onToolChange={handlePhotoTool}
            onClose={closeCamera}
            onDownload={downloadPhoto}
            onRetake={retakePhoto}
            onSend={sendCapturedPhoto}
            recipientName={recipientName}
            photoCaption={photoCaption}
            onCaptionChange={(event) => setPhotoCaption(event.target.value)}
            downloadMessage={downloadMessage}
          />
        ) : null}

        {/* ===================================================== */}
        {/* VIDEO PREVIEW                                         */}
        {/* ===================================================== */}

        {showingRecordedVideo ? (
          <VideoPreview
            videoUrl={recordedVideoUrl}
            videoBlob={recordedVideoBlob}
            activeTool={activeVideoTool}
            onToolChange={handleVideoTool}
            onClose={closeCamera}
            onDownload={downloadVideo}
            onRetake={retakeVideo}
            onSend={({ blob, caption }) => {
              if (!blob) return;

              onVideoCaptured?.({
                blob,
                caption,
              });

              closeCamera();
            }}
            recipientName={recipientName}
            videoCaption={videoCaption}
            onCaptionChange={(event) => setVideoCaption(event.target.value)}
            downloadMessage={downloadMessage}
          />
        ) : null}

        {/* ===================================================== */}
        {/* LIVE CAMERA                                           */}
        {/* ===================================================== */}

        {!showingPreview ? (
          <div className="relative h-full min-h-0 w-full overflow-hidden bg-black">
            {/* CAMERA */}

            {stream ? (
              <CameraPreview
                ref={cameraPreviewRef}
                stream={stream}
                mirrored={facingMode === "user"}
                onReady={() => setIsVideoReady(true)}
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

            {/* ================================================= */}
            {/* TOP CAMERA CONTROLS                              */}
            {/* ================================================= */}

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

              {/* RECORD TIMER */}

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

            {/* ================================================= */}
            {/* BOTTOM CAMERA CONTROLS                           */}
            {/* ================================================= */}

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

                {/* SHUTTER */}

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
