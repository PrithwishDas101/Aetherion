import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FiChevronLeft, FiChevronRight, FiDownload, FiX } from "react-icons/fi";

const MediaViewer = ({ mediaItems = [], initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const currentMedia = mediaItems[currentIndex];

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < mediaItems.length - 1;

  const currentType = currentMedia?.type;

  const currentUrl = currentMedia?.mediaUrl;

  const currentCaption = currentMedia?.text?.trim();

  const goPrevious = () => {
    if (!hasPrevious) return;

    setCurrentIndex((previous) => previous - 1);
  };

  const goNext = () => {
    if (!hasNext) return;

    setCurrentIndex((previous) => previous + 1);
  };

  const downloadMedia = () => {
    if (!currentUrl) return;

    const link = document.createElement("a");

    link.href = currentUrl;
    link.download =
      currentType === "video"
        ? `aetherion-video-${Date.now()}`
        : `aetherion-image-${Date.now()}`;

    link.target = "_blank";
    link.rel = "noopener noreferrer";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
        return;
      }

      if (event.key === "ArrowLeft") {
        goPrevious();
        return;
      }

      if (event.key === "ArrowRight") {
        goNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex, mediaItems.length]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const mediaCountLabel = useMemo(() => {
    if (mediaItems.length <= 1) {
      return null;
    }

    return `${currentIndex + 1} / ${mediaItems.length}`;
  }, [currentIndex, mediaItems.length]);

  if (!currentMedia || !currentUrl) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] bg-black/95">
      {/* BACKDROP */}

      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
        aria-label="Close media viewer"
      />

      {/* TOP BAR */}

      <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 pt-[max(12px,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white shadow-lg backdrop-blur-xl transition hover:bg-black/60 active:scale-95"
          aria-label="Close media viewer"
        >
          <FiX className="text-[23px]" />
        </button>

        {mediaCountLabel ? (
          <div className="rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-xl">
            {mediaCountLabel}
          </div>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={downloadMedia}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white shadow-lg backdrop-blur-xl transition hover:bg-black/60 active:scale-95"
          aria-label="Download media"
        >
          <FiDownload className="text-[21px]" />
        </button>
      </div>

      {/* MEDIA */}

      <div
        className="absolute inset-0 z-10 flex items-center justify-center px-3 py-20 sm:px-8"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {currentType === "video" ? (
          <video
            key={currentUrl}
            src={currentUrl}
            controls
            autoPlay
            playsInline
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        ) : (
          <img
            key={currentUrl}
            src={currentUrl}
            alt={currentType === "gif" ? "GIF" : "Image"}
            draggable={false}
            className="max-h-full max-w-full select-none rounded-lg object-contain"
          />
        )}
      </div>

      {/* PREVIOUS */}

      {hasPrevious ? (
        <button
          type="button"
          onClick={goPrevious}
          className="absolute left-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white shadow-lg backdrop-blur-xl transition hover:bg-black/60 active:scale-95"
          aria-label="Previous media"
        >
          <FiChevronLeft className="text-2xl" />
        </button>
      ) : null}

      {/* NEXT */}

      {hasNext ? (
        <button
          type="button"
          onClick={goNext}
          className="absolute right-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white shadow-lg backdrop-blur-xl transition hover:bg-black/60 active:scale-95"
          aria-label="Next media"
        >
          <FiChevronRight className="text-2xl" />
        </button>
      ) : null}

      {/* CAPTION */}

      {currentCaption ? (
        <div className="absolute inset-x-0 bottom-0 z-30 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-16">
          <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-black/55 px-4 py-3 text-center text-sm leading-relaxed text-white shadow-xl backdrop-blur-xl">
            {currentCaption}
          </div>
        </div>
      ) : null}
    </div>,
    document.body,
  );
};

export default MediaViewer;
