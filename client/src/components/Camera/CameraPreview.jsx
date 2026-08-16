import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const CameraPreview = forwardRef(({ stream, mirrored = false }, ref) => {
  const videoRef = useRef(null);

  useImperativeHandle(ref, () => videoRef.current);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.srcObject = stream || null;

    if (stream) {
      video.play().catch((error) => {
        console.error("Camera preview play error:", error);
      });
    }

    return () => {
      video.pause();
      video.srcObject = null;
    };
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className={`absolute inset-0 h-full w-full object-cover ${
        mirrored ? "-scale-x-100" : ""
      }`}
    />
  );
});

CameraPreview.displayName = "CameraPreview";

export default CameraPreview;
