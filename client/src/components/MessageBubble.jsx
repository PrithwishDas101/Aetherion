import { IoCheckmark, IoCheckmarkDone } from "react-icons/io5";

import {
  FiCornerUpLeft,
  FiCornerUpRight,
  FiFileText,
  FiPlay,
} from "react-icons/fi";

import { formatMessageTime } from "../utils/messageDate.js";

import ReplyMessage from "./ReplyMessage.jsx";
import MediaUploadIndicator from "./MediaUploadIndicator.jsx";
import PollMessage from "./Poll/PollMessage.jsx";

import useSwipeToReply from "../Hooks/useSwipeToReply.js";

const MessageBubble = ({
  message,
  isMyMessage,
  onReply,
  onReplyClick,
  onMediaClick,
  onPollVote,
  isHighlighted,
  currentUserId,
  otherUserName,
}) => {
  const messageTime = formatMessageTime(message.createdAt);

  // MESSAGE TYPES

  const isGif = message.type === "gif" && !!message.mediaUrl;

  const isImage = message.type === "image" && !!message.mediaUrl;

  const isVideo = message.type === "video" && !!message.mediaUrl;

  const isDocument = message.type === "document" && !!message.mediaUrl;

  const isPoll = message.type === "poll" && !!message.poll;

  const isMedia = isGif || isImage || isVideo;

  // DOCUMENT HELPERS
  const getDocumentName = () => {
    return (message.document?.name || "Document");
  };

  const getDocumentExtension = () => {
    const fileName = getDocumentName();

    const parts = fileName.split(".");

    if (parts.length < 2) {
      return "FILE";
    }

    const extension = parts.pop();

    if (!extension) {
      return "FILE";
    }

    return extension.toUpperCase();
  };

  const formatFileSize = (bytes) => {
    if (!bytes || Number.isNaN(bytes)
    ) {
      return "";
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    if (bytes < 1024 * 1024 * 1024) {
      return `${(
        bytes /
        (1024 * 1024)
      ).toFixed(1)} MB`;
    }

    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  // SWIPE TO REPLY
  const { swipeOffset, handlePointerDown, handlePointerMove, handlePointerUp, handlePointerCancel, } = useSwipeToReply({
    isMyMessage,

    onReply: () => onReply(message),
  });

  // REPLY PREVIEW CLICK
  const handleReplyPreviewClick = () => {
    if (!message.replyTo?._id) {
      return;
    }

    onReplyClick?.(message.replyTo._id,);
  };

  // OPEN DOCUMENT
  const handleDocumentClick = (event,) => {
    event.stopPropagation();

    if (
      message.isUploading || !message.mediaUrl
    ) {
      return;
    }

    window.open(message.mediaUrl, "_blank", "noopener,noreferrer",);
  };

  const handleDocumentKeyDown = (event,) => {
    if (message.isUploading) {
      return;
    }

    if (event.key === "Enter" || event.key === " "
    ) {
      event.preventDefault();

      window.open(message.mediaUrl, "_blank", "noopener,noreferrer",);
    }
  };

  return (
    <div
      className={`group relative flex w-full items-center gap-2 overflow-hidden rounded-xl transition-all duration-300 ${isMyMessage
        ? "justify-end"
        : "justify-start"
        } ${isHighlighted
          ? "message-row-highlight"
          : ""
        }`}
    >
      {/* REPLY BUTTON — RECEIVED MESSAGE */}

      {!isMyMessage && (
        <div className="order-2 shrink-0">
          <button
            type="button"
            onClick={() =>
              onReply(message)
            }
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#8d9689] opacity-0 transition hover:bg-[#d8f45a]/10 hover:text-[#f4ffc3] group-hover:opacity-100"
            aria-label="Reply to message"
          >
            <FiCornerUpRight className="text-lg" />
          </button>
        </div>
      )}

      {/* SWIPEABLE MESSAGE */}

      <div
        className={`order-1 touch-pan-y ${isDocument
          ? "max-w-[62%]"
          : "max-w-[75%]"
          }`}
        onPointerDown={
          handlePointerDown
        }
        onPointerMove={
          handlePointerMove
        }
        onPointerUp={
          handlePointerUp
        }
        onPointerCancel={
          handlePointerCancel
        }
        style={{
          transform: `translateX(${swipeOffset}px)`,

          transition:
            swipeOffset === 0
              ? "transform 200ms ease-out"
              : "none",
        }}
      >
        <div
          className={`w-fit max-w-full break-words ${isMedia || isPoll
            ? ""
            : `rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isMyMessage
              ? "rounded-tr-sm bg-[#d8f164] text-[#10120d]"
              : "rounded-bl-sm border border-[#d8f45a]/10 bg-[#18221a] text-[#f1eee8]"
            }`
            }`}
        >
          {/* REPLIED MESSAGE PREVIEW */}

          {message.replyTo && (
            <ReplyMessage
              replyTo={
                message.replyTo
              }
              isMyMessage={
                isMyMessage
              }
              currentUserId={
                currentUserId
              }
              otherUserName={
                otherUserName
              }
              onClick={
                handleReplyPreviewClick
              }
            />
          )}

          {/* DOCUMENT MESSAGE */}

          {isDocument ? (
            <div
              role="button"
              tabIndex={
                message.isUploading
                  ? -1
                  : 0
              }
              onClick={handleDocumentClick}
              onKeyDown={handleDocumentKeyDown}
              className={`relative inline-flex max-w-full items-center gap-2 rounded-lg px-2.5 py-2 transition ${message.isUploading
                ? "cursor-default"
                : "cursor-pointer"
                } ${isMyMessage
                  ? "bg-[#d8f164] text-[#10120d]"
                  : "border border-[#d8f45a]/10 bg-[#18221a] text-[#f1eee8]"
                }`}
            >
              <FiFileText className="shrink-0 text-base" />

              <div className="min-w-0">
                <p className="max-w-[140px] truncate text-[13px] font-medium leading-4">
                  {getDocumentName()}
                </p>

                {message.document?.size ? (
                  <p
                    className={`mt-0.5 text-[10px] leading-3 ${isMyMessage
                      ? "text-[#10120d]/55"
                      : "text-[#aab3a8]"
                      }`}
                  >
                    {formatFileSize(message.document.size)}
                  </p>
                ) : null}
              </div>

              {message.isUploading ? (
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <MediaUploadIndicator />
                </div>
              ) : null}
            </div>
          ) : null}

          {/* POLL MESSAGE */}

          {isPoll ? (
            <PollMessage
              poll={message.poll}
              isMyMessage={isMyMessage}
              currentUserId={currentUserId}
              onVote={onPollVote}
            />
          ) : null}

          {/* IMAGE / GIF / VIDEO MESSAGE */}

          {isMedia ? (
            <div
              className={`overflow-hidden rounded-xl ${isImage &&
                message.text?.trim()
                ? isMyMessage
                  ? "border border-[#d8f164]"
                  : "border border-[#18221a]"
                : ""
                }`}
            >
              <div
                role="button"
                tabIndex={
                  message.isUploading
                    ? -1
                    : 0
                }
                className={`relative ${message.isUploading
                  ? "cursor-default"
                  : "cursor-pointer"
                  }`}
                onClick={(event) => {
                  event.stopPropagation();

                  if (
                    message.isUploading
                  ) {
                    return;
                  }

                  onMediaClick?.(
                    message,
                  );
                }}
                onKeyDown={(
                  event,
                ) => {
                  if (
                    message.isUploading
                  ) {
                    return;
                  }

                  if (
                    event.key ===
                    "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();

                    onMediaClick?.(
                      message,
                    );
                  }
                }}
              >
                {/* VIDEO */}

                {isVideo ? (
                  <>
                    <video
                      src={
                        message.mediaUrl
                      }
                      muted
                      playsInline
                      preload="metadata"
                      className={`block max-h-72 max-w-full cursor-pointer rounded-xl object-cover transition-all duration-300 ${message.isUploading
                        ? "scale-[1.01]"
                        : "scale-100"
                        }`}
                    />

                    {!message.isUploading ? (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#090909] text-white shadow-xl backdrop-blur-md">
                          <FiPlay className="ml-1 text-2xl" />
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  /* IMAGE / GIF */

                  <img
                    src={
                      message.mediaUrl
                    }
                    alt={
                      isGif
                        ? "GIF"
                        : "Image"
                    }
                    className={`block max-h-72 max-w-full cursor-pointer object-cover transition-all duration-300 ${isImage &&
                      message.text?.trim()
                      ? "rounded-t-[11px]"
                      : "rounded-xl"
                      } ${message.isUploading
                        ? "scale-[1.01]"
                        : "scale-100"
                      }`}
                    loading="lazy"
                  />
                )}

                {/* OPEN HINT */}

                {!message.isUploading ? (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 hover:opacity-100">
                    <div className="rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                      Open
                    </div>
                  </div>
                ) : null}

                {/* UPLOAD OVERLAY */}

                <div
                  className={`absolute inset-0 z-10 transition-opacity duration-300 ${message.isUploading
                    ? "opacity-100"
                    : "pointer-events-none opacity-0"
                    }`}
                >
                  <MediaUploadIndicator />
                </div>
              </div>

              {/* IMAGE CAPTION */}

              {isImage &&
                message.text?.trim() && (
                  <div
                    className={`px-3 pb-2.5 pt-2.5 text-sm leading-relaxed ${isMyMessage
                      ? "bg-[#d8f164] text-[#10120d]"
                      : "bg-[#18221a] text-[#f1eee8]"
                      }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {message.text}
                    </p>
                  </div>
                )}
            </div>
          ) : null}

          {/* TEXT MESSAGE */}

          {!isMedia &&
            !isDocument &&
            !isPoll && (
              <div className="whitespace-pre-wrap break-words">
                {message.text}
              </div>
            )}

          {/* MESSAGE META */}

          <div
            className={`flex items-center justify-end gap-1 text-[10px] leading-none ${isMedia || isPoll
              ? "px-1 pt-1 text-[#aab3a8]"
              : `mt-1 ${isMyMessage
                ? "text-[#10120d]/60"
                : "text-[#aab3a8]"
              }`
              }`}
          >
            <span>
              {messageTime}
            </span>

            {isMyMessage &&
              (message.isUploading ? (
                <span className="text-[10px] text-[#7b8477]">
                  Sending...
                </span>
              ) : message.read ? (
                <IoCheckmarkDone className="text-sm text-[#2196f3]" />
              ) : (
                <IoCheckmark className="text-sm text-[#5d654f]" />
              ))}
          </div>
        </div>
      </div>

      {/* REPLY BUTTON — SENT MESSAGE */}

      {
        isMyMessage && (
          <div className="shrink-0">
            <button
              type="button"
              onClick={() =>
                onReply(message)
              }
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#8d9689] opacity-0 transition hover:bg-[#d8f45a]/10 hover:text-[#d8f45a] group-hover:opacity-100"
              aria-label="Reply to message"
            >
              <FiCornerUpLeft className="text-lg" />
            </button>
          </div>
        )
      }
    </div >
  );
};

export default MessageBubble;