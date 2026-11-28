import { useEffect, useRef, useState } from "react";
import { IoCheckmark, IoCheckmarkDone, IoTimeOutline } from "react-icons/io5";

import {
  FiCornerUpLeft,
  FiCornerUpRight,
  FiFileText,
  FiPlay,
  FiTrash2,
} from "react-icons/fi";

import { formatMessageTime } from "../utils/messageDate.js";

import ReplyMessage from "./ReplyMessage.jsx";
import MediaUploadIndicator from "./MediaUploadIndicator.jsx";
import PollMessage from "./Poll/PollMessage.jsx";
import LocationMessage from "./Location/LocationMessage.jsx";
import ContactMessage from "./Contacts/ContactMessage.jsx";

import useSwipeToReply from "../Hooks/useSwipeToReply.js";
import MessageActions from "./MessageActions.jsx";

const MessageBubble = ({
  message,
  isMyMessage,
  onReply,
  onReplyClick,
  onMediaClick,
  onPollVote,
  onChat,
  isHighlighted,
  currentUserId,
  otherUserName,
  onEdit,
  onDelete,
  onReact,
}) => {
  const [actionsOpen, setActionsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || "");
  const longPressTimer = useRef(null);
  const messageTime = formatMessageTime(message.createdAt);
  const canEdit = isMyMessage && message.type === "text" && !message.deletedForEveryone;
  const canReact = !message.deletedForEveryone;
  const myReaction = message.reactions?.find(
    (reaction) => String(reaction.userId?._id || reaction.userId) === String(currentUserId),
  )?.emoji;
  const reactionCounts = message.reactions?.reduce((groups, reaction) => {
    groups[reaction.emoji] = (groups[reaction.emoji] || 0) + 1;
    return groups;
  }, {}) || {};
  const startLongPress = (event) => {
    if (event.pointerType !== "touch") return;
    clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => setActionsOpen(true), 550);
  };
  const cancelLongPress = () => clearTimeout(longPressTimer.current);
  useEffect(() => () => clearTimeout(longPressTimer.current), []);
  const saveEdit = () => {
    if (!editText.trim() || editText.trim() === (message.text || "")) {
      setIsEditing(false);
      return;
    }
    onEdit?.(message, editText.trim());
    setIsEditing(false);
  };

  // MESSAGE TYPES
  const isGif = message.type === "gif" && !!message.mediaUrl;
  const isImage = message.type === "image" && !!message.mediaUrl;
  const isVideo = message.type === "video" && !!message.mediaUrl;
  const isDocument = message.type === "document" && !!message.mediaUrl;
  const isPoll = message.type === "poll" && !!message.poll;
  const isLocation = message.type === "location" && !!message.location;
  const isContact = message.type === "contact" && !!message.contact;

  const isMedia = isGif || isImage || isVideo;

  const getDocumentName = () => message.document?.name || "Document";

  const formatFileSize = (bytes) => {
    if (!bytes || Number.isNaN(bytes)) {
      return "";
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  // SWIPE TO REPLY
  const {
    swipeOffset,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel, } = useSwipeToReply({
      isMyMessage,

      onReply: () => onReply(message),
    });

  // REPLY PREVIEW CLICK
  const handleReplyPreviewClick = () => {
    if (!message.replyTo?._id) {
      return;
    }

    onReplyClick?.(message.replyTo._id);
  };

  // OPEN DOCUMENT
  const handleDocumentClick = (event) => {
    event.stopPropagation();

    if (
      message.isUploading ||
      !message.mediaUrl
    ) {
      return;
    }

    window.open(
      message.mediaUrl,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleDocumentKeyDown = (event) => {
    if (
      message.isUploading ||
      !message.mediaUrl
    ) {
      return;
    }

    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      window.open(
        message.mediaUrl,
        "_blank",
        "noopener,noreferrer",
      );
    }
  };

  return (
    <div
      onPointerDown={startLongPress}
      onPointerUp={cancelLongPress}
      onPointerCancel={cancelLongPress}
      onPointerMove={cancelLongPress}
      onContextMenu={(event) => {
        event.preventDefault();
        setActionsOpen(true);
      }}
      className={`group relative flex w-full items-center gap-2 rounded-xl transition-all duration-300 ${isMyMessage
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
            onClick={() => onReply(message)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--home-muted)] opacity-0 transition duration-150 hover:bg-[var(--home-hover)] hover:text-[var(--home-text)] group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#879b82]"
            aria-label="Reply to message"
          >
            <FiCornerUpRight className="text-lg" />
          </button>
        </div>
      )}

      {/* SWIPEABLE MESSAGE */}
      <div
        className={`relative order-1 touch-pan-y ${isDocument
          ? "max-w-[62%]"
          : isPoll || isLocation || isContact
            ? "max-w-[90%]"
            : "max-w-[75%]"
          }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        style={{
          transform: `translateX(${swipeOffset}px)`,

          transition:
            swipeOffset === 0
              ? "transform 200ms ease-out"
              : "none",
        }}
      >
        <div
          className={`w-fit max-w-full break-words ${isMedia ||
            isPoll ||
            isLocation || 
            isContact
            ? ""
            : `rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isMyMessage
              ? "rounded-tr-sm bg-[#171717] text-[#FFFFFF]"
              : "rounded-bl-sm border border-[#E5E5E5] bg-[#FFFFFF] text-[#171717]"
            }`
            }`}
        >
          {/* REPLIED MESSAGE PREVIEW */}
          {message.replyTo && (
            <ReplyMessage
              replyTo={message.replyTo}
              isMyMessage={isMyMessage}
              currentUserId={currentUserId}
              otherUserName={otherUserName}
              onClick={handleReplyPreviewClick}
            />
          )}

          {message.deletedForEveryone && (
            <p className="flex items-center gap-2 px-1 py-1.5 text-xs italic opacity-70">
              <FiTrash2 className="shrink-0" />
              This message was deleted
            </p>
          )}

          {/* DOCUMENT MESSAGE */}
          {!message.deletedForEveryone && isDocument ? (
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
                  ? "bg-[#171717] text-[#FFFFFF]"
                  : "border border-[#E5E5E5] bg-[#FFFFFF] text-[#171717]"
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
                      ? "text-[#FFFFFF]/55"
                      : "text-[#737373]"
                      }`}
                  >
                    {formatFileSize(
                      message.document.size,
                    )}
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
          {!message.deletedForEveryone && isPoll ? (
            <PollMessage
              poll={message.poll}
              isMyMessage={isMyMessage}
              currentUserId={currentUserId}
              onVote={onPollVote}
            />
          ) : null}

          {/* LOCATION MESSAGE */}
          {!message.deletedForEveryone && isLocation ? (
            <LocationMessage
              message={message}
              isOwn={isMyMessage}
            />
          ) : null}

          {/* CONTACT MESSAGE */}
          {!message.deletedForEveryone && isContact ? (
            <ContactMessage
              contact={message.contact}
              onChat={onChat}
            />
          ) : null}

          {/* IMAGE / GIF / VIDEO MESSAGE */}
          {!message.deletedForEveryone && isMedia ? (
            <div
              className={`overflow-hidden rounded-xl ${isImage &&
                message.text?.trim()
                ? isMyMessage
                  ? "border border-[#171717]"
                  : "border border-[#FFFFFF]"
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

                  onMediaClick?.(message);
                }}
                onKeyDown={(event) => {
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

                    onMediaClick?.(message);
                  }
                }}
              >
                {/* VIDEO */}
                {isVideo ? (
                  <>
                    <video
                      src={message.mediaUrl}
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
                    src={message.mediaUrl}
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
                      ? "bg-[#171717] text-[#FFFFFF]"
                      : "bg-[#FFFFFF] text-[#171717]"
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
          {!message.deletedForEveryone && !isMedia &&
            !isDocument &&
            !isPoll &&
            !isLocation &&
            !isContact && (
              <div className="whitespace-pre-wrap break-words">
                {isEditing ? (
                  <div className="min-w-[220px] space-y-2.5 rounded-xl border border-current/10 bg-white/10 p-2.5 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-3 px-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.13em] opacity-75">
                        Editing message
                      </span>
                      <span className="text-[10px] tabular-nums opacity-55">
                        {editText.length}/5000
                      </span>
                    </div>
                    <textarea
                      autoFocus
                      value={editText}
                      onChange={(event) => setEditText(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          saveEdit();
                        }
                        if (event.key === "Escape") setIsEditing(false);
                      }}
                      maxLength={5000}
                      rows={Math.min(5, Math.max(2, editText.split("\n").length))}
                      className="max-h-36 min-h-[68px] w-full resize-y rounded-lg border border-[var(--home-border)] bg-[var(--home-surface)] px-3 py-2.5 text-sm leading-relaxed text-[var(--home-text)] shadow-inner outline-none transition placeholder:text-[var(--home-muted)] focus:border-[#879b82] focus:ring-2 focus:ring-[#879b82]/15"
                      aria-label="Edit message"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <span className="hidden text-[10px] leading-tight opacity-60 sm:inline">
                        Enter saves · Shift + Enter for a new line
                      </span>
                      <div className="ml-auto flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="rounded-lg px-3 py-2 text-xs font-medium text-current/75 transition hover:bg-white/10"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={saveEdit}
                          disabled={!editText.trim()}
                          className="rounded-lg bg-[var(--home-surface)] px-3.5 py-2 text-xs font-semibold text-[var(--home-text)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {message.text}
                    {message.editedAt && (
                      <span className="ml-1.5 inline-flex rounded-full border border-current/15 px-1.5 py-0.5 align-middle text-[9px] font-medium not-italic opacity-65">
                        edited
                      </span>
                    )}
                  </>
                )}
              </div>
            )}

          {/* MESSAGE META */}
          <div
            className={`flex items-center justify-end gap-1 text-[10px] leading-none 
              ${isMedia ||
                isPoll ||
                isLocation ||
                isContact
                ? "px-1 pt-1 text-[#404040]"
                : `mt-1 ${isMyMessage
                  ? "text-[#FFFFFF]/60"
                  : "text-[#404040]"
                }`
              }`}
          >
            <span>
              {messageTime}
            </span>

            {isMyMessage &&
              (message.isUploading ? (
                <span className="text-[10px] text-[#525252]">
                  Sending...
                </span>
              ) : message.isSending ? (
                <IoTimeOutline
                  className="text-sm text-[#525252]"
                  aria-label="Sending"
                />
              ) : message.read ? (
                <IoCheckmarkDone className="text-sm text-[#525252]" />
              ) : (
                <IoCheckmark className="text-sm text-[#525252]" />
              ))}
          </div>
        </div>

        {!message.deletedForEveryone && (
          <div className="absolute right-1 top-1 z-30">
            <MessageActions
              message={message}
              isMyMessage={isMyMessage}
              canEdit={canEdit}
              canReact={canReact}
              onReply={() => onReply(message)}
              onEdit={() => setIsEditing(true)}
              onDelete={(scope) => onDelete?.(message, scope)}
              onReact={(emoji) => onReact?.(message, emoji)}
              open={actionsOpen}
              onOpenChange={setActionsOpen}
            />
          </div>
        )}
      </div>

      {Object.keys(reactionCounts).length > 0 && !message.deletedForEveryone && (
        <div className={`absolute bottom-0 z-20 flex max-w-[min(82vw,24rem)] flex-wrap gap-1.5 ${isMyMessage ? "right-12" : "left-12"} translate-y-1/2`}>
          {Object.entries(reactionCounts).map(([emoji, count]) => {
            const isMine = myReaction === emoji;
            return (
              <button
                key={emoji}
                type="button"
                onClick={() => onReact?.(message, emoji)}
                aria-pressed={isMine}
                aria-label={`${emoji} reaction, ${count} total${isMine ? ", selected by you" : ""}`}
                className={`inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium shadow-[0_3px_12px_rgba(0,0,0,0.08)] transition duration-150 hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${
                  isMine
                    ? "border-[#879b82] bg-[var(--home-selected)] text-[var(--home-text)]"
                    : "border-[var(--home-border)] bg-[var(--home-surface)] text-[var(--home-text)] hover:bg-[var(--home-hover)]"
                }`}
              >
                <span className="text-sm leading-none">{emoji}</span>
                <span className="text-[10px] tabular-nums text-[var(--home-muted)]">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* REPLY BUTTON — SENT MESSAGE */}
      {isMyMessage && (
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => onReply(message)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--home-muted)] opacity-0 transition duration-150 hover:bg-[var(--home-hover)] hover:text-[var(--home-text)] group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#879b82]"
            aria-label="Reply to message"
          >
            <FiCornerUpLeft className="text-lg" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;