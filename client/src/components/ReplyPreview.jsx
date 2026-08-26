import { IoClose, IoImageOutline, IoVideocamOutline } from "react-icons/io5";

const ReplyPreview = ({ message, isMyMessage, otherUserName, onCancel }) => {
  if (!message) {
    return null;
  }

  const senderName = isMyMessage ? "You" : otherUserName;

  const isGif = message.type === "gif" && !!message.mediaUrl;
  const isImage = message.type === "image" && !!message.mediaUrl;
  const isVideo = message.type === "video" && !!message.mediaUrl;

  const previewText = isGif
    ? "GIF"
    : isVideo
      ? message.text?.trim() || "Video"
      : isImage
        ? message.text?.trim() || "Image"
        : message.text;

  return (
    <div className="mb-2 flex items-center gap-3 overflow-hidden rounded-xl border border-[#d8f45a]/15 bg-[#111811] px-3 py-2">
      {/* REPLY INDICATOR */}

      <div className="h-10 w-1 shrink-0 rounded-full bg-[#d8f45a]" />

      {/* REPLY CONTENT */}

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-[#d8f45a]">
          {senderName}
        </p>

        <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-[#aab3a8]">
          {isImage ? (
            <IoImageOutline className="shrink-0 text-sm text-[#aab3a8]" />
          ) : isVideo ? (
            <IoVideocamOutline className="shrink-0 text-sm text-[#aab3a8]" />
          ) : null}

          <p className="truncate">{previewText || "Message"}</p>
        </div>
      </div>

      {/* MEDIA THUMBNAIL */}

      {(isGif || isImage || isVideo) &&
        (isVideo ? (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-black">
            <video
              src={message.mediaUrl}
              className="h-full w-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
          </div>
        ) : (
          <img
            src={message.mediaUrl}
            alt={isGif ? "GIF preview" : "Image preview"}
            className="h-12 w-12 shrink-0 rounded-lg object-cover"
          />
        ))}

      {/* CANCEL REPLY */}

      <button
        type="button"
        onClick={onCancel}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#aab3a8] transition hover:bg-[#d8f45a]/10 hover:text-[#f1eee8]"
        aria-label="Cancel reply"
      >
        <IoClose className="text-xl" />
      </button>
    </div>
  );
};

export default ReplyPreview;
