import { useEffect, useRef } from "react";

const CameraPreview = ({ stream, mirrored = false }) => {
  const videoRef = useRef(null);

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
      if (video) {
        video.pause();
        video.srcObject = null;
      }
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
};

export default CameraPreview;
