import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const CameraPreview = forwardRef(
  ({ stream, mirrored = false, onReady }, ref) => {
    const videoRef = useRef(null);

    useImperativeHandle(ref, () => videoRef.current);

    useEffect(() => {
      const video = videoRef.current;

      if (!video) {
        return;
      }

      video.srcObject = stream || null;

      if (!stream) {
        return;
      }

      const handleReady = () => {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          onReady?.();
        }
      };

      video.addEventListener("loadedmetadata", handleReady);

      video.addEventListener("loadeddata", handleReady);

      video.addEventListener("canplay", handleReady);

      return () => {
        video.removeEventListener("loadedmetadata", handleReady);

        video.removeEventListener("loadeddata", handleReady);

        video.removeEventListener("canplay", handleReady);

        video.pause();

        if (video.srcObject === stream) {
          video.srcObject = null;
        }
      };
    }, [stream, onReady]);

    return (
      <video
        ref={videoRef}
        data-camera-preview
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 h-full w-full object-cover ${
          mirrored ? "-scale-x-100" : ""
        }`}
      />
    );
  },
);

CameraPreview.displayName = "CameraPreview";

export default CameraPreview;
