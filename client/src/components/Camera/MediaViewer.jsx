import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiCornerUpLeft,
  FiDownload,
  FiEdit3,
  FiX,
} from "react-icons/fi";

import MediaZoomSurface from "./MediaZoomSurface.jsx";
import PhotoPreview from "./PhotoPreview.jsx";

const getInitials = (person) => {
  if (!person) {
    return "?";
  }

  const firstName = String(person.firstName || "").trim();
  const middleName = String(person.middleName || "").trim();
  const lastName = String(person.lastName || "").trim();

  /*
   * First + last is preferred.
   *
   * If no last name exists, use first + middle.
   */
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }

  if (firstName && middleName) {
    return `${firstName[0]}${middleName[0]}`.toUpperCase();
  }

  if (firstName) {
    return firstName.slice(0, 2).toUpperCase();
  }

  if (lastName) {
    return lastName.slice(0, 2).toUpperCase();
  }

  return "?";
};

const getFullName = (person) => {
  if (!person) {
    return "Unknown";
  }

  return (
    [person.firstName, person.middleName, person.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || "Unknown"
  );
};

const formatTime = (createdAt) => {
  if (!createdAt) {
    return "";
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

const MediaViewer = ({
  mediaItems = [],
  initialIndex = 0,
  onClose,
  onReply,
  currentUser,
  otherUser,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isDownloading, setIsDownloading] = useState(false);

  /*
   * MOBILE / TABLET EDIT MODE
   *
   * This is intentionally separate from the desktop viewer.
   */
  const [isEditing, setIsEditing] = useState(false);
  const [activeEditTool, setActiveEditTool] = useState(null);

  const currentMedia = mediaItems[currentIndex];

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < mediaItems.length - 1;

  const sender = useMemo(() => {
    if (!currentMedia) {
      return otherUser || currentUser || null;
    }

    const senderId =
      typeof currentMedia.sender === "object"
        ? String(currentMedia.sender?._id || "")
        : String(currentMedia.sender || "");

    if (currentUser?._id && String(currentUser._id) === senderId) {
      return currentUser;
    }

    if (otherUser?._id && String(otherUser._id) === senderId) {
      return otherUser;
    }

    return otherUser || currentUser || null;
  }, [currentMedia, currentUser, otherUser]);

  const senderName = getFullName(sender);
  const senderInitials = getInitials(sender);

  /*
   * Reset editing state when navigating between media.
   */
  useEffect(() => {
    setIsEditing(false);
    setActiveEditTool(null);
  }, [currentIndex]);

  const goPrevious = () => {
    if (!hasPrevious) {
      return;
    }

    setCurrentIndex((previous) => previous - 1);
  };

  const goNext = () => {
    if (!hasNext) {
      return;
    }

    setCurrentIndex((previous) => previous + 1);
  };

  /*
   * REPLY
   *
   * Uses Chat.jsx's existing reply system.
   */
  const handleReply = () => {
    if (!currentMedia) {
      return;
    }

    onReply?.(currentMedia);

    onClose?.();
  };

  /*
   * DOWNLOAD
   */
  const handleDownload = async () => {
    if (!currentMedia?.mediaUrl || isDownloading) {
      return;
    }

    try {
      setIsDownloading(true);

      const response = await fetch(currentMedia.mediaUrl);

      if (!response.ok) {
        throw new Error(`Media download failed with status ${response.status}`);
      }

      const blob = await response.blob();

      const blobUrl = URL.createObjectURL(blob);

      let extension = "bin";

      if (currentMedia.type === "image") {
        extension = "jpg";
      } else if (currentMedia.type === "video") {
        extension = "mp4";
      } else if (currentMedia.type === "gif") {
        extension = "gif";
      }

      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = `aetherion-media-${Date.now()}.${extension}`;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000);
    } catch (error) {
      console.error("Unable to download media:", error);

      /*
       * Fallback for servers that block fetch requests.
       */
      window.open(currentMedia.mediaUrl, "_blank", "noopener,noreferrer");
    } finally {
      setIsDownloading(false);
    }
  };

  /*
   * MOBILE / TABLET EDIT
   *
   * Only images and GIF-like image media should enter PhotoPreview.
   * Video editing is not sent into the photo editor.
   */
  const openEditor = () => {
    if (!currentMedia) {
      return;
    }

    if (currentMedia.type === "video") {
      return;
    }

    setActiveEditTool(null);
    setIsEditing(true);
  };

  const closeEditor = () => {
    setIsEditing(false);
    setActiveEditTool(null);
  };

  /*
   * KEYBOARD CONTROLS
   */
  useEffect(() => {
    const handleKeyDown = (event) => {
      /*
       * Escape exits editing first.
       */
      if (event.key === "Escape" && isEditing) {
        closeEditor();
        return;
      }

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
  }, [currentIndex, mediaItems.length, isEditing, onClose]);

  /*
   * LOCK BACKGROUND SCROLLING
   */
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!currentMedia?.mediaUrl) {
    return null;
  }

  /*
   * =========================================================
   * MOBILE / TABLET EDIT MODE
   *
   * We reuse the existing PhotoPreview component instead of
   * building another editor.
   *
   * The viewer itself remains underneath this mode logically.
   * Closing the editor returns to the media viewer.
   * =========================================================
   */
  if (isEditing && currentMedia.type !== "video") {
    return createPortal(
      <div className="fixed inset-0 z-[300] bg-black lg:hidden">
        <PhotoPreview
          photoUrl={currentMedia.mediaUrl}
          activeTool={activeEditTool}
          onToolChange={setActiveEditTool}
          onClose={closeEditor}
          onDownload={handleDownload}
          onRetake={closeEditor}
          onSend={() => {
            /*
             * This media already exists in chat.
             *
             * For now, returning from editing must not accidentally
             * resend or duplicate the existing message.
             */
            closeEditor();
          }}
          recipientName={senderName}
          photoCaption=""
          onCaptionChange={() => {}}
          downloadMessage={isDownloading ? "Downloading..." : ""}
        />
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] bg-black">
      {/* =====================================================
          MOBILE + TABLET VIEW
          < lg

          COMPLETELY SEPARATE FROM DESKTOP.
      ===================================================== */}

      <div className="flex h-full w-full flex-col overflow-hidden bg-[#101010] lg:hidden">
        {/* =================================================
            MOBILE HEADER
        ================================================= */}

        <div className="shrink-0 border-b border-white/10 px-3 pb-3 pt-[max(12px,env(safe-area-inset-top))]">
          {/* BACK */}

          <button
            type="button"
            onClick={onClose}
            className="mb-3 flex h-10 w-10 items-center justify-center rounded-full text-white transition active:scale-95"
            aria-label="Back"
          >
            <FiArrowLeft className="text-[23px]" />
          </button>

          <div className="flex items-center justify-between gap-3">
            {/* SENDER */}

            <div className="flex min-w-0 flex-1 items-center gap-3">
              {sender?.profilePic ? (
                <img
                  src={sender.profilePic}
                  alt={senderName}
                  className="h-12 w-12 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white"
                  aria-label={senderName}
                >
                  {senderInitials}
                </div>
              )}

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {senderName}
                </p>

                <p className="mt-0.5 text-xs text-white/50">
                  {formatTime(currentMedia.createdAt)}
                </p>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="flex shrink-0 items-center gap-2">
              {/* EDIT */}

              {currentMedia.type !== "video" ? (
                <button
                  type="button"
                  onClick={openEditor}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition active:scale-95"
                  aria-label="Edit media"
                >
                  <FiEdit3 className="text-[20px]" />
                </button>
              ) : null}

              {/* DOWNLOAD */}

              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition active:scale-95 disabled:opacity-50"
                aria-label="Download media"
              >
                <FiDownload className="text-[20px]" />
              </button>
            </div>
          </div>
        </div>

        {/* =================================================
            MOBILE MEDIA AREA
        ================================================= */}

        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 py-5">
          <MediaZoomSurface>
            <div className="relative h-full w-full">
              {currentMedia.type === "video" ? (
                <video
                  key={currentMedia.mediaUrl}
                  src={currentMedia.mediaUrl}
                  controls
                  autoPlay
                  playsInline
                  className="h-full w-full select-none object-contain"
                />
              ) : (
                <img
                  key={currentMedia.mediaUrl}
                  src={currentMedia.mediaUrl}
                  alt="Shared media"
                  draggable={false}
                  className="h-full w-full select-none object-contain"
                />
              )}
            </div>
          </MediaZoomSurface>

          {/* PREVIOUS */}

          {hasPrevious ? (
            <button
              type="button"
              onClick={goPrevious}
              className="absolute left-5 top-1/2 z-[60] hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white shadow-xl backdrop-blur-xl transition hover:bg-black/60 active:scale-95 lg:flex"
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
              className="absolute right-5 top-1/2 z-[60] hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white shadow-xl backdrop-blur-xl transition hover:bg-black/60 active:scale-95 lg:flex"
              aria-label="Next media"
            >
              <FiChevronRight className="text-2xl" />
            </button>
          ) : null}
        </div>

        {/* =================================================
            MOBILE REPLY BAR

            Exactly the bottom action area requested.
        ================================================= */}

        <div className="shrink-0 border-t border-white/10 bg-[#101010] px-4 pb-[max(10px,env(safe-area-inset-bottom))] pt-2">
          <button
            type="button"
            onClick={handleReply}
            className="flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold text-white transition active:opacity-70"
            aria-label={`Reply to ${senderName}`}
          >
            <FiCornerUpLeft className="text-lg" />

            <span>Reply</span>
          </button>
        </div>
      </div>

      {/* =====================================================
          DESKTOP VIEW
          lg+

          THIS PRESERVES THE EXISTING LAPTOP/DESKTOP LAYOUT.
      ===================================================== */}

      <div className="hidden h-full w-full lg:block">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="absolute inset-x-0 top-0 z-[100] flex items-center justify-between border-b border-white/10 bg-black/40 px-5 py-3 backdrop-blur-xl">
          {/* SENDER */}

          <div className="flex min-w-0 items-center gap-3">
            {sender?.profilePic ? (
              <img
                src={sender.profilePic}
                alt={senderName}
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white"
                aria-label={senderName}
              >
                {senderInitials}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {senderName}
              </p>

              <p className="text-xs text-white/45">
                {formatTime(currentMedia.createdAt)}
              </p>
            </div>
          </div>

          {/* DESKTOP TOOLS */}

          <div className="flex shrink-0 items-center gap-2">
            {/* REPLY */}

            <button
              type="button"
              onClick={handleReply}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white shadow-lg backdrop-blur-xl transition hover:bg-black/55 active:scale-95"
              aria-label={`Reply to ${senderName}`}
            >
              <FiCornerUpLeft className="text-[19px]" />
            </button>

            {/* DOWNLOAD */}

            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white shadow-lg backdrop-blur-xl transition hover:bg-black/55 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Download media"
            >
              <FiDownload className="text-[20px]" />
            </button>

            {/* CLOSE */}

            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white shadow-lg backdrop-blur-xl transition hover:bg-black/55 active:scale-95"
              aria-label="Close media viewer"
            >
              <FiX className="text-[22px]" />
            </button>
          </div>
        </div>

        {/* =====================================================
            DESKTOP MEDIA VIEWPORT

            ONLY THIS AREA ZOOMS.
        ===================================================== */}

        <div className="absolute inset-0 z-10 flex items-center justify-center px-20 pb-24 pt-20">
          <MediaZoomSurface>
            <div className="relative h-full w-full">
              {currentMedia.type === "video" ? (
                <video
                  key={currentMedia.mediaUrl}
                  src={currentMedia.mediaUrl}
                  controls
                  autoPlay
                  playsInline
                  className="h-full w-full select-none object-contain"
                />
              ) : (
                <img
                  key={currentMedia.mediaUrl}
                  src={currentMedia.mediaUrl}
                  alt="Shared media"
                  draggable={false}
                  className="h-full w-full select-none object-contain"
                />
              )}
            </div>
          </MediaZoomSurface>
        </div>

        {/* PREVIOUS */}

        {hasPrevious ? (
          <button
            type="button"
            onClick={goPrevious}
            className="absolute left-5 top-1/2 z-[60] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white shadow-xl backdrop-blur-xl transition hover:bg-black/60 active:scale-95"
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
            className="absolute right-5 top-1/2 z-[60] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white shadow-xl backdrop-blur-xl transition hover:bg-black/60 active:scale-95"
            aria-label="Next media"
          >
            <FiChevronRight className="text-2xl" />
          </button>
        ) : null}

        {/* THUMBNAILS */}

        {mediaItems.length > 1 ? (
          <div className="absolute inset-x-0 bottom-0 z-[80] border-t border-white/10 bg-black/70 px-5 py-3 backdrop-blur-xl">
            <div className="flex gap-2 overflow-x-auto">
              {mediaItems.map((media, index) => {
                const isActive = index === currentIndex;

                return (
                  <button
                    key={media._id || `${media.mediaUrl}-${index}`}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                      isActive
                        ? "border-white"
                        : "border-white/10 opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`Open media ${index + 1}`}
                  >
                    {media.type === "video" ? (
                      <video
                        src={media.mediaUrl}
                        muted
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={media.mediaUrl}
                        alt=""
                        draggable={false}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {/* =====================================================
          DOWNLOAD STATUS
      ===================================================== */}

      {isDownloading ? (
        <div className="pointer-events-none absolute left-1/2 top-20 z-[400] -translate-x-1/2">
          <div className="rounded-full border border-white/10 bg-black/70 px-4 py-2 text-sm text-white shadow-xl backdrop-blur-xl">
            Downloading...
          </div>
        </div>
      ) : null}
    </div>,
    document.body,
  );
};

export default MediaViewer;
