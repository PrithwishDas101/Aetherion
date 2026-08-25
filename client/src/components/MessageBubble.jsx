import { IoCheckmark, IoCheckmarkDone } from "react-icons/io5";
import { FiCornerUpLeft, FiCornerUpRight } from "react-icons/fi";

import { formatMessageTime } from "../utils/messageDate.js";
import ReplyMessage from "./ReplyMessage.jsx";
import MediaUploadIndicator from "./MediaUploadIndicator.jsx";

const MessageBubble = ({
  message,
  isMyMessage,
  onReply,
  onReplyClick,
  isHighlighted,
  currentUserId,
  otherUserName,
}) => {
  const messageTime = formatMessageTime(message.createdAt);

  const isGif = message.type === "gif" && !!message.mediaUrl;
  const isImage = message.type === "image" && !!message.mediaUrl;
  const isMedia = isGif || isImage;

  const handleReplyPreviewClick = () => {
    if (!message.replyTo?._id) {
      return;
    }

    onReplyClick?.(message.replyTo._id);
  };

  return (
    <div
      className={`group relative flex w-full items-center gap-2 overflow-hidden rounded-xl transition-all duration-300 ${
        isMyMessage ? "justify-end" : "justify-start"
      } ${isHighlighted ? "message-row-highlight" : ""}`}
    >
      {/* REPLY BUTTON — RECEIVED MESSAGE */}

      {!isMyMessage && (
        <div className="order-2 shrink-0">
          <button
            type="button"
            onClick={() => onReply(message)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#8d9689] opacity-0 transition hover:bg-[#d8f45a]/10 hover:text-[#f4ffc3] group-hover:opacity-100"
            aria-label="Reply to message"
          >
            <FiCornerUpRight className="text-lg" />
          </button>
        </div>
      )}

      {/* MESSAGE CONTENT */}

      <div
        className={`order-1 w-fit max-w-[75%] break-words ${
          isMedia
            ? ""
            : `rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                isMyMessage
                  ? "rounded-tr-sm bg-[#d8f164] text-[#10120d]"
                  : "rounded-bl-sm border border-[#d8f45a]/10 bg-[#18221a] text-[#f1eee8]"
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

        {/* IMAGE / GIF MESSAGE */}

        {isMedia ? (
          <div
            className={`overflow-hidden rounded-xl ${
              isImage && message.text?.trim()
                ? isMyMessage
                  ? "border border-[#d8f164]"
                  : "border border-[#18221a]"
                : ""
            }`}
          >
            <div className="relative">
              <img
                src={message.mediaUrl}
                alt={isGif ? "GIF" : "Image"}
                className={`block max-h-72 max-w-full object-cover transition-all duration-300 ${
                  isImage && message.text?.trim()
                    ? "rounded-t-[11px]"
                    : "rounded-xl"
                } ${message.isUploading ? "scale-[1.01]" : "scale-100"}`}
                loading="lazy"
              />

              {/* UPLOAD OVERLAY */}

              <div
                className={`absolute inset-0 z-10 transition-opacity duration-300 ${
                  message.isUploading
                    ? "opacity-100"
                    : "pointer-events-none opacity-0"
                }`}
              >
                <MediaUploadIndicator />
              </div>
            </div>

            {/* IMAGE CAPTION */}

            {isImage && message.text?.trim() && (
              <div
                className={`px-3 pb-2.5 pt-2.5 text-sm leading-relaxed ${
                  isMyMessage
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
        ) : (
          /* TEXT MESSAGE */

          <div className="whitespace-pre-wrap break-words">{message.text}</div>
        )}

        {/* MESSAGE META */}

        <div
          className={`flex items-center justify-end gap-1 text-[10px] leading-none ${
            isMedia
              ? "px-1 pt-1 text-[#aab3a8]"
              : `mt-1 ${isMyMessage ? "text-[#10120d]/60" : "text-[#aab3a8]"}`
          }`}
        >
          <span>{messageTime}</span>

          {isMyMessage &&
            (message.isUploading ? (
              <span className="text-[10px] text-[#7b8477]">Sending...</span>
            ) : message.read ? (
              <IoCheckmarkDone className="text-sm text-[#2196f3]" />
            ) : (
              <IoCheckmark className="text-sm text-[#5d654f]" />
            ))}
        </div>
      </div>

      {/* REPLY BUTTON — SENT MESSAGE */}

      {isMyMessage && (
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => onReply(message)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#8d9689] opacity-0 transition hover:bg-[#d8f45a]/10 hover:text-[#d8f45a] group-hover:opacity-100"
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
