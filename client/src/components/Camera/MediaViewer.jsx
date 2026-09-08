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
import VideoPreview from "./VideoPreview.jsx";

const getInitials = (person) => {
  if (!person) {
    return "?";
  }

  const firstName = String(person.firstName || "").trim();

  const middleName = String(person.middleName || "").trim();

  const lastName = String(person.lastName || "").trim();

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
  onSendEditedPhoto,
  onSendEditedVideo,
  onVideoProcessingStart,
  currentUser,
  otherUser,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const [isDownloading, setIsDownloading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [activeEditTool, setActiveEditTool] = useState(null);

  const [isSendingEdited, setIsSendingEdited] = useState(false);

  const [videoBlob, setVideoBlob] = useState(null);

  const [isLoadingEditor, setIsLoadingEditor] = useState(false);

  const currentMedia = mediaItems[currentIndex];

  const hasPrevious = currentIndex > 0;

  const hasNext = currentIndex < mediaItems.length - 1;

  useEffect(() => {
    if (currentIndex > mediaItems.length - 1) {
      setCurrentIndex(Math.max(0, mediaItems.length - 1));
    }
  }, [currentIndex, mediaItems.length]);

  // Resolve sender.
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

  useEffect(() => {
    setIsEditing(false);
    setActiveEditTool(null);
    setIsSendingEdited(false);
    setVideoBlob(null);
    setIsLoadingEditor(false);
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

  // REPLY
  const handleReply = () => {
    if (!currentMedia) {
      return;
    }

    onReply?.(currentMedia);

    onClose?.();
  };

  // DOWNLOAD
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

      window.open(currentMedia.mediaUrl, "_blank", "noopener,noreferrer");
    } finally {
      setIsDownloading(false);
    }
  };

  const openEditor = async () => {
    if (!currentMedia?.mediaUrl || isLoadingEditor) {
      return;
    }

    setActiveEditTool(null);

    // IMAGE / GIF
    if (currentMedia.type === "image" || currentMedia.type === "gif") {
      setIsEditing(true);

      return;
    }

    // VIDEO
    if (currentMedia.type === "video") {
      try {
        setIsLoadingEditor(true);

        const response = await fetch(currentMedia.mediaUrl);

        if (!response.ok) {
          throw new Error(
            `Unable to load video with status ${response.status}`,
          );
        }

        const blob = await response.blob();

        setVideoBlob(blob);

        setIsEditing(true);
      } catch (error) {
        console.error("Unable to prepare video for editing:", error);
      } finally {
        setIsLoadingEditor(false);
      }
    }
  };

  const closeEditor = () => {
    if (isSendingEdited) {
      return;
    }

    setIsEditing(false);
    setActiveEditTool(null);
    setVideoBlob(null);
  };

  // SEND EDITED IMAGE / GIF
  const handleSendEditedPhoto = async (editedBlob) => {
    if (!editedBlob || isSendingEdited) {
      return false;
    }

    setIsSendingEdited(true);
    setIsEditing(false);
    setActiveEditTool(null);

    onClose?.();

    await new Promise((resolve) => {
      requestAnimationFrame(resolve);
    });

    try {
      const didSend = await onSendEditedPhoto?.({
        blob: editedBlob,
        caption: "",
        type: currentMedia.type,
      });

      return Boolean(didSend);
    } catch (error) {
      console.error("Unable to send edited image:", error);

      return false;
    } finally {
      setIsSendingEdited(false);
    }
  };

  // SEND EDITED VIDEO
  const handleVideoProcessingStart = async ({
    blob,
    caption = "",
    muted = false,
  }) => {
    if (!blob || isSendingEdited) {
      return null;
    }

    try {

      setIsSendingEdited(true);

      setIsEditing(false);
      setActiveEditTool(null);
      setVideoBlob(null);

      const temporaryMessageId =
        await onVideoProcessingStart?.({
          blob,
          caption,
          muted,
        });

      onClose?.();

      return temporaryMessageId || null;
    } catch (error) {
      console.error("Unable to start video processing:", error);

      return null;
    } finally {
      setIsSendingEdited(false);
    }
  };

  const handleSendEditedVideo = async ({
    blob,
    caption = "",
    muted = false,
    temporaryMessageId = null,
  }) => {
    if (!blob) {
      return false;
    }

    try {
      const didSend = await onSendEditedVideo?.({
        blob,
        caption,
        muted,
        temporaryMessageId,
      });

      return Boolean(didSend);
    } catch (error) {
      console.error("Unable to send edited video:", error);

      return false;
    }
  };

  // KEYBOARD CONTROLS
  useEffect(() => {
    const handleKeyDown = (event) => {
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
  }, [currentIndex, mediaItems.length, isEditing, isSendingEdited, onClose]);

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

  /* EDIT MODE */
  if (isEditing) {
    /* VIDEO EDITOR */
    if (currentMedia.type === "video" && videoBlob) {
      return createPortal(
        <div className="fixed inset-0 z-[300] bg-black">
          <VideoPreview
            videoUrl={currentMedia.mediaUrl}
            videoBlob={videoBlob}
            activeTool={activeEditTool}
            onToolChange={setActiveEditTool}
            onClose={closeEditor}
            onDownload={handleDownload}
            onRetake={closeEditor}
            onSend={handleSendEditedVideo}
            onProcessingStart={handleVideoProcessingStart}
            recipientName={senderName}
            videoCaption=""
            onCaptionChange={() => { }}
            downloadMessage={isDownloading ? "Downloading..." : ""}
          />
        </div>,
        document.body,
      );
    }

    if (currentMedia.type === "image" || currentMedia.type === "gif") {
      return createPortal(
        <div className="fixed inset-0 z-[300] bg-black">
          <PhotoPreview
            photoUrl={currentMedia.mediaUrl}
            activeTool={activeEditTool}
            onToolChange={setActiveEditTool}
            onClose={closeEditor}
            onDownload={handleDownload}
            onRetake={closeEditor}
            onSend={handleSendEditedPhoto}
            recipientName={senderName}
            photoCaption=""
            onCaptionChange={() => { }}
            downloadMessage={isDownloading ? "Downloading..." : ""}
          />
        </div>,
        document.body,
      );
    }
  }

  const canEditMedia =
    currentMedia.type === "gif" || currentMedia.type === "video";

  return createPortal(
    <div className="fixed inset-0 z-[200] bg-black">
      {/* MOBILE / TABLET */}

      <div className="flex h-full w-full flex-col overflow-hidden bg-[#101010] lg:hidden">
        {/* MOBILE HEADER */}

        <div className="shrink-0 border-b border-white/10 px-3 pb-3 pt-[max(12px,env(safe-area-inset-top))]">
          <div className="flex items-center justify-between gap-3">
            {/* LEFT SIDE */}

            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition active:scale-95"
                aria-label="Back"
              >
                <FiArrowLeft className="text-[23px]" />
              </button>

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
              {canEditMedia ? (
                <button
                  type="button"
                  onClick={openEditor}
                  disabled={isLoadingEditor}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition active:scale-95 disabled:opacity-50"
                  aria-label="Edit media"
                >
                  {isLoadingEditor ? (
                    <span className="text-sm font-bold">...</span>
                  ) : (
                    <FiEdit3 className="text-[20px]" />
                  )}
                </button>
              ) : null}

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

        {/* MOBILE MEDIA */}

        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 py-5">
          <MediaZoomSurface onSwipeLeft={goNext} onSwipeRight={goPrevious}>
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

        {/* MOBILE REPLY */}

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

      {/* DESKTOP */}

      <div className="hidden h-full w-full lg:block">
        {/* HEADER */}

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

          {/* ACTIONS */}

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleReply}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white shadow-lg backdrop-blur-xl transition hover:bg-black/55 active:scale-95"
              aria-label={`Reply to ${senderName}`}
            >
              <FiCornerUpLeft className="text-[19px]" />
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white shadow-lg backdrop-blur-xl transition hover:bg-black/55 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Download media"
            >
              <FiDownload className="text-[20px]" />
            </button>

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

        {/* MEDIA */}

        <div className="absolute inset-0 z-10 flex items-center justify-center px-20 pb-24 pt-20">
          <MediaZoomSurface onSwipeLeft={goNext} onSwipeRight={goPrevious}>
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
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${isActive
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

      {/* DOWNLOAD STATUS */}

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
